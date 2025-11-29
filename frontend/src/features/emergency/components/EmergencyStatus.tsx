/**
 * Emergency Status Component
 * Displays current emergency fund status
 */

import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';

interface EmergencyData {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  reason: string;
  amountRequested: number;
  status: 'pending' | 'approved' | 'rejected' | 'executed';
  votesFor: number;
  votesAgainst: number;
  triggeredAt: string;
}

interface EmergencyStatusData {
  active: boolean;
  pending: EmergencyData[];
  history: EmergencyData[];
}

export const EmergencyStatus = () => {
  const [status, setStatus] = useState<EmergencyStatusData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/emergency/status`);
      const data = await response.json();
      if (data.success) {
        setStatus(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch emergency status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-blue-600 bg-blue-100';
    }
  };

  const getStatusIcon = (emergencyStatus: string) => {
    switch (emergencyStatus) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">Unable to load emergency status</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Emergency Fund Status</h2>
        <div
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            status.active ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
          }`}
        >
          {status.active ? 'Active Emergency' : 'No Active Emergency'}
        </div>
      </div>

      {status.pending.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-900">Pending Proposals</h3>
          <div className="space-y-3">
            {status.pending.map((emergency) => (
              <div
                key={emergency.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(emergency.status)}
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(
                        emergency.severity
                      )}`}
                    >
                      {emergency.severity.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(emergency.triggeredAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-900 mb-2">{emergency.reason}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-900">
                    {emergency.amountRequested.toLocaleString()} XRP requested
                  </span>
                  <div className="flex gap-4">
                    <span className="text-green-600">✓ {emergency.votesFor}</span>
                    <span className="text-red-600">✗ {emergency.votesAgainst}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {status.history.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-900">Recent History</h3>
          <div className="space-y-2">
            {status.history.slice(0, 5).map((emergency) => (
              <div
                key={emergency.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(emergency.status)}
                  <div>
                    <p className="text-sm text-gray-900">{emergency.reason}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(emergency.triggeredAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-600">
                  {emergency.amountRequested.toLocaleString()} XRP
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {status.pending.length === 0 && status.history.length === 0 && (
        <div className="text-center py-8">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
          <p className="text-gray-500">No emergency actions recorded</p>
        </div>
      )}
    </div>
  );
};
