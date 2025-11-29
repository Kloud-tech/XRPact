/**
 * Mongoose Schema for Escrow Management
 * 
 * Stocke toutes les informations sur les escrows XRPL
 * incluant les secrets chiffrés et l'état de validation IA
 */

const mongoose = require('mongoose');

const escrowSchema = new mongoose.Schema({
    // Identifiants
    escrowId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },

    projectId: {
        type: String,
        required: true,
        index: true
    },

    projectName: {
        type: String,
        required: true
    },

    projectDescription: String,

    // Informations XRPL
    ownerAddress: {
        type: String,
        required: true,
        index: true
    },

    sequence: {
        type: Number,
        required: true
    },

    txHash: {
        type: String,
        required: true,
        unique: true
    },

    // Secrets (CHIFFRÉS!)
    oracleSecret: {
        type: String,
        required: true
    },

    fulfillment: {
        type: String,
        required: true
    },

    condition: {
        type: String,
        required: true
    },

    // Détails de l'escrow
    amount: {
        type: String,
        required: true
    },

    amountXRP: {
        type: Number,
        required: true
    },

    beneficiaryAddress: {
        type: String,
        required: true
    },

    deadline: {
        type: Number,
        required: true
    },

    // Jalons (si applicable)
    isMilestone: {
        type: Boolean,
        default: false
    },

    milestoneIndex: Number,

    milestoneDescription: String,

    milestoneTotal: Number,

    parentEscrowId: String,

    // État et validation
    status: {
        type: String,
        enum: ['pending', 'validating', 'approved', 'rejected', 'unlocked', 'cancelled', 'expired'],
        default: 'pending',
        index: true
    },

    // Validation IA
    validationPhotos: [{
        url: String,
        uploadedAt: Date,
        metadata: Object
    }],

    aiValidationScore: Number,

    aiValidationResult: {
        validated: Boolean,
        confidence: Number,
        analysis: Object,
        timestamp: Date
    },

    aiValidationDate: Date,

    rejectionReason: String,

    // Transactions de déblocage/annulation
    unlockTxHash: String,
    unlockedAt: Date,

    cancelTxHash: String,
    cancelledAt: Date,

    // Métadonnées
    createdBy: String,

    notes: String,

}, {
    timestamps: true,
    collection: 'escrows'
});

// Index composés pour les requêtes fréquentes
escrowSchema.index({ projectId: 1, status: 1 });
escrowSchema.index({ ownerAddress: 1, createdAt: -1 });
escrowSchema.index({ beneficiaryAddress: 1, status: 1 });

// Méthodes virtuelles
escrowSchema.virtual('isExpired').get(function () {
    return Date.now() / 1000 > this.deadline;
});

escrowSchema.virtual('canBeUnlocked').get(function () {
    return this.status === 'approved' && !this.isExpired;
});

escrowSchema.virtual('explorerUrl').get(function () {
    return `https://testnet.xrpl.org/transactions/${this.txHash}`;
});

// Méthodes d'instance
escrowSchema.methods.toPublicJSON = function () {
    return {
        escrowId: this.escrowId,
        projectId: this.projectId,
        projectName: this.projectName,
        ownerAddress: this.ownerAddress,
        beneficiaryAddress: this.beneficiaryAddress,
        amountXRP: this.amountXRP,
        status: this.status,
        deadline: this.deadline,
        isMilestone: this.isMilestone,
        milestoneIndex: this.milestoneIndex,
        aiValidationScore: this.aiValidationScore,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        explorerUrl: this.explorerUrl
        // ⚠️ PAS de secrets dans la réponse publique!
    };
};

module.exports = mongoose.model('Escrow', escrowSchema);
