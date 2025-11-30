# Configuration GemWallet

## Installation

1. **Installer l'extension GemWallet**
   - Chrome/Brave: https://chrome.google.com/webstore/detail/gemwallet/
   - Firefox: https://addons.mozilla.org/firefox/addon/gemwallet/
   - Site officiel: https://gemwallet.app/

2. **Créer ou importer un wallet**
   - Ouvrir l'extension GemWallet
   - Créer un nouveau wallet OU importer un wallet existant
   - **IMPORTANT**: Sauvegarder votre phrase de récupération en lieu sûr !

## Configuration pour le développement

### Réseau Testnet

Pour tester sans utiliser de vrais XRP:

1. Ouvrir GemWallet
2. Aller dans **Paramètres** > **Réseau**
3. Sélectionner **Testnet** ou **Devnet**

### Obtenir des XRP de test

1. Utiliser un faucet testnet:
   - https://faucet.altnet.rippletest.net/
   - https://faucet.tequ.dev/

2. Entrer votre adresse GemWallet
3. Recevoir 1000 XRP de test gratuits

## Utilisation dans XRPact

### Connexion

1. Cliquer sur **"Connect Wallet"** dans l'application
2. GemWallet s'ouvrira automatiquement
3. Approuver la connexion

### Faire une donation

1. Entrer le montant de XRP
2. Cliquer sur **"Donate Now"**
3. GemWallet affichera une popup de confirmation
4. Vérifier les détails:
   - **Destination**: Adresse du pool XRPact
   - **Montant**: Montant en XRP + frais réseau (~0.000012 XRP)
5. Cliquer sur **"Confirmer"**
6. Attendre la confirmation de la transaction

## Versions supportées

L'application supporte **toutes les versions** de GemWallet:

- ✅ **v3.5+**: API `submitPayment` (recommandée)
- ✅ **v3.0-3.4**: API `signPayment`
- ✅ **v2.x**: API `sendPayment` (ancienne)

## Dépannage

### "GemWallet not installed"

**Solution**: Installer l'extension depuis https://gemwallet.app/

### "Connection rejected by user"

**Solution**: Vous avez refusé la connexion. Réessayez et acceptez.

### "Insufficient XRP balance"

**Solutions**:
- Vérifier votre solde dans GemWallet
- Sur testnet: utiliser un faucet pour obtenir des XRP de test
- Chaque wallet XRPL doit conserver minimum **10 XRP de réserve**

### "Payment method not available"

**Solutions**:
1. Mettre à jour GemWallet vers la dernière version
2. Rafraîchir la page (F5)
3. Redémarrer le navigateur
4. Vérifier que GemWallet est activé dans les extensions

### La transaction n'apparaît pas

**Solution**: 
- Vérifier sur un explorateur XRPL:
  - Testnet: https://testnet.xrpl.org/
  - Mainnet: https://livenet.xrpl.org/
- Entrer votre adresse ou le hash de transaction

## Sécurité

⚠️ **IMPORTANT** ⚠️

- **JAMAIS** partager votre phrase de récupération (seed)
- **JAMAIS** entrer votre seed sur un site web
- **TOUJOURS** vérifier l'adresse de destination avant de confirmer
- Sur **mainnet**, commencer avec de petits montants pour tester
- Les transactions XRPL sont **IRRÉVERSIBLES**

## Support

- Documentation GemWallet: https://gemwallet.app/docs
- Discord GemWallet: https://discord.gg/gemwallet
- Documentation XRPL: https://xrpl.org/

---

**Développé par**: XRPact Team  
**Dernière mise à jour**: 30 novembre 2025
