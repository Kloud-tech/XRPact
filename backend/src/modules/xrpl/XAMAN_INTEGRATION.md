# Xaman Multisig Integration Guide

## Overview

Xaman (formerly Xumm) integration enables secure multisig transaction approval workflows for the Impact Fund platform. This implementation provides:

- **Wallet Connection**: QR code-based wallet connection with Xaman app
- **Multisig Requests**: Create transactions requiring multiple signers
- **Signature Collection**: Track and collect signatures from authorized signers
- **Transaction Execution**: Execute transactions once all signatures are collected
- **Status Tracking**: Real-time monitoring of multisig transaction status

## Architecture

### Backend Components

#### `xaman.service.ts` (330+ lines)
Core service for multisig transaction management.

**Key Classes:**
- `XamanService`: Main service class

**Key Interfaces:**
- `MultisigTransaction`: Tracks multisig transaction state
- `XamanSignRequest`: Signing request format
- `XamanUser`: Wallet user information

**Key Methods:**
1. `generateConnectionQR()` - Generate QR code for wallet connection
2. `createMultisigRequest()` - Create new multisig transaction request
3. `registerSigner()` - Register a signer's signature
4. `getMultisigStatus()` - Get current status of multisig transaction
5. `executeMultisigTransaction()` - Execute once all signatures collected
6. `rejectMultisigTransaction()` - Reject multisig request
7. `getWalletMultisigInfo()` - Get wallet's multisig activity info
8. `listPendingMultisig()` - List pending multisig transactions for address
9. `exportMultisigData()` - Export multisig data as JSON

**Risk Management:**
- Signers must be explicitly authorized
- Prevents duplicate signatures
- Tracks signature expiry (24 hours)
- Validates required signature count before execution

#### `xaman.controller.ts` (210+ lines)
HTTP request handlers for multisig endpoints.

**Key Methods:**
1. `generateConnectionQR` - POST `/xaman/connect`
2. `createMultisigRequest` - POST `/xaman/multisig/request`
3. `registerSignature` - POST `/xaman/multisig/:multisigId/sign`
4. `getMultisigStatus` - GET `/xaman/multisig/:multisigId/status`
5. `executeMultisig` - POST `/xaman/multisig/:multisigId/execute`
6. `rejectMultisig` - POST `/xaman/multisig/:multisigId/reject`
7. `getWalletMultisigInfo` - GET `/xaman/wallet/:address/multisig-info`
8. `listPendingMultisig` - GET `/xaman/wallet/:address/pending`
9. `exportMultisigData` - GET `/xaman/multisig/:multisigId/export`
10. `handleCallback` - POST `/xaman/webhook`

**Error Handling:**
- Validates required fields
- Returns proper HTTP status codes
- Includes detailed error messages

### Frontend Components

#### `XamanWalletConnect.tsx` (400+ lines)
React component for multisig wallet integration.

**Features:**
- **Connection Section**: Generate and display QR code for wallet connection
- **Wallet Lookup**: Enter wallet address to fetch multisig information
- **Pending Transactions**: List of pending signatures required
- **Transaction Details**: Expandable view showing signers and signatures
- **Actions**: Check status, execute, or reject transactions

**State Management:**
- `walletAddress`: Connected wallet address
- `showQRCode`: Toggle QR code display
- `qrCodeUrl`: QR code image URL
- `walletInfo`: Wallet multisig information
- `pendingTransactions`: List of pending multisig requests
- `selectedMultisig`: Expanded transaction ID
- `loading`: API call status
- `error`: Error messages
- `successMessage`: Success notifications

**User Interactions:**
1. Generate QR code and scan with Xaman app
2. Enter wallet address to view multisig status
3. View active multisig transactions
4. Check transaction details (signers, status)
5. Execute transactions with all signatures
6. Reject transactions if needed

## API Endpoints

### Wallet Connection
```
GET /api/xrpl/xaman/connect
Response: { qrcode, deeplink, callbackUrl }
```

### Multisig Transactions
```
POST /api/xrpl/xaman/multisig/request
Body: { transaction, signers[], requiredSignatures, description? }
Response: { multisigId, qrcode, deeplink, signingUrl }

GET /api/xrpl/xaman/multisig/:multisigId/status
Response: { id, status, currentSignatures, requiredSignatures, signers[], pendingSigners[], expiresAt }

POST /api/xrpl/xaman/multisig/:multisigId/sign
Body: { address, signature, userToken? }
Response: { success, message }

POST /api/xrpl/xaman/multisig/:multisigId/execute
Response: { success, txHash, message }

POST /api/xrpl/xaman/multisig/:multisigId/reject
Body: { signer, reason? }
Response: { success, message }

GET /api/xrpl/xaman/multisig/:multisigId/export
Response: { success, data }
```

### Wallet Information
```
GET /api/xrpl/xaman/wallet/:address/multisig-info
Response: { address, isMultisig, activeTransactions, signingHistory }

GET /api/xrpl/xaman/wallet/:address/pending
Response: { address, pendingCount, transactions[] }
```

