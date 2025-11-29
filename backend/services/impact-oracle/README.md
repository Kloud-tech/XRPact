# ImpactOracle micro-service

Small micro-service that verifies XRPL NGO addresses against public sources (mocked/deterministic) and returns a clean JSON with an `impactScore` (0–100).

## Run

```powershell
cd "backend/services/impact-oracle"
npm install
npm start
```

The service listens on port `3300` by default.

## Endpoints

- `GET /oracle/verify?address=<xrplAddress>`
- `POST /oracle/verify` with JSON body `{ "address": "<xrplAddress>" }`

Response example:

```json
{
  "address": "rExampleAddress...",
  "exists": true,
  "sources": [
    { "name": "UNData", "found": true, "infoUrl": "https://search.example.org/...", "rawInfo": null },
    { "name": "OCDE", "found": false, "infoUrl": null, "rawInfo": null },
    { "name": "CharityBase", "found": false, "infoUrl": null, "rawInfo": null }
  ],
  "impactScore": 73,
  "timestamp": "2025-11-29T12:34:56.789Z"
}
```

## Integration example (backend XRPL)

You can call the micro-service from the main backend. Example snippet in Node:

```js
// Example: call ImpactOracle from another service
const axios = require('axios');
async function verifyOrg(address) {
  const oracleUrl = process.env.IMPACT_ORACLE_URL || 'http://localhost:3300/oracle/verify';
  const res = await axios.post(oracleUrl, { address });
  return res.data; // uses the clean JSON schema above
}
```

## Next steps (recommended)

- Add a `Dockerfile` and integrate into `docker-compose.yml` for local testing.
- Replace mock API endpoints with real API integrations and API keys.
- Add tests and health checks.
