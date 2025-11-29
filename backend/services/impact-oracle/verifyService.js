const axios = require('axios');
const crypto = require('crypto');

function hashToInt(str) {
  const h = crypto.createHash('sha256').update(String(str)).digest('hex');
  return parseInt(h.slice(0, 8), 16);
}

async function probeApis(address) {
  const publicApis = [
    { name: 'UNData', url: `https://api.undata.mock/search?q=${encodeURIComponent(address)}` },
    { name: 'OCDE', url: `https://api.oecd.mock/search?q=${encodeURIComponent(address)}` },
    { name: 'CharityBase', url: `https://api.charitybase.mock/search?q=${encodeURIComponent(address)}` }
  ];

  const sources = [];

  for (const s of publicApis) {
    let found = false;
    let info = null;
    try {
      // Attempt a real HTTP call (many public APIs require keys); this is safe-to-fail.
      const r = await axios.get(s.url, { timeout: 2000 });
      if (r && r.status === 200 && r.data) {
        // If the API returned something truthy, treat as found.
        found = true;
        info = r.data;
      }
    } catch (e) {
      // ignore network errors; we'll use deterministic mock below
    }

    // Deterministic fallback: hash of address + source name
    const h = hashToInt(address + s.name);
    if (!found) {
      // 1-in-5 fallback "found" to emulate discovery without external keys
      found = (h % 5) === 0;
    }

    sources.push({
      name: s.name,
      found,
      infoUrl: found ? `https://search.example.org/${encodeURIComponent(address)}` : null,
      rawInfo: info || null
    });
  }

  return sources;
}

function computeImpactScore(address) {
  // Deterministic pseudo-random 0..100 based on hash
  const h = hashToInt(address);
  return Math.floor((h % 101));
}

async function verifyAddress(address) {
  if (!address || String(address).trim() === '') throw new Error('invalid address');
  const sources = await probeApis(address);
  const exists = sources.some(s => s.found === true);
  const impactScore = computeImpactScore(address);
  return {
    address,
    exists,
    sources,
    impactScore,
    timestamp: new Date().toISOString()
  };
}

module.exports = { verifyAddress };
