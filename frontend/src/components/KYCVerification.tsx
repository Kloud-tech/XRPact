/**
 * KYC Verification Component
 * Handles Know Your Customer verification for donors and NGOs
 */

import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Clock, Shield } from 'lucide-react';

interface KYCFormData {
  entityType: 'donor' | 'ngo';
  fullName: string;
  email: string;
  countryCode: string;
  documentType: 'passport' | 'id' | 'license';
  documentNumber: string;
}

interface KYCStatus {
  kycId?: string;
  status: 'pending' | 'approved' | 'rejected' | 'not_submitted';
  riskScore?: number;
  verificationDate?: string;
  expiryDate?: string;
  message?: string;
}

export const KYCVerification: React.FC = () => {
  const [formData, setFormData] = useState<KYCFormData>({
    entityType: 'donor',
    fullName: '',
    email: '',
    countryCode: 'US',
    documentType: 'passport',
    documentNumber: '',
  });

  const [status, setStatus] = useState<KYCStatus>({
    status: 'not_submitted',
  });
  const [loading, setLoading] = useState(false);
  const [userAddress, setUserAddress] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitKYC = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/xrpl/kyc/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          address: userAddress || 'rDonor' + Math.random().toString(36).substr(2, 9),
        }),
      });

      const result = await response.json();

      setStatus({
        kycId: result.kycId,
        status: result.status,
        riskScore: result.riskScore,
        message: result.message,
      });

      // Check status after submission
      if (result.kycId) {
        checkKYCStatus(result.kycId);
      }
    } catch (error) {
      console.error('[KYCVerification] Error submitting KYC:', error);
      setStatus({
        status: 'rejected',
        message: 'Failed to submit KYC verification',
      });
    } finally {
      setLoading(false);
    }
  };

  const checkKYCStatus = async (kycId: string) => {
    try {
      const response = await fetch(`/api/xrpl/kyc/${kycId}`);
      const result = await response.json();

      if (result.success && result.kyc) {
        setStatus({
          kycId: result.kyc.id,
          status: result.kyc.verificationStatus,
          riskScore: result.kyc.riskScore,
          verificationDate: result.kyc.verificationDate,
          expiryDate: result.kyc.expiryDate,
          message: `KYC Status: ${result.kyc.verificationStatus}`,
        });
      }
    } catch (error) {
      console.error('[KYCVerification] Error checking KYC status:', error);
    }
  };

  const getStatusIcon = () => {
    switch (status.status) {
      case 'approved':
        return <CheckCircle2 className="w-6 h-6 text-green-500" />;
      case 'rejected':
        return <AlertCircle className="w-6 h-6 text-red-500" />;
      case 'pending':
        return <Clock className="w-6 h-6 text-yellow-500" />;
      default:
        return <Shield className="w-6 h-6 text-gray-500" />;
    }
  };

  const getRiskColor = (score?: number) => {
    if (!score) return 'text-gray-600';
    if (score < 30) return 'text-green-600';
    if (score < 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const countries = [
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'CA', name: 'Canada' },
    { code: 'AU', name: 'Australia' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'CH', name: 'Switzerland' },
    { code: 'SG', name: 'Singapore' },
    { code: 'HK', name: 'Hong Kong' },
    { code: 'JP', name: 'Japan' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-md p-6 text-white">
        <div className="flex items-center mb-4">
          <Shield className="w-8 h-8 mr-3" />
          <h2 className="text-2xl font-bold">KYC Verification</h2>
        </div>
        <p className="text-blue-100">
          Know Your Customer verification for secure and compliant donations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Submit KYC Information</h3>

          <form onSubmit={handleSubmitKYC} className="space-y-4">
            {/* Entity Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Entity Type
              </label>
              <select
                name="entityType"
                value={formData.entityType}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="donor">Donor</option>
                <option value="ngo">NGO</option>
              </select>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="John Doe"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="john@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <select
                name="countryCode"
                value={formData.countryCode}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Document Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Type
              </label>
              <select
                name="documentType"
                value={formData.documentType}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="passport">Passport</option>
                <option value="id">National ID</option>
                <option value="license">Driver License</option>
              </select>
            </div>

            {/* Document Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Number
              </label>
              <input
                type="text"
                name="documentNumber"
                value={formData.documentNumber}
                onChange={handleInputChange}
                placeholder="ABC123456"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Wallet Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Wallet Address
              </label>
              <input
                type="text"
                value={userAddress}
                onChange={(e) => setUserAddress(e.target.value)}
                placeholder="rN7n7otQDd6FczFgLdhmKib8FsViiPbLb"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Optional - will be auto-generated if not provided</p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !formData.fullName || !formData.email || !formData.documentNumber}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Submitting KYC...' : 'Submit KYC Verification'}
            </button>
          </form>
        </div>

        {/* Status Display */}
        <div className="space-y-4">
          {/* Status Card */}
          <div
            className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
              status.status === 'approved'
                ? 'border-green-500'
                : status.status === 'rejected'
                  ? 'border-red-500'
                  : status.status === 'pending'
                    ? 'border-yellow-500'
                    : 'border-gray-300'
            }`}
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">{getStatusIcon()}</div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 capitalize">
                  {status.status === 'not_submitted' ? 'KYC Not Submitted' : `Status: ${status.status}`}
                </h3>
                <p className="text-gray-600 mt-1">{status.message || 'Submit your KYC information to get started'}</p>

                {status.kycId && (
                  <div className="mt-3 text-sm space-y-1">
                    <p className="text-gray-700">
                      <span className="font-medium">KYC ID:</span> {status.kycId}
                    </p>
                    {status.riskScore !== undefined && (
                      <p className={`${getRiskColor(status.riskScore)}`}>
                        <span className="font-medium">Risk Score:</span> {status.riskScore}/100
                      </p>
                    )}
                    {status.verificationDate && (
                      <p className="text-gray-700">
                        <span className="font-medium">Verified:</span> {new Date(status.verificationDate).toLocaleDateString()}
                      </p>
                    )}
                    {status.expiryDate && (
                      <p className="text-gray-700">
                        <span className="font-medium">Expires:</span> {new Date(status.expiryDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Information Cards */}
          <div className="bg-blue-50 rounded-lg shadow-md p-4 border border-blue-200">
            <h4 className="font-bold text-blue-900 mb-2">ℹ️ KYC Requirements</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ Valid government-issued ID</li>
              <li>✓ Correct legal name</li>
              <li>✓ Valid email address</li>
              <li>✓ Country of residence</li>
            </ul>
          </div>

          <div className="bg-green-50 rounded-lg shadow-md p-4 border border-green-200">
            <h4 className="font-bold text-green-900 mb-2">✨ Benefits of KYC</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>✓ Higher donation limits</li>
              <li>✓ Priority distribution</li>
              <li>✓ Governance voting rights</li>
              <li>✓ Exclusive NFT rewards</li>
            </ul>
          </div>

          <div className="bg-purple-50 rounded-lg shadow-md p-4 border border-purple-200">
            <h4 className="font-bold text-purple-900 mb-2">🔒 Data Security</h4>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>✓ Documents are encrypted</li>
              <li>✓ Compliant with GDPR</li>
              <li>✓ No document storage</li>
              <li>✓ Secure verification only</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KYCVerification;
