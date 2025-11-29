// Integration example: call the ImpactOracle micro-service from the backend
const axios = require('axios');

async function verifyOrg(address) {
  const oracleUrl = process.env.IMPACT_ORACLE_URL || 'http://localhost:3300/oracle/verify';
  try {
    const res = await axios.post(oracleUrl, { address });
    console.log('Oracle result:', res.data);
    return res.data;
  } catch (err) {
    console.error('Failed to contact ImpactOracle', err.message || err);
    throw err;
  }
}

// Example usage
if (require.main === module) {
  (async () => {
    const address = process.argv[2] || 'rExampleAddress12345';
    const r = await verifyOrg(address);
    console.log(JSON.stringify(r, null, 2));
  })();
}

module.exports = { verifyOrg };
