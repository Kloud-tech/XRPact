/**
 * MongoDB Models - Complete Schema Definitions
 * 
 * Replaces PostgreSQL tables with MongoDB collections
 */

const mongoose = require('mongoose');

// ============================================================================
// User / Donor Schema
// ============================================================================

const userSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },

    xrplAddress: {
        type: String,
        required: true,
        unique: true,
        index: true
    },

    email: String,
    name: String,

    // KYC Information
    kyc: {
        status: {
            type: String,
            enum: ['pending', 'verified', 'rejected'],
            default: 'pending'
        },
        riskLevel: {
            type: String,
            enum: ['low', 'medium', 'high']
        },
        verifiedAt: Date,
        documents: [{
            type: String,
            url: String,
            uploadedAt: Date
        }]
    },

    // Gamification
    xp: {
        type: Number,
        default: 0
    },

    level: {
        type: String,
        enum: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'],
        default: 'Bronze'
    },

    // Stats
    totalDonated: {
        type: Number,
        default: 0
    },

    donationCount: {
        type: Number,
        default: 0
    },

    lastDonationAt: Date,

    // Governance
    votingPower: {
        type: Number,
        default: 0
    },

    votes: [{
        ngoId: String,
        projectId: String,
        votedAt: Date,
        weight: Number
    }],

}, {
    timestamps: true,
    collection: 'users'
});

// ============================================================================
// NGO Schema
// ============================================================================

const ngoSchema = new mongoose.Schema({
    ngoId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },

    name: {
        type: String,
        required: true
    },

    description: String,

    xrplAddress: {
        type: String,
        required: true,
        unique: true
    },

    // Verification
    verified: {
        type: Boolean,
        default: false
    },

    impactScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },

    category: {
        type: String,
        enum: ['water', 'education', 'health', 'environment', 'infrastructure', 'other']
    },

    // Location
    country: String,
    region: String,
    coordinates: {
        lat: Number,
        lng: Number
    },

    // Stats
    totalReceived: {
        type: Number,
        default: 0
    },

    projectsCompleted: {
        type: Number,
        default: 0
    },

    // Certification
    certifications: [{
        name: String,
        issuer: String,
        validUntil: Date
    }],

    website: String,
    logo: String,

}, {
    timestamps: true,
    collection: 'ngos'
});

// ============================================================================
// Project Schema
// ============================================================================

const projectSchema = new mongoose.Schema({
    projectId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },

    ngoId: {
        type: String,
        required: true,
        index: true
    },

    title: {
        type: String,
        required: true
    },

    description: String,

    category: String,

    // Funding
    targetAmount: {
        type: Number,
        required: true
    },

    currentAmount: {
        type: Number,
        default: 0
    },

    status: {
        type: String,
        enum: ['active', 'funded', 'completed', 'cancelled'],
        default: 'active',
        index: true
    },

    // Location
    country: String,
    region: String,
    coordinates: {
        lat: Number,
        lng: Number
    },

    // Timeline
    startDate: Date,
    endDate: Date,
    completedAt: Date,

    // Impact
    impactMetrics: {
        beneficiaries: Number,
        co2Offset: Number,
        treesPlanted: Number,
        wellsBuilt: Number,
        childrenEducated: Number
    },

    // Media
    images: [String],
    videos: [String],

    // Validation
    validationPhotos: [{
        url: String,
        uploadedAt: Date,
        validatedBy: String
    }],

}, {
    timestamps: true,
    collection: 'projects'
});

// ============================================================================
// Donation Schema
// ============================================================================

const donationSchema = new mongoose.Schema({
    donationId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },

    userId: {
        type: String,
        required: true,
        index: true
    },

    userAddress: {
        type: String,
        required: true
    },

    amount: {
        type: Number,
        required: true
    },

    amountXRP: {
        type: Number,
        required: true
    },

    // Target (peut être pool, NGO ou project)
    targetType: {
        type: String,
        enum: ['pool', 'ngo', 'project'],
        default: 'pool'
    },

    targetId: String,

    // XRPL Transaction
    txHash: {
        type: String,
        required: true,
        unique: true
    },

    ledgerIndex: Number,

    // Climate mode
    climateMode: {
        type: Boolean,
        default: false
    },

    co2Offset: Number,

    // Story / Receipt
    storyGenerated: {
        type: Boolean,
        default: false
    },

    qrCodeUrl: String,

}, {
    timestamps: true,
    collection: 'donations'
});

// ============================================================================
// Impact NFT Schema
// ============================================================================

const impactNFTSchema = new mongoose.Schema({
    nftId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },

    userId: {
        type: String,
        required: true,
        index: true
    },

    userAddress: {
        type: String,
        required: true
    },

    // NFT Details
    tokenId: String,
    uri: String,

    // Evolution
    tier: {
        type: String,
        enum: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'],
        default: 'Bronze'
    },

    xp: {
        type: Number,
        default: 0
    },

    // Visual attributes
    attributes: {
        color: String,
        shape: String,
        aura: String,
        background: String
    },

    // Perks unlocked
    perks: [String],

    // XRPL
    mintTxHash: String,
    lastUpdateTxHash: String,

}, {
    timestamps: true,
    collection: 'impact_nfts'
});

// ============================================================================
// Transaction / Redistribution Schema
// ============================================================================

const redistributionSchema = new mongoose.Schema({
    redistributionId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },

    // Amount distributed
    totalAmount: {
        type: Number,
        required: true
    },

    // Recipients
    distributions: [{
        ngoId: String,
        ngoName: String,
        ngoAddress: String,
        amount: Number,
        percentage: Number,
        txHash: String
    }],

    // Source
    sourceType: {
        type: String,
        enum: ['ai_trading', 'donation', 'other'],
        default: 'ai_trading'
    },

    profit: Number,

    // Execution
    executedAt: Date,
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
    },

}, {
    timestamps: true,
    collection: 'redistributions'
});

// ============================================================================
// Exports
// ============================================================================

module.exports = {
    User: mongoose.model('User', userSchema),
    NGO: mongoose.model('NGO', ngoSchema),
    Project: mongoose.model('Project', projectSchema),
    Donation: mongoose.model('Donation', donationSchema),
    ImpactNFT: mongoose.model('ImpactNFT', impactNFTSchema),
    Redistribution: mongoose.model('Redistribution', redistributionSchema),
};
