/**
 * QR Code Generator Service
 * Generates QR codes for donation stories
 */

import QRCode from 'qrcode';

export interface QRCodeOptions {
  size?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  color?: {
    dark?: string;
    light?: string;
  };
}

export class QRGeneratorService {
  /**
   * Generate QR code as Data URL (base64 PNG)
   */
  async generateDataURL(url: string, options?: QRCodeOptions): Promise<string> {
    try {
      const qrOptions = {
        errorCorrectionLevel: options?.errorCorrectionLevel || 'H',
        type: 'image/png' as const,
        width: options?.size || 512,
        margin: 2,
        color: {
          dark: options?.color?.dark || '#1E40AF',
          light: options?.color?.light || '#FFFFFF',
        },
      };

      return await QRCode.toDataURL(url, qrOptions);
    } catch (error) {
      throw new Error(`Failed to generate QR code: ${error.message}`);
    }
  }

  /**
   * Generate QR code as SVG string
   */
  async generateSVG(url: string, options?: QRCodeOptions): Promise<string> {
    try {
      const qrOptions = {
        errorCorrectionLevel: options?.errorCorrectionLevel || 'H',
        type: 'svg' as const,
        width: options?.size || 512,
        margin: 2,
        color: {
          dark: options?.color?.dark || '#1E40AF',
          light: options?.color?.light || '#FFFFFF',
        },
      };

      return await QRCode.toString(url, qrOptions);
    } catch (error) {
      throw new Error(`Failed to generate QR code SVG: ${error.message}`);
    }
  }

  /**
   * Generate story URL
   */
  generateStoryURL(storyId: string, baseURL: string = 'https://xrpl-impact.fund'): string {
    return `${baseURL}/stories/${storyId}`;
  }

  /**
   * Generate QR code for donation story
   */
  async generateStoryQR(storyId: string, baseURL?: string, options?: QRCodeOptions): Promise<string> {
    const url = this.generateStoryURL(storyId, baseURL);
    return this.generateDataURL(url, options);
  }
}
