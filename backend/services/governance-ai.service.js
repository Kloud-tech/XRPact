/**
 * Governance AI Service
 * Intègre le moteur PPO Python pour optimiser les paramètres d'escrow
 */

const axios = require('axios');

class GovernanceAIService {
  constructor() {
    this.aiServiceUrl = process.env.GOVERNANCE_AI_URL || 'http://localhost:8001';
    this.enabled = false;
    this.lastRecommendations = null;
  }

  /**
   * Vérifie si l'IA de gouvernance est disponible
   */
  async checkAvailability() {
    try {
      const response = await axios.get(`${this.aiServiceUrl}/health`, { timeout: 2000 });
      this.enabled = response.data.status === 'healthy';
      return this.enabled;
    } catch (error) {
      console.log('[Governance AI] Service not available, using default parameters');
      this.enabled = false;
      return false;
    }
  }

  /**
   * Obtenir les recommandations IA pour les paramètres d'escrow
   * @param {Object} metrics - Métriques actuelles par région
   * @returns {Object} Paramètres recommandés
   */
  async getEscrowRecommendations(metrics) {
    if (!this.enabled) {
      return this._getDefaultParameters();
    }

    try {
      const response = await axios.post(
        `${this.aiServiceUrl}/governance/recommend`,
        {
          regions: metrics.regions,
          global_metrics: metrics.global
        },
        { timeout: 5000 }
      );

      this.lastRecommendations = response.data;
      console.log('[Governance AI] New recommendations received:', {
        impact_score: response.data.impact_score,
        regions: Object.keys(response.data.parameters_by_region)
      });

      return response.data;
    } catch (error) {
      console.error('[Governance AI] Error getting recommendations:', error.message);
      return this._getDefaultParameters();
    }
  }

  /**
   * Envoyer feedback sur les résultats d'un escrow
   * @param {Object} escrowResult - Résultats de l'escrow terminé
   */
  async sendFeedback(escrowResult) {
    if (!this.enabled) return;

    try {
      await axios.post(
        `${this.aiServiceUrl}/governance/feedback`,
        {
          escrow_id: escrowResult.escrowId,
          region: escrowResult.region,
          success: escrowResult.success,
          clawback: escrowResult.clawback,
          delay_days: escrowResult.delayDays,
          parameters_used: escrowResult.parameters
        },
        { timeout: 3000 }
      );
    } catch (error) {
      console.error('[Governance AI] Error sending feedback:', error.message);
    }
  }

  /**
   * Calculer les métriques pour l'IA à partir des données d'escrow
   * @param {Array} escrows - Liste des escrows
   * @returns {Object} Métriques formatées pour l'IA
   */
  calculateMetrics(escrows) {
    const regions = ['Africa', 'LatinAmerica', 'SouthAsia', 'Other'];
    const regionMetrics = {};

    regions.forEach(region => {
      const regionEscrows = escrows.filter(e => e.region === region);
      const total = regionEscrows.length;
      
      if (total === 0) {
        regionMetrics[region] = {
          funds_ratio: 0,
          success_rate: 0.5,
          clawback_rate: 0.1,
          avg_delay_norm: 0.3,
          validator_rep: 0.7,
          projects_funded: 0
        };
        return;
      }

      const successful = regionEscrows.filter(e => e.status === 'validated').length;
      const clawbacks = regionEscrows.filter(e => e.status === 'clawback').length;
      const totalAmount = regionEscrows.reduce((sum, e) => sum + (e.amount || 0), 0);
      
      // Calcul du délai moyen normalisé (0-1)
      const avgDelay = regionEscrows.reduce((sum, e) => {
        if (e.validatedAt && e.createdAt) {
          const days = (new Date(e.validatedAt) - new Date(e.createdAt)) / (1000 * 60 * 60 * 24);
          return sum + days;
        }
        return sum + 30; // Défaut 30 jours
      }, 0) / total;
      
      const delayNorm = Math.min(avgDelay / 90, 1); // 90 jours = max

      regionMetrics[region] = {
        funds_ratio: totalAmount,
        success_rate: successful / total,
        clawback_rate: clawbacks / total,
        avg_delay_norm: delayNorm,
        validator_rep: this._calculateValidatorRep(regionEscrows),
        projects_funded: total
      };
    });

    // Normaliser funds_ratio
    const totalFunds = Object.values(regionMetrics).reduce((sum, m) => sum + m.funds_ratio, 0);
    if (totalFunds > 0) {
      Object.keys(regionMetrics).forEach(region => {
        regionMetrics[region].funds_ratio /= totalFunds;
      });
    }

    // Métriques globales
    const allSuccessRate = escrows.filter(e => e.status === 'validated').length / Math.max(escrows.length, 1);
    const allClawbackRate = escrows.filter(e => e.status === 'clawback').length / Math.max(escrows.length, 1);

    return {
      regions: regionMetrics,
      global: {
        donor_retention: Math.max(0.4 + 0.4 * allSuccessRate - 0.5 * allClawbackRate, 0),
        impact_score_global: allSuccessRate * 0.8,
        geographical_balance: this._calculateGeoBalance(regionMetrics),
        new_donors_norm: 0.5
      }
    };
  }

