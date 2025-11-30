#!/bin/bash

# Script pour démarrer tous les services XRPL Impact Map
# y compris l'IA de Gouvernance

echo "🚀 Démarrage XRPL Impact Map - Google Maps de l'Humanitaire"
echo "============================================================"

# Couleurs
GREEN='\033[0.32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Governance AI (Python PPO)
echo -e "${BLUE}📊 Démarrage Governance AI (PPO)...${NC}"
cd IA-Governance
if [ ! -d "venv" ]; then
    echo "Création de l'environnement virtuel Python..."
    python3 -m venv venv
fi
source venv/bin/activate
pip install -q -r requirements.txt
python governance-api.py &
GOVERNANCE_PID=$!
echo -e "${GREEN}✅ Governance AI démarré (PID: $GOVERNANCE_PID)${NC}"
cd ..

sleep 3

# 2. Image AI (CLIP)
echo -e "${BLUE}🖼️  Démarrage Image AI (CLIP)...${NC}"
cd IA-Image
python api.py &
IMAGE_AI_PID=$!
echo -e "${GREEN}✅ Image AI démarré (PID: $IMAGE_AI_PID)${NC}"
cd ..

sleep 2

# 3. Backend Node.js
echo -e "${BLUE}⚙️  Démarrage Backend Node.js...${NC}"
cd backend
npm run dev &
BACKEND_PID=$!
echo -e "${GREEN}✅ Backend démarré (PID: $BACKEND_PID)${NC}"
cd ..

sleep 3

# 4. Frontend React
echo -e "${BLUE}🌐 Démarrage Frontend React...${NC}"
cd frontend
npm run dev &
FRONTEND_PID=$!
echo -e "${GREEN}✅ Frontend démarré (PID: $FRONTEND_PID)${NC}"
cd ..

echo ""
echo "============================================================"
echo -e "${GREEN}✅ Tous les services sont démarrés!${NC}"
echo "============================================================"
echo ""
echo "📍 Services disponibles:"
echo -e "   ${YELLOW}Governance AI:${NC}  http://localhost:8001"
echo -e "   ${YELLOW}Image AI:${NC}       http://localhost:8000"
echo -e "   ${YELLOW}Backend API:${NC}    http://localhost:3001"
echo -e "   ${YELLOW}Frontend:${NC}       http://localhost:5173"
echo ""
echo "📝 Pour arrêter tous les services:"
echo "   kill $GOVERNANCE_PID $IMAGE_AI_PID $BACKEND_PID $FRONTEND_PID"
echo ""
echo "============================================================"

# Sauvegarder les PIDs
echo "$GOVERNANCE_PID $IMAGE_AI_PID $BACKEND_PID $FRONTEND_PID" > .services.pid

# Attendre Ctrl+C
trap "kill $GOVERNANCE_PID $IMAGE_AI_PID $BACKEND_PID $FRONTEND_PID; exit" INT

wait
