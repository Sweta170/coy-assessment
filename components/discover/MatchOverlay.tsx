'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, MessageCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { PublicProfile } from '@/lib/matching/validation';
import { CURRENT_USER } from '@/lib/db/seed-data';

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
  if (!matchedProfile) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
      >
        <motion.div
          initial={{ scale: 0.8, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 20 }}
          transition={{ type: 'spring', damping: 20, stiffness: 220 }}
          className="w-full max-w-sm text-center flex flex-col items-center"
        >
          {/* Animated Header */}
          <div className="relative mb-6">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 shadow-xl shadow-rose-500/30 text-white mb-3"
            >
              <Heart className="w-8 h-8 fill-white" />
            </motion.div>

            <h1 className="text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-pink-300 to-amber-300 drop-shadow-sm">
              It&apos;s a Match!
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              You and <span className="font-semibold text-white">{matchedProfile.name}</span> liked each other
            </p>
          </div>

          {/* Both Photos Interlocking Display */}
          <div className="relative flex items-center justify-center my-4 w-full h-44">
            {/* My Photo */}
            <motion.div
              initial={{ x: -60, rotate: -15, opacity: 0 }}
              animate={{ x: -28, rotate: -8, opacity: 1 }}
              transition={{ type: 'spring', delay: 0.15 }}
              className="relative w-32 h-44 rounded-2xl overflow-hidden border-4 border-slate-900 shadow-2xl z-10"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={CURRENT_USER.photo}
                alt="You"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <span className="absolute bottom-2 left-2 text-xs font-semibold text-white/90">
                You
              </span>
            </motion.div>

            {/* Glowing Heart Connector */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [1, 1.25, 1] }}
              transition={{ repeat: Infinity, duration: 2, delay: 0.3 }}
              className="absolute z-30 w-10 h-10 rounded-full bg-rose-500 border-2 border-white flex items-center justify-center shadow-lg shadow-rose-500/50"
            >
              <Sparkles className="w-5 h-5 text-white" />
            </motion.div>

            {/* Matched User Photo */}
            <motion.div
              initial={{ x: 60, rotate: 15, opacity: 0 }}
              animate={{ x: 28, rotate: 8, opacity: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="relative w-32 h-44 rounded-2xl overflow-hidden border-4 border-slate-900 shadow-2xl z-20"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={matchedProfile.photo}
                alt={matchedProfile.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <span className="absolute bottom-2 left-2 text-xs font-semibold text-white/90 truncate max-w-[80px]">
                {matchedProfile.name}
              </span>
            </motion.div>
          </div>

          {/* Privacy Reassurance Note */}
          <div className="flex items-center gap-2 px-3.5 py-2 my-4 rounded-xl bg-slate-900/80 border border-white/10 text-slate-300 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Coy Promise: Neither of you knew until both swiped right.</span>
          </div>

          {/* Action Buttons */}
          <div className="w-full space-y-3 mt-2">
            <button
              onClick={onViewMatches}
              className="w-full py-3.5 px-6 rounded-2xl font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 transition active:scale-[0.98]"
            >
              <MessageCircle className="w-5 h-5" />
              <span>View Matches</span>
              <ArrowRight className="w-4 h-4 ml-auto" />
            </button>

            <button
              onClick={onKeepSwiping}
              className="w-full py-3.5 px-6 rounded-2xl font-medium text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition active:scale-[0.98]"
            >
              Keep Swiping
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
