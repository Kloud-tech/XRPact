/**
 * Panda Mascot - Animated floating panda that follows scroll
 *
 * Features:
 * - Follows scroll position
 * - Bounces and floats
 * - Interactive animations
 * - Cute eco-friendly vibe
 */

import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export const PandaMascot: React.FC = () => {
  const [isWaving, setIsWaving] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const { scrollYProgress } = useScroll();

  // Panda moves from left to right as you scroll
  const xPosition = useTransform(scrollYProgress, [0, 1], ['10%', '85%']);

  // Panda bounces up and down slightly
  const yBounce = useTransform(
    scrollYProgress,
    [0, 0.25, 0.5, 0.75, 1],
    [0, -20, 0, -20, 0]
  );

  // Random wave every 5 seconds
  useEffect(() => {
    const waveInterval = setInterval(() => {
      setIsWaving(true);
      setShowMessage(true);
      setTimeout(() => {
        setIsWaving(false);
        setTimeout(() => setShowMessage(false), 2000);
      }, 1000);
    }, 8000);

    return () => clearInterval(waveInterval);
  }, []);

  const messages = [
    "Keep saving the planet! 🌍",
    "Every donation helps! 💚",
    "You're amazing! ✨",
    "Eco-warrior! 🌱",
    "Making a difference! 🚀"
  ];

  const [currentMessage] = useState(messages[Math.floor(Math.random() * messages.length)]);

  return (
    <motion.div
      style={{ x: xPosition, y: yBounce }}
      className="fixed bottom-8 z-50 cursor-pointer"
      whileHover={{ scale: 1.1 }}
      onClick={() => {
        setIsWaving(true);
        setShowMessage(true);
        setTimeout(() => {
          setIsWaving(false);
          setTimeout(() => setShowMessage(false), 2000);
        }, 1000);
      }}
    >
      {/* Speech bubble */}
      {showMessage && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-white rounded-2xl px-4 py-2 shadow-xl border-2 border-emerald-400 whitespace-nowrap"
        >
          <div className="text-sm font-bold text-emerald-900">{currentMessage}</div>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white"></div>
        </motion.div>
      )}

      {/* Panda body */}
      <motion.div
        className="relative"
        animate={{
          rotate: [0, -5, 5, -5, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Bamboo stick in hand */}
        <motion.div
          className="absolute -left-8 top-6 w-2 h-16 bg-gradient-to-b from-green-600 to-green-800 rounded-full transform -rotate-45"
          animate={isWaving ? {
            rotate: [-45, -20, -45],
          } : {}}
          transition={{ duration: 0.5, repeat: isWaving ? 2 : 0 }}
        >
          {/* Bamboo leaves */}
          <div className="absolute -top-2 -left-2 text-2xl">🌿</div>
        </motion.div>

        {/* Main panda SVG-like design */}
        <div className="relative w-24 h-24">
          {/* Body */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-16 bg-white rounded-full shadow-2xl border-4 border-gray-800"></div>

          {/* Head */}
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-white rounded-full shadow-xl border-4 border-gray-800">
            {/* Ears */}
            <div className="absolute -top-2 -left-2 w-6 h-6 bg-gray-800 rounded-full"></div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gray-800 rounded-full"></div>

            {/* Eyes */}
            <div className="absolute top-4 left-2 w-4 h-5 bg-gray-800 rounded-full">
              <div className="absolute top-1 left-1 w-2 h-2 bg-white rounded-full"></div>
            </div>
            <div className="absolute top-4 right-2 w-4 h-5 bg-gray-800 rounded-full">
              <div className="absolute top-1 left-1 w-2 h-2 bg-white rounded-full"></div>
            </div>

            {/* Nose */}
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-3 h-2 bg-gray-800 rounded-full"></div>

            {/* Smile */}
            <motion.div
              className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-2 border-b-2 border-gray-800 rounded-b-full"
              animate={{
                scaleX: [1, 1.2, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            ></motion.div>
          </div>

          {/* Left arm */}
          <motion.div
            className="absolute top-10 left-1 w-5 h-8 bg-gray-800 rounded-full"
            animate={isWaving ? {
              rotate: [0, -30, 0, -30, 0],
            } : {}}
            transition={{ duration: 0.5, repeat: isWaving ? 2 : 0 }}
          ></motion.div>

          {/* Right arm */}
          <div className="absolute top-10 right-1 w-5 h-8 bg-gray-800 rounded-full"></div>

          {/* Legs */}
          <div className="absolute bottom-0 left-3 w-4 h-6 bg-gray-800 rounded-full"></div>
          <div className="absolute bottom-0 right-3 w-4 h-6 bg-gray-800 rounded-full"></div>
        </div>

        {/* Floating hearts around panda */}
        <motion.div
          className="absolute -top-4 -right-4 text-2xl"
          animate={{
            y: [-5, -15, -5],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          💚
        </motion.div>

        <motion.div
          className="absolute -top-6 -left-4 text-xl"
          animate={{
            y: [-8, -18, -8],
            opacity: [0.4, 0.9, 0.4],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            delay: 0.5,
          }}
        >
          🌱
        </motion.div>

        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-lime-400/20 rounded-full blur-xl -z-10 animate-pulse"></div>
      </motion.div>

      {/* Shadow */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-3 bg-black/20 rounded-full blur-md"></div>
    </motion.div>
  );
};

export default PandaMascot;
