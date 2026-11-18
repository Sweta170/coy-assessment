'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, MapPin, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';
import { MatchItem, PublicProfile } from '@/lib/matching/validation';

interface MatchesGridProps {
  matches: MatchItem[];
  isLoading: boolean;
  onSelectMatch: (match: PublicProfile) => void;
  onSwitchToSwipe: () => void;
}

function formatMatchTime(isoDate: string): string {
  try {
    const matchTime = new Date(isoDate).getTime();
    const now = Date.now();
    const diffSec = Math.floor((now - matchTime) / 1000);

    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return `${Math.floor(diffSec / 86400)}d ago`;
  } catch {
    return 'Recently';
  }
}

export function MatchesGrid({
  matches,
  isLoading,
  onSelectMatch,
  onSwitchToSwipe,
}: MatchesGridProps) {
  if (isLoading && matches.length === 0) {
    return (
      <div className="w-full flex-1 p-4 grid grid-cols-2 gap-3.5 max-w-md mx-auto">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="aspect-[3/4] rounded-3xl bg-coy-surface border border-white/5 shimmer-box relative overflow-hidden"
          />
        ))}
      </div>
    );
  }

  // Friendly Empty State
  if (matches.length === 0) {
    return (
      <div className="w-full flex-1 flex flex-col items-center justify-center p-6 text-center max-w-sm mx-auto">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 20 }}
          className="w-20 h-20 rounded-4xl bg-gradient-to-tr from-coy-primary/20 to-pink-500/10 border border-white/10 flex items-center justify-center text-coy-primary mb-5 shadow-xl"
        >
          <Heart className="w-10 h-10 fill-coy-primary/20 text-coy-primary" />
        </motion.div>

        <h3 className="font-display text-2xl font-bold text-white mb-2">No Matches Yet</h3>
        <p className="text-sm text-coy-muted mb-7 leading-relaxed">
          Keep exploring! Your likes stay 100% confidential. When you and someone else both like each other, they&apos;ll appear right here.
        </p>

        <button
          onClick={onSwitchToSwipe}
          className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-coy-primary to-pink-500 hover:from-coy-primaryHover hover:to-pink-600 text-white font-bold text-sm shadow-coy-primary transition flex items-center gap-2 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-coy-primary"
        >
          <span>Start Swiping</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="mt-8 flex items-center gap-1.5 text-xs text-coy-muted/80">
          <ShieldCheck className="w-4 h-4 text-coy-like" />
          <span>Zero-Knowledge Discovery</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex-1 overflow-y-auto px-4 py-3 max-w-md mx-auto">
      {/* Header Info */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div>
          <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2.5">
            <span>Your Matches</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-coy-primary/20 text-coy-accent font-bold border border-coy-primary/30">
              {matches.length}
            </span>
          </h2>
          <p className="text-xs text-coy-muted mt-0.5 font-medium">
            Mutual likes only • Completely secret
          </p>
        </div>
      </div>

      {/* Grid of Matches with Staggered Entrance */}
      <div className="grid grid-cols-2 gap-3.5 pb-8">
        {matches.map((match, idx) => (
          <motion.div
            key={match.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.35, delay: idx * 0.06, ease: 'easeOut' }}
            onClick={() => onSelectMatch(match)}
            className="group relative aspect-[3/4] rounded-3xl overflow-hidden cursor-pointer border border-white/10 hover:border-coy-primary/50 bg-[#12151E] shadow-coy-card transition-all duration-200 transform hover:-translate-y-1 active:scale-[0.98]"
          >
            {/* Match Photo */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={match.photo}
              alt={match.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />

            {/* Gradient Scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />

            {/* New Match Badge */}
            <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-coy-primary/90 text-white text-[10px] font-bold shadow-sm flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              <span>Match</span>
            </div>

            {/* Timestamp Pill */}
            <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-medium text-coy-sand/90">
              {formatMatchTime(match.matchedAt)}
            </div>

            {/* Profile Info */}
            <div className="absolute bottom-0 left-0 right-0 p-3.5 text-white pointer-events-none">
              <div className="flex items-baseline gap-1.5">
                <span className="font-display font-bold text-base text-white truncate max-w-[100px]">
                  {match.name}
                </span>
                <span className="font-display text-xs text-coy-sand/80">{match.age}</span>
              </div>

              <p className="text-[11px] text-coy-sand/80 flex items-center gap-1 mt-0.5 truncate">
                <MapPin className="w-3 h-3 text-coy-primary shrink-0" />
                <span className="truncate">{match.city}</span>
              </p>

              {/* Interests tag */}
              {match.interests.length > 0 && (
                <div className="mt-2 flex items-center gap-1">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-200 border border-white/10 truncate max-w-[110px]">
                    {match.interests[0]}
                  </span>
                  {match.interests.length > 1 && (
                    <span className="text-[9px] text-coy-muted font-medium">
                      +{match.interests.length - 1}
                    </span>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
