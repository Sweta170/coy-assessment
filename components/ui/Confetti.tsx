'use client';

import React, { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const CONFETTI_COLORS = [
  '#FF2D55', // Coy Rose
  '#FF6584', // Soft Coral
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#38BDF8', // Sky Blue
  '#E0E7FF', // Lavender
  '#FDE047', // Gold
];

interface Particle {
  id: number;
  x: number;
  y: number;
  rotate: number;
  scale: number;
  color: string;
  shape: 'rect' | 'circle' | 'heart';
  delay: number;
  duration: number;
}

export function ConfettiBurst() {
  const shouldReduceMotion = useReducedMotion();

  const particles: Particle[] = useMemo(() => {
    if (shouldReduceMotion) return [];

    const count = 50;
    return Array.from({ length: count }, (_, i) => {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const distance = 160 + Math.random() * 220;
      const shapes: ('rect' | 'circle' | 'heart')[] = ['rect', 'circle', 'heart'];

      return {
        id: i,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance - 80 + Math.random() * 80, // bias upward slightly
        rotate: Math.random() * 720 - 360,
        scale: 0.6 + Math.random() * 0.8,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        delay: Math.random() * 0.15,
        duration: 1.2 + Math.random() * 0.6,
      };
    });
  }, [shouldReduceMotion]);

  if (shouldReduceMotion) return null;

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-20">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0, rotate: 0 }}
          animate={{
            x: p.x,
            y: p.y + 120, // gravity fall
            opacity: [0, 1, 1, 0],
            scale: [0, p.scale, p.scale * 0.8, 0],
            rotate: p.rotate,
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="absolute"
        >
          {p.shape === 'rect' && (
            <div
              style={{ backgroundColor: p.color }}
              className="w-3.5 h-2 rounded-sm shadow-sm"
            />
          )}
          {p.shape === 'circle' && (
            <div
              style={{ backgroundColor: p.color }}
              className="w-2.5 h-2.5 rounded-full shadow-sm"
            />
          )}
          {p.shape === 'heart' && (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill={p.color}
              className="drop-shadow-sm"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          )}
        </motion.div>
      ))}
    </div>
  );
}
