const express = require('express');
const bodyParser = require('body-parser');
const { verifyAddress } = require('./verifyService');

const app = express();
app.use(bodyParser.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/oracle/verify', async (req, res) => {
  const address = String(req.query.address || '').trim();
  if (!address) return res.status(400).json({ error: 'address query param required' });
  try {
    const result = await verifyAddress(address);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message || String(err) });
  }
});

app.post('/oracle/verify', async (req, res) => {
  const address = String((req.body && req.body.address) || '').trim();
  if (!address) return res.status(400).json({ error: 'address in body required' });
  try {
    const result = await verifyAddress(address);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message || String(err) });
  }
});

const port = process.env.PORT || 3300;
app.listen(port, () => console.log(`ImpactOracle listening on ${port}`));

module.exports = app;
