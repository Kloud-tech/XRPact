/**
 * WebSocket Service
 * Handles real-time communication with frontend
 */

import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';

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

export class SocketService {
  private io: Server;

  constructor(server: HTTPServer, corsOrigin: string = 'http://localhost:5173') {
    this.io = new Server(server, {
      cors: {
        origin: corsOrigin,
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    this.setupHandlers();
  }

  private setupHandlers() {
    this.io.on('connection', (socket: Socket) => {
      console.log(`[WebSocket] Client connected: ${socket.id}`);

      // Subscribe to pool updates
      socket.on('subscribe:pool', () => {
        socket.join('pool-updates');
        console.log(`[WebSocket] ${socket.id} subscribed to pool updates`);
      });

      // Subscribe to donation feed
      socket.on('subscribe:donations', () => {
        socket.join('donation-feed');
        console.log(`[WebSocket] ${socket.id} subscribed to donation feed`);
      });

      // Subscribe to emergency alerts
      socket.on('subscribe:emergency', () => {
        socket.join('emergency-alerts');
        console.log(`[WebSocket] ${socket.id} subscribed to emergency alerts`);
      });

      // Unsubscribe handlers
      socket.on('unsubscribe:pool', () => {
        socket.leave('pool-updates');
      });

      socket.on('unsubscribe:donations', () => {
        socket.leave('donation-feed');
      });

      socket.on('unsubscribe:emergency', () => {
        socket.leave('emergency-alerts');
      });

      socket.on('disconnect', () => {
        console.log(`[WebSocket] Client disconnected: ${socket.id}`);
      });
    });
  }

  /**
   * Broadcast pool state update
   */
  broadcastPoolUpdate(update: PoolUpdate) {
    this.io.to('pool-updates').emit('pool:updated', update);
    console.log(`[WebSocket] Broadcasting pool update:`, update);
  }

  /**
   * Broadcast new donation
   */
  broadcastNewDonation(donation: DonationEvent) {
    this.io.to('donation-feed').emit('donation:new', donation);
    console.log(`[WebSocket] Broadcasting new donation:`, donation);
  }

  /**
   * Broadcast emergency alert
   */
  broadcastEmergency(emergency: EmergencyEvent) {
    this.io.to('emergency-alerts').emit('emergency:triggered', emergency);
    // Also broadcast to all for important alerts
    this.io.emit('emergency:alert', emergency);
    console.log(`[WebSocket] Broadcasting emergency:`, emergency);
  }

  /**
   * Broadcast generic event to all clients
   */
  broadcast(event: string, data: any) {
    this.io.emit(event, data);
  }

  /**
   * Broadcast to specific room
   */
  broadcastToRoom(room: string, event: string, data: any) {
    this.io.to(room).emit(event, data);
  }

  /**
   * Get connected clients count
   */
  getConnectedCount(): number {
    return this.io.sockets.sockets.size;
  }
}
