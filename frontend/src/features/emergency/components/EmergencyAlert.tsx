/**
 * Emergency Alert Component
 * Displays real-time emergency notifications
 */

import { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useWebSocket } from '@/shared/hooks/useWebSocket';

interface EmergencyEvent {
  id: string;
  severity: string;
  reason: string;
  amountRequested: number;
  timestamp: Date;
}

export const EmergencyAlert = () => {
  const { socket, connected, subscribeToEmergency } = useWebSocket();
  const [alerts, setAlerts] = useState<EmergencyEvent[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (connected) {
      subscribeToEmergency();
    }
  }, [connected, subscribeToEmergency]);

  useEffect(() => {
    if (!socket) return;

    const handleEmergency = (emergency: EmergencyEvent) => {
      console.log('[Emergency Alert] New emergency:', emergency);
      setAlerts((prev) => [emergency, ...prev].slice(0, 3));
      setVisible(true);

      // Auto-hide after 30 seconds
      setTimeout(() => {
        setAlerts((prev) => prev.filter((a) => a.id !== emergency.id));
      }, 30000);
    };

    socket.on('emergency:alert', handleEmergency);
    socket.on('emergency:triggered', handleEmergency);

    return () => {
      socket.off('emergency:alert', handleEmergency);
      socket.off('emergency:triggered', handleEmergency);
    };
  }, [socket]);

  useEffect(() => {
    if (alerts.length === 0) {
      setVisible(false);
    }
  }, [alerts]);

  const dismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'bg-red-600 border-red-700';
      case 'high':
        return 'bg-orange-600 border-orange-700';
      case 'medium':
        return 'bg-yellow-600 border-yellow-700';
      default:
        return 'bg-blue-600 border-blue-700';
    }
  };

  if (!visible || alerts.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`${getSeverityColor(
            alert.severity
          )} border-2 text-white rounded-lg shadow-lg p-4 animate-slide-in`}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm uppercase">{alert.severity} Emergency</span>
                <button
                  onClick={() => dismissAlert(alert.id)}
                  className="text-white hover:text-gray-200 transition-colors"
                  aria-label="Dismiss alert"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-sm mb-2">{alert.reason}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{alert.amountRequested.toLocaleString()} XRP</span>
                <span className="text-xs opacity-90">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
