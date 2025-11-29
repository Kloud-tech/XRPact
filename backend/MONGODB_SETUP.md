# Guide de Configuration MongoDB pour XRPL Impact Map

## 🎯 Où mettre l'URL MongoDB ?

Dans le fichier **`.env`** (à la racine de `/backend`), ajoutez :

```
MONGODB_URI=votre_url_mongodb_ici
```

---

## 📋 Option 1: MongoDB Atlas (Cloud - RECOMMANDÉ)

### Avantages
- ✅ Gratuit (tier gratuit: 512 MB)
- ✅ Pas d'installation locale
- ✅ Accessible de partout
- ✅ Backups automatiques

### Étapes

1. **Créer un compte gratuit** : https://www.mongodb.com/cloud/atlas/register

2. **Créer un cluster** :
   - Cliquez sur "Build a Database"
   - Choisissez "FREE" (M0 Sandbox)
   - Sélectionnez une région proche (ex: Europe - Paris)
   - Cliquez "Create"

3. **Configurer l'accès** :
   - **Username/Password** : Créez un utilisateur (ex: `xrpluser` / `votre-password`)
   - **IP Whitelist** : Ajoutez `0.0.0.0/0` (permet toutes les IPs - pour dev)

4. **Obtenir l'URL de connexion** :
   - Cliquez sur "Connect"
   - Choisissez "Connect your application"
   - Sélectionnez "Node.js" et version "4.1 or later"
   - Copiez l'URL qui ressemble à :
     ```
     mongodb+srv://xrpluser:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```

5. **Configurer `.env`** :
   ```bash
   # Dans /backend/.env
   MONGODB_URI=mongodb+srv://xrpluser:VOTRE_PASSWORD@cluster0.xxxxx.mongodb.net/xrpl-impact-map?retryWrites=true&w=majority
   ```
   
   ⚠️ **Remplacez** :
   - `<password>` par votre mot de passe
   - Ajoutez `/xrpl-impact-map` après `.net` (nom de la database)

---

## 📋 Option 2: MongoDB Local

### Avantages
- ✅ Données en local
- ✅ Pas besoin d'internet
- ✅ Contrôle total

### Installation sur macOS

```bash
# Installer MongoDB via Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Démarrer MongoDB
brew services start mongodb-community

# Vérifier que ça fonctionne
mongosh
```

### Configurer `.env`

```bash
# Dans /backend/.env
MONGODB_URI=mongodb://localhost:27017/xrpl-impact-map
```

---

## 🔐 Configuration complète du fichier `.env`

Créez ou modifiez `/backend/.env` :

```bash
# MongoDB (choisissez une option ci-dessus)
MONGODB_URI=mongodb://localhost:27017/xrpl-impact-map

# XRPL Oracle Wallet
# Générez-en un avec: curl -X POST http://localhost:3001/api/wallet/generate
ORACLE_SEED=sYourOracleSeedGoesHere

# Encryption Key (générez-en une)
# Commande: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ENCRYPTION_KEY=

# Port du serveur
PORT=3001
```

---

## 🚀 Générer les clés manquantes

### 1. Générer une clé de chiffrement

```bash
cd backend
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copiez le résultat dans `ENCRYPTION_KEY=`

### 2. Générer un wallet Oracle

```bash
# Démarrez le serveur
npm start

# Dans un autre terminal
curl -X POST http://localhost:3001/api/wallet/generate
```

Copiez le `seed` dans `ORACLE_SEED=`

---

## ✅ Vérifier la configuration

Une fois configuré, démarrez le serveur :

```bash
npm start
```

Vous devriez voir :

```
✅ Connecté à MongoDB
✅ Connecté à XRPL Testnet
🔑 Oracle Wallet: rXXXXXXXXXXXXXXXXXXXXXXX
```

---

## 🐛 Dépannage

### Erreur : "MongooseServerSelectionError"

**Cause** : MongoDB n'est pas accessible

**Solutions** :
- **Atlas** : Vérifiez que votre IP est autorisée (ajoutez `0.0.0.0/0`)
- **Local** : MongoDB n'est pas démarré → `brew services start mongodb-community`

### Erreur : "Authentication failed"

**Cause** : Mauvais username/password dans l'URL Atlas

**Solution** : Vérifiez le mot de passe (pas de caractères spéciaux non-encodés)

### MongoDB local ne démarre pas

```bash
# Vérifier le statut
brew services list

# Redémarrer
brew services restart mongodb-community

# Voir les logs
tail -f /opt/homebrew/var/log/mongodb/mongo.log
```

---

## 📝 Exemple de fichier `.env` complet

```bash
# MongoDB Atlas (Cloud)
MONGODB_URI=mongodb+srv://xrpluser:MyP@ssw0rd123@cluster0.abc123.mongodb.net/xrpl-impact-map?retryWrites=true&w=majority

# Oracle Wallet
ORACLE_SEED=sEdSKaCy2JT7JaM7v95H9SxkhP9wS2r

# Encryption
ENCRYPTION_KEY=a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456

# Server
PORT=3001
```

---

## 🎓 Recommandation

Pour débuter rapidement : **Utilisez MongoDB Atlas** (Option 1)
- Setup en 5 minutes
- Pas d'installation
- Tier gratuit suffisant pour le développement

Pour la production : Utilisez Atlas avec IP whitelisting spécifique et un utilisateur dédié.
