'use client';

import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Heart, Sparkles, MessageCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { PublicProfile } from '@/lib/matching/validation';
import { CURRENT_USER } from '@/lib/db/seed-data';
import { ConfettiBurst } from '../ui/Confetti';

interface MatchOverlayProps {
  matchedProfile: PublicProfile | null;
  onKeepSwiping: () => void;
  onViewMatches: () => void;
}

export function MatchOverlay({
  matchedProfile,
  onKeepSwiping,
  onViewMatches,
}: MatchOverlayProps) {
  const shouldReduceMotion = useReducedMotion();

  if (!matchedProfile) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl"
      >
        {/* Confetti Explosion */}
        <ConfettiBurst />

        <motion.div
          initial={shouldReduceMotion ? { opacity: 0 } : { scale: 0.85, y: 30 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { scale: 1, y: 0 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { scale: 0.85, y: 20 }}
          transition={{ type: 'spring', damping: 22, stiffness: 240 }}
          className="relative w-full max-w-sm text-center flex flex-col items-center z-10"
        >
          {/* Header Title with Editorial Display Font */}
          <div className="relative mb-6">
            <motion.div
              animate={shouldReduceMotion ? {} : { rotate: [0, 8, -8, 0], scale: [1, 1.12, 1] }}
              transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
              className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-coy-primary to-pink-500 shadow-coy-primary text-white mb-3"
            >
              <Heart className="w-7 h-7 fill-white" />
            </motion.div>

            <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-white drop-shadow-md">
              It&apos;s a Match!
            </h1>
            <p className="text-sm text-coy-sand/80 mt-1.5 font-medium">
              You and <span className="font-semibold text-white">{matchedProfile.name}</span> liked each other
            </p>
          </div>

          {/* Dual Photos Sliding Together Animation */}
          <div className="relative flex items-center justify-center my-4 w-full h-48 select-none">
            {/* My Photo (Alex) */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 0 } : { x: -120, rotate: -16, opacity: 0 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { x: -28, rotate: -8, opacity: 1 }}
              transition={{ type: 'spring', damping: 18, stiffness: 200, delay: 0.1 }}
              className="relative w-32 h-44 rounded-3xl overflow-hidden border-[3px] border-[#10131A] shadow-2xl z-10 bg-slate-900"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={CURRENT_USER.photo}
                alt="You"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
              <span className="absolute bottom-2.5 left-3 text-xs font-bold text-white/95">
                You
              </span>
            </motion.div>

            {/* Glowing Interlocking Central Medallion */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 0 } : { scale: 0 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { scale: [1, 1.22, 1] }}
              transition={{ repeat: Infinity, duration: 2.2, delay: 0.3 }}
              className="absolute z-30 w-11 h-11 rounded-full bg-gradient-to-tr from-coy-primary to-pink-500 border-2 border-white flex items-center justify-center shadow-coy-primary"
            >
              <Sparkles className="w-5 h-5 text-white" />
            </motion.div>

            {/* Match Photo */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 0 } : { x: 120, rotate: 16, opacity: 0 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { x: 28, rotate: 8, opacity: 1 }}
              transition={{ type: 'spring', damping: 18, stiffness: 200, delay: 0.15 }}
              className="relative w-32 h-44 rounded-3xl overflow-hidden border-[3px] border-[#10131A] shadow-2xl z-20 bg-slate-900"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={matchedProfile.photo}
                alt={matchedProfile.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
              <span className="absolute bottom-2.5 left-3 text-xs font-bold text-white/95 truncate max-w-[85px]">
                {matchedProfile.name}
              </span>
            </motion.div>
          </div>

          {/* Coy Privacy Guarantee Badge */}
          <div className="flex items-center gap-2 px-3.5 py-2 my-4 rounded-xl bg-white/[0.04] border border-white/10 text-coy-sand/80 text-xs">
            <ShieldCheck className="w-4 h-4 text-coy-like shrink-0" />
            <span>Neither knew until both swiped right.</span>
          </div>

          {/* CTA Buttons */}
          <div className="w-full space-y-3 mt-1">
            <button
              onClick={onViewMatches}
              className="w-full py-3.5 px-6 rounded-2xl font-bold text-white bg-gradient-to-r from-coy-primary to-pink-500 hover:from-coy-primaryHover hover:to-pink-600 shadow-coy-primary flex items-center justify-center gap-2 transition active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-coy-primary"
            >
              <MessageCircle className="w-5 h-5" />
              <span>View Matches</span>
              <ArrowRight className="w-4 h-4 ml-auto" />
            </button>

            <button
              onClick={onKeepSwiping}
              className="w-full py-3.5 px-6 rounded-2xl font-semibold text-coy-sand hover:text-white bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 transition active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            >
              Keep Swiping
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
