# trust_optimizer.py
from datetime import datetime
from typing import List, Literal, Tuple

from sqlalchemy.orm import Session

from models import Project, Donation, Evidence, Validator, ProjectStatus, DonationStatus
from validator_service import haversine_km
from vision_ai import analyze_image


def compute_ong_trust_score(project: Project) -> float:
    """
    Score de confiance de base de l'ONG (historique global).
    Pour l'instant : 0.7 par défaut, 0.3 si elle a déjà échoué.
    """
    base = 0.7
    if project.status == ProjectStatus.FAILED:
        base = 0.3
    return base


def compute_evidence_components(
    project: Project,
    evidences: List[Evidence],
    validators: List[Validator],
) -> Tuple[float, float, float, float]:
    """
    Retourne (total_score, gps_score, rep_score, cv_score)
    - gps_score : proximité géographique
    - rep_score : réputation moyenne des validateurs
    - cv_score  : score IA vision moyen sur les images
    - total_score : mix 0.4*gps + 0.3*rep + 0.3*cv
    """
    if not evidences:
        return 0.0, 0.0, 0.5, 0.5

    # 1) GPS
    gps_scores = []
    for ev in evidences:
        d = haversine_km(project.latitude, project.longitude, ev.latitude, ev.longitude)
        gps_scores.append(max(0.0, 1.0 - d / 1.0))  # plein score si < 1 km

    gps_score = sum(gps_scores) / len(gps_scores)

    # 2) Réputation validateurs
    rep_scores = [v.success_rate or 0.5 for v in validators]
    rep_score = sum(rep_scores) / len(rep_scores) if rep_scores else 0.5

    # 3) IA vision (CLIP)
    cv_scores = []
    for ev in evidences:
        try:
            score = analyze_image(ev.image_url)
            cv_scores.append(score)
        except Exception as e:
            print(f"[TRUST_OPT] Error analyzing image {ev.image_url}: {e}")
            continue

    cv_score = sum(cv_scores) / len(cv_scores) if cv_scores else 0.5

    total = 0.4 * gps_score + 0.3 * rep_score + 0.3 * cv_score

    print(
        f"[TRUST_OPT] gps={gps_score:.3f}, rep={rep_score:.3f}, cv={cv_score:.3f}, total={total:.3f}"
    )

    return total, gps_score, rep_score, cv_score


def decide_project_verdict(
    db: Session,
    project: Project,
) -> dict:
    evidences = db.query(Evidence).filter(Evidence.project_id == project.id).all()

    # map validator_id -> Validator
    validators_map = {
        v.id: v for v in db.query(Validator).all()
    }
    validators_used = []
    for ev in evidences:
        v = validators_map.get(ev.validator_id)
        if v:
            validators_used.append(v)

    ong_score = compute_ong_trust_score(project)
    evidence_score, gps_score, rep_score, cv_score = compute_evidence_components(
        project,
        evidences,
        validators_used,
    )

    combined = 0.6 * evidence_score + 0.4 * ong_score

    if combined >= 0.7 and len(evidences) >= 2:
        decision: Literal["SUCCESS", "FAILURE"] = "SUCCESS"
        project.status = ProjectStatus.SUCCESS
    else:
        decision = "FAILURE"
        project.status = ProjectStatus.FAILED

    db.add(project)
    db.commit()

    return {
        "decision": decision,
        "combined_score": combined,
        "evidence_score": evidence_score,
        "ong_score": ong_score,
        "gps_score": gps_score,
        "rep_score": rep_score,
        "cv_score": cv_score,
        "nb_evidences": len(evidences),
    }