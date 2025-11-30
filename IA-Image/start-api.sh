#!/bin/bash
# Script pour démarrer l'API Vision AI Python

echo "🚀 Démarrage de l'API Vision AI..."
echo "📍 URL: http://localhost:8000"
echo ""

# Vérifier si le venv existe
if [ ! -d "venv" ]; then
    echo "⚠️  Environnement virtuel Python non trouvé"
    echo "📦 Création de l'environnement virtuel..."
    python3 -m venv venv
    
    echo "📥 Installation des dépendances..."
    source venv/bin/activate
    pip install -r requirements.txt
else
    source venv/bin/activate
fi

# Lancer l'API
echo "✅ Démarrage du serveur FastAPI..."
python api.py
