/**
 * On-Chain Validation Service
 *
 * Publishes NGO validation results as hashes to XRPL Memo field.
 * This ensures immutable proof of validation.
 */

const crypto = require('crypto');

class OnChainValidationService {
  /**
   * Compute SHA256 hash of validation result
   */
  static computeValidationHash(validationResult) {
    const normalized = JSON.stringify(validationResult, null, 0);
    return crypto
      .createHash('sha256')
      .update(normalized)
      .digest('hex')
      .toUpperCase();
  }

  /**
   * Convert hex string to uppercase for XRPL Memo
   */
  static hexEncode(str) {
    return Buffer.from(str, 'utf8').toString('hex').toUpperCase();
  }

  /**
   * Create XRPL Payment transaction with validation hash in Memo
   * 
   * @param {Object} options - { ngoId, ngoAddress, validationHash, ownerAddress, amount, xrplSeed, network }
   * @returns {Object} - Transaction object ready for submission
   */
  static createValidationTransaction(options) {
    const {
      ngoId,
      ngoAddress,
      validationHash,
      ownerAddress,
      amount = '1000', // drops (0.001 XRP)
      network = 'testnet',
    } = options;

    const memoData = this.hexEncode(
      `VALIDATION_${ngoId}_${validationHash}`
    );

    return {
      TransactionType: 'Payment',
      Account: ownerAddress,
      Destination: ngoAddress,
      Amount: amount.toString(),
      Memos: [
        {
          Memo: {
            MemoData: memoData,
            MemoType: this.hexEncode('NGOValidation'),
            MemoFormat: this.hexEncode('sha256'),
          },
        },
      ],
      SourceTag: 0, // Can be used to organize validations
      SigningPubKey: '',
    };
  }

  /**
   * Parse validation hash from XRPL Memo
   */
  static parseValidationMemo(memoData) {
    try {
      const decoded = Buffer.from(memoData, 'hex').toString('utf8');
      const parts = decoded.split('_');
      if (parts.length >= 2 && parts[0] === 'VALIDATION') {
        return {
          ngoId: parts[1],
          hash: parts[2],
        };
      }
    } catch (e) {
      // Invalid memo format
    }
    return null;
  }

  /**
   * Verify that a validation result matches the published hash
   */
  static verifyValidationHash(validationResult, publishedHash) {
    const computedHash = this.computeValidationHash(validationResult);
    return computedHash === publishedHash.toUpperCase();
  }
}

module.exports = OnChainValidationService;
