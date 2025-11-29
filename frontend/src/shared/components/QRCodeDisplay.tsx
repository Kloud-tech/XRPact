/**
 * QR Code Display Component
 * Generates and displays QR codes for donation stories
 */

import { QRCodeSVG } from 'qrcode.react';
import { Download, Share2 } from 'lucide-react';

interface QRCodeDisplayProps {
  storyId: string;
  size?: number;
  includeDownload?: boolean;
  includeShare?: boolean;
  baseURL?: string;
}

export const QRCodeDisplay = ({
  storyId,
  size = 256,
  includeDownload = true,
  includeShare = true,
  baseURL = 'https://xrpl-impact.fund',
}: QRCodeDisplayProps) => {
  const url = `${baseURL}/stories/${storyId}`;

  const handleDownload = () => {
    const svg = document.getElementById(`qr-${storyId}`) as HTMLElement;
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = size;
    canvas.height = size;

    img.onload = () => {
      ctx?.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `story-${storyId}-qr.png`;
          link.click();
          URL.revokeObjectURL(url);
        }
      });
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Donation Story',
          text: 'Check out this impact story from XRPL Impact Fund',
          url: url,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="bg-white p-4 rounded-lg shadow-md">
        <QRCodeSVG
          id={`qr-${storyId}`}
          value={url}
          size={size}
          level="H"
          includeMargin={true}
          fgColor="#1E40AF"
          bgColor="#FFFFFF"
        />
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-600 mb-2">Scan to view impact story</p>
        <p className="text-xs text-gray-500 font-mono break-all max-w-xs">{url}</p>
      </div>

      {(includeDownload || includeShare) && (
        <div className="flex gap-2">
          {includeDownload && (
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              Download
            </button>
          )}
          {includeShare && (
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Share2 className="h-4 w-4" />
              Share
            </button>
          )}
        </div>
      )}
    </div>
  );
};
