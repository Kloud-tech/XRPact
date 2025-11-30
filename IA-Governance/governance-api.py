"""
XRPL Impact Governance API
Expose le modèle PPO via FastAPI pour le backend Node.js
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional
import numpy as np
from pathlib import Path
import sys

# Ajouter le chemin du script de gouvernance
sys.path.append(str(Path(__file__).parent.parent / "IA cloclo"))

try:
    from XRPL_Impact_Governance import (
        GovernanceEnv,
        train_demo_model,
        NUM_REGIONS,
        REGION_NAMES,
        OBS_SIZE
    )
except ImportError:
    print("❌ Impossible d'importer XRPL_Impact_Governance.py")
    print("Assurez-vous que le fichier est dans 'IA cloclo/'")
    sys.exit(1)

app = FastAPI(title="XRPL Impact Governance AI")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modèle PPO global
governance_model = None
env = None


class RegionMetrics(BaseModel):
    funds_ratio: float
    success_rate: float
    clawback_rate: float
    avg_delay_norm: float
    validator_rep: float
    projects_funded: int


class GlobalMetrics(BaseModel):
    donor_retention: float
    impact_score_global: float
    geographical_balance: float
    new_donors_norm: float


class GovernanceRequest(BaseModel):
    regions: Dict[str, RegionMetrics]
    global_metrics: GlobalMetrics


class EscrowFeedback(BaseModel):
    escrow_id: str
    region: str
    success: bool
    clawback: bool
    delay_days: float
    parameters_used: Dict


@app.on_event("startup")
async def startup_event():
    global governance_model, env
    print("🚀 Démarrage du service Governance AI...")
    print("📊 Entraînement du modèle PPO...")
    
    try:
        governance_model = train_demo_model()
        env = GovernanceEnv()
        print("✅ Modèle PPO entraîné et prêt")
    except Exception as e:
        print(f"❌ Erreur lors de l'entraînement: {e}")
        governance_model = None


@app.get("/")
def root():
    return {
        "service": "XRPL Impact Governance AI",
        "version": "1.0.0",
        "model": "PPO (Stable-Baselines3)",
        "status": "running" if governance_model else "error"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy" if governance_model else "unhealthy",
        "model_loaded": governance_model is not None
    }


@app.post("/governance/recommend")
async def get_recommendations(request: GovernanceRequest):
    """
    Obtenir les recommandations de paramètres d'escrow par région
    basées sur les métriques actuelles
    """
    if not governance_model:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        # Construire l'observation pour le modèle
        obs = _build_observation(request.regions, request.global_metrics)
        
        # Prédiction PPO
        action, _ = governance_model.predict(obs, deterministic=True)
        
        # Décoder l'action en paramètres concrets
        params = _decode_action(action)
        
        # Calculer un score d'impact estimé
        impact_score = request.global_metrics.impact_score_global
        
        return {
            "impact_score": float(impact_score),
            "parameters_by_region": params,
            "model_confidence": 0.85,  # Placeholder
            "timestamp": str(np.datetime64('now'))
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@app.post("/governance/feedback")
async def receive_feedback(feedback: EscrowFeedback):
    """
    Recevoir le feedback sur un escrow terminé
    (Pour futur fine-tuning du modèle)
    """
    # TODO: Stocker le feedback pour réentraînement périodique
    print(f"📝 Feedback reçu pour escrow {feedback.escrow_id}:")
    print(f"   Région: {feedback.region}, Succès: {feedback.success}")
    
    return {
        "status": "feedback_received",
        "escrow_id": feedback.escrow_id
    }


def _build_observation(regions: Dict[str, RegionMetrics], global_metrics: GlobalMetrics) -> np.ndarray:
    """Construire le vecteur d'observation pour le modèle PPO"""
    region_order = ["Africa", "LatinAmerica", "SouthAsia", "Other"]
    
    per_region = []
    for region_name in region_order:
        if region_name in regions:
            r = regions[region_name]
            per_region.extend([
                r.funds_ratio,
                r.success_rate,
                r.clawback_rate,
                r.avg_delay_norm,
                r.validator_rep
            ])
        else:
            # Valeurs par défaut si région manquante
            per_region.extend([0.25, 0.5, 0.1, 0.3, 0.7])
    
    global_feats = [
        global_metrics.donor_retention,
        global_metrics.impact_score_global,
        global_metrics.geographical_balance,
        global_metrics.new_donors_norm
    ]
    
    obs = np.array(per_region + global_feats, dtype=np.float32)
    assert obs.shape[0] == OBS_SIZE, f"Observation size mismatch: {obs.shape[0]} vs {OBS_SIZE}"
    
    return obs


def _decode_action(action: np.ndarray) -> Dict[str, Dict]:
    """Décoder l'action PPO en paramètres de gouvernance par région"""
    region_order = ["Africa", "LatinAmerica", "SouthAsia", "Other"]
    
    a = np.clip(action, -1.0, 1.0).astype(np.float32)
    
    # Matching multipliers par région (4 premiers éléments)
    matching_multipliers = 0.5 + (a[:NUM_REGIONS] + 1.0) * 0.75  # 0.5-2.0
    
    # Paramètres globaux
    escrow_timeout_days = float(15.0 + (a[NUM_REGIONS] + 1.0) * 37.5)  # 15-90
    escrow_stages = int(np.clip(np.round(2.0 + (a[NUM_REGIONS + 1] + 1.0) * 1.0), 2, 4))
    validators_per_project = int(np.clip(np.round(1.0 + (a[NUM_REGIONS + 2] + 1.0) * 1.0), 1, 3))
    min_reputation = float(0.3 + (a[NUM_REGIONS + 3] + 1.0) * 0.3)  # 0.3-0.9
    highlight_impact_bias = float((a[NUM_REGIONS + 4] + 1.0) * 0.5)  # 0-1
    
    result = {}
    for i, region in enumerate(region_order):
        result[region] = {
            "matching_multiplier": float(matching_multipliers[i]),
            "escrow_timeout_days": escrow_timeout_days,
            "escrow_stages": escrow_stages,
            "validators_per_project": validators_per_project,
            "min_reputation": min_reputation,
            "highlight_impact_bias": highlight_impact_bias
        }
    
    return result


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=9000)
