# api.py - API FastAPI pour exposer le service d'analyse d'images
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import shutil
import uuid
from typing import Dict, Any

from vision_ai import analyze_image, explain_image

app = FastAPI(title="XRPL Impact Vision AI API")

# CORS pour permettre les appels depuis le backend Node.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dossier temporaire pour les uploads
UPLOAD_DIR = Path("./uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


@app.get("/")
def root():
    return {
        "service": "XRPL Impact Vision AI",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "clip_available": True  # À ajuster selon vision_ai.HAS_CLIP
    }


@app.post("/analyze")
async def analyze_image_endpoint(
    file: UploadFile = File(...),
    category: str = "humanitarian"
) -> Dict[str, Any]:
    """
    Analyse une image uploadée avec CLIP.
    
    Retourne:
    - score: score global (0-100)
    - confidence: confiance de l'analyse (0-1)
    - verified: booléen si l'image correspond au projet
    - category: catégorie détectée (water, solar, school, etc.)
    - description: description textuelle
    - tags: liste de tags
    - matchScore: score de correspondance avec la catégorie attendue
    """
    try:
        # Sauvegarder l'image temporairement
        file_id = str(uuid.uuid4())
        file_ext = Path(file.filename).suffix or ".jpg"
        temp_path = UPLOAD_DIR / f"{file_id}{file_ext}"
        
        with temp_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Analyser avec CLIP
        analysis = explain_image(str(temp_path))
        
        # Mapper les résultats au format attendu par le backend
        score = int(analysis.get("score", 0.5) * 100)
        humanitarian_conf = analysis.get("humanitarian_confidence", 0.5)
        infra_type = analysis.get("infra_type_label", "unknown")
        completion = analysis.get("completion_label", "unknown")
        
        # Déterminer la catégorie
        category_mapping = {
            "Puits / accès à l'eau": "water",
            "École / infrastructure éducative": "education",
            "Énergie solaire / infrastructure énergétique": "solar",
            "Autre infrastructure humanitaire": "infrastructure"
        }
        detected_category = category_mapping.get(infra_type, "other")
        
        # Vérification : si la catégorie détectée correspond à l'attendue
        verified = (
            humanitarian_conf > 0.6 and
            completion in ["Terminé", "En chantier"] and
            score > 50
        )
        
        # Score de correspondance
        match_score = humanitarian_conf * 0.7 + (score / 100) * 0.3
        
        # Nettoyage
        temp_path.unlink(missing_ok=True)
        
        return {
            "success": True,
            "verified": verified,
            "score": score,
            "confidence": float(humanitarian_conf),
            "category": detected_category,
            "description": f"{infra_type} - {completion}",
            "tags": [detected_category, completion.lower(), "humanitarian"],
            "objects": [infra_type],
            "matchScore": float(match_score),
            "reasoning": f"Infrastructure: {infra_type}, État: {completion}, Confiance humanitaire: {humanitarian_conf:.2f}",
            "raw_analysis": analysis  # Données brutes pour debug
        }
        
    except Exception as e:
        # Nettoyage en cas d'erreur
        if temp_path.exists():
            temp_path.unlink(missing_ok=True)
        
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/simple-analyze")
async def simple_analyze(file: UploadFile = File(...)) -> Dict[str, Any]:
    """
    Version simplifiée de l'analyse - retourne juste le score brut.
    """
    try:
        file_id = str(uuid.uuid4())
        file_ext = Path(file.filename).suffix or ".jpg"
        temp_path = UPLOAD_DIR / f"{file_id}{file_ext}"
        
        with temp_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        result = analyze_image(str(temp_path))
        
        temp_path.unlink(missing_ok=True)
        
        return {
            "success": True,
            "score": float(result.get("score", 0.5)) * 100,
            "data": result
        }
        
    except Exception as e:
        if temp_path.exists():
            temp_path.unlink(missing_ok=True)
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    print("[AI API] Starting Vision AI API on port 8000...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