  /**
   * Appliquer les recommandations IA à un nouvel escrow
   * @param {String} region - Région du projet
   * @param {Object} escrowData - Données de base de l'escrow
   * @returns {Object} Escrow avec paramètres optimisés
   */
  async applyAIParameters(region, escrowData) {
    const metrics = this.lastRecommendations;
    
    if (!metrics || !metrics.parameters_by_region || !metrics.parameters_by_region[region]) {
      return {
        ...escrowData,
        aiOptimized: false,
        parameters: this._getDefaultParametersForRegion(region)
      };
    }

    const params = metrics.parameters_by_region[region];

    return {
      ...escrowData,
      aiOptimized: true,
      timeoutDays: Math.round(params.escrow_timeout_days),
      stages: params.escrow_stages,
      requiredValidators: params.validators_per_project,
      minValidatorReputation: params.min_reputation,
      matchingMultiplier: params.matching_multiplier,
      parameters: params,
      aiImpactScore: metrics.impact_score || 0,
      aiRecommendationTimestamp: new Date()
    };
  }

  /**
   * Paramètres par défaut si l'IA n'est pas disponible
   */
  _getDefaultParameters() {
    return {
      impact_score: 0.5,
      parameters_by_region: {
        Africa: this._getDefaultParametersForRegion('Africa'),
        LatinAmerica: this._getDefaultParametersForRegion('LatinAmerica'),
        SouthAsia: this._getDefaultParametersForRegion('SouthAsia'),
        Other: this._getDefaultParametersForRegion('Other')
      }
    };
  }

  _getDefaultParametersForRegion(region) {
    return {
      matching_multiplier: 1.0,
      escrow_timeout_days: 60,
      escrow_stages: 3,
      validators_per_project: 2,
      min_reputation: 0.6,
      highlight_impact_bias: 0.5
    };
  }

  _calculateValidatorRep(escrows) {
    // Réputation basée sur le ratio succès/échecs
    const successful = escrows.filter(e => e.status === 'validated').length;
    const failed = escrows.filter(e => e.status === 'clawback').length;
    const total = successful + failed;
    
    if (total === 0) return 0.7;
    return Math.max(0.3, Math.min(1.0, successful / total));
  }

  _calculateGeoBalance(regionMetrics) {
    const ratios = Object.values(regionMetrics).map(m => m.funds_ratio);
    const mean = ratios.reduce((a, b) => a + b, 0) / ratios.length;
    const variance = ratios.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / ratios.length;
    const std = Math.sqrt(variance);
    
    // Plus le std est faible, meilleur est l'équilibre
    return Math.max(0, 1 - std * 2);
  }
}

module.exports = new GovernanceAIService();
