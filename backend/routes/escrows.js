/**
 * Escrow Routes - API REST pour la gestion des escrows
 * 
 * Routes:
 * - POST /api/escrows - Créer un nouvel escrow
 * - GET /api/escrows/:id - Obtenir les détails d'un escrow
 * - GET /api/escrows - Lister les escrows (avec filtres)
 * - POST /api/escrows/:id/validate - Soumettre des photos pour validation
 * - POST /api/escrows/:id/unlock - Débloquer manuellement un escrow
 * - POST /api/escrows/:id/cancel - Annuler un escrow expiré
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Escrow = require('../models/Escrow');
const encryptionService = require('../services/encryptionService');
const SmartEscrowService = require('../SmartEscrowService.js');
const { Wallet } = require('xrpl');

const router = express.Router();

// Initialiser le service d'escrow
const escrowService = new SmartEscrowService.default
    ('wss://s.altnet.rippletest.net:51233');

// Wallet Oracle (⚠️ En production, utiliser un KMS!)
const ORACLE_SEED = process.env.ORACLE_SEED || 'sYourOracleSeedHere';
let oracleWallet;

try {
    oracleWallet = Wallet.fromSeed(ORACLE_SEED);
    console.log(`🔑 Oracle Wallet: ${oracleWallet.address}`);
} catch (error) {
    console.warn('⚠️  Wallet Oracle non configuré. Définissez ORACLE_SEED dans .env');
}

// ============================================================================
// POST /api/escrows - Créer un nouvel escrow
// ============================================================================

router.post('/', async (req, res) => {
    try {
        const {
            donorSeed,
            amount,
            beneficiaryAddress,
            projectId,
            projectName,
            projectDescription,
            deadlineDays = 30
        } = req.body;

        // Validation
        if (!donorSeed || !amount || !beneficiaryAddress || !projectId || !projectName) {
            return res.status(400).json({
                error: 'Paramètres manquants',
                required: ['donorSeed', 'amount', 'beneficiaryAddress', 'projectId', 'projectName']
            });
        }

        // Générer un secret Oracle unique
        const oracleSecret = escrowService.generateRandomSecret();

        // Calculer la deadline
        const deadline = Math.floor(Date.now() / 1000) + (deadlineDays * 24 * 60 * 60);

        // Créer l'escrow sur XRPL
        console.log(`📝 Création d'un escrow pour le projet: ${projectName}`);
        const escrowInfo = await escrowService.createSmartEscrow({
            donorSeed,
            amount,
            beneficiary: beneficiaryAddress,
            oracleSecret,
            deadline
        });

        // Chiffrer les secrets
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
            status: 'pending'
        });

        await escrow.save();

        console.log(`✅ Escrow créé: ${escrow.escrowId}`);

        res.status(201).json({
            success: true,
            escrow: escrow.toPublicJSON(),
            message: 'Escrow créé avec succès'
        });

    } catch (error) {
        console.error('❌ Erreur création escrow:', error);
        res.status(500).json({
            error: 'Erreur lors de la création de l\'escrow',
            details: error.message
        });
    }
});

// ============================================================================
// GET /api/escrows/:id - Obtenir les détails d'un escrow
// ============================================================================

router.get('/:id', async (req, res) => {
    try {
        const escrow = await Escrow.findOne({ escrowId: req.params.id });

        if (!escrow) {
            return res.status(404).json({ error: 'Escrow non trouvé' });
        }

        res.json(escrow.toPublicJSON());

    } catch (error) {
        console.error('❌ Erreur récupération escrow:', error);
        res.status(500).json({
            error: 'Erreur lors de la récupération de l\'escrow',
            details: error.message
        });
    }
});

// ============================================================================
// GET /api/escrows - Lister les escrows avec filtres
// ============================================================================

router.get('/', async (req, res) => {
    try {
        const {
            projectId,
            ownerAddress,
            beneficiaryAddress,
            status,
            limit = 50,
            skip = 0
        } = req.query;

        // Construire le filtre
        const filter = {};
        if (projectId) filter.projectId = projectId;
        if (ownerAddress) filter.ownerAddress = ownerAddress;
        if (beneficiaryAddress) filter.beneficiaryAddress = beneficiaryAddress;
        if (status) filter.status = status;

        const escrows = await Escrow.find(filter)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip));

        const total = await Escrow.countDocuments(filter);

        res.json({
            escrows: escrows.map(e => e.toPublicJSON()),
            total,
            limit: parseInt(limit),
            skip: parseInt(skip)
        });

    } catch (error) {
        console.error('❌ Erreur listage escrows:', error);
        res.status(500).json({
            error: 'Erreur lors de la récupération des escrows',
            details: error.message
        });
    }
});

// ============================================================================
// POST /api/escrows/:id/validate - Soumettre des photos pour validation IA
// ============================================================================

router.post('/:id/validate', async (req, res) => {
    try {
        const { photos, autoUnlock = true } = req.body;

        if (!photos || !Array.isArray(photos) || photos.length === 0) {
            return res.status(400).json({
                error: 'Photos requises',
                details: 'Envoyez un tableau d\'URLs de photos'
            });
        }

        const escrow = await Escrow.findOne({ escrowId: req.params.id });

        if (!escrow) {
            return res.status(404).json({ error: 'Escrow non trouvé' });
        }

        if (escrow.status !== 'pending') {
            return res.status(400).json({
                error: 'Escrow déjà traité',
                status: escrow.status
            });
        }

        // Mettre à jour le statut
        escrow.status = 'validating';
        escrow.validationPhotos = photos.map(url => ({
            url,
            uploadedAt: new Date()
        }));
        await escrow.save();

        // TODO: Appeler votre service IA ici
        // Pour l'instant, simulation avec score aléatoire
        const mockAIValidation = {
            validated: true,
            confidence: 0.95,
            analysis: {
                photoQuality: 'good',
                locationMatch: true,
                objectDetected: 'water well construction',
                timestamp: new Date()
            }
        };

        // Mettre à jour avec résultat IA
        escrow.aiValidationResult = mockAIValidation;
        escrow.aiValidationScore = mockAIValidation.confidence;
        escrow.aiValidationDate = new Date();
        escrow.status = mockAIValidation.validated ? 'approved' : 'rejected';

        if (!mockAIValidation.validated) {
            escrow.rejectionReason = 'Validation IA échouée';
        }

        await escrow.save();

        // Si approuvé et autoUnlock = true, débloquer automatiquement
        if (mockAIValidation.validated && autoUnlock && oracleWallet) {
            try {
                // Déchiffrer le secret
                const oracleSecret = encryptionService.decrypt(escrow.oracleSecret);

                // Débloquer l'escrow
                console.log(`🔓 Déblocage automatique de l'escrow ${escrow.escrowId}...`);
                const unlockTxHash = await escrowService.fulfillEscrow(
                    oracleWallet,
                    escrow.ownerAddress,
                    escrow.sequence,
                    oracleSecret
                );

                escrow.status = 'unlocked';
                escrow.unlockTxHash = unlockTxHash;
                escrow.unlockedAt = new Date();
                await escrow.save();

                console.log(`✅ Escrow débloqué: ${unlockTxHash}`);

                return res.json({
                    success: true,
                    validated: true,
                    unlocked: true,
                    unlockTxHash,
                    escrow: escrow.toPublicJSON()
                });

            } catch (unlockError) {
                console.error('❌ Erreur déblocage:', unlockError);
                // Même si le déblocage échoue, on retourne le résultat de validation
                return res.json({
                    success: true,
                    validated: true,
                    unlocked: false,
                    unlockError: unlockError.message,
                    escrow: escrow.toPublicJSON()
                });
            }
        }

        res.json({
            success: true,
            validated: mockAIValidation.validated,
            unlocked: false,
            escrow: escrow.toPublicJSON()
        });

    } catch (error) {
        console.error('❌ Erreur validation:', error);
        res.status(500).json({
            error: 'Erreur lors de la validation',
            details: error.message
        });
    }
});

// ============================================================================
// POST /api/escrows/:id/unlock - Débloquer manuellement un escrow
// ============================================================================

router.post('/:id/unlock', async (req, res) => {
    try {
        const escrow = await Escrow.findOne({ escrowId: req.params.id });

        if (!escrow) {
            return res.status(404).json({ error: 'Escrow non trouvé' });
        }

        if (escrow.status === 'unlocked') {
            return res.status(400).json({ error: 'Escrow déjà débloqué' });
        }

        if (escrow.status !== 'approved') {
            return res.status(400).json({
                error: 'Escrow non approuvé',
                status: escrow.status,
                message: 'L\'escrow doit être validé avant d\'être débloqué'
            });
        }

        if (!oracleWallet) {
            return res.status(500).json({ error: 'Wallet Oracle non configuré' });
        }

        // Déchiffrer le secret
        const oracleSecret = encryptionService.decrypt(escrow.oracleSecret);

        // Débloquer
        console.log(`🔓 Déblocage manuel de l'escrow ${escrow.escrowId}...`);
        const unlockTxHash = await escrowService.fulfillEscrow(
            oracleWallet,
            escrow.ownerAddress,
            escrow.sequence,
            oracleSecret
        );

        escrow.status = 'unlocked';
        escrow.unlockTxHash = unlockTxHash;
        escrow.unlockedAt = new Date();
        await escrow.save();

        console.log(`✅ Escrow débloqué: ${unlockTxHash}`);

        res.json({
            success: true,
            unlockTxHash,
            escrow: escrow.toPublicJSON()
        });

    } catch (error) {
        console.error('❌ Erreur déblocage:', error);
        res.status(500).json({
            error: 'Erreur lors du déblocage de l\'escrow',
            details: error.message
        });
    }
});

// ============================================================================
// POST /api/escrows/:id/cancel - Annuler un escrow expiré (clawback)
// ============================================================================

router.post('/:id/cancel', async (req, res) => {
    try {
        const escrow = await Escrow.findOne({ escrowId: req.params.id });

        if (!escrow) {
            return res.status(404).json({ error: 'Escrow non trouvé' });
        }

        if (escrow.status === 'cancelled' || escrow.status === 'unlocked') {
            return res.status(400).json({
                error: 'Escrow déjà traité',
                status: escrow.status
            });
        }

        if (!oracleWallet) {
            return res.status(500).json({ error: 'Wallet Oracle non configuré' });
        }

        // Annuler (clawback)
        console.log(`🔙 Annulation de l'escrow ${escrow.escrowId}...`);
        const cancelTxHash = await escrowService.triggerClawback(
            oracleWallet,
            escrow.ownerAddress,
            escrow.sequence
        );

        escrow.status = 'cancelled';
        escrow.cancelTxHash = cancelTxHash;
        escrow.cancelledAt = new Date();
        await escrow.save();

        console.log(`✅ Escrow annulé: ${cancelTxHash}`);

        res.json({
            success: true,
            cancelTxHash,
            escrow: escrow.toPublicJSON()
        });

    } catch (error) {
        console.error('❌ Erreur annulation:', error);
        res.status(500).json({
            error: 'Erreur lors de l\'annulation de l\'escrow',
            details: error.message
        });
    }
});

module.exports = router;
