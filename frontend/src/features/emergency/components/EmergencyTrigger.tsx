/**
 * Emergency Trigger Component
 * Allows authorized users to trigger emergency fund releases
 */

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

interface TriggerFormData {
  triggeredBy: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  reason: string;
  amountRequested: number;
  affectedNGOs: string[];
}

export const EmergencyTrigger = () => {
  const [formData, setFormData] = useState<TriggerFormData>({
    triggeredBy: '',
    severity: 'medium',
    reason: '',
    amountRequested: 0,
    affectedNGOs: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/emergency/trigger`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setFormData({
          triggeredBy: '',
          severity: 'medium',
          reason: '',
          amountRequested: 0,
          affectedNGOs: [],
        });
      } else {
        setError(data.error?.message || 'Failed to trigger emergency');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-3 mb-6">
        <AlertTriangle className="h-6 w-6 text-red-600" />
        <h2 className="text-2xl font-bold text-gray-900">Trigger Emergency Fund</h2>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-yellow-800">
          <strong>Warning:</strong> Emergency fund releases require governance approval. This action
          will notify all stakeholders and initiate a voting period.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="triggeredBy" className="block text-sm font-medium text-gray-700 mb-1">
            Your Wallet Address *
          </label>
          <input
            type="text"
            id="triggeredBy"
            required
            value={formData.triggeredBy}
            onChange={(e) => setFormData({ ...formData, triggeredBy: e.target.value })}
            placeholder="rYourWalletAddress..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="severity" className="block text-sm font-medium text-gray-700 mb-1">
            Severity Level *
          </label>
          <select
            id="severity"
            required
            value={formData.severity}
            onChange={(e) =>
              setFormData({ ...formData, severity: e.target.value as TriggerFormData['severity'] })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
            Emergency Reason *
          </label>
          <textarea
            id="reason"
            required
            rows={4}
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            placeholder="Describe the emergency situation requiring immediate fund release..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        <div>
          <label htmlFor="amountRequested" className="block text-sm font-medium text-gray-700 mb-1">
            Amount Requested (XRP) *
          </label>
          <input
            type="number"
            id="amountRequested"
            required
            min="1"
            step="0.01"
            value={formData.amountRequested || ''}
            onChange={(e) => setFormData({ ...formData, amountRequested: parseFloat(e.target.value) })}
            placeholder="1000"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="affectedNGOs" className="block text-sm font-medium text-gray-700 mb-1">
            Affected NGO IDs (comma-separated)
          </label>
          <input
            type="text"
            id="affectedNGOs"
            value={formData.affectedNGOs.join(', ')}
            onChange={(e) =>
              setFormData({
                ...formData,
                affectedNGOs: e.target.value.split(',').map((id) => id.trim()).filter(Boolean),
              })
            }
            placeholder="ngo_health_1, ngo_water_2"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-800">
              Emergency triggered successfully! Stakeholders will be notified for voting.
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Triggering Emergency...' : 'Trigger Emergency Fund'}
        </button>
      </form>
    </div>
  );
};
