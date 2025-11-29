/**
 * QR Code Demo Component
 * Demonstrates QR code generation for donation stories
 */

import { useState } from 'react';
import { QRCodeDisplay } from '@/shared/components/QRCodeDisplay';
import { QrCode } from 'lucide-react';

export const QRCodeDemo = () => {
  const [storyId, setStoryId] = useState('story_demo_123');
  const [customUrl, setCustomUrl] = useState('');

  // Example story IDs
  const exampleStories = [
    { id: 'story_water_haiti_2024', title: 'Clean Water Project - Haiti' },
    { id: 'story_school_kenya_2024', title: 'School Building - Kenya' },
    { id: 'story_medical_ukraine_2024', title: 'Medical Supplies - Ukraine' },
    { id: 'story_forest_amazon_2024', title: 'Forest Protection - Amazon' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <QrCode className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">QR Code Generator</h1>
          </div>
          <p className="text-gray-600">
            Generate QR codes for donation impact stories - scannable links to share your impact
          </p>
        </header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Controls */}
          <div className="space-y-6">
            {/* Custom Story ID Input */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Custom Story</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="storyId" className="block text-sm font-medium text-gray-700 mb-2">
                    Story ID
                  </label>
                  <input
                    type="text"
                    id="storyId"
                    value={storyId}
                    onChange={(e) => setStoryId(e.target.value)}
                    placeholder="story_demo_123"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Enter any story ID to generate its QR code
                  </p>
                </div>

                <div>
                  <label htmlFor="customUrl" className="block text-sm font-medium text-gray-700 mb-2">
                    Or Custom URL (optional)
                  </label>
                  <input
                    type="text"
                    id="customUrl"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://your-custom-url.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Leave empty to use the default story URL format
                  </p>
                </div>
              </div>
            </div>

            {/* Example Stories */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Example Stories</h2>
              <div className="space-y-2">
                {exampleStories.map((story) => (
                  <button
                    key={story.id}
                    onClick={() => setStoryId(story.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      storyId === story.id
                        ? 'bg-blue-100 border-2 border-blue-500'
                        : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                    }`}
                  >
                    <p className="font-medium text-gray-900">{story.title}</p>
                    <p className="text-xs text-gray-500 font-mono mt-1">{story.id}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">How It Works</h3>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>• QR codes link to donation impact stories</li>
                <li>• Donors can scan to see their impact</li>
                <li>• Stories show how their donation helped</li>
                <li>• Download as PNG or share via link</li>
                <li>• High error correction (Level H)</li>
              </ul>
            </div>
          </div>

          {/* Right Column - QR Code Display */}
          <div className="space-y-6">
            {/* Main QR Code */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-6 text-center">Generated QR Code</h2>

              {customUrl ? (
                <div className="flex flex-col items-center">
                  <div className="bg-white p-4 rounded-lg shadow-md mb-4">
                    <QRCodeDisplay
                      storyId={storyId}
                      size={256}
                      includeDownload={true}
                      includeShare={true}
                      baseURL={customUrl}
                    />
                  </div>
                  <p className="text-sm text-gray-600 text-center">
                    Custom URL: <span className="font-mono text-xs">{customUrl}</span>
                  </p>
                </div>
              ) : (
                <QRCodeDisplay
                  storyId={storyId}
                  size={256}
                  includeDownload={true}
                  includeShare={true}
                />
              )}
            </div>

            {/* Preview URL */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Story URL Preview</h3>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-sm font-mono text-gray-700 break-all">
                  {customUrl || `https://xrpl-impact.fund/stories/${storyId}`}
                </p>
              </div>
              <p className="mt-3 text-sm text-gray-600">
                This URL will open when someone scans the QR code
              </p>
            </div>

            {/* Different Sizes Demo */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Different Sizes</h3>
              <div className="flex items-end justify-around gap-4">
                <div className="text-center">
                  <QRCodeDisplay
                    storyId={storyId}
                    size={64}
                    includeDownload={false}
                    includeShare={false}
                  />
                  <p className="text-xs text-gray-500 mt-2">64px</p>
                </div>
                <div className="text-center">
                  <QRCodeDisplay
                    storyId={storyId}
                    size={128}
                    includeDownload={false}
                    includeShare={false}
                  />
                  <p className="text-xs text-gray-500 mt-2">128px</p>
                </div>
                <div className="text-center">
                  <QRCodeDisplay
                    storyId={storyId}
                    size={192}
                    includeDownload={false}
                    includeShare={false}
                  />
                  <p className="text-xs text-gray-500 mt-2">192px</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
