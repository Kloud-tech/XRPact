# 🔗 XRPL On-Chain Storage - Documentation

## 🎯 Vue d'ensemble

**Au lieu de PostgreSQL**, ce module utilise les **technologies XRPL natives** pour stocker toutes les données **directement sur la blockchain** !

### Avantages du stockage on-chain

✅ **Décentralisé** - Pas de serveur centralisé
✅ **Transparent** - Toutes les données publiques sur le ledger
✅ **Immutable** - Les données ne peuvent pas être modifiées
✅ **Auditable** - Historique complet vérifiable
✅ **Permanent** - Stockage persistant sur la blockchain
✅ **Trustless** - Pas besoin de faire confiance à un tiers

---

## 🛠️ Technologies XRPL utilisées

### 1. Transaction Memos (max 1KB)

Les **Memos** sont des champs de données arbitraires attachés aux transactions XRPL.

**Documentation:** [XRPL Transaction Common Fields](https://xrpl.org/docs/references/protocol/transactions/common-fields)

**Format:**
```typescript
{
  Memo: {
    MemoType: convertStringToHex('donation'),           // Type de données
    MemoData: convertStringToHex(JSON.stringify(data)), // Données JSON
    MemoFormat: convertStringToHex('application/json')  // Format
  }
}
```

**Limite:** 1KB par transaction (suffisant pour la plupart des cas)

**Sources:**
- [Memos Format Standard](https://github.com/XRPLF/XRPL-Standards/discussions/103)
- [Writing and Reading Memos](https://docs.xrpl-commons.org/xrpl-basics/writing-and-reading-memos)

---

### 2. NFT Metadata (XLS-20)

Les **NFTs XRPL** permettent de stocker des métadonnées dans leur URI.

**Documentation:** [XRPL NFTs Tutorial](https://xrpl.org/docs/tutorials/nfts/)

**Format:**
```typescript
{
  TransactionType: 'NFTokenMint',
  URI: convertStringToHex(`data:application/json,${metadata}`),
  Memos: [/* métadonnées additionnelles */]
}
```

**Avantages:**
- Stockage de métadonnées riches (JSON)
- URI peut pointer vers IPFS ou données inline
- NFT transférable avec ses métadonnées

---

### 3. XRPL Hooks (Xahau Network)

Les **Hooks** sont des smart contracts WebAssembly exécutés sur le ledger.

**Documentation:**
- [Hooks: Smart Contracts for XRPL](https://hooks.xrpl.org/)
- [Hooks Blog Post](https://blog.xaman.app/hooksxrpl)
- [XLS-101d: XRPL Smart Contracts](https://github.com/XRPLF/XRPL-Standards/discussions/271)

**Fonctionnalités:**
- Exécution de logique avant/après les transactions
- Stockage d'état persistant sur le ledger
- Plus rapide que l'EVM (WebAssembly)

**Note:** Les hooks nécessitent le réseau **Xahau** (testnet hooks)

---

## 📦 Installation

```bash
npm install xrpl winston
```

---

## 🚀 Usage rapide

### 1. Initialisation

```typescript
import { XRPLOnChainStorage } from './xrpl-onchain-storage';

const storage = new XRPLOnChainStorage({
  network: 'testnet',
  websocketUrl: 'wss://s.altnet.rippletest.net:51233',
  poolWalletSeed: 'sXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  poolWalletAddress: 'rXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  enableLogging: true,
});

await storage.connect();
```

---

### 2. Enregistrer une donation ON-CHAIN

```typescript
const donation = {
  donorAddress: 'rDonor123456789ABCDEFGHIJKLMNOP',
  amount: 100,
  timestamp: Date.now(),
  xpGained: 1000,
  level: 4,
  nftTokenId: undefined,
  txHash: '',
};

// Stockage avec MEMO
const txHash = await storage.saveDonationWithMemo(donation);

console.log(`✅ Donation enregistrée ON-CHAIN!`);
console.log(`TX: https://testnet.xrpl.org/transactions/${txHash}`);
```

**Résultat:**
- Transaction créée sur le ledger XRPL
- Données stockées dans le champ `Memos`
- Visible sur l'explorateur: https://testnet.xrpl.org

---

### 3. Lire une donation depuis ON-CHAIN

```typescript
const donation = await storage.readDonationFromMemo(txHash);

console.log(donation);
// {
//   donorAddress: 'rDonor123456789ABCDEFGHIJKLMNOP',
//   amount: 100,
//   timestamp: 1706539935123,
//   xpGained: 1000,
//   level: 4,
//   txHash: 'ABC123...'
// }
```

---

### 4. Récupérer l'historique d'un donateur

```typescript
const history = await storage.getDonationHistory(donorAddress);

console.log(`${history.length} donations trouvées ON-CHAIN!`);

history.forEach(don => {
  console.log(`${don.amount} XRP - Level ${don.level}`);
  console.log(`TX: ${don.txHash}`);
});

const totalDonated = history.reduce((sum, d) => sum + d.amount, 0);
console.log(`Total: ${totalDonated} XRP`);
```

---

### 5. Mint d'un NFT avec métadonnées

```typescript
const nftTokenId = await storage.mintImpactNFTWithMetadata(
  donorAddress,
  10,    // level
  10000  // xp
);

console.log(`NFT minté: ${nftTokenId}`);

// Lire les métadonnées
const metadata = await storage.readNFTMetadata(nftTokenId);

console.log(metadata);
// {
//   name: 'Impact NFT - Level 10',
//   description: 'Donor Impact Token for reaching level 10',
//   attributes: [
//     { trait_type: 'Level', value: 10 },
//     { trait_type: 'XP', value: 10000 },
//     ...
//   ]
// }
```

---

### 6. Enregistrer une ONG ON-CHAIN

```typescript
const ngo = {
  id: 'ngo_1',
  name: 'Climate Action Network',
  walletAddress: 'rClimateAction123456789ABCDEF',
  category: 'climate',
  impactScore: 95,
  weight: 0.25,
  verified: true,
  certifications: ['UN_VERIFIED', 'ISO_14001'],
  totalReceived: 0,
  timestamp: Date.now(),
};

const ngoTxHash = await storage.saveNGOOnChain(ngo);

console.log(`ONG enregistrée ON-CHAIN: ${ngoTxHash}`);
```

---

### 7. Récupérer toutes les ONG

```typescript
const allNGOs = await storage.getAllNGOs();

console.log(`${allNGOs.length} ONG trouvées ON-CHAIN!`);

allNGOs.forEach(ngo => {
  console.log(`${ngo.name} - Score: ${ngo.impactScore}`);
});
```

---

## 📊 Comparaison: PostgreSQL vs On-Chain

| Feature | PostgreSQL | XRPL On-Chain |
|---------|------------|---------------|
| **Décentralisation** | ❌ Centralisé | ✅ Décentralisé |
| **Transparence** | ❌ Base privée | ✅ Ledger public |
| **Immutabilité** | ❌ Modifiable | ✅ Immutable |
| **Auditabilité** | ⚠️ Logs serveur | ✅ Ledger complet |
| **Coût** | 💰 Serveur + maintenance | 💰 Fees XRPL (0.00001 XRP/TX) |
| **Performance** | ✅ Très rapide | ⚠️ Dépend du réseau |
| **Scalabilité** | ✅ Excellente | ⚠️ Limitée par memos (1KB) |
| **Complexité** | ⚠️ Setup DB | ✅ Simple (juste XRPL) |
| **Backup** | ⚠️ Nécessaire | ✅ Auto (ledger) |

---

## 🔍 Comment ça fonctionne

### Flux de stockage avec Memos

```
1. Préparer les données
   ↓
2. Convertir en JSON
   ↓
3. Encoder en hexadécimal
   ↓
4. Créer un memo XRPL
   ↓
5. Créer une transaction Payment
   (self-payment avec montant minimal)
   ↓
6. Attacher le memo
   ↓
7. Soumettre au ledger
   ↓
8. Données stockées ON-CHAIN! ✅
```

### Flux de lecture depuis le ledger

```
1. Requête au ledger XRPL
   ↓
2. Récupérer la transaction par hash
   ↓
3. Extraire le champ Memos
   ↓
4. Décoder de hexadécimal vers string
   ↓
5. Parser le JSON
   ↓
6. Retourner les données ✅
```

---

## 💡 Cas d'usage

### 1. Fonds caritatif transparent

```typescript
// Toutes les donations visibles sur le ledger
const donations = await storage.getDonationHistory(donorAddress);

// Vérification publique
// https://testnet.xrpl.org/accounts/rXXXXXXXXXXXXXXXXX
```

### 2. Audit trail immutable

```typescript
// Chaque distribution est enregistrée on-chain
await storage.saveDonationWithMemo({
  type: 'distribution',
  ngoId: 'ngo_1',
  amount: 50,
  timestamp: Date.now(),
});

// Impossible de modifier l'historique!
```

### 3. Gouvernance décentralisée

```typescript
// Votes stockés on-chain
await storage.saveDonationWithMemo({
  type: 'vote',
  proposal: 'emergency_1',
  voter: 'rVoterXXXXXXXXXXXXXXXXX',
  vote: 'for',
  weight: 100,
});
```

---

## 🔒 Limites et considérations

### Limite de 1KB pour les memos

```typescript
const data = { ... }; // Vos données
const dataJson = JSON.stringify(data);

if (Buffer.byteLength(dataJson, 'utf8') > 1024) {
  // Solution 1: Compresser les données
  // Solution 2: Utiliser plusieurs transactions
  // Solution 3: Stocker sur IPFS et mettre le hash dans le memo
  throw new Error('Data exceeds 1KB memo limit');
}
```

### Coût des transactions

Chaque transaction coûte ~**0.00001 XRP** (10 drops) en fees.

Pour 1000 donations:
- Coût: 0.01 XRP (~$0.005 au prix actuel)
- Très économique comparé à une base de données!

### Performance

- **Écriture:** ~4-5 secondes (validation du ledger)
- **Lecture:** ~100-200ms (requête au ledger)

Pour de meilleures performances:
- Utiliser un **cache en mémoire**
- Indexer les transactions localement
- Utiliser des **hooks** pour des requêtes plus rapides

---

## 🚀 Mode avancé: XRPL Hooks (Xahau)

### Configuration pour Xahau

```typescript
const storage = new XRPLOnChainStorage({
  network: 'xahau',
  websocketUrl: 'wss://xahau-test.net',
  useHooks: true,
  hookHash: '0x...', // Hash du hook déployé
  hookNamespace: '0x...', // Namespace du hook
});
```

### Enregistrement via Hook

```typescript
const txHash = await storage.saveDonationWithHook(donation);

// Le hook s'exécute automatiquement:
// 1. Valide la donation
// 2. Calcule le XP
// 3. Met à jour l'état
// 4. Mint le NFT si level up
```

### Lecture depuis l'état du Hook

```typescript
const donorData = await storage.readFromHookState(
  hookNamespace,
  `donor_${donorAddress}`
);

console.log(donorData);
// {
//   totalDonated: 1000,
//   xp: 10000,
//   level: 11,
//   nfts: [...]
// }
```

---

## 🧪 Tests

### Exécuter les tests

```bash
tsx backend/src/services/test-onchain-storage.ts
```

### Output attendu

```
═══════════════════════════════════════════════════════════════
🧪 XRPL ON-CHAIN STORAGE - TEST SUITE
═══════════════════════════════════════════════════════════════

📌 TEST 1: Connexion au réseau XRPL
✅ Connected to XRPL

📌 TEST 2: Enregistrer une donation ON-CHAIN avec MEMO
💾 Sauvegarde de la donation avec MEMO...
   ✅ Donation enregistrée ON-CHAIN!
   ✅ TX Hash: ABC123...
   ✅ Voir sur explorer: https://testnet.xrpl.org/transactions/ABC123...

...

🎉 TOUS LES TESTS ON-CHAIN RÉUSSIS !
```

---

## 📚 Ressources & Sources

### Documentation officielle

1. **Transaction Memos**
   - [XRPL Common Fields](https://xrpl.org/docs/references/protocol/transactions/common-fields)
   - [Memos Format Standard](https://github.com/XRPLF/XRPL-Standards/discussions/103)
   - [Writing and Reading Memos](https://docs.xrpl-commons.org/xrpl-basics/writing-and-reading-memos)

2. **XRPL Hooks**
   - [Hooks Documentation](https://hooks.xrpl.org/)
   - [Hooks Blog Post](https://blog.xaman.app/hooksxrpl)
   - [XLS-101d Smart Contracts](https://github.com/XRPLF/XRPL-Standards/discussions/271)

3. **NFTokens**
   - [XRPL NFTs Tutorial](https://xrpl.org/docs/tutorials/nfts/)
   - [XLS-20 Standard](https://github.com/XRPLF/XRPL-Standards/discussions/46)

### Outils

- [XRPL Explorer (Testnet)](https://testnet.xrpl.org/)
- [XRPL Explorer (Mainnet)](https://livenet.xrpl.org/)
- [Xahau Explorer](https://explorer.xahau.network/)

---

## 🎯 Bonnes pratiques

### 1. Optimiser la taille des données

```typescript
// ❌ BAD: Données trop verboses
const data = {
  donorAddress: 'rXXXXXXXXXXXXXXXXXXXXXXX',
  amountInXRP: 100,
  experiencePointsGained: 1000,
  currentLevel: 4,
};

// ✅ GOOD: Données compressées
const data = {
  donor: 'rXXXXXXXXXXXXXXXXXXXXXXX',
  amt: 100,
  xp: 1000,
  lvl: 4,
};
```

### 2. Utiliser un cache

```typescript
// Cache les lectures fréquentes
private donationsCache: Map<string, Donation[]> = new Map();

async getDonationHistory(address: string): Promise<Donation[]> {
  // Vérifier le cache
  if (this.donationsCache.has(address)) {
    return this.donationsCache.get(address)!;
  }

  // Sinon, lire depuis le ledger
  const donations = await this.readFromLedger(address);

  // Mettre à jour le cache
  this.donationsCache.set(address, donations);

  return donations;
}
```

### 3. Indexer les transactions

Pour de meilleures performances, maintenir un index local:

```typescript
// Lors de l'enregistrement
await storage.saveDonationWithMemo(donation);

// Ajouter à un index local (Redis, fichier JSON, etc.)
await redis.set(`donations:${donorAddress}`, JSON.stringify([...history, donation]));
```

---

## 🏆 Conclusion

Le stockage on-chain sur XRPL offre:

✅ **Décentralisation totale**
✅ **Transparence maximale**
✅ **Immutabilité garantie**
✅ **Coût minimal** (0.00001 XRP/TX)
✅ **Simplicité** (pas de serveur DB)
✅ **Fiabilité** (ledger XRPL)

**Parfait pour:**
- Fonds caritatifs transparents
- Audit trails immutables
- Gouvernance décentralisée
- Systèmes trustless

---

**Version:** 4.0.0 - Full On-Chain
**Dernière mise à jour:** 2025-01-29
**Auteur:** XRPact Hack For Good Team

**#BuildOnXRPL** 🚀
