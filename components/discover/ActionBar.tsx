'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, X, Info } from 'lucide-react';

interface ActionBarProps {
  onPass: () => void;
  onLike: () => void;
  onInfo: () => void;
  disabled?: boolean;
}

export function ActionBar({
  onPass,
  onLike,
  onInfo,
  disabled = false,
}: ActionBarProps) {
  const triggerHaptic = (ms: number = 12) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(ms);
      } catch {
        // Safe fallback
      }
    }
  };

  const handlePass = () => {
    if (disabled) return;
    triggerHaptic(12);
    onPass();
  };

  const handleLike = () => {
    if (disabled) return;
    triggerHaptic(18);
    onLike();
  };

  const handleInfo = () => {
    if (disabled) return;
    triggerHaptic(8);
    onInfo();
  };

  return (
    <div className="w-full max-w-sm mx-auto flex items-center justify-center gap-7 py-2 px-4 select-none">
      {/* PASS (NOPE) BUTTON */}
      <motion.button
        type="button"
        disabled={disabled}
        onClick={handlePass}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.88 }}
        className="group relative w-16 h-16 rounded-full bg-[#12151E] border border-white/10 hover:border-coy-nope/50 hover:bg-coy-nope/10 text-coy-nope shadow-coy-float hover:shadow-coy-nope transition-all flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-coy-nope disabled:opacity-40 min-w-[56px] min-h-[56px]"
        aria-label="Pass (Left Arrow)"
        title="Pass (Left Arrow)"
      >
        <X className="w-7 h-7 stroke-[2.75] transition-transform duration-200 group-hover:rotate-12" />
        <span className="sr-only">Pass profile</span>
      </motion.button>

      {/* INFO BUTTON (EXPAND PROFILE SHEET) */}
      <motion.button
        type="button"
        disabled={disabled}
        onClick={handleInfo}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="group w-12 h-12 rounded-full bg-[#151924] border border-white/10 hover:border-white/25 text-slate-400 hover:text-white shadow-md transition-all flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 disabled:opacity-40 min-w-[48px] min-h-[48px]"
        aria-label="View profile details"
        title="View profile details"
      >
        <Info className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
      </motion.button>

      {/* LIKE BUTTON */}
      <motion.button
        type="button"
        disabled={disabled}
        onClick={handleLike}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.88 }}
        className="group relative w-16 h-16 rounded-full bg-gradient-to-tr from-coy-primary to-pink-500 text-white shadow-coy-primary hover:shadow-coy-primary transition-all flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-coy-primary disabled:opacity-40 min-w-[56px] min-h-[56px]"
        aria-label="Like (Right Arrow)"
        title="Like (Right Arrow)"
      >
        <Heart className="w-8 h-8 fill-white stroke-none transition-transform duration-200 group-hover:scale-115 group-active:scale-95" />
        <span className="sr-only">Like profile</span>
      </motion.button>
    </div>
  );
}
