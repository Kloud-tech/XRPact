// IMPORTANT: Load environment variables FIRST
import './config/env';

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import mongoose from 'mongoose';
import xrplRoutes from './modules/xrpl/xrpl.routes';
import emergencyRoutes from './api/routes/emergency.routes';
import { errorHandler, notFoundHandler } from './api/middlewares/error-handler.middleware';
import { SocketService } from './infrastructure/websocket/socket.service';

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3001;

// ============================================================================
// MongoDB Connection
// ============================================================================
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/xrpl-impact-map';
let mongoConnected = false;

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    console.log(`   Database: ${mongoose.connection.name}`);
    mongoConnected = true;
  })
  .catch((error) => {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('⚠️  Running in MOCK mode (no database)');
  });

// ============================================================================
// Initialize WebSocket
// ============================================================================
const socketService = new SocketService(
  server,
  process.env.CORS_ORIGIN || 'http://localhost:5173'
);

// Make socketService available globally
(global as any).socketService = socketService;

// ============================================================================
// Middleware
// ============================================================================
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173', 'http://localhost:5175'],
  credentials: true,
}));
app.use(express.json());

// ============================================================================
// Import MongoDB Routes (with escrows)
// ============================================================================
// Temporarily disabled - needs conversion to ES modules
// import { createRequire } from 'module';
// const require = createRequire(import.meta.url);
// const escrowRoutes = require('../routes/escrows.js');
// app.use('/api/escrows', escrowRoutes);


// ============================================================================
// Existing Routes
// ============================================================================
app.use('/api/xrpl', xrplRoutes);
app.use('/api/v1/emergency', emergencyRoutes);

// ============================================================================
// Health Check
// ============================================================================
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'xrpl-impact-fund-api',
    mongodb: mongoConnected,
    mode: mongoConnected ? 'mongodb' : 'mock',
    timestamp: new Date().toISOString(),
  });
});

// ============================================================================
// Error Handlers
// ============================================================================
app.use(notFoundHandler);
app.use(errorHandler);

// ============================================================================
// Start Server
// ============================================================================
server.listen(PORT, () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🚀 XRPL Impact Fund API is running!`);
  console.log(`${'='.repeat(60)}`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌐 API: http://localhost:${PORT}`);
  console.log(`💚 Health: http://localhost:${PORT}/health`);
  console.log(`📊 XRPL Pool: http://localhost:${PORT}/api/xrpl/pool`);
  console.log(`🚨 Emergency: http://localhost:${PORT}/api/v1/emergency/status`);
  console.log(`⚡ WebSocket: ws://localhost:${PORT}`);
  console.log(`${'='.repeat(60)}`);
  console.log(`✅ WebSocket enabled`);
  console.log(`✅ Error handling active`);
  console.log(`✅ Emergency module loaded`);
  console.log(mongoConnected ? `✅ MongoDB connected` : `⚠️  MongoDB not connected (using MOCK mode)`);
  console.log(`${'='.repeat(60)}\n`);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n👋 Shutting down gracefully...');
  if (mongoConnected) {
    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected');
  }
  process.exit(0);
});

export default app;
export { socketService };
