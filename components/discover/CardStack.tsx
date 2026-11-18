'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, RotateCcw, Sparkles, AlertTriangle, ArrowLeft, ArrowRight, ShieldCheck, Info } from 'lucide-react';
import { PublicProfile, SwipeResponse } from '@/lib/matching/validation';
import { SwipeCard } from './SwipeCard';

interface CardStackProps {
  initialDeck: PublicProfile[];
  isLoading: boolean;
  error: string | null;
  onMatch: (profile: PublicProfile) => void;
  onRefreshFeed: () => void;
  onResetDb: () => Promise<void>;
  onShowToast: (message: string, type: 'error' | 'success' | 'info') => void;
  onOpenDetails: (profile: PublicProfile) => void;
}

export function CardStack({
  initialDeck,
  isLoading,
  error,
  onMatch,
  onRefreshFeed,
  onResetDb,
  onShowToast,
  onOpenDetails,
}: CardStackProps) {
  const [deck, setDeck] = useState<PublicProfile[]>([]);
  const [swipingExit, setSwipingExit] = useState<{ id: string; direction: 'like' | 'pass' } | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const isProcessingSwipe = useRef(false);

  // Sync internal deck with prop
  useEffect(() => {
    setDeck(initialDeck);
  }, [initialDeck]);

  // Prefetch the next 3 cards' images so swiping never flashes blank
  useEffect(() => {
    if (!deck || deck.length === 0) return;
    const toPrefetch = deck.slice(1, 4);
    for (const p of toPrefetch) {
      if (p?.photo && typeof window !== 'undefined') {
        const img = new Image();
        img.src = p.photo;
      }
    }
  }, [deck]);

  const topCard = deck[0];
  const nextCard = deck[1];

  // Core Swipe Execution with Optimistic Update and Rollback
  const handleSwipe = useCallback(
    async (direction: 'like' | 'pass', profileToSwipe?: PublicProfile) => {
      const target = profileToSwipe || deck[0];
      if (!target || isProcessingSwipe.current) return;

      isProcessingSwipe.current = true;
      setSwipingExit({ id: target.id, direction });

      // 1. Optimistic removal from deck immediately
      setDeck((prev) => prev.filter((p) => p.id !== target.id));

      try {
        // 2. Perform background POST to /api/swipe
        const res = await fetch('/api/swipe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targetId: target.id,
            direction,
          }),
        });

        if (!res.ok) {
          throw new Error(`Server returned status ${res.status}`);
        }

        const data: SwipeResponse = await res.json();

        // 3. If mutual match occurs, notify parent to trigger MatchOverlay
        if (data.matched) {
          onMatch(data.profile);
        }
      } catch (err) {
        console.error('Optimistic swipe failed, rolling back:', err);

        // 4. Rollback: restore the card to top of the deck
        setDeck((prev) => [target, ...prev]);

        onShowToast(
          `Unable to swipe on ${target.name}. Action rolled back.`,
          'error'
        );
      } finally {
        setSwipingExit(null);
        isProcessingSwipe.current = false;
      }
    },
    [deck, onMatch, onShowToast]
  );

  // Desktop keyboard navigation (Left Arrow = Pass, Right Arrow = Like)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (deck.length === 0 || isProcessingSwipe.current) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleSwipe('pass');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleSwipe('like');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deck, handleSwipe]);

  const handleReset = async () => {
    try {
      setIsResetting(true);
      await onResetDb();
      onShowToast('Database reset and seeded with fresh demo profiles!', 'success');
    } catch {
      onShowToast('Failed to reset demo database.', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  // 1. Loading Skeleton State
  if (isLoading && deck.length === 0) {
    return (
      <div className="w-full flex-1 flex flex-col items-center justify-center p-4">
        <div className="relative w-full max-w-sm aspect-[3/4.4] rounded-3xl bg-slate-900 border border-white/5 overflow-hidden shimmer shadow-2xl flex flex-col justify-end p-6">
          <div className="space-y-3">
            <div className="h-7 w-3/5 bg-white/10 rounded-lg" />
            <div className="h-4 w-2/5 bg-white/5 rounded-md" />
            <div className="h-10 w-full bg-white/5 rounded-xl mt-2" />
            <div className="flex gap-2 pt-2">
              <div className="h-6 w-16 bg-white/10 rounded-full" />
              <div className="h-6 w-16 bg-white/10 rounded-full" />
            </div>
          </div>
        </div>

        {/* Buttons skeleton */}
        <div className="flex items-center justify-center gap-6 mt-6">
          <div className="w-16 h-16 rounded-full bg-slate-800/80 shimmer" />
          <div className="w-12 h-12 rounded-full bg-slate-800/50 shimmer" />
          <div className="w-16 h-16 rounded-full bg-slate-800/80 shimmer" />
        </div>
      </div>
    );
  }

  // 2. Error State
  if (error && deck.length === 0) {
    return (
      <div className="w-full flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4 shadow-lg">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Unable to load feed</h3>
        <p className="text-sm text-slate-400 max-w-xs mb-6">{error}</p>
        <button
          onClick={onRefreshFeed}
          className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold border border-white/10 transition flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    );
  }

  // 3. Exhausted Feed Empty State
  if (deck.length === 0) {
    return (
      <div className="w-full flex-1 flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-rose-500/10 via-pink-500/10 to-amber-500/10 border border-white/10 flex items-center justify-center text-rose-400 mb-5 shadow-2xl"
        >
          <Sparkles className="w-10 h-10 text-rose-400 animate-pulse" />
        </motion.div>

        <h3 className="text-2xl font-bold text-white mb-2">
          You&apos;ve seen everyone!
        </h3>
        <p className="text-sm text-slate-400 max-w-xs mb-6 leading-relaxed">
          You have reviewed all available profiles for now. Check back later or reset the demo to experience matching again.
        </p>

        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            onClick={handleReset}
            disabled={isResetting}
            className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 disabled:opacity-50 text-white font-semibold text-sm shadow-lg shadow-rose-500/25 transition flex items-center justify-center gap-2 active:scale-95"
          >
            <RotateCcw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
            <span>{isResetting ? 'Resetting...' : 'Reset Demo Database'}</span>
          </button>

          <button
            onClick={onRefreshFeed}
            className="w-full py-3 px-5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 font-medium text-sm border border-white/10 transition active:scale-95"
          >
            Check For New Profiles
          </button>
        </div>

        {/* Privacy Note */}
        <div className="mt-8 flex items-center gap-1.5 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>All your swipes remain private and secure</span>
        </div>
      </div>
    );
  }

  // 4. Active Card Deck
  return (
    <div className="w-full flex-1 flex flex-col items-center justify-between px-4 py-2 sm:py-4">
      {/* Cards Stage Container */}
      <div className="relative w-full max-w-sm aspect-[3/4.4] max-h-[580px] flex items-center justify-center">
        {/* Next Card Stack Hint (Underneath top card) */}
        {nextCard && (
          <motion.div
            key={nextCard.id}
            initial={{ scale: 0.94, y: 14, opacity: 0.6 }}
            animate={{ scale: 0.95, y: 12, opacity: 0.7 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="absolute inset-0"
          >
            <SwipeCard
              profile={nextCard}
              isTop={false}
              onSwipe={() => {}}
              onOpenDetails={() => {}}
            />
          </motion.div>
        )}

        {/* Top Active Card */}
        {topCard && (
          <AnimatePresence mode="popLayout">
            <motion.div
              key={topCard.id}
              initial={{ scale: 0.97, y: 6, opacity: 0.9 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={
                swipingExit
                  ? {
                      x: swipingExit.direction === 'like' ? 450 : -450,
                      rotate: swipingExit.direction === 'like' ? 22 : -22,
                      opacity: 0,
                      transition: { duration: 0.24, ease: 'easeOut' },
                    }
                  : { opacity: 0, scale: 0.9 }
              }
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              className="absolute inset-0"
            >
              <SwipeCard
                profile={topCard}
                isTop={true}
                onSwipe={(dir) => handleSwipe(dir, topCard)}
                onOpenDetails={onOpenDetails}
              />
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Desktop Keyboard Helper Hint */}
      <div className="hidden sm:flex items-center justify-center gap-4 text-[11px] text-slate-500 my-2 select-none">
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-mono text-[10px] border border-white/10">←</kbd>
          Pass
        </span>
        <span className="text-slate-600">•</span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-mono text-[10px] border border-white/10">→</kbd>
          Like
        </span>
      </div>

      {/* Bottom Action Buttons Bar */}
      <div className="flex items-center justify-center gap-6 py-2 select-none">
        {/* Pass Button */}
        <button
          onClick={() => handleSwipe('pass')}
          className="group w-16 h-16 rounded-full bg-slate-900/90 border border-white/10 hover:border-rose-500/50 hover:bg-rose-950/20 flex items-center justify-center text-rose-500 shadow-xl transition-all duration-150 transform active:scale-90 hover:scale-105"
          aria-label="Pass"
          title="Pass (Left Arrow)"
        >
          <X className="w-8 h-8 transition-transform group-hover:scale-110 stroke-[2.5]" />
        </button>

        {/* Info / Details Button */}
        <button
          onClick={() => topCard && onOpenDetails(topCard)}
          className="w-11 h-11 rounded-full bg-slate-900/80 border border-white/10 hover:border-cyan-500/50 hover:bg-cyan-950/20 flex items-center justify-center text-slate-400 hover:text-cyan-300 shadow-lg transition-all transform active:scale-90"
          aria-label="View Profile Information"
          title="Profile Information"
        >
          <Info className="w-5 h-5" />
        </button>

        {/* Like Button */}
        <button
          onClick={() => handleSwipe('like')}
          className="group w-16 h-16 rounded-full bg-slate-900/90 border border-white/10 hover:border-emerald-500/50 hover:bg-emerald-950/20 flex items-center justify-center text-emerald-400 shadow-xl transition-all duration-150 transform active:scale-90 hover:scale-105"
          aria-label="Like"
          title="Like (Right Arrow)"
        >
          <Heart className="w-8 h-8 transition-transform group-hover:scale-110 fill-emerald-400/20 group-hover:fill-emerald-400 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}
