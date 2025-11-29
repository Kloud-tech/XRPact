import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import xrplRoutes from './modules/xrpl/xrpl.routes';
import emergencyRoutes from './api/routes/emergency.routes';
import { errorHandler, notFoundHandler } from './api/middlewares/error-handler.middleware';
import { SocketService } from './infrastructure/websocket/socket.service';

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;

// Initialize WebSocket
const socketService = new SocketService(
  server,
  process.env.CORS_ORIGIN || 'http://localhost:5173'
);

// Make socketService available globally
(global as any).socketService = socketService;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173', 'http://localhost:5175'],
  credentials: true,
}));
app.use(express.json());

// API v1 Routes
app.use('/api/xrpl', xrplRoutes);
app.use('/api/v1/emergency', emergencyRoutes);

// Mock database (until Docker is running)
const mockDatabase = {
  poolBalance: 125000,
  totalDonors: 342,
  totalDistributed: 45000,
  co2Offset: 12500,
  recentDonations: [
    { address: 'rDon...x7k9', amount: 500, time: '2 min ago', txHash: 'ABC123...' },
    { address: 'rDon...m3n2', amount: 1000, time: '15 min ago', txHash: 'DEF456...' },
    { address: 'rDon...p8q1', amount: 250, time: '1 hour ago', txHash: 'GHI789...' },
  ],
  ngos: [
    { id: 'ngo-001', name: 'Reforestation International', category: 'climate', impactScore: 95, totalReceived: 12000 },
    { id: 'ngo-002', name: 'Clean Water Project', category: 'water', impactScore: 92, totalReceived: 8500 },
    { id: 'ngo-003', name: 'Education for All', category: 'education', impactScore: 90, totalReceived: 7200 },
    { id: 'ngo-004', name: 'Global Health Initiative', category: 'health', impactScore: 88, totalReceived: 6800 },
  ],
};

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'xrpl-impact-fund-api',
    mode: 'mock-data',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.get('/api/pool/stats', (req, res) => {
  res.json({
    poolBalance: mockDatabase.poolBalance,
    totalDonors: mockDatabase.totalDonors,
    totalDistributed: mockDatabase.totalDistributed,
    co2Offset: mockDatabase.co2Offset,
  });
});

app.get('/api/donations/recent', (req, res) => {
  res.json(mockDatabase.recentDonations);
});

app.get('/api/ngos', (req, res) => {
  res.json(mockDatabase.ngos);
});

app.get('/api/ngos/:id', (req, res) => {
  const ngo = mockDatabase.ngos.find(n => n.id === req.params.id);
  if (!ngo) {
    return res.status(404).json({ error: 'NGO not found' });
  }
  res.json(ngo);
});

app.get('/api/leaderboard', (req, res) => {
  res.json([
    { rank: 1, address: 'rTop1...xyz', totalDonated: 5000, xp: 50000, level: 8 },
    { rank: 2, address: 'rTop2...abc', totalDonated: 3500, xp: 35000, level: 6 },
    { rank: 3, address: 'rTop3...def', totalDonated: 2800, xp: 28000, level: 6 },
  ]);
});

// Mock donation endpoint
app.post('/api/donate', (req, res) => {
  const { amount, donorAddress } = req.body;

  if (!amount || !donorAddress) {
    return res.status(400).json({ error: 'Missing amount or donorAddress' });
  }

  // Simulate donation
  mockDatabase.poolBalance += amount;
  mockDatabase.totalDonors += 1;
  mockDatabase.recentDonations.unshift({
    address: donorAddress,
    amount,
    time: 'Just now',
    txHash: `MOCK${Date.now()}`,
  });

  res.json({
    success: true,
    txHash: `MOCK${Date.now()}`,
    nftMinted: true,
    xpGained: amount * 10,
  });
});

// 404 Handler (must be after all routes)
app.use(notFoundHandler);

// Global Error Handler (must be last)
app.use(errorHandler);

// Start server
server.listen(PORT, () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🚀 XRPL Impact Fund API is running!`);
  console.log(`${'='.repeat(60)}`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌐 API: http://localhost:${PORT}`);
  console.log(`💚 Health: http://localhost:${PORT}/health`);
  console.log(`📊 XRPL: http://localhost:${PORT}/api/xrpl/pool`);
  console.log(`🚨 Emergency: http://localhost:${PORT}/api/v1/emergency/status`);
  console.log(`⚡ WebSocket: ws://localhost:${PORT}`);
  console.log(`${'='.repeat(60)}`);
  console.log(`✅ WebSocket enabled for real-time updates`);
  console.log(`✅ Error handling middleware active`);
  console.log(`✅ Emergency module loaded`);
  console.log(`⚠️  Running in MOCK MODE (no database required)`);
  console.log(`${'='.repeat(60)}\n`);
});

export default app;
export { socketService };
