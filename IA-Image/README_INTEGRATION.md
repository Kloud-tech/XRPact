# Configuration de l'IA Vision - XRPL Impact Map

## Architecture

Le système utilise une **IA locale Python** basée sur CLIP (OpenAI Vision) pour analyser les photos de preuve terrain.

```
Frontend Upload Photo
    ↓
Backend Node.js (routes/ai.js)
    ↓
Python FastAPI (IA-Image/api.py)
    ↓
CLIP Model (vision_ai.py)
    ↓
Analyse + Score
    ↓
Auto-déblocage si score ≥ 85%
```

## Services

### 1. **API Python Vision AI** (`IA-Image/api.py`)
- **Port:** 8000
- **Endpoints:**
  - `POST /analyze` - Analyse complète d'image avec CLIP
  - `POST /simple-analyze` - Analyse simplifiée
  - `GET /health` - Status de l'API

### 2. **Backend Node.js** (`backend/services/imageAnalysisService.js`)
- Reçoit les images du frontend
- Envoie à l'API Python
- Gère le déblocage automatique des escrows

## Démarrage

### Option 1: Script automatique
```bash
cd IA-Image
./start-api.sh
```

### Option 2: Manuel
```bash
cd IA-Image

# Créer environnement virtuel (première fois)
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Démarrer l'API
python api.py
```

L'API sera accessible sur `http://localhost:8000`

## Configuration Backend

Le backend est déjà configuré pour utiliser l'IA locale.

**Fichier:** `backend/.env`
```env
AI_SERVICE_URL=http://localhost:8000
```

**Fichier:** `backend/services/imageAnalysisService.js`
```javascript
this.aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
```

## Modèle IA

Le système utilise **CLIP (openai/clip-vit-base-patch32)** qui permet:

- ✅ Classification d'images multimodales (texte + image)
- ✅ Détection de type d'infrastructure (puits, école, panneaux solaires)
- ✅ Évaluation de l'état de complétion (terminé, en cours, non démarré)
- ✅ Score de confiance humanitaire
- ✅ Analyse sans connexion externe (local)

## Analyse d'image

### Input
```python
{
  "file": <binary image data>,
  "category": "water" | "solar" | "education" | "infrastructure"
}
```

### Output
```json
{
  "success": true,
  "verified": true,
  "score": 87,
  "confidence": 0.82,
  "category": "water",
  "description": "Puits / accès à l'eau - Terminé",
  "tags": ["water", "terminé", "humanitarian"],
  "objects": ["Puits / accès à l'eau"],
  "matchScore": 0.85,
  "reasoning": "Infrastructure: Puits / accès à l'eau, État: Terminé, Confiance humanitaire: 0.82"
}
```

## Seuils de validation

```javascript
// backend/routes/ai.js
if (analysisResult.analysis.aiScore >= 85 && 
    analysisResult.analysis.confidence >= 0.8) {
  // ✅ Auto-validation et déblocage automatique
}

if (analysisResult.analysis.aiScore >= 70 && 
    analysisResult.analysis.aiScore < 85) {
  // ⚠️ Validation manuelle requise
}

if (analysisResult.analysis.aiScore < 70) {
  // ❌ Rejet
}
```

## Dépendances Python

```txt
fastapi==0.115.6        # Framework web
uvicorn==0.34.0         # Serveur ASGI
python-multipart==0.0.20 # Upload de fichiers
pillow==11.1.0          # Traitement d'images
transformers==4.47.1    # CLIP model
torch==2.6.0            # PyTorch (pour CLIP)
```

## Tests

### Test manuel de l'API
```bash
curl -X POST "http://localhost:8000/analyze" \
  -F "file=@photo.jpg" \
  -F "category=water"
```

### Test avec le frontend
1. Démarrer l'API IA: `cd IA-Image && ./start-api.sh`
2. Démarrer le backend: `cd backend && npm start`
3. Uploader une photo via l'interface

## Debugging

### Vérifier que l'API est accessible
```bash
curl http://localhost:8000/health
```

Réponse attendue:
```json
{
  "status": "healthy",
  "clip_available": true
}
```

### Logs backend
```bash
cd backend
npm start

# Chercher:
# ✅ [ImageAnalysis] Using AI Service
# ❌ [ImageAnalysis] AI Service Error: ...
```

### Logs Python
```bash
cd IA-Image
python api.py

# Chercher:
# INFO:     Application startup complete
# [VISION_AI] CLIP model loaded
```

## Avantages vs OpenAI API

| Critère | IA Locale (CLIP) | OpenAI API |
|---------|------------------|------------|
| **Coût** | ✅ Gratuit | ❌ Payant (~$0.01/image) |
| **Latence** | ✅ ~1-2s | ⚠️ 3-5s |
| **Vie privée** | ✅ Local | ❌ Externe |
| **Personnalisation** | ✅ Fine-tunable | ❌ Limitée |
| **Disponibilité** | ✅ Offline | ❌ Besoin internet |

## Troubleshooting

### Erreur: `AI Service Error: connect ECONNREFUSED`
➡️ L'API Python n'est pas démarrée
```bash
cd IA-Image
./start-api.sh
```

### Erreur: `Module 'torch' not found`
➡️ Dépendances non installées
```bash
cd IA-Image
source venv/bin/activate
pip install -r requirements.txt
```

### Score toujours faible
➡️ Vérifier la qualité de l'image:
- Minimum 400x400px
- Format JPG/PNG
- Bonne luminosité
- Sujet visible et centré
