/**
 * XRPL Impact Fund Hook - Proof of Concept
 *
 * Ceci est un exemple de Hook XRPL qui pourrait être déployé sur Xahau.
 * Les Hooks sont des smart contracts qui s'exécutent automatiquement
 * lors de certaines transactions sur le ledger.
 *
 * NOTE: Ce code est un exemple conceptuel. Pour déployer un vrai Hook,
 * il faudrait le compiler en WebAssembly et utiliser le SetHook transaction.
 *
 * Fonctionnalités du Hook:
 * 1. Détecte les donations entrantes au pool wallet
 * 2. Émet des événements pour le backend
 * 3. Déclenche le mint de NFTs
 * 4. Gère les distributions automatiques
 *
 * Documentation: https://xrpl-hooks.readme.io/
 */

// ============================================================================
// HOOK CONFIGURATION
// ============================================================================

/**
 * HookOn: Définit quand le hook s'exécute
 * - ttPAYMENT: Sur les transactions Payment
 * - ttNFTOKEN_MINT: Sur les mints de NFT
 */
const HOOK_ON = ['ttPAYMENT', 'ttNFTOKEN_MINT'];

/**
 * Hook Namespace: Identifiant unique du hook
 */
const HOOK_NAMESPACE = '584D414354494D504143540000000000000000000000000000000000000000'; // "XMACTIMPACT"

/**
 * Pool Wallet Address
 */
const POOL_WALLET = process.env.XRPL_POOL_WALLET_ADDRESS || 'rPoolWalletAddress';

// ============================================================================
// HOOK MAIN FUNCTION
// ============================================================================

/**
 * Hook principal - Appelé pour chaque transaction
 *
 * @param reserved - Réservé pour usage futur
 * @param hookAccount - Compte sur lequel le hook est installé
 * @param hookHash - Hash du hook
 * @param hookNamespace - Namespace du hook
 * @param otxn - Transaction originale (décodée)
 * @returns 0 (accept) ou négatif (reject)
 */
function hook(
  reserved: number,
  hookAccount: string,
  hookHash: string,
  hookNamespace: string,
  otxn: any
): number {
  // 1. Vérifier le type de transaction
  const txType = otxn.TransactionType;

  if (txType === 'Payment') {
    return handlePayment(otxn);
  }

  if (txType === 'NFTokenMint') {
    return handleNFTMint(otxn);
  }

  // Autres types de transaction: accepter sans traitement
  return 0;
}

// ============================================================================
// PAYMENT HANDLER - Donations
// ============================================================================

/**
 * Gérer les donations (transactions Payment vers le pool)
 */
function handlePayment(otxn: any): number {
  const destination = otxn.Destination;
  const amount = otxn.Amount;
  const donor = otxn.Account;

  // Vérifier que c'est bien une donation vers le pool
  if (destination !== POOL_WALLET) {
    // Pas pour nous, accepter sans traitement
    return 0;
  }

  // Convertir le montant (en drops) en XRP
  const amountXRP = parseFloat(amount) / 1000000;

  console.log(`[Hook] Donation received: ${amountXRP} XRP from ${donor}`);

  // Émettre un événement pour le backend
  emitEvent('DonationReceived', {
    donor,
    amount: amountXRP,
    txHash: otxn.hash,
    timestamp: Date.now(),
  });

  // Calculer XP (1 XRP = 10 XP)
  const xpGained = Math.floor(amountXRP * 10);

  // Déclencher le mint de NFT (via état du hook)
  // Dans un vrai hook, on utiliserait emit() pour créer une transaction secondaire
  triggerNFTMint(donor, xpGained);

  // Accepter la transaction
  return 0;
}

// ============================================================================
// NFT MINT HANDLER
// ============================================================================

/**
 * Gérer les mints de NFT
 */
