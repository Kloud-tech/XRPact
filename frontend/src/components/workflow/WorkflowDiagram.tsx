/**
 * Workflow Diagram Component
 *
 * Visual representation of the complete donor-to-impact flow
 */

import React, { useState } from 'react';
import { ArrowRight, CheckCircle, XCircle, Clock, Play, Loader } from 'lucide-react';
import { simulateWorkflow } from '../../services/workflowApi';

interface Step {
  id: number;
  title: string;
  description: string;
  icon: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  details?: string[];
}

export const WorkflowDiagram: React.FC = () => {
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSimulate = async () => {
    setIsSimulating(true);
    setError(null);
    setSimulationResult(null);

    try {
      const result = await simulateWorkflow({
        donorName: 'Demo User',
        projectTitle: 'Demo Project - Puits au Sénégal',
        category: 'Water',
        amount: 5000
      });

      setSimulationResult(result);
      console.log('[Workflow] Simulation successful:', result);
    } catch (err: any) {
      setError(err.message || 'Failed to simulate workflow');
      console.error('[Workflow] Simulation failed:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const steps: Step[] = [
    {
      id: 1,
      title: 'Donateur',
      description: 'Donation initiale en XRP',
      icon: '💰',
      status: 'completed',
      details: [
        'Le donateur envoie des XRP',
        'Transaction sécurisée sur XRPL',
        'Frais: ~0.0002 XRP'
      ]
    },
    {
      id: 2,
      title: 'Impact Map',
      description: 'Projet créé sur la carte',
      icon: '🗺️',
      status: 'completed',
      details: [
        'Pin jaune ajouté à la carte',
        'Projet visible mondialement',
        'Transparence totale'
      ]
    },
    {
      id: 3,
      title: 'Smart Escrow',
      description: 'Fonds bloqués avec conditions',
      icon: '🔒',
      status: 'completed',
      details: [
        'XLS-100 Conditional Escrow',
        'Conditions: photos + validateurs',
        'Deadline automatique'
      ]
    },
    {
      id: 4,
      title: 'AMM Pool',
      description: 'Génération de yield',
      icon: '📊',
      status: 'active',
      details: [
        'Fonds dans liquidity pool XRPL',
        'Yield: ~9.8% APY',
        'Aucun CEX, 100% on-chain'
      ]
    },
    {
      id: 5,
      title: 'AI Trust Optimizer',
      description: 'Sélection des validateurs',
      icon: '🤖',
      status: 'active',
      details: [
        'Analyse proximité géographique',
        'Score de réputation',
        'Spécialisation par catégorie',
        'Temps de réponse'
      ]
    },
    {
      id: 6,
      title: 'XRPL Commons',
      description: 'Réseau de validateurs',
      icon: '🌐',
      status: 'active',
      details: [
        'Ambassadeurs locaux',
        'Universités partenaires',
        'Développeurs communautaires'
      ]
    },
    {
      id: 7,
      title: 'Oracle Humain',
      description: 'Validation terrain',
      icon: '✅',
      status: 'pending',
      details: [
        'Photo géolocalisée (GPS)',
        'Vérification rayon 500m',
        'Signature cryptographique',
        'Multi-signature (3/5)'
      ]
    }
  ];

  const outcomes = [
    {
      type: 'success',
      title: 'Validation Réussie',
      icon: '🟢',
      steps: [
        'Escrow débloqué automatiquement',
        'Paiement à l\'entrepreneur local',
        'Pin passe en VERT',
        'NFT "Proof of Impact" envoyé au donateur',
        'Yield redistribué'
      ],
      color: 'border-green-500 bg-green-50'
    },
    {
      type: 'failure',
      title: 'Validation Échouée',
      icon: '🔴',
      steps: [
        'Clawback automatique (XLS-39)',
        'Fonds renvoyés au donateur',
        'Pin passe en ROUGE',
        'Yield conservé pour futurs projets',
        'Réputation validateur ajustée'
      ],
      color: 'border-red-500 bg-red-50'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Complete Workflow
        </h2>
        <p className="text-gray-600">
          From donor to proof of impact - Full transparency on XRPL
        </p>
      </div>

      {/* Main Flow */}
      <div className="space-y-4 mb-8">
        {steps.map((step, index) => (
          <div key={step.id}>
            <div
              onClick={() => setSelectedStep(selectedStep === step.id ? null : step.id)}
              className={`
                relative flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all
                ${getStepBorderColor(step.status)}
                ${selectedStep === step.id ? 'shadow-lg scale-105' : 'hover:shadow-md'}
              `}
            >
              {/* Step Number */}
              <div className={`
                flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl
                ${getStepBgColor(step.status)}
              `}>
                {step.icon}
              </div>

              {/* Step Content */}
              <div className="ml-4 flex-1">
                <h3 className="font-bold text-lg text-gray-900">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>

              {/* Status Icon */}
              <div className="ml-4 flex-shrink-0">
                {step.status === 'completed' && <CheckCircle className="w-6 h-6 text-green-600" />}
                {step.status === 'active' && <Clock className="w-6 h-6 text-yellow-600 animate-pulse" />}
                {step.status === 'pending' && <Clock className="w-6 h-6 text-gray-400" />}
                {step.status === 'failed' && <XCircle className="w-6 h-6 text-red-600" />}
              </div>

              {/* Arrow connector */}
              {index < steps.length - 1 && (
                <div className="absolute left-6 -bottom-4 transform -translate-x-1/2">
                  <ArrowRight className="w-6 h-6 text-gray-400 rotate-90" />
                </div>
              )}
            </div>

            {/* Expanded Details */}
            {selectedStep === step.id && step.details && (
              <div className="mt-2 ml-16 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <ul className="space-y-2">
                  {step.details.map((detail, i) => (
                    <li key={i} className="flex items-start text-sm text-gray-700">
                      <span className="mr-2">•</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Decision Point */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t-2 border-gray-300"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-4 py-2 text-lg font-bold text-gray-700 border-2 border-gray-300 rounded-lg">
            ⚡ Décision Automatique
          </span>
        </div>
      </div>

      {/* Outcomes */}
      <div className="grid grid-cols-2 gap-6">
        {outcomes.map((outcome) => (
          <div
            key={outcome.type}
            className={`p-6 rounded-lg border-2 ${outcome.color}`}
          >
            <div className="flex items-center mb-4">
              <span className="text-4xl mr-3">{outcome.icon}</span>
              <h3 className="text-xl font-bold text-gray-900">{outcome.title}</h3>
            </div>

            <ul className="space-y-2">
              {outcome.steps.map((step, i) => (
                <li key={i} className="flex items-start text-sm text-gray-700">
                  <span className="mr-2">{outcome.type === 'success' ? '✅' : '❌'}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Key Features */}
      <div className="mt-8 grid grid-cols-3 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">100%</div>
          <div className="text-sm text-gray-600">On-chain XRPL</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">~9.8%</div>
          <div className="text-sm text-gray-600">APY from AMM</div>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">$0.0002</div>
          <div className="text-sm text-gray-600">Transaction Fee</div>
        </div>
      </div>

      {/* Live Demo Button */}
      <div className="mt-8 text-center">
        <button
          onClick={handleSimulate}
          disabled={isSimulating}
          className={`
            px-8 py-4 rounded-lg font-bold text-lg shadow-xl transition-all
            ${isSimulating
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:scale-105 hover:shadow-2xl'
            }
          `}
        >
          {isSimulating ? (
            <span className="flex items-center gap-2">
              <Loader className="w-5 h-5 animate-spin" />
              Running Workflow...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Play className="w-5 h-5" />
              🚀 Run Live Demo
            </span>
          )}
        </button>
        <p className="mt-2 text-sm text-gray-600">
          Execute the complete workflow end-to-end on XRPL Testnet
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
          <div className="flex items-start gap-2">
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-red-900">Error</h4>
              <p className="text-sm text-red-700">{error}</p>
              <p className="text-xs text-red-600 mt-2">
                Make sure the backend server is running on http://localhost:3001
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Simulation Result */}
      {simulationResult && (
        <div className="mt-4 p-6 bg-green-50 border-2 border-green-300 rounded-lg">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold text-green-900 text-lg mb-2">
                ✅ Workflow Executed Successfully!
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Project ID:</span>
                  <code className="px-2 py-1 bg-white rounded font-mono text-xs">
                    {simulationResult.projectId}
                  </code>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Final Status:</span>
                  <span className={`px-2 py-1 rounded font-bold ${
                    simulationResult.finalState.status === 'FUNDED'
                      ? 'bg-green-200 text-green-800'
                      : 'bg-yellow-200 text-yellow-800'
                  }`}>
                    {simulationResult.finalState.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Pin Color:</span>
                  <span className="text-2xl">
                    {simulationResult.finalState.pinColor === 'GREEN' ? '🟢' :
                     simulationResult.finalState.pinColor === 'YELLOW' ? '🟡' : '🔴'}
                  </span>
                  <span className="font-bold">{simulationResult.finalState.pinColor}</span>
                </div>
                {simulationResult.finalState.escrowHash && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Escrow Hash:</span>
                    <code className="px-2 py-1 bg-white rounded font-mono text-xs">
                      {simulationResult.finalState.escrowHash}
                    </code>
                  </div>
                )}
                {simulationResult.finalState.finalAmount && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Final Amount:</span>
                    <span className="font-bold text-green-700">
                      {simulationResult.finalState.finalAmount.toLocaleString()} XRP
                    </span>
                    {simulationResult.finalState.yieldGenerated && (
                      <span className="text-xs text-gray-600">
                        (+ {simulationResult.finalState.yieldGenerated.toFixed(2)} XRP yield)
                      </span>
                    )}
                  </div>
                )}
                {simulationResult.finalState.nftTokenId && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">NFT Proof:</span>
                    <code className="px-2 py-1 bg-white rounded font-mono text-xs">
                      {simulationResult.finalState.nftTokenId}
                    </code>
                  </div>
                )}
              </div>
              <div className="mt-4 p-3 bg-white rounded border border-green-200">
                <p className="text-xs text-gray-700">
                  <strong>✨ What happened:</strong> {simulationResult.message}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper functions
function getStepBorderColor(status: Step['status']): string {
  switch (status) {
    case 'completed':
      return 'border-green-300 bg-green-50';
    case 'active':
      return 'border-yellow-300 bg-yellow-50';
    case 'pending':
      return 'border-gray-300 bg-gray-50';
    case 'failed':
      return 'border-red-300 bg-red-50';
    default:
      return 'border-gray-300';
  }
}

function getStepBgColor(status: Step['status']): string {
  switch (status) {
    case 'completed':
      return 'bg-green-100';
    case 'active':
      return 'bg-yellow-100 animate-pulse';
    case 'pending':
      return 'bg-gray-100';
    case 'failed':
      return 'bg-red-100';
    default:
      return 'bg-gray-100';
  }
}

export default WorkflowDiagram;
