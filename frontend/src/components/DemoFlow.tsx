/**
 * Demo Flow Component
 *
 * One-click demo that executes:
 * 1. Make a donation (creates SBT)
 * 2. Simulate profit (generate trading profits)
 * 3. Distribute profits (auto-mints Impact NFT)
 */

import React, { useState } from 'react';
import { Play, AlertCircle, CheckCircle, Loader } from 'lucide-react';

interface DemoStep {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
}

export const DemoFlow: React.FC = () => {
  const [steps, setSteps] = useState<DemoStep[]>([
    { id: 'donation', label: '💰 Make Donation', status: 'pending' },
    { id: 'profit', label: '📈 Simulate Profit', status: 'pending' },
    { id: 'distribute', label: '🎁 Distribute Profits', status: 'pending' },
  ]);
  const [running, setRunning] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const updateStep = (id: string, status: DemoStep['status'], message?: string) => {
    setSteps((prev) =>
      prev.map((step) =>
        step.id === id ? { ...step, status, message } : step
      )
    );
  };

  const runDemo = async () => {
    setRunning(true);
    setShowResults(false);
    setSteps((prev) =>
      prev.map((step) => ({ ...step, status: 'pending' }))
    );

    let profitGenerated = 0.67; // Default fallback value

    try {
      // Step 1: Make donation
      updateStep('donation', 'running', 'Creating SBT...');
      try {
        const donationRes = await fetch('http://localhost:3000/api/xrpl/deposit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            donorAddress: 'rN7n7otQDd6FczFgLdkqfHRSEeGe3N5Ewk',
            amount: 100,
          }),
        });

        const donationData = await donationRes.json();

        if (donationData.success) {
          updateStep('donation', 'success', `Donated 100 XRP, SBT: ${donationData.sbtTokenId?.substring(0, 12)}...`);
        } else {
          updateStep('donation', 'error', donationData.error || 'Donation failed');
          throw new Error('Donation failed');
        }
      } catch (err: any) {
        updateStep('donation', 'error', err.message);
        throw err;
      }

      // Step 2: Simulate profit
      updateStep('profit', 'running', 'Generating trading profits...');
      try {
        const profitRes = await fetch('http://localhost:3000/api/xrpl/simulate-profit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            profitPercentage: 0.67,
          }),
        });

        const profitData = await profitRes.json();

        if (profitData.success) {
          profitGenerated = profitData.profitGenerated || 0.67;
          updateStep(
            'profit',
            'success',
            `Generated ${profitGenerated.toFixed(2)} XRP profit`
          );
        } else {
          updateStep('profit', 'error', profitData.error || 'Profit simulation failed');
          throw new Error('Profit simulation failed');
        }
      } catch (err: any) {
        updateStep('profit', 'error', err.message);
        throw err;
      }

      // Step 3: Distribute profits
      updateStep('distribute', 'running', 'Minting Impact NFT...');
      try {
        const distributeRes = await fetch('http://localhost:3000/api/xrpl/distribute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            profitAmount: profitGenerated,
          }),
        });

        const distributeData = await distributeRes.json();

        if (distributeData.success) {
          const impactNFT = distributeData.impactNFT;
          updateStep(
            'distribute',
            'success',
            `Distributed to ${distributeData.ngoCount || 0} NGOs. Impact NFT: ${impactNFT?.tier || 'bronze'} (${impactNFT?.impactScore || 0}/100)`
          );
        } else {
          updateStep('distribute', 'error', distributeData.error || 'Distribution failed');
          throw new Error('Distribution failed');
        }
      } catch (err: any) {
        updateStep('distribute', 'error', err.message);
        throw err;
      }

      setShowResults(true);
    } catch (error: any) {
      console.error('[DemoFlow] Error:', error);
    } finally {
      setRunning(false);
    }
  };

  const getStepIcon = (status: DemoStep['status']) => {
    switch (status) {
      case 'running':
        return <Loader className="w-5 h-5 animate-spin text-blue-600" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStepColor = (status: DemoStep['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'running':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getStepTextColor = (status: DemoStep['status']) => {
    switch (status) {
      case 'success':
        return 'text-green-700';
      case 'error':
        return 'text-red-700';
      case 'running':
        return 'text-blue-700';
      default:
        return 'text-gray-700';
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border-2 border-purple-200 p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">🎯 Complete Demo Flow</h2>
          <p className="text-gray-600">
            Experience the full donation → profit → redistribution → Impact NFT cycle in one click
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-4 mb-8">
          {steps.map((step, idx) => (
            <div
              key={step.id}
              className={`border-2 rounded-lg p-4 ${getStepColor(step.status)} transition-all`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-0.5">{getStepIcon(step.status)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{step.label}</span>
                    <span className={`text-xs font-medium ${getStepTextColor(step.status)}`}>
                      {step.status === 'pending' && 'Waiting...'}
                      {step.status === 'running' && 'Processing...'}
                      {step.status === 'success' && '✓ Complete'}
                      {step.status === 'error' && '✗ Failed'}
                    </span>
                  </div>
                  {step.message && (
                    <p className={`text-sm mt-1 ${getStepTextColor(step.status)}`}>
                      {step.message}
                    </p>
                  )}
                </div>
                {idx < steps.length - 1 && step.status === 'success' && (
                  <div className="text-2xl">➜</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Results Section */}
        {showResults && steps.every((s) => s.status === 'success') && (
          <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-green-900 mb-2">🎉 Demo Complete!</h3>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>✓ Donation created and SBT minted</li>
                  <li>✓ Trading profits simulated</li>
                  <li>✓ Profits distributed to NGOs</li>
                  <li>✓ Impact NFT automatically generated</li>
                </ul>
                <p className="text-sm text-green-700 mt-3">
                  📍 View your Impact NFTs in the section below!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Button */}
        <div className="text-center">
          <button
            onClick={runDemo}
            disabled={running}
            className={`inline-flex items-center gap-2 px-8 py-3 rounded-lg font-semibold transition ${
              running
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
            }`}
          >
            {running ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Running Demo...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Start Demo Flow
              </>
            )}
          </button>

          {steps.some((s) => s.status === 'error') && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">
                ⚠️ Something went wrong. Make sure the backend is running on port 3000.
              </p>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 pt-8 border-t border-purple-200">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">What happens in this demo:</h4>
            <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
              <li>
                <strong>Donation:</strong> Sends 100 XRP, automatically mints a Soulbound Token (SBT)
              </li>
              <li>
                <strong>Profit Simulation:</strong> Generates 0.67 XRP trading profit from the pool
              </li>
              <li>
                <strong>Distribution:</strong> Distributes profits to verified NGOs and auto-mints an Impact NFT showing the redistribution tier
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoFlow;
