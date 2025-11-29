/**
 * Express Server for XRPL Impact Fund
 *
 * Provides API endpoints for the workflow and other features
 */

import express from 'express';
import cors from 'cors';
import workflowRoutes from './api/workflowRoutes';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'XRPL Impact Fund API'
  });
});

// API Routes
app.use('/api/workflow', workflowRoutes);

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Server] Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n╔════════════════════════════════════════════════════╗`);
  console.log(`║   XRPL Impact Fund API Server                     ║`);
  console.log(`╚════════════════════════════════════════════════════╝`);
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`\n📋 Available endpoints:`);
  console.log(`   GET  /health                        - Health check`);
  console.log(`   POST /api/workflow/donate           - Initiate donation`);
  console.log(`   POST /api/workflow/validate         - Submit validation`);
  console.log(`   GET  /api/workflow/state/:projectId - Get project state`);
  console.log(`   GET  /api/workflow/all-states       - Get all states`);
  console.log(`   POST /api/workflow/simulate         - Simulate workflow`);
  console.log(`\n`);
});

export default app;
