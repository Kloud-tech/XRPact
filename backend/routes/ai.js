const express = require('express');
const multer = require('multer');
const ImageValidation = require('../models/ImageValidation');
const imageAnalysisService = require('../services/imageAnalysisService');
const Escrow = require('../models/Escrow');

const router = express.Router();

// Configuration multer pour upload en mémoire
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé. Utilisez JPEG, PNG ou WebP'));
    }
  }
});

/**
 * POST /api/ai/validate-image
 * Upload et analyse d'une image pour validation d'escrow
 */
router.post('/validate-image', upload.single('image'), async (req, res) => {
  try {
    const { escrowId, category, description, uploadedBy } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Aucune image fournie'
      });
    }

    if (!escrowId) {
      return res.status(400).json({
        success: false,
        error: 'escrowId requis'
      });
    }

    // Vérifier que l'escrow existe
    const escrow = await Escrow.findById(escrowId);
    if (!escrow) {
      return res.status(404).json({
        success: false,
        error: 'Escrow non trouvé'
      });
    }

    console.log(`[AI] Analyzing image for escrow ${escrowId}`);

    // Analyser l'image
    const analysisResult = await imageAnalysisService.analyzeImage(
      req.file.buffer,
      {
        category: category || escrow.category,
        description: description || escrow.description
      }
    );

    if (!analysisResult.success) {
      return res.status(400).json({
        success: false,
        error: analysisResult.error
      });
    }

    // Vérifier les duplicatas
    const isDuplicate = await imageAnalysisService.isDuplicate(
      analysisResult.imageHash,
      ImageValidation
    );

    if (isDuplicate) {
      return res.status(409).json({
        success: false,
        error: 'Cette image a déjà été soumise'
      });
    }

    // Sauvegarder dans MongoDB
    const imageValidation = new ImageValidation({
      escrowId,
      imageUrl: `/uploads/${analysisResult.imageHash}.jpg`, // À implémenter: stockage réel
      imageHash: analysisResult.imageHash,
      metadata: {
        uploadedBy,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        dimensions: {
          width: analysisResult.metadata.width,
          height: analysisResult.metadata.height
        }
      },
      analysis: analysisResult.analysis
    });

    await imageValidation.save();

    // Mettre à jour l'escrow si l'image est validée
    if (analysisResult.analysis.status === 'validated' && 
        analysisResult.analysis.aiScore >= 70) {
      escrow.validationImages = escrow.validationImages || [];
      escrow.validationImages.push(imageValidation._id);
      escrow.aiValidationScore = analysisResult.analysis.aiScore;
      escrow.aiValidationDate = new Date();
      
      // Si score élevé, auto-valider ET débloquer les fonds
      if (analysisResult.analysis.aiScore >= 85 && 
          analysisResult.analysis.confidence >= 0.8) {
        escrow.status = 'validated';
        escrow.validatedAt = new Date();
        escrow.validatedBy = 'AI-Auto';
        
        // Déclencher le déblocage des fonds via l'API donations
        try {
          const axios = require('axios');
          const baseURL = process.env.API_BASE_URL || 'http://localhost:3001';
          
          console.log(`🔓 Déclenchement du déblocage pour escrow ${escrowId}...`);
          
          const unlockResponse = await axios.post(
            `${baseURL}/api/donations/${escrowId}/validate`,
            { imageValidationId: imageValidation._id }
          );
          
          if (unlockResponse.data.success) {
            console.log(`✅ Fonds débloqués: ${unlockResponse.data.unlockTxHash}`);
            escrow.unlockTxHash = unlockResponse.data.unlockTxHash;
            escrow.unlockedAt = new Date();
            escrow.status = 'unlocked';
          }
        } catch (unlockError) {
          console.error('❌ Erreur déblocage:', unlockError.message);
          // Ne pas bloquer la validation si le déblocage échoue
          // On peut réessayer plus tard
        }
      }
      
      await escrow.save();
    }

    res.json({
      success: true,
      data: {
        validationId: imageValidation._id,
        escrowId,
        analysis: analysisResult.analysis,
        imageHash: analysisResult.imageHash,
        escrowUpdated: escrow.status === 'validated' || escrow.status === 'unlocked',
        fundsUnlocked: escrow.status === 'unlocked',
        unlockTxHash: escrow.unlockTxHash
      }
    });

  } catch (error) {
    console.error('[AI] Validation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/ai/validations/:escrowId
 * Récupérer toutes les validations d'images pour un escrow
 */
router.get('/validations/:escrowId', async (req, res) => {
  try {
    const { escrowId } = req.params;

    const validations = await ImageValidation.find({ escrowId })
      .sort({ 'metadata.uploadedAt': -1 });

    res.json({
      success: true,
      count: validations.length,
      data: validations
    });

  } catch (error) {
    console.error('[AI] Get validations error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/ai/validation/:validationId
 * Récupérer une validation spécifique
 */
router.get('/validation/:validationId', async (req, res) => {
  try {
    const { validationId } = req.params;

    const validation = await ImageValidation.findById(validationId);

    if (!validation) {
      return res.status(404).json({
        success: false,
        error: 'Validation non trouvée'
      });
    }

    res.json({
      success: true,
      data: validation
    });

  } catch (error) {
    console.error('[AI] Get validation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/ai/validation/:validationId/approve
 * Approuver manuellement une validation
 */
router.post('/validation/:validationId/approve', async (req, res) => {
  try {
    const { validationId } = req.params;
    const { approvedBy } = req.body;

    const validation = await ImageValidation.findById(validationId);

    if (!validation) {
      return res.status(404).json({
        success: false,
        error: 'Validation non trouvée'
      });
    }

    validation.validationResult = {
      approved: true,
      approvedBy,
      approvedAt: new Date()
    };
    validation.analysis.status = 'validated';

    await validation.save();

    // Mettre à jour l'escrow
    const escrow = await Escrow.findById(validation.escrowId);
    if (escrow) {
      escrow.status = 'validated';
      escrow.validatedAt = new Date();
      escrow.validatedBy = approvedBy;
      await escrow.save();
    }

    res.json({
      success: true,
      data: validation
    });

  } catch (error) {
    console.error('[AI] Approve error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/ai/validation/:validationId/reject
 * Rejeter une validation
 */
router.post('/validation/:validationId/reject', async (req, res) => {
  try {
    const { validationId } = req.params;
    const { rejectedBy, reason } = req.body;

    const validation = await ImageValidation.findById(validationId);

    if (!validation) {
      return res.status(404).json({
        success: false,
        error: 'Validation non trouvée'
      });
    }

    validation.validationResult = {
      approved: false,
      approvedBy: rejectedBy,
      approvedAt: new Date(),
      rejectionReason: reason
    };
    validation.analysis.status = 'rejected';

    await validation.save();

    res.json({
      success: true,
      data: validation
    });

  } catch (error) {
    console.error('[AI] Reject error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/ai/stats
 * Statistiques des validations IA
 */
router.get('/stats', async (req, res) => {
  try {
    const total = await ImageValidation.countDocuments();
    const validated = await ImageValidation.countDocuments({ 'analysis.status': 'validated' });
    const rejected = await ImageValidation.countDocuments({ 'analysis.status': 'rejected' });
    const pending = await ImageValidation.countDocuments({ 'analysis.status': 'pending' });

    const avgScore = await ImageValidation.aggregate([
      { $match: { 'analysis.aiScore': { $exists: true } } },
      { $group: { _id: null, avg: { $avg: '$analysis.aiScore' } } }
    ]);

    res.json({
      success: true,
      data: {
        total,
        validated,
        rejected,
        pending,
        averageScore: avgScore[0]?.avg || 0
      }
    });

  } catch (error) {
    console.error('[AI] Stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
