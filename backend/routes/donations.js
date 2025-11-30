/**
 * Donations Routes - Gestion des donations via Smart Escrow
 * 
 * Routes:
 * - POST /api/donations/create - Créer une donation via escrow conditionnel
 * - POST /api/donations/:escrowId/validate - Valider et débloquer via photo
 * - GET /api/donations/:escrowId - Obtenir les infos d'une donation
 * - GET /api/donations - Lister toutes les donations
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Escrow = require('../models/Escrow');
const encryptionService = require('../services/encryptionService');
const SmartEscrowService = require('../SmartEscrowService.js');
const { Wallet } = require('xrpl');

const router = express.Router();

// Initialiser le service d'escrow
const escrowService = new SmartEscrowService.default(
    'wss://s.altnet.rippletest.net:51233'
);

// Wallet Oracle (⚠️ En production, utiliser un KMS!)
const ORACLE_SEED = process.env.ORACLE_SEED || 'sYourOracleSeedHere';
let oracleWallet;

try {
    oracleWallet = Wallet.fromSeed(ORACLE_SEED);
    console.log(`🔑 Oracle Wallet (Donations): ${oracleWallet.address}`);
} catch (error) {
    console.warn('⚠️  Wallet Oracle non configuré. Définissez ORACLE_SEED dans .env');
}

// ============================================================================
// POST /api/donations/create - Créer une donation via escrow
// ============================================================================

/**
 * Crée un escrow conditionnel pour une donation
 * Body: {
 *   donorSeed: string (seed du wallet donateur),
 *   amount: string (montant en XRP),
 *   beneficiaryAddress: string (adresse de l'ONG),
 *   projectId: string,
 *   projectName: string,
 *   projectDescription?: string,
 *   deadlineDays?: number (défaut: 90)
 * }
 */
router.post('/create', async (req, res) => {
    try {
        const {
            donorSeed,
            donorAddress,
            amount,
            beneficiaryAddress,
            projectId,
            projectName,
            projectDescription = '',
            deadlineDays = 90,
            txHash // Transaction hash from frontend
        } = req.body;

        // Validation
        if (!amount || !beneficiaryAddress || !projectId || !projectName) {
            return res.status(400).json({
                error: 'Paramètres manquants',
                required: ['amount', 'beneficiaryAddress', 'projectId', 'projectName']
            });
        }

        // Si on a seulement le txHash (donation déjà faite), on enregistre juste
        if (txHash && !donorSeed) {
            // Pour l'instant, on stocke juste la donation sans escrow complet
            // Utiliser des valeurs par défaut pour les champs requis
            const deadline = Math.floor(Date.now() / 1000) + (deadlineDays * 24 * 60 * 60);
            
            const escrow = new Escrow({
                escrowId: uuidv4(),
                projectId,
                projectName,
                projectDescription,
                ownerAddress: donorAddress,
                txHash,
                amount: (parseFloat(amount) * 1000000).toString(), // Convert to drops
                amountXRP: parseFloat(amount),
                beneficiaryAddress,
                deadline,
                sequence: 0, // Placeholder - donation déjà effectuée
                oracleSecret: 'n/a', // Pas d'escrow conditionnel
                fulfillment: 'n/a',
                condition: 'n/a',
                status: 'pending',
                createdAt: new Date()
            });

            await escrow.save();

            return res.json({
                success: true,
                escrowId: escrow.escrowId,
                message: 'Donation enregistrée - en attente de validation photo',
                escrow: {
                    id: escrow.escrowId,
                    amount: escrow.amountXRP,
                    status: escrow.status,
                    projectName: escrow.projectName
                }
            });
        }

        // Sinon, créer un vrai escrow conditionnel
        if (!donorSeed) {
            return res.status(400).json({
                error: 'donorSeed ou txHash requis'
            });
        }

        // Générer un secret Oracle unique pour cette donation
        const oracleSecret = escrowService.generateRandomSecret();

        // Calculer la deadline
        const deadline = Math.floor(Date.now() / 1000) + (deadlineDays * 24 * 60 * 60);

        console.log(`📝 Création d'un escrow pour donation: ${projectName}`);
        console.log(`   Montant: ${amount} XRP`);
        console.log(`   Bénéficiaire: ${beneficiaryAddress}`);

        // Créer l'escrow sur XRPL
        const escrowInfo = await escrowService.createSmartEscrow({
            donorSeed,
            amount,
            beneficiary: beneficiaryAddress,
            oracleSecret,
            deadline
        });

        // Chiffrer les secrets sensibles
        const encryptedSecret = encryptionService.encrypt(oracleSecret);
        const encryptedFulfillment = encryptionService.encrypt(escrowInfo.fulfillment);

        // Stocker dans MongoDB
        const escrow = new Escrow({
            escrowId: uuidv4(),
            projectId,
            projectName,
            projectDescription,
            ownerAddress: escrowInfo.owner,
            sequence: escrowInfo.sequence,
            txHash: escrowInfo.txHash,
            oracleSecret: encryptedSecret,
            fulfillment: encryptedFulfillment,
            condition: escrowInfo.condition,
            amount: escrowInfo.amount,
            amountXRP: parseFloat(amount),
            beneficiaryAddress,
            deadline,
            status: 'pending',
            createdAt: new Date()
        });

        await escrow.save();

        console.log(`✅ Escrow créé: ${escrow.escrowId}`);

        res.json({
            success: true,
            escrowId: escrow.escrowId,
            txHash: escrowInfo.txHash,
            message: 'Donation créée avec succès - fonds bloqués jusqu\'à validation photo',
            escrow: {
                id: escrow.escrowId,
                amount: escrow.amountXRP,
                status: escrow.status,
                projectName: escrow.projectName,
                deadline: new Date(deadline * 1000).toISOString()
            }
        });

    } catch (error) {
        console.error('[Donations] Erreur création:', error);
        res.status(500).json({
            error: 'Erreur lors de la création de la donation',
            details: error.message
        });
    }
});

