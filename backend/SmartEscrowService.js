"use strict";
/**
 * SmartEscrowService - Service de gestion des dons conditionnels sur XRPL
 *
 * Ce service simule le standard XLS-100 en utilisant des Escrows XRPL avec
 * des Crypto-Conditions (PreimageSha256). Les fonds sont bloqués et ne peuvent
 * être débloqués que si un Oracle (backend IA) valide les preuves terrain.
 *
 * @author XRPL Impact Map Team
 * @version 1.0.0
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmartEscrowService = void 0;
const xrpl_1 = require("xrpl");
const cc = __importStar(require("five-bells-condition"));
const crypto = __importStar(require("crypto"));
const governanceAI = require("./services/governance-ai.service");

// ============================================================================
// SMART ESCROW SERVICE (AI-Enhanced)
// ============================================================================
class SmartEscrowService {
    /**
     * Initialise le service avec un client XRPL
     * @param xrplServerUrl - URL du serveur XRPL (ex: wss://s.altnet.rippletest.net:51233)
     */
    constructor(xrplServerUrl = 'wss://s.altnet.rippletest.net:51233') {
        this.client = new xrpl_1.Client(xrplServerUrl);
        
        // Vérifier disponibilité de l'IA de gouvernance
        governanceAI.checkAvailability()
            .then(available => {
                if (available) {
                    console.log('✅ Governance AI disponible - paramètres optimisés');
                } else {
                    console.log('⚠️  Governance AI non disponible - paramètres par défaut');
                }
            });
    }
    // ==========================================================================
    // HELPERS - CRYPTO-CONDITIONS (PREIMAGE SHA256)
    // ==========================================================================
    /**
     * Génère une paire Condition/Fulfillment à partir d'un secret Oracle
     *
     * Le secret est hashé en SHA256 pour créer la Condition.
     * Le Fulfillment est le secret original encodé.
     *
     * @param oracleSecret - Secret de l'Oracle (string ou hex 32 bytes)
     * @returns Paire {condition, fulfillment} en format hex
     */
    generateConditionPair(oracleSecret) {
        try {
            // Convertir le secret en Buffer (si c'est un string, on le hash d'abord)
            let preimageBuffer;
            if (oracleSecret.length === 64 && /^[0-9a-fA-F]+$/.test(oracleSecret)) {
                // C'est déjà un hex de 32 bytes
                preimageBuffer = Buffer.from(oracleSecret, 'hex');
            }
            else {
                // C'est un string, on crée un hash SHA256
                preimageBuffer = crypto
                    .createHash('sha256')
                    .update(oracleSecret)
                    .digest();
            }
            // Créer la condition PreimageSha256
            const fulfillment = new cc.PreimageSha256();
            fulfillment.setPreimage(preimageBuffer);
            // Encoder en format XRPL (hex uppercase)
            const condition = fulfillment
                .getConditionBinary()
                .toString('hex')
                .toUpperCase();
            const fulfillmentHex = fulfillment
                .serializeBinary()
                .toString('hex')
                .toUpperCase();
            return {
                condition,
                fulfillment: fulfillmentHex,
            };
        }
        catch (error) {
            throw new Error(`Erreur lors de la génération de la condition: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Génère un secret aléatoire pour l'Oracle (32 bytes)
     * Utile si vous ne voulez pas fournir votre propre secret
     *
     * @returns Secret en format hex (64 caractères)
     */
    generateRandomSecret() {
        return crypto.randomBytes(32).toString('hex');
    }
    /**
     * Convertit une date en timestamp Ripple (secondes depuis 2000-01-01)
     *
     * @param date - Date en format ISO ou timestamp Unix
     * @returns Timestamp Ripple
     */
    dateToRippleTime(date) {
        const RIPPLE_EPOCH = 946684800; // 2000-01-01 00:00:00 UTC in Unix time
        let unixTimestamp;
        if (typeof date === 'number') {
            unixTimestamp = date;
        }
        else {
            unixTimestamp = Math.floor(new Date(date).getTime() / 1000);
        }
        return unixTimestamp - RIPPLE_EPOCH;
    }
    // ==========================================================================
    // MÉTHODES PRINCIPALES
    // ==========================================================================
    /**
     * Crée un Escrow conditionnel sur XRPL
     *
     * Cette méthode crée une transaction EscrowCreate qui bloque les fonds.
     * Les fonds ne peuvent être débloqués que si l'Oracle fournit le bon
     * Fulfillment (preuve de validation terrain).
     *
     * @param config - Configuration de l'escrow
     * @returns Hash de la transaction et informations sur l'escrow
     *
     * @example
     * ```typescript
     * const escrowInfo = await service.createSmartEscrow({
     *   donorSeed: 'sXXXXXXXXXXXXXXXXXXXXXXXXX',
     *   amount: '100',
     *   beneficiary: 'rNXXXXXXXXXXXXXXXXXXXXXXXX',
     *   oracleSecret: 'my-secret-key-for-validation',
     *   deadline: '2024-12-31T23:59:59Z'
     * });
     * ```
     */
    async createSmartEscrow(config) {
        try {
            // Validation des paramètres
            if (!config.donorSeed || !config.amount || !config.beneficiary || !config.oracleSecret) {
                throw new Error('Paramètres manquants: donorSeed, amount, beneficiary, oracleSecret sont requis');
            }
            // Connexion au client XRPL
            await this.client.connect();
            console.log('✅ Connecté au XRPL Testnet');
            // Créer le wallet donateur
            const donorWallet = xrpl_1.Wallet.fromSeed(config.donorSeed);
            console.log(`💰 Wallet donateur: ${donorWallet.address}`);
            // Générer la paire Condition/Fulfillment
            const { condition, fulfillment } = this.generateConditionPair(config.oracleSecret);
            console.log(`🔐 Condition générée: ${condition.substring(0, 20)}...`);
            // Préparer la transaction EscrowCreate
            const escrowTx = {
                TransactionType: 'EscrowCreate',
                Account: donorWallet.address,
                Destination: config.beneficiary,
                Amount: (0, xrpl_1.xrpToDrops)(config.amount),
                Condition: condition,
            };
            // Ajouter CancelAfter si deadline fournie
            if (config.deadline) {
                escrowTx.CancelAfter = this.dateToRippleTime(config.deadline);
                console.log(`⏰ Deadline définie: ${new Date(typeof config.deadline === 'number'
                    ? config.deadline * 1000
                    : config.deadline).toISOString()}`);
            }
            // Soumettre la transaction
            console.log('📤 Soumission de la transaction EscrowCreate...');
            const prepared = await this.client.autofill(escrowTx);
            const signed = donorWallet.sign(prepared);
            const result = await this.client.submitAndWait(signed.tx_blob);
            // Vérifier le résultat
            if (result.result.meta && typeof result.result.meta !== 'string') {
                if (result.result.meta.TransactionResult !== 'tesSUCCESS') {
                    throw new Error(`Transaction échouée: ${result.result.meta.TransactionResult}`);
                }
            }
            const txHash = result.result.hash;
            const sequence = prepared.Sequence || 0;
            console.log(`✅ Escrow créé avec succès!`);
            console.log(`   📋 TX Hash: ${txHash}`);
            console.log(`   🔢 Sequence: ${sequence}`);
            await this.client.disconnect();
            // Retourner les informations complètes
            return {
                owner: donorWallet.address,
                sequence,
                txHash,
                condition,
                fulfillment, // ⚠️ À stocker en sécurité côté Oracle!
                amount: (0, xrpl_1.xrpToDrops)(config.amount),
                destination: config.beneficiary,
                cancelAfter: config.deadline ? this.dateToRippleTime(config.deadline) : undefined,
            };
        }
        catch (error) {
            await this.client.disconnect();
            throw new Error(`Erreur lors de la création de l'escrow: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Débloque un Escrow en fournissant le Fulfillment
     *
     * Cette méthode est appelée par l'Oracle (IA) après validation terrain.
     * Elle libère les fonds vers le bénéficiaire.
     *
     * @param wallet - Wallet pour signer la transaction (peut être n'importe qui)
     * @param ownerAddress - Adresse du créateur de l'escrow
     * @param escrowSequence - Numéro de séquence de la transaction EscrowCreate
     * @param oracleSecret - Secret Oracle pour générer le Fulfillment
     * @returns Hash de la transaction EscrowFinish
     *
     * @example
     * ```typescript
     * const txHash = await service.fulfillEscrow(
     *   oracleWallet,
     *   'rDonorAddress...',
     *   12345,
     *   'my-secret-key-for-validation'
     * );
     * ```
     */
    async fulfillEscrow(wallet, ownerAddress, escrowSequence, oracleSecret) {
        try {
            // Validation
            if (!ownerAddress || !escrowSequence || !oracleSecret) {
                throw new Error('Paramètres manquants: ownerAddress, escrowSequence, oracleSecret requis');
            }
            // Générer le Fulfillment à partir du secret
            const { condition, fulfillment } = this.generateConditionPair(oracleSecret);
            await this.client.connect();
            console.log('✅ Connecté au XRPL Testnet');
            // Préparer la transaction EscrowFinish
            const finishTx = {
                TransactionType: 'EscrowFinish',
                Account: wallet.address,
                Owner: ownerAddress,
                OfferSequence: escrowSequence,
                Condition: condition,
                Fulfillment: fulfillment,
            };
            // Soumettre
            console.log('🔓 Déblocage de l\'escrow...');
            const prepared = await this.client.autofill(finishTx);
            const signed = wallet.sign(prepared);
            const result = await this.client.submitAndWait(signed.tx_blob);
            // Vérifier
            if (result.result.meta && typeof result.result.meta !== 'string') {
                if (result.result.meta.TransactionResult !== 'tesSUCCESS') {
                    throw new Error(`Transaction échouée: ${result.result.meta.TransactionResult}`);
                }
            }
            const txHash = result.result.hash;
            console.log(`✅ Fonds débloqués avec succès!`);
            console.log(`   📋 TX Hash: ${txHash}`);
            await this.client.disconnect();
            return txHash;
        }
        catch (error) {
            await this.client.disconnect();
            throw new Error(`Erreur lors du déblocage de l'escrow: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Déclenche un Clawback (récupération des fonds par le donateur)
     *
     * Cette méthode annule un escrow expiré et renvoie les fonds au donateur.
     * Elle ne peut être appelée qu'après la deadline (CancelAfter).
     *
     * @param wallet - Wallet pour signer (peut être n'importe qui)
     * @param ownerAddress - Adresse du créateur de l'escrow
     * @param escrowSequence - Numéro de séquence de la transaction EscrowCreate
     * @returns Hash de la transaction EscrowCancel
     *
     * @example
     * ```typescript
     * const txHash = await service.triggerClawback(
     *   anyWallet,
     *   'rDonorAddress...',
     *   12345
     * );
     * ```
     */
    async triggerClawback(wallet, ownerAddress, escrowSequence) {
        try {
            // Validation
            if (!ownerAddress || !escrowSequence) {
                throw new Error('Paramètres manquants: ownerAddress, escrowSequence requis');
            }
            await this.client.connect();
            console.log('✅ Connecté au XRPL Testnet');
            // Vérifier si l'escrow existe et est expiré
            // Note: Le ledger rejettera la transaction si CancelAfter n'est pas atteint
            // Préparer la transaction EscrowCancel
            const cancelTx = {
                TransactionType: 'EscrowCancel',
                Account: wallet.address,
                Owner: ownerAddress,
                OfferSequence: escrowSequence,
            };
            // Soumettre
            console.log('🔙 Annulation de l\'escrow (Clawback)...');
            const prepared = await this.client.autofill(cancelTx);
            const signed = wallet.sign(prepared);
            const result = await this.client.submitAndWait(signed.tx_blob);
            // Vérifier
            if (result.result.meta && typeof result.result.meta !== 'string') {
                if (result.result.meta.TransactionResult !== 'tesSUCCESS') {
                    throw new Error(`Transaction échouée: ${result.result.meta.TransactionResult}`);
                }
            }
            const txHash = result.result.hash;
            console.log(`✅ Clawback effectué! Fonds retournés au donateur.`);
            console.log(`   📋 TX Hash: ${txHash}`);
            await this.client.disconnect();
            return txHash;
        }
        catch (error) {
            await this.client.disconnect();
            throw new Error(`Erreur lors du clawback: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    // ==========================================================================
    // GESTION DES JALONS (MILESTONES)
    // ==========================================================================
    /**
     * Crée plusieurs Escrows pour des paiements fractionnés (jalons)
     *
     * Exemple: Pour un don de 100 XRP avec jalons [30, 70]:
     * - Escrow 1: 30 XRP avec secret 1
     * - Escrow 2: 70 XRP avec secret 2
     *
     * Chaque jalon peut avoir sa propre deadline et condition.
     *
     * @param config - Configuration de base (le montant sera divisé)
     * @param milestones - Liste des jalons avec pourcentages
     * @returns Liste des informations d'escrows créés
     *
     * @example
     * ```typescript
     * const escrows = await service.createMilestoneEscrows(
     *   {
     *     donorSeed: 'sXXXXXXXXXXXXXXXXXXXXXXXXX',
     *     amount: '100',
     *     beneficiary: 'rNXXXXXXXXXXXXXXXXXXXXXXXX',
     *     oracleSecret: 'base-secret', // Non utilisé si milestones ont leurs secrets
     *   },
     *   [
     *     { percentage: 30, description: 'Démarrage', oracleSecret: 'secret1' },
     *     { percentage: 70, description: 'Finalisation', oracleSecret: 'secret2' }
     *   ]
     * );
     * ```
     */
    async createMilestoneEscrows(config, milestones) {
        try {
            // Validation
            const totalPercentage = milestones.reduce((sum, m) => sum + m.percentage, 0);
            if (totalPercentage !== 100) {
                throw new Error(`Les pourcentages des jalons doivent totaliser 100% (actuellement: ${totalPercentage}%)`);
            }
            const totalAmount = parseFloat(config.amount);
            const escrowInfos = [];
            console.log(`📊 Création de ${milestones.length} escrows pour jalons...`);
            // Créer un escrow pour chaque jalon
            for (let i = 0; i < milestones.length; i++) {
                const milestone = milestones[i];
                const milestoneAmount = (totalAmount * milestone.percentage / 100).toFixed(6);
                console.log(`\n🎯 Jalon ${i + 1}/${milestones.length}: ${milestone.description} (${milestone.percentage}% = ${milestoneAmount} XRP)`);
                // Créer l'escrow pour ce jalon
                const escrowInfo = await this.createSmartEscrow({
                    donorSeed: config.donorSeed,
                    amount: milestoneAmount,
                    beneficiary: config.beneficiary,
                    oracleSecret: milestone.oracleSecret,
                    deadline: milestone.deadline || config.deadline,
                });
                escrowInfos.push(escrowInfo);
            }
            console.log(`\n✅ ${milestones.length} escrows de jalons créés avec succès!`);
            return escrowInfos;
        }
        catch (error) {
            throw new Error(`Erreur lors de la création des escrows de jalons: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Récupère les informations d'un Escrow depuis le ledger
     *
     * @param ownerAddress - Adresse du propriétaire de l'escrow
     * @param escrowSequence - Numéro de séquence
     * @returns Informations sur l'escrow ou null s'il n'existe pas
     */
    async getEscrowInfo(ownerAddress, escrowSequence) {
        try {
            await this.client.connect();
            const response = await this.client.request({
                command: 'ledger_entry',
                escrow: {
                    owner: ownerAddress,
                    seq: escrowSequence,
                },
            });
            await this.client.disconnect();
            return response.result.node || null;
        }
        catch (error) {
            await this.client.disconnect();
            // L'escrow n'existe probablement pas ou a été exécuté/annulé
            return null;
        }
    }
}
exports.SmartEscrowService = SmartEscrowService;
// ============================================================================
// EXPORT PAR DÉFAUT
// ============================================================================
exports.default = SmartEscrowService;
