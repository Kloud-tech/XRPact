/**
 * WebSocket Hook
 * Provides real-time connection to backend
 */

import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export interface PoolUpdate {
  totalBalance: number;
  totalDonations: number;
  donorCount: number;
  timestamp: Date;
}

export interface DonationEvent {
  donorAddress: string;
  amount: number;
  txHash: string;
  level: number;
  tier: string;
  timestamp: Date;
}

export interface EmergencyEvent {
  id: string;
  severity: string;
  reason: string;
  amountRequested: number;
  timestamp: Date;
}

interface UseWebSocketReturn {
  socket: Socket | null;
  connected: boolean;
  subscribeToPool: () => void;
  subscribeToDonations: () => void;
  subscribeToEmergency: () => void;
  unsubscribeFromPool: () => void;
  unsubscribeFromDonations: () => void;
  unsubscribeFromEmergency: () => void;
}

export const useWebSocket = (url?: string): UseWebSocketReturn => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  const socketUrl = url || import.meta.env.VITE_WS_URL || 'http://localhost:3001';

  useEffect(() => {
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('[WebSocket] Connected to server');
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('[WebSocket] Disconnected from server');
      setConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('[WebSocket] Connection error:', error);
      setConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [socketUrl]);

  const subscribeToPool = useCallback(() => {
    if (socket) {
      socket.emit('subscribe:pool');
      console.log('[WebSocket] Subscribed to pool updates');
    }
  }, [socket]);

  const subscribeToDonations = useCallback(() => {
    if (socket) {
      socket.emit('subscribe:donations');
      console.log('[WebSocket] Subscribed to donation feed');
    }
  }, [socket]);

  const subscribeToEmergency = useCallback(() => {
    if (socket) {
      socket.emit('subscribe:emergency');
      console.log('[WebSocket] Subscribed to emergency alerts');
    }
  }, [socket]);

  const unsubscribeFromPool = useCallback(() => {
    if (socket) {
      socket.emit('unsubscribe:pool');
    }
  }, [socket]);

  const unsubscribeFromDonations = useCallback(() => {
    if (socket) {
      socket.emit('unsubscribe:donations');
    }
  }, [socket]);

  const unsubscribeFromEmergency = useCallback(() => {
    if (socket) {
      socket.emit('unsubscribe:emergency');
    }
  }, [socket]);

  return {
    socket,
    connected,
    subscribeToPool,
    subscribeToDonations,
    subscribeToEmergency,
    unsubscribeFromPool,
    unsubscribeFromDonations,
    unsubscribeFromEmergency,
  };
};