// ============================================================================
// GET /api/donations/:escrowId - Obtenir les infos d'une donation
// ============================================================================

router.get('/:escrowId', async (req, res) => {
    try {
        const { escrowId } = req.params;

        const escrow = await Escrow.findOne({ escrowId }).populate('validationImages');

        if (!escrow) {
            return res.status(404).json({ error: 'Donation non trouvée' });
        }

        res.json({
            success: true,
            escrow: {
                id: escrow.escrowId,
                projectId: escrow.projectId,
                projectName: escrow.projectName,
                projectDescription: escrow.projectDescription,
                amount: escrow.amountXRP,
                beneficiaryAddress: escrow.beneficiaryAddress,
                status: escrow.status,
                txHash: escrow.txHash,
                deadline: escrow.deadline ? new Date(escrow.deadline * 1000) : null,
                createdAt: escrow.createdAt,
                unlockedAt: escrow.unlockedAt,
                validationImages: escrow.validationImages || []
            }
        });

    } catch (error) {
        console.error('[Donations] Erreur récupération:', error);
        res.status(500).json({
            error: 'Erreur lors de la récupération de la donation',
            details: error.message
        });
    }
});

// ============================================================================
// GET /api/donations - Lister toutes les donations
// ============================================================================

router.get('/', async (req, res) => {
    try {
        const { status, projectId, limit = 50 } = req.query;

        const query = {};
        if (status) query.status = status;
        if (projectId) query.projectId = projectId;

        const escrows = await Escrow.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .select('-oracleSecret -fulfillment -condition');

        res.json({
            success: true,
            count: escrows.length,
            donations: escrows.map(e => ({
                id: e.escrowId,
                projectId: e.projectId,
                projectName: e.projectName,
                amount: e.amountXRP,
                status: e.status,
                createdAt: e.createdAt,
                txHash: e.txHash
            }))
        });

    } catch (error) {
        console.error('[Donations] Erreur listing:', error);
        res.status(500).json({
            error: 'Erreur lors du listing des donations',
            details: error.message
        });
    }
});

// ============================================================================
// POST /api/donations/:escrowId/validate - Valider via photo et débloquer
// ============================================================================

/**
 * Valide une donation via une photo et débloque les fonds
 * Cette route est appelée après qu'une photo a été validée par l'IA
 */
router.post('/:escrowId/validate', async (req, res) => {
    try {
        const { escrowId } = req.params;
        const { imageValidationId } = req.body;

        // Récupérer l'escrow
        const escrow = await Escrow.findOne({ escrowId });

        if (!escrow) {
            return res.status(404).json({ error: 'Donation non trouvée' });
        }

        if (escrow.status === 'unlocked') {
            return res.status(400).json({ 
                error: 'Donation déjà débloquée',
                txHash: escrow.unlockTxHash 
            });
        }

        if (escrow.status === 'cancelled') {
            return res.status(400).json({ error: 'Donation annulée' });
        }

        // Vérifier que l'oracle wallet est configuré
        if (!oracleWallet) {
            throw new Error('Oracle Wallet non configuré');
        }

        // Déchiffrer le secret Oracle
        const oracleSecret = encryptionService.decrypt(escrow.oracleSecret);

        console.log(`🔓 Déblocage de la donation ${escrowId}...`);
        console.log(`   Montant: ${escrow.amountXRP} XRP`);
        console.log(`   Bénéficiaire: ${escrow.beneficiaryAddress}`);

        // Débloquer l'escrow sur XRPL
        const unlockTxHash = await escrowService.fulfillEscrow(
            oracleWallet,
            escrow.ownerAddress,
            escrow.sequence,
            oracleSecret
        );

        // Mettre à jour le statut
        escrow.status = 'unlocked';
        escrow.unlockedAt = new Date();
        escrow.unlockTxHash = unlockTxHash;
        
        if (imageValidationId) {
            escrow.validationImages = escrow.validationImages || [];
            escrow.validationImages.push(imageValidationId);
        }

        await escrow.save();

        console.log(`✅ Donation débloquée: ${unlockTxHash}`);

        res.json({
            success: true,
            message: 'Fonds débloqués avec succès!',
            unlockTxHash,
            escrow: {
                id: escrow.escrowId,
                amount: escrow.amountXRP,
                status: escrow.status,
                unlockedAt: escrow.unlockedAt
            }
        });

    } catch (error) {
        console.error('[Donations] Erreur validation:', error);
        res.status(500).json({
            error: 'Erreur lors du déblocage de la donation',
            details: error.message
        });
    }
});

module.exports = router;
