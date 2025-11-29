# main.py
from datetime import datetime
from typing import List

from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from pathlib import Path
import uuid
import base64

from database import Base, engine, get_db
from models import (
    Project,
    ProjectCreate,
    ProjectOut,
    Donation,
    DonationCreate,
    DonationOut,
    Evidence,
    EvidenceCreate,
    DonationStatus,
    ProjectStatus,
)
from escrow_service import (
    generate_secret_and_condition,
    create_donation_escrow,
    finish_donation_escrow,
    cancel_donation_escrow,
)
from trust_optimizer import decide_project_verdict
from xrpl_client import client, platform_wallet
from settings import settings
from vision_ai import analyze_image, explain_image

app = FastAPI(title="XRPL Impact Map - Smart Escrow")

# Création des tables
Base.metadata.create_all(bind=engine)

# Wallet "donateur" unique pour le POC
donor_wallet = platform_wallet


@app.get("/projects", response_model=List[ProjectOut])
def list_projects(db: Session = Depends(get_db)):
    projects = db.query(Project).all()
    return projects


@app.post("/projects", response_model=ProjectOut)
def create_project(payload: ProjectCreate, db: Session = Depends(get_db)):
    project = Project(
        title=payload.title,
        description=payload.description,
        ong_address=payload.ong_address,
        latitude=payload.latitude,
        longitude=payload.longitude,
        deadline=payload.deadline,
        amount_target=payload.amount_target,
        status=ProjectStatus.OPEN,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@app.post("/projects/{project_id}/donate", response_model=DonationOut)
def donate_to_project(
    project_id: int,
    payload: DonationCreate,
    db: Session = Depends(get_db),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if project.deadline < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Project deadline passed")

    fulfillment_hex, condition_hex = generate_secret_and_condition()

    # Ici, on utilise le wallet plateforme comme "donor_wallet" POC
    resp = create_donation_escrow(
        donor_wallet=donor_wallet,
        ong_address=project.ong_address,
        amount_xrp=payload.amount_xrp,
        cancel_after=project.deadline,
        condition_hex=condition_hex,
    )

    # infos escrow
    tx_meta = resp.get("meta", {})
    escrow_sequence = resp.get("tx_json", {}).get("Sequence")
    if escrow_sequence is None:
        raise HTTPException(status_code=500, detail="Escrow sequence not found in tx")

    donation = Donation(
        project_id=project.id,
        donor_address=payload.donor_address,
        amount_xrp=payload.amount_xrp,
        escrow_owner=donor_wallet.address,
        escrow_sequence=escrow_sequence,
        condition_hex=condition_hex,
        fulfillment_hex=fulfillment_hex,
        cancel_after=project.deadline,
        status=DonationStatus.LOCKED,
    )
    db.add(donation)
    db.commit()
    db.refresh(donation)

    project.status = ProjectStatus.IN_PROGRESS
    db.add(project)
    db.commit()

    return donation


@app.post("/projects/{project_id}/evidence")
def submit_evidence(
    project_id: int,
    payload: EvidenceCreate,
    db: Session = Depends(get_db),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # récup / crée validator
    from models import Validator  # éviter import circulaire

    validator = (
        db.query(Validator)
        .filter(Validator.xrpl_address == payload.validator_address)
        .first()
    )
    if not validator:
        validator = Validator(
            xrpl_address=payload.validator_address,
            latitude=payload.latitude,
            longitude=payload.longitude,
        )
        db.add(validator)
        db.commit()
        db.refresh(validator)

    ev = Evidence(
        project_id=project.id,
        validator_id=validator.id,
        image_url=payload.image_url,
        latitude=payload.latitude,
        longitude=payload.longitude,
        timestamp=payload.timestamp,
        wallet_signature=payload.wallet_signature,
    )
    db.add(ev)
    db.commit()
    return {"status": "ok"}


@app.post("/projects/{project_id}/verdict")
def run_verdict(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    verdict = decide_project_verdict(db, project)

    donations = db.query(Donation).filter(Donation.project_id == project.id).all()

    if verdict["decision"] == "SUCCESS":
        # finish chaque escrow
        for d in donations:
            if d.status != DonationStatus.LOCKED:
                continue
            resp = finish_donation_escrow(
                donor_wallet=donor_wallet,
                owner=d.escrow_owner,
                offer_sequence=d.escrow_sequence,
                condition_hex=d.condition_hex,
                fulfillment_hex=d.fulfillment_hex,
            )
            d.status = DonationStatus.RELEASED
            db.add(d)
        db.commit()
    else:
        # refund (si deadline dépassée)
        now = datetime.utcnow()
        for d in donations:
            if d.status != DonationStatus.LOCKED:
                continue
            if now < d.cancel_after:
                # on ne peut pas encore cancel on-chain, on laisse en LOCKED
                continue
            resp = cancel_donation_escrow(
                donor_wallet=donor_wallet,
                owner=d.escrow_owner,
                offer_sequence=d.escrow_sequence,
            )
            d.status = DonationStatus.REFUNDED
            db.add(d)
        db.commit()

    return {"project_id": project.id, "verdict": verdict}


# =========================
# Debug IA Vision - UI
# =========================


@app.get("/debug/vision", response_class=HTMLResponse)
def debug_vision_ui():
    # Mini page HTML pour tester l'IA visuelle en direct
    return """
    <html>
      <head>
        <title>XRPL Impact Map - Vision AI Debug</title>
      </head>
      <body style="font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif; max-width: 900px; margin: 40px auto;">
        <h1>XRPL Impact Map - Vision AI Debug</h1>
        <p>Upload une photo (puits, école, scooter, etc.) et regarde comment l'IA l'analyse.</p>
        <form action="/debug/analyze-image" method="post" enctype="multipart/form-data" style="margin-top: 20px;">
          <input type="file" name="file" accept="image/*" required />
          <button type="submit" style="margin-left: 8px; padding: 6px 12px;">Analyser l'image</button>
        </form>
        <p style="margin-top: 20px; color: #555;">
          L'IA utilise un modèle vision-langage (CLIP) si disponible, sinon une heuristique visuelle.
        </p>
      </body>
    </html>
    """


@app.post("/debug/analyze-image", response_class=HTMLResponse)
async def debug_analyze_image(file: UploadFile = File(...)):
    """
    Endpoint de debug : on reçoit une image, on la sauvegarde,
    on appelle vision_ai.explain_image et on renvoie une page HTML lisible.
    """
    # 1) Sauvegarder le fichier dans un dossier local
    upload_dir = Path("debug_uploads")
    upload_dir.mkdir(parents=True, exist_ok=True)

    ext = Path(file.filename).suffix or ".jpg"
    tmp_path = upload_dir / f"debug_{uuid.uuid4().hex}{ext}"

    file_bytes = await file.read()
    with tmp_path.open("wb") as f:
        f.write(file_bytes)

    # 2) Analyse détaillée
    info = explain_image(str(tmp_path))

    score = float(info["score"])
    human_conf = float(info["humanitarian_confidence"])
    infra_label = info["infra_type_label"]
    infra_conf = float(info["infra_type_confidence"])
    completion_label = info["completion_label"]
    completion_conf = float(info["completion_confidence"])
    environment_label = info["environment_label"]
    environment_conf = float(info["environment_confidence"])
    people_label = info["people_label"]
    people_conf = float(info["people_confidence"])
    brightness = info["brightness"]
    contrast = info["contrast"]
    notes = info.get("notes", [])

    # 3) Encoder l'image en base64 pour l'afficher directement
    mime = "image/jpeg"
    if ext.lower() in [".png"]:
        mime = "image/png"

    import base64 as _b64

    with tmp_path.open("rb") as img_f:
        b64_data = _b64.b64encode(img_f.read()).decode("utf-8")
    img_src = f"data:{mime};base64,{b64_data}"

    score_pct = score * 100.0
    human_pct = human_conf * 100.0
    infra_pct = infra_conf * 100.0
    completion_pct = completion_conf * 100.0
    env_pct = environment_conf * 100.0
    people_pct = people_conf * 100.0

    notes_html = "".join(f"<li>{n}</li>" for n in notes)

    html = f"""
    <html>
      <head>
        <title>Analyse IA de la photo - XRPL Impact Map</title>
      </head>
      <body style="font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif; max-width: 1000px; margin: 40px auto;">
        <h1>Analyse IA de la photo</h1>

        <div style="display: flex; gap: 24px; align-items: flex-start; margin-top: 20px;">
          <div style="flex: 0 0 360px;">
            <img src="{img_src}" alt="Image analysée" style="max-width: 100%; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);" />
          </div>
          <div style="flex: 1;">
            <h2>Score global Smart Escrow</h2>
            <p style="font-size: 1.1rem;">
              Confiance que cette image représente <strong>un site de projet humanitaire réel et terminé</strong> :
              <strong>{score_pct:.1f}%</strong>
            </p>

            <h3>Axes d'analyse</h3>
            <ul>
              <li><strong>Indice "projet humanitaire"</strong> : {human_pct:.1f}%</li>
              <li><strong>Type d'infrastructure détecté</strong> : {infra_label} ({infra_pct:.1f}% de confiance)</li>
              <li><strong>État de complétion</strong> : {completion_label} ({completion_pct:.1f}% de confiance)</li>
              <li><strong>Environnement</strong> : {environment_label} ({env_pct:.1f}% de confiance)</li>
              <li><strong>Présence de personnes</strong> : {people_label} ({people_pct:.1f}% de confiance)</li>
            </ul>

            <h3>Qualité visuelle</h3>
            <ul>
              <li><strong>Luminosité moyenne</strong> : {brightness:.1f} / 255</li>
              <li><strong>Contraste approximatif</strong> : {contrast:.3f}</li>
            </ul>

            <h3>Notes de l'IA</h3>
            <ul>
              {notes_html}
            </ul>

            <p style="margin-top: 24px;">
              <a href="/debug/vision" style="text-decoration: none;">⇦ Analyser une autre image</a>
            </p>
          </div>
        </div>
      </body>
    </html>
    """

    return HTMLResponse(content=html)