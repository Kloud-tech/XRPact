/**
 * Green QR Code Demo - Eco-themed & Animated
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { QRCodeDisplay } from '@/shared/components/QRCodeDisplay';
import { QrCode, Sparkles, Download, Share2 } from 'lucide-react';

export const GreenQRCodeDemo = () => {
  const [storyId, setStoryId] = useState('story_demo_123');
  const [customUrl, setCustomUrl] = useState('');

  const exampleStories = [
    { id: 'story_water_haiti_2024', title: 'Clean Water Project - Haiti', emoji: '💧' },
    { id: 'story_school_kenya_2024', title: 'School Building - Kenya', emoji: '📚' },
    { id: 'story_medical_ukraine_2024', title: 'Medical Supplies - Ukraine', emoji: '❤️' },
    { id: 'story_forest_amazon_2024', title: 'Forest Protection - Amazon', emoji: '🌳' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-800 to-green-900 p-6 relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-lime-400/10 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl animate-pulse-slow"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="p-3 rounded-2xl bg-gradient-to-br from-lime-400 to-green-500 shadow-lg"
            >
              <QrCode className="h-8 w-8 text-white" />
            </motion.div>
            <h1 className="text-5xl font-bold text-white drop-shadow-lg">
              🔗 QR Code Generator
            </h1>
          </div>
          <p className="text-emerald-200 text-lg font-medium">
            Generate scannable QR codes for your donation impact stories 🌍
          </p>
        </motion.header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Controls */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Custom Story ID Input */}
            <div className="bg-gradient-to-br from-emerald-800/80 to-teal-900/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border-2 border-emerald-500/30">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-lime-400" />
                Custom Story
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-emerald-200 mb-2">
                    Story ID
                  </label>
                  <input
                    type="text"
                    value={storyId}
                    onChange={(e) => setStoryId(e.target.value)}
                    placeholder="story_demo_123"
                    className="w-full px-4 py-3 bg-green-950/50 border-2 border-emerald-500/30 rounded-xl focus:ring-2 focus:ring-lime-400 focus:border-lime-400 text-white placeholder-emerald-300/50 transition-all"
                  />
                  <p className="mt-1 text-xs text-emerald-300">
                    Enter any story ID to generate its QR code
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-emerald-200 mb-2">
                    Or Custom URL (optional)
                  </label>
                  <input
                    type="text"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://your-custom-url.com"
                    className="w-full px-4 py-3 bg-green-950/50 border-2 border-emerald-500/30 rounded-xl focus:ring-2 focus:ring-lime-400 focus:border-lime-400 text-white placeholder-emerald-300/50 transition-all"
                  />
                  <p className="mt-1 text-xs text-emerald-300">
                    Leave empty to use the default story URL format
                  </p>
                </div>
              </div>
            </div>

            {/* Example Stories */}
            <div className="bg-gradient-to-br from-emerald-800/80 to-teal-900/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border-2 border-emerald-500/30">
              <h2 className="text-2xl font-bold text-white mb-6">📌 Example Stories</h2>
              <div className="space-y-3">
                {exampleStories.map((story, i) => (
                  <motion.button
                    key={story.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ scale: 1.05, x: 10 }}
                    onClick={() => setStoryId(story.id)}
                    className="w-full text-left px-4 py-3 bg-green-950/50 hover:bg-green-900/50 border-2 border-emerald-500/30 hover:border-lime-400/50 rounded-xl transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{story.emoji}</span>
                      <div className="flex-1">
                        <p className="text-white font-semibold group-hover:text-lime-200 transition-colors">
                          {story.title}
                        </p>
                        <p className="text-xs text-emerald-300 font-mono">{story.id}</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* How It Works */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-teal-800/80 to-green-900/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border-2 border-emerald-500/30"
            >
              <h2 className="text-xl font-bold text-white mb-4">✨ How It Works</h2>
              <ul className="space-y-2 text-emerald-200 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-lime-400">•</span>
                  <span>QR codes link to donation impact stories</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lime-400">•</span>
                  <span>Donors can scan to see their impact</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lime-400">•</span>
                  <span>Stories show how their donation helped</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lime-400">•</span>
                  <span>Download as PNG or share via link</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lime-400">•</span>
                  <span>High error correction (Level H)</span>
                </li>
              </ul>
            </motion.div>
          </motion.div>

          {/* Right Column - QR Display */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Generated QR Code */}
            <div className="bg-gradient-to-br from-emerald-800/80 to-teal-900/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border-2 border-emerald-500/30">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  ✨
                </motion.div>
                Generated QR Code
              </h2>

              <div className="bg-white rounded-2xl p-6 mb-6 flex justify-center">
                <QRCodeDisplay
                  storyId={customUrl || storyId}
                  isCustomUrl={!!customUrl}
                  size="large"
                />
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold flex items-center justify-center gap-2 shadow-lg"
                >
                  <Download className="w-5 h-5" />
                  Download
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold flex items-center justify-center gap-2 shadow-lg"
                >
                  <Share2 className="w-5 h-5" />
                  Share
                </motion.button>
              </div>

              {/* Scan to view impact story */}
              <div className="mt-4 text-center text-emerald-200 text-sm">
                Scan to view impact story
              </div>
            </div>

            {/* Story URL Preview */}
            <div className="bg-gradient-to-br from-teal-800/80 to-green-900/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border-2 border-emerald-500/30">
              <h3 className="text-xl font-bold text-white mb-4">🔗 Story URL Preview</h3>
              <div className="bg-green-950/50 rounded-xl p-4 border-2 border-emerald-500/30">
                <code className="text-lime-300 text-sm break-all font-mono">
                  {customUrl || `https://xrpl-impact.fund/stories/${storyId}`}
                </code>
              </div>
              <p className="mt-3 text-emerald-300 text-sm">
                This URL will open when someone scans the QR code
              </p>
            </div>

            {/* Different Sizes */}
            <div className="bg-gradient-to-br from-emerald-800/80 to-teal-900/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border-2 border-emerald-500/30">
              <h3 className="text-xl font-bold text-white mb-4">📐 Different Sizes</h3>
              <div className="flex items-end justify-around gap-4 bg-white rounded-xl p-6">
                <div className="text-center">
                  <QRCodeDisplay storyId={storyId} size="small" />
                  <p className="text-xs text-gray-600 mt-2">Small</p>
                </div>
                <div className="text-center">
                  <QRCodeDisplay storyId={storyId} size="medium" />
                  <p className="text-xs text-gray-600 mt-2">Medium</p>
                </div>
                <div className="text-center">
                  <QRCodeDisplay storyId={storyId} size="large" />
                  <p className="text-xs text-gray-600 mt-2">Large</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default GreenQRCodeDemo;