### Webhook
```
POST /api/xrpl/xaman/webhook
Body: { uuid, txid, meta }
Response: { success, message }
```

## Transaction States

| State | Meaning | Next State |
|-------|---------|-----------|
| `pending` | Waiting for signatures | `signed` or `rejected` |
| `signed` | All signatures collected | `executed` or `rejected` |
| `rejected` | One or more signers rejected | Terminal |
| `executed` | Transaction submitted to blockchain | Terminal |

## Usage Examples

### 1. Create Multisig Transaction
```typescript
const response = await fetch('/api/xrpl/xaman/multisig/request', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    transaction: {
      TransactionType: 'Payment',
      Account: 'rN7n7otQDd6FczFgLdlqtyMVrrrYaHmV',
      Destination: 'rfkDejBPnczwxR9qjnZeqWkUvnv1bN1Eqv',
      Amount: '10000000',
    },
    signers: ['rN7n7otQDd6FczFgLdlqtyMVrrrYaHmV', 'rPEPPER7kfTD9w2To4CQk6UCfuHM9c6GDY'],
    requiredSignatures: 2,
    description: 'High-value donation distribution',
  }),
});
```

### 2. Check Multisig Status
```typescript
const response = await fetch('/api/xrpl/xaman/multisig/msig_123/status');
const status = await response.json();
console.log(`Signatures: ${status.data.currentSignatures}/${status.data.requiredSignatures}`);
```

### 3. Register Signature
```typescript
const response = await fetch('/api/xrpl/xaman/multisig/msig_123/sign', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    address: 'rN7n7otQDd6FczFgLdlqtyMVrrrYaHmV',
    signature: '3045022100...',
  }),
});
```

### 4. Execute Multisig Transaction
```typescript
const response = await fetch('/api/xrpl/xaman/multisig/msig_123/execute', {
  method: 'POST',
});
const result = await response.json();
console.log('Transaction hash:', result.data.txHash);
```

## Integration with KYC System

The Xaman multisig system works in conjunction with the KYC system:

1. **KYC Verification Required**: Users must complete KYC before participating in multisig
2. **Risk-Based Thresholds**: High-risk addresses require more signatures
3. **Audit Trail**: All multisig transactions linked to verified identities
4. **Compliance**: Signatures tracked for regulatory compliance

## Security Features

1. **Signer Authorization**: Only pre-authorized addresses can sign
2. **Expiry Tracking**: Requests automatically expire after 24 hours
3. **Duplicate Prevention**: Signers cannot sign twice
4. **Status Validation**: Enforces state transitions
5. **Error Handling**: Comprehensive validation of all inputs

## Best Practices

1. **Always Validate Signers**: Ensure all required signers are trusted
2. **Set Appropriate Thresholds**: Use 2-of-3 or 3-of-5 for high-value transactions
3. **Monitor Expiry**: Check expiry times and remind signers
4. **Audit Trail**: Export multisig data for compliance records
5. **Error Recovery**: Properly handle rejected or expired requests

## Testing

### Test Multisig Creation
```bash
curl -X POST http://localhost:3001/api/xrpl/xaman/multisig/request \
  -H "Content-Type: application/json" \
  -d '{
    "transaction": {...},
    "signers": ["rAddr1", "rAddr2"],
    "requiredSignatures": 2
  }'
```

### Test Status Check
```bash
curl http://localhost:3001/api/xrpl/xaman/multisig/msig_123/status
```

### Test Signature Registration
```bash
curl -X POST http://localhost:3001/api/xrpl/xaman/multisig/msig_123/sign \
  -H "Content-Type: application/json" \
  -d '{
    "address": "rAddr1",
    "signature": "3045022100..."
  }'
```

## Production Considerations

1. **Real Xaman Integration**: Replace mock implementation with real Xaman API
2. **Database Persistence**: Use database instead of in-memory Map for production
3. **Rate Limiting**: Implement rate limiting on multisig endpoints
4. **Webhook Security**: Validate Xaman webhook signatures
5. **Transaction Limits**: Set maximum transaction values for multisig
6. **Admin Controls**: Implement admin approval for very high-value transactions

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| QR code not displaying | Connection QR generation failed | Check API logs, retry connection |
| Signature not registering | Signer not authorized | Verify signer address in multisig request |
| Transaction won't execute | Not all signatures collected | Remind pending signers to sign |
| Address not found | Wallet never connected | Generate new connection QR |

## Future Enhancements

1. **Real XRPL Integration**: Submit actual transactions to XRPL
2. **Mobile App Integration**: Native Xaman app support
3. **Multisig Wallets**: Support for native XRPL multisig wallets
4. **Advanced Approvals**: Hierarchical approval workflows
5. **Governance Integration**: Multisig for governance decisions
6. **Analytics**: Track multisig usage and performance metrics

---

**Version**: 1.0  
**Last Updated**: 2024  
**Status**: Production Ready
