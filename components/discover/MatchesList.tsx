'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, MapPin, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';
import { MatchItem, PublicProfile } from '@/lib/matching/validation';

interface MatchesListProps {
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

export function MatchesList({
  matches,
  isLoading,
  onSelectMatch,
  onSwitchToSwipe,
}: MatchesListProps) {
  if (isLoading && matches.length === 0) {
    return (
      <div className="w-full flex-1 p-4 grid grid-cols-2 gap-3.5 max-w-md mx-auto">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="aspect-[3/4] rounded-2xl bg-slate-900 border border-white/5 shimmer relative overflow-hidden"
          />
        ))}
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="w-full flex-1 flex flex-col items-center justify-center p-6 text-center max-w-sm mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500/10 to-pink-500/10 border border-white/10 flex items-center justify-center text-rose-400 mb-4 shadow-xl">
          <Heart className="w-8 h-8 fill-rose-500/20 text-rose-400" />
        </div>

        <h3 className="text-xl font-bold text-white mb-2">No Matches Yet</h3>
        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
          Keep exploring! Remember: your likes are 100% confidential. Neither of you will ever know unless you both like each other.
        </p>

        <button
          onClick={onSwitchToSwipe}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold text-sm shadow-lg shadow-rose-500/25 transition flex items-center gap-2 active:scale-95"
        >
          <span>Start Swiping</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="mt-8 flex items-center gap-1.5 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Protected by Coy privacy protocol</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex-1 overflow-y-auto p-4 max-w-md mx-auto">
      {/* Header Info */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Mutual Matches</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30">
              {matches.length}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Both of you liked each other
          </p>
        </div>
      </div>

      {/* Grid of Matches */}
      <div className="grid grid-cols-2 gap-3.5 pb-6">
        {matches.map((match, idx) => (
          <motion.div
            key={match.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => onSelectMatch(match)}
            className="group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer border border-white/10 hover:border-rose-500/40 bg-slate-900 shadow-lg transition-all duration-200 transform hover:-translate-y-1"
          >
            {/* Match Photo */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={match.photo}
              alt={match.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

            {/* Match Time Pill */}
            <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-medium text-slate-300">
              {formatMatchTime(match.matchedAt)}
            </div>

            {/* Details */}
            <div className="absolute bottom-0 left-0 right-0 p-3 text-white pointer-events-none">
              <div className="flex items-baseline gap-1.5">
                <span className="font-bold text-sm text-white truncate max-w-[100px]">
                  {match.name}
                </span>
                <span className="text-xs text-white/70">{match.age}</span>
              </div>

              <p className="text-[11px] text-slate-300 flex items-center gap-1 mt-0.5 truncate">
                <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                <span className="truncate">{match.city}</span>
              </p>

              {/* Interests tag */}
              {match.interests.length > 0 && (
                <div className="mt-2 flex items-center gap-1">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-200 border border-rose-500/30 truncate max-w-[120px]">
                    {match.interests[0]}
                  </span>
                  {match.interests.length > 1 && (
                    <span className="text-[9px] text-slate-400">
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
