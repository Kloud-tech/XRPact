const mongoose = require('mongoose');

const imageValidationSchema = new mongoose.Schema({
  escrowId: {
    type: String,
    required: true,
    index: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  imageHash: {
    type: String,
    required: true,
    unique: true
  },
  metadata: {
    uploadedBy: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    fileSize: Number,
    mimeType: String,
    dimensions: {
      width: Number,
      height: Number
    }
  },
  analysis: {
    status: {
      type: String,
      enum: ['pending', 'processing', 'validated', 'rejected', 'failed'],
      default: 'pending'
    },
    aiScore: {
      type: Number,
      min: 0,
      max: 100
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1
    },
    tags: [String],
    description: String,
    detectedObjects: [String],
    impactVerification: {
      verified: Boolean,
      category: String, // 'water', 'solar', 'tree', etc.
      matchScore: Number
    },
    processedAt: Date,
    errorMessage: String
  },
  validationResult: {
    approved: Boolean,
    approvedBy: String,
    approvedAt: Date,
    rejectionReason: String
  }
}, {
  timestamps: true
});

// Index pour recherche rapide
imageValidationSchema.index({ 'analysis.status': 1 });
imageValidationSchema.index({ 'metadata.uploadedAt': -1 });

module.exports = mongoose.model('ImageValidation', imageValidationSchema);
