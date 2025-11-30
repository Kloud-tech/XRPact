# XRPL Impact Governance AI

Service d'IA par apprentissage par renforcement (PPO) pour optimiser les paramètres de gouvernance des Smart Escrows.

## Installation

```bash
pip install -r requirements.txt
```

## Démarrage

```bash
python governance-api.py
```

Le service démarre sur http://localhost:8001

## API Endpoints

### GET /health
Vérifie que le modèle PPO est chargé

### POST /governance/recommend
Obtient les recommandations de paramètres d'escrow optimisés

**Request:**
```json
{
  "regions": {
    "Africa": {
      "funds_ratio": 0.3,
      "success_rate": 0.7,
      "clawback_rate": 0.15,
      "avg_delay_norm": 0.4,
      "validator_rep": 0.75,
      "projects_funded": 12
    },
    ...
  },
  "global_metrics": {
    "donor_retention": 0.65,
    "impact_score_global": 0.72,
    "geographical_balance": 0.8,
    "new_donors_norm": 0.5
  }
}
```

**Response:**
```json
{
  "impact_score": 0.75,
  "parameters_by_region": {
    "Africa": {
      "matching_multiplier": 1.2,
      "escrow_timeout_days": 60,
      "escrow_stages": 3,
      "validators_per_project": 2,
      "min_reputation": 0.65,
      "highlight_impact_bias": 0.7
    },
    ...
  }
}
```

### POST /governance/feedback
Envoie le feedback sur un escrow terminé (pour réentraînement futur)

## Intégration avec Smart Escrow

Le service Node.js `governance-ai.service.js` communique automatiquement avec cette API pour :

1. Obtenir des recommandations optimisées par région
2. Appliquer ces paramètres aux nouveaux escrows
3. Envoyer du feedback pour améliorer le modèle

## Modèle PPO

- **Algorithme**: Proximal Policy Optimization (Stable-Baselines3)
- **Environnement**: 4 régions (Africa, LatinAmerica, SouthAsia, Other)
- **Métriques optimisées**: Impact global, taux de succès, réduction des clawbacks, équilibre géographique
- **Récompense**: Combinaison pondérée des métriques

## Architecture

```
Frontend (React)
    ↓
Backend Node.js (Smart Escrow)
    ↓
Governance AI Service (Python/FastAPI)
    ↓
Modèle PPO (Stable-Baselines3)
```
