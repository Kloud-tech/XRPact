# MongoDB-Only Setup Guide

## ✅ Configuration Simple (Sans Docker)

Le projet utilise maintenant **uniquement MongoDB Atlas** (cloud) - plus besoin de Docker, PostgreSQL ou Redis !

---

## 🚀 Setup en 3 étapes

### 1. Créer un compte MongoDB Atlas (Gratuit)

1. Allez sur https://www.mongodb.com/cloud/atlas/register
2. Créez un compte (gratuit)
3. Créez un cluster "FREE" (M0 Sandbox)
4. Région: Europe (Paris ou Frankfurt)

### 2. Configurez l'accès

**Username/Password** :
- Username: `KLOUD` (ou votre choix)
- Password: Créez un mot de passe fort

**IP Whitelist** :
- Ajoutez `0.0.0.0/0` (permet toutes les IPs - pour développement)
- Pour production: restreignez à vos IPs spécifiques

### 3. Obtenez l'URL de connexion

1. Cliquez sur "Connect"
2. Choisissez "Connect your application"
3. Driver: Node.js 4.1 or later
4. Copiez l'URL qui ressemble à:
   ```
   mongodb+srv://KLOUD:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### 4. Configurez votre `.env`

```bash
# Dans /backend/.env (créez-le si nécessaire)
MONGODB_URI=mongodb+srv://KLOUD:VOTRE_MOT_DE_PASSE@cluster0.xxxxx.mongodb.net/xrpl-impact-map?retryWrites=true&w=majority&appName=XRPact

# Autres configs
ORACLE_SEED=sYourOracleSeedHere
ENCRYPTION_KEY=4a3ab3b54a0a2bf33df488615639c4a75d86cf5e30afa4c59002d589a4d6e201
PORT=3001
```

**⚠️ Important** : Ajoutez `/xrpl-impact-map` après `.net` pour spécifier le nom de la database

---

## 📊 Collections MongoDB

Le système créera automatiquement ces collections :

| Collection | Description |
|------------|-------------|
| `escrows` | Smart escrows avec conditions crypto |
| `users` | Utilisateurs/donateurs (KYC, XP, niveau) |
| `ngos` | ONGs vérifiées |
| `projects` | Projets de charité |
| `donations` | Historique des dons |
| `impact_nfts` | NFTs évolutifs des donateurs |
| `redistributions` | Historique des redistributions |

---

## ✅ Avantages MongoDB Atlas vs Docker

| Aspect | Docker (Ancien) | MongoDB Atlas (Nouveau) |
|--------|----------------|------------------------|
| Setup | Complexe (Docker + PostgreSQL + Redis) | Simple (juste une URL) |
| Maintenance | Locale (vous gérez tout) | Cloud (managé) |
| Backups | Manuel | Automatique |
| Scaling | Limité | Facile |
| Coût | Ressources locales | Gratuit (tier M0) |
| Collaboration | Difficile | Facile (URL partagée) |

---

## 🔧 Commandes utiles

### Démarrer le serveur

```bash
cd backend
npm install  # Installer les dépendances
npm run dev  # Mode développement
```

### Vérifier la connexion

```bash
# Le serveur affichera:
✅ Connected to MongoDB
   Database: xrpl-impact-map
   Host: cluster0.xxxxx.mongodb.net
```

### Voir vos données

1. Allez sur https://cloud.mongodb.com
2. Cliquez sur "Browse Collections"
3. Sélectionnez votre database `xrpl-impact-map`
4. Explorez vos collections

---

## 🐛 Troubleshooting

### Erreur: "MongooseServerSelectionError"

❌ **Cause**: MongoDB Atlas n'est pas accessible

✅ **Solutions**:
1. Vérifiez que votre IP est dans la whitelist (0.0.0.0/0)
2. Vérifiez votre username/password
3. Assurez-vous que l'URL contient le nom de la database

### Erreur: "Authentication failed"

❌ **Cause**: Mauvais credentials

✅ **Solutions**:
1. Double-vérifiez username/password
2. Pas de caractères spéciaux dans le mot de passe (ou encodez-les)
3. Recréez un user dans MongoDB Atlas

### L'application affiche "Running in MOCK mode"

❌ **Cause**: `MONGODB_URI` n'est pas défini ou invalide

✅ **Solutions**:
1. Vérifiez que `.env` existe dans `/backend`
2. Vérifiez que `MONGODB_URI` est correctement configuré
3. Redémarrez le serveur

---

## 📈 Migration depuis Docker

Si vous aviez des données dans Docker/PostgreSQL :

### Option 1: Recommencer (recommandé pour dev)
Les données de test seront regénérées automatiquement

### Option 2: Migrer manuellement
```bash
# Exporter depuis PostgreSQL
pg_dump xrpl_impact > backup.sql

# Importer dans MongoDB (nécessite un script de migration)
# Contactez-nous si vous avez des données importantes à migrer
```

---

## 🎯 Prochaines étapes

1. ✅ Configurez MongoDB Atlas
2. ✅ Copiez l'URL dans `.env`
3. ✅ Générez les autres clés (ORACLE_SEED, ENCRYPTION_KEY)
4. ✅ Démarrez le serveur
5. ✅ Testez l'API

---

**Questions ?** Consultez la documentation MongoDB Atlas : https://docs.atlas.mongodb.com/
