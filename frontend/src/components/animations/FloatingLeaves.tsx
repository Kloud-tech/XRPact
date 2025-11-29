/**
 * Floating Leaves Animation
 *
 * Eco-friendly floating leaf particles across the page
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Leaf {
  id: number;
  x: number;
  delay: number;
  duration: number;
  emoji: string;
}

export const FloatingLeaves: React.FC = () => {
  const [leaves, setLeaves] = useState<Leaf[]>([]);

  useEffect(() => {
    const emojis = ['🌿', '🍃', '🌱', '💚', '✨', '🌍'];
    const newLeaves: Leaf[] = [];

    for (let i = 0; i < 15; i++) {
      newLeaves.push({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 10 + Math.random() * 10,
        emoji: emojis[Math.floor(Math.random() * emojis.length)]
      });
    }

    setLeaves(newLeaves);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {leaves.map((leaf) => (
        <motion.div
          key={leaf.id}
          className="absolute text-2xl opacity-30"
          style={{
            left: `${leaf.x}%`,
            top: '-10%',
          }}
          animate={{
            y: ['0vh', '110vh'],
            x: [0, Math.sin(leaf.id) * 50, 0],
            rotate: [0, 360],
            opacity: [0, 0.6, 0.4, 0],
          }}
          transition={{
            duration: leaf.duration,
            delay: leaf.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {leaf.emoji}
        </motion.div>
      ))}
    </div>
  );
};

export default FloatingLeaves;
