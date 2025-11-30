import React, { useState, useCallback } from 'react';
import axios from 'axios';

interface ImageUploadProps {
  escrowId: string;
  category?: string;
  description?: string;
  uploadedBy?: string;
  onValidationComplete?: (result: any) => void;
}

interface ValidationResult {
  validationId: string;
  escrowId: string;
  analysis: {
    status: string;
    aiScore: number;
    confidence: number;
    description: string;
    tags: string[];
    impactVerification: {
      verified: boolean;
      category: string;
      matchScore: number;
    };
  };
  imageHash: string;
  escrowUpdated: boolean;
}

export const ImageUploadValidation: React.FC<ImageUploadProps> = ({
  escrowId,
  category,
  description,
  uploadedBy,
  onValidationComplete
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifications basiques
    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner une image');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image trop volumineuse (max 10MB)');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setResult(null);

    // Preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('escrowId', escrowId);
      if (category) formData.append('category', category);
      if (description) formData.append('description', description);
      if (uploadedBy) formData.append('uploadedBy', uploadedBy);

      const response = await axios.post<{ success: boolean; data: ValidationResult; error?: string }>(
        'http://localhost:3001/api/ai/validate-image',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        setResult(response.data.data);
        onValidationComplete?.(response.data.data);
      } else {
        setError(response.data.error || 'Erreur lors de la validation');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Erreur réseau');
    } finally {
      setUploading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 85) return 'bg-green-100';
    if (score >= 70) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold mb-4">📸 Validation d'Impact par IA</h3>

      {/* Upload Zone */}
      <div className="mb-6">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Téléchargez une preuve photo
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            {preview ? (
              <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded" />
            ) : (
              <div className="text-gray-500">
                <svg className="mx-auto h-12 w-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <p>Cliquez pour sélectionner une image</p>
                <p className="text-xs mt-1">JPEG, PNG ou WebP (max 10MB)</p>
              </div>
            )}
          </label>
        </div>
      </div>

      {/* Upload Button */}
      {selectedFile && !result && (
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {uploading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Analyse en cours...
            </span>
          ) : (
            '🤖 Analyser avec l\'IA'
          )}
        </button>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          ❌ {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="mt-6 space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 border-2 border-blue-200">
            <h4 className="font-bold text-lg mb-4">✨ Résultats de l'Analyse IA</h4>
            
            {/* Score */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Score IA</span>
                <span className={`text-2xl font-bold ${getScoreColor(result.analysis.aiScore)}`}>
                  {result.analysis.aiScore.toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className={`h-4 rounded-full ${getScoreBg(result.analysis.aiScore)} transition-all`}
                  style={{ width: `${result.analysis.aiScore}%` }}
                />
              </div>
            </div>

            {/* Status */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white rounded p-3">
                <div className="text-sm text-gray-600">Statut</div>
                <div className="font-bold capitalize">{result.analysis.status}</div>
              </div>
              <div className="bg-white rounded p-3">
                <div className="text-sm text-gray-600">Confiance</div>
                <div className="font-bold">{(result.analysis.confidence * 100).toFixed(0)}%</div>
              </div>
            </div>

            {/* Description */}
            {result.analysis.description && (
              <div className="bg-white rounded p-4 mb-4">
                <div className="text-sm text-gray-600 mb-1">Description</div>
                <p className="text-gray-800">{result.analysis.description}</p>
              </div>
            )}

            {/* Impact Verification */}
            <div className="bg-white rounded p-4 mb-4">
              <div className="text-sm text-gray-600 mb-2">Vérification d'Impact</div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Vérifié:</span>
                  <span className="font-bold">
                    {result.analysis.impactVerification.verified ? '✅ Oui' : '❌ Non'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Catégorie:</span>
                  <span className="font-bold capitalize">
                    {result.analysis.impactVerification.category}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Correspondance:</span>
                  <span className="font-bold">
                    {(result.analysis.impactVerification.matchScore * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Tags */}
            {result.analysis.tags && result.analysis.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {result.analysis.tags.map((tag, i) => (
                  <span key={i} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Escrow Update Status */}
            {result.escrowUpdated && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mt-4">
                ✅ L'escrow a été automatiquement validé !
              </div>
            )}
          </div>

          {/* New Upload Button */}
          <button
            onClick={() => {
              setSelectedFile(null);
              setPreview(null);
              setResult(null);
              setError(null);
            }}
            className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
          >
            📤 Télécharger une autre photo
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUploadValidation;