function handleNFTMint(otxn: any): number {
  const minter = otxn.Account;
  const uri = otxn.URI;

  console.log(`[Hook] NFT minted by ${minter}`);

  // Émettre un événement
  emitEvent('NFTMinted', {
    minter,
    uri,
    txHash: otxn.hash,
    timestamp: Date.now(),
  });

  // Accepter la transaction
  return 0;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Émettre un événement pour le backend
 * En réalité, cela serait géré via HookExecution metadata ou un oracle
 */
function emitEvent(eventType: string, data: any): void {
  // Dans un vrai hook, on utiliserait:
  // - emit() pour créer une transaction secondaire
  // - ou state_set() pour stocker l'événement dans le hook state
  // - ou un oracle externe qui écoute les transactions

  console.log(`[Hook Event] ${eventType}:`, JSON.stringify(data));

  // Exemple de stockage dans le hook state:
  // const stateKey = `event_${Date.now()}`;
  // state_set(stateKey, JSON.stringify({ type: eventType, data }));
}

/**
 * Déclencher le mint d'un NFT
 * En réalité, cela créerait une transaction NFTokenMint via emit()
 */
function triggerNFTMint(donor: string, xp: number): void {
  console.log(`[Hook] Triggering NFT mint for ${donor} (XP: ${xp})`);

  // Dans un vrai hook:
  // const nftMintTx = {
  //   TransactionType: 'NFTokenMint',
  //   Account: POOL_WALLET,
  //   URI: `ipfs://metadata_${donor}_${xp}`,
  //   Flags: 8, // tfTransferable
  // };
  // emit(nftMintTx);
}

// ============================================================================
// HOOK DEPLOYMENT
// ============================================================================

/**
 * Exemple de déploiement du hook via SetHook transaction
 *
 * Cette fonction n'est PAS exécutée sur le hook lui-même,
 * mais depuis un script de déploiement côté backend.
 */
export async function deployImpactFundHook(xrplClient: any, wallet: any): Promise<string> {
  // 1. Compiler le hook en WebAssembly (wasm)
  // const wasmBinary = compileHookToWasm(hook);

  // 2. Créer la transaction SetHook
  const setHookTx = {
    TransactionType: 'SetHook',
    Account: wallet.address,
    Hooks: [
      {
        Hook: {
          CreateCode: '<HookWasmBinary>', // Binary du hook compilé
          HookOn: HOOK_ON.join(','),
          HookNamespace: HOOK_NAMESPACE,
          HookApiVersion: 0,
        },
      },
    ],
  };

  // 3. Soumettre la transaction
  // const result = await xrplClient.submitAndWait(setHookTx, { wallet });

  console.log('[Hook] Deployed successfully');
  // return result.result.hash;

  return 'MOCK_HOOK_DEPLOYMENT_HASH';
}

// ============================================================================
// HOOK STATE QUERIES
// ============================================================================

/**
 * Lire l'état du hook depuis le ledger
 */
export async function queryHookState(xrplClient: any, hookAccount: string, stateKey: string): Promise<any> {
  // const response = await xrplClient.request({
  //   command: 'ledger_entry',
  //   hook_state: {
  //     account: hookAccount,
  //     key: stateKey,
  //   },
  // });

  // return response.result.node;

  return { mockState: 'value' };
}

// ============================================================================
// NOTES POUR LE HACKATHON
// ============================================================================

/**
 * Pour le hackathon, vous n'avez PAS besoin de déployer un vrai hook.
 * Vous pouvez:
 *
 * 1. Montrer ce code comme proof of concept
 * 2. Simuler les événements du hook dans votre backend
 * 3. Expliquer au jury comment ça fonctionnerait en production
 *
 * Pour déployer un vrai hook:
 * - Installer le XRPL Hooks Builder: https://github.com/XRPL-Labs/xrpld-hooks
 * - Compiler le code C en WebAssembly
 * - Déployer sur le testnet Hooks V3
 * - Ou utiliser Xahau: https://xahau.network/
 */

export default {
  hook,
  deployImpactFundHook,
  queryHookState,
  HOOK_NAMESPACE,
  POOL_WALLET,
};
