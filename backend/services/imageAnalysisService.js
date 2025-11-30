const axios = require('axios');
const sharp = require('sharp');
const crypto = require('crypto');
const FormData = require('form-data');

/**
 * Service d'analyse d'images utilisant le service Python IA (CLIP)
 */

class ImageAnalysisService {
  constructor() {
    // URL du service Python IA
    this.aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    this.useAI = true; // L'IA Python est toujours disponible
  }

  /**
   * Analyse complète d'une image
   */
  async analyzeImage(imageBuffer, escrowContext = {}) {
    try {
      // 1. Validation basique
      const basicValidation = await this.validateImageQuality(imageBuffer);
      
      if (!basicValidation.isValid) {
        return {
          success: false,
          error: basicValidation.error,
          analysis: null
        };
      }

      // 2. Générer hash unique
      const imageHash = this.generateImageHash(imageBuffer);

      // 3. Analyse IA si disponible
      let aiAnalysis = null;
      if (this.useAI) {
        aiAnalysis = await this.analyzeWithAI(imageBuffer, escrowContext);
      } else {
        aiAnalysis = await this.basicAnalysis(imageBuffer, escrowContext);
      }

      return {
        success: true,
        imageHash,
        metadata: basicValidation.metadata,
        analysis: aiAnalysis
      };

    } catch (error) {
      console.error('[ImageAnalysis] Error:', error);
      return {
        success: false,
        error: error.message,
        analysis: null
      };
    }
  }

  /**
   * Validation de base : dimensions, format, qualité
   */
  async validateImageQuality(imageBuffer) {
    try {
      const image = sharp(imageBuffer);
      const metadata = await image.metadata();

      // Vérifications
      const minWidth = 400;
      const minHeight = 400;
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (metadata.width < minWidth || metadata.height < minHeight) {
        return {
          isValid: false,
          error: `Image trop petite. Minimum ${minWidth}x${minHeight}px`
        };
      }

      if (imageBuffer.length > maxSize) {
        return {
          isValid: false,
          error: 'Image trop volumineuse. Maximum 10MB'
        };
      }

      return {
        isValid: true,
        metadata: {
          width: metadata.width,
          height: metadata.height,
          format: metadata.format,
          size: imageBuffer.length
        }
      };

    } catch (error) {
      return {
        isValid: false,
        error: 'Format d\'image invalide'
      };
    }
  }

  /**
   * Analyse basique sans IA
   */
  async basicAnalysis(imageBuffer, escrowContext) {
    const image = sharp(imageBuffer);
    const stats = await image.stats();

    // Calcul simple de qualité basé sur les statistiques
    const avgBrightness = stats.channels.reduce((sum, ch) => sum + ch.mean, 0) / stats.channels.length;
    const quality = Math.min(100, (avgBrightness / 255) * 100);

    return {
      status: 'validated',
      aiScore: quality,
      confidence: 0.6,
      tags: ['image', escrowContext.category || 'general'],
      description: 'Analyse basique effectuée',
      detectedObjects: [],
      impactVerification: {
        verified: true,
        category: escrowContext.category || 'unknown',
        matchScore: 0.6
      },
      processedAt: new Date()
    };
  }

  /**
   * Analyse avec le service Python IA (CLIP)
   */
  async analyzeWithAI(imageBuffer, escrowContext) {
    try {
      const FormData = require('form-data');
      const form = new FormData();
      
      form.append('file', imageBuffer, {
        filename: 'image.jpg',
        contentType: 'image/jpeg'
      });
      
      if (escrowContext.category) {
        form.append('category', escrowContext.category);
      }

      const response = await axios.post(
        `${this.aiServiceUrl}/analyze`,
        form,
        {
          headers: {
            ...form.getHeaders()
          },
          timeout: 30000 // 30 secondes pour l'analyse IA
        }
      );

      const aiResponse = response.data;

      return {
        status: aiResponse.verified ? 'validated' : 'rejected',
        aiScore: aiResponse.score || 0,
        confidence: aiResponse.confidence || 0,
        tags: aiResponse.tags || [],
        description: aiResponse.description || '',
        detectedObjects: aiResponse.objects || [],
        impactVerification: {
          verified: aiResponse.verified || false,
          category: aiResponse.category || escrowContext.category,
          matchScore: aiResponse.matchScore || 0
        },
        processedAt: new Date(),
        reasoning: aiResponse.reasoning
      };

    } catch (error) {
      console.error('[ImageAnalysis] AI Service Error:', error.message);
      
      // Fallback vers analyse basique si le service IA est indisponible
      console.warn('[ImageAnalysis] Falling back to basic analysis');
      return this.basicAnalysis(imageBuffer, escrowContext);
    }
  }

  /**
   * Construction du prompt pour l'IA
   */
  buildPrompt(context) {
    const category = context.category || 'impact project';
    const description = context.description || '';

    return `Analyze this image for an impact verification system. This should be evidence of: ${category}.
${description ? `Expected: ${description}` : ''}

Please respond with a JSON object containing:
{
  "verified": true/false (does the image match the expected impact?),
  "score": 0-100 (quality and relevance score),
  "confidence": 0-1 (how confident are you?),
  "category": "water/solar/tree/education/etc",
  "description": "brief description of what you see",
  "objects": ["list", "of", "detected", "objects"],
  "tags": ["relevant", "tags"],
  "matchScore": 0-1 (how well does it match the expected impact?),
  "reasoning": "why you gave this score"
}`;
  }

  /**
   * Parse la réponse de l'IA
   */
  parseAIResponse(aiResponse) {
    try {
      // Essayer de parser comme JSON
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback : réponse par défaut
      return {
        verified: false,
        score: 50,
        confidence: 0.5,
        description: aiResponse.substring(0, 200),
        tags: [],
        objects: [],
        category: 'unknown',
        matchScore: 0.5
      };
    } catch (error) {
      console.error('[ImageAnalysis] Parse error:', error);
      return {
        verified: false,
        score: 0,
        confidence: 0,
        description: 'Error parsing AI response',
        tags: [],
        objects: [],
        category: 'unknown',
        matchScore: 0
      };
    }
  }

  /**
   * Génère un hash unique pour l'image
   */
  generateImageHash(imageBuffer) {
    return crypto
      .createHash('sha256')
      .update(imageBuffer)
      .digest('hex');
  }

  /**
   * Vérifie si une image est un duplicata
   */
  async isDuplicate(imageHash, ImageValidation) {
    const existing = await ImageValidation.findOne({ imageHash });
    return !!existing;
  }
}

module.exports = new ImageAnalysisService();
