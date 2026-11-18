'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Sparkles, RotateCcw, ShieldCheck, AlertCircle, Compass } from 'lucide-react';
import { PublicProfile, SwipeResponse } from '@/lib/matching/validation';
import { SwipeCard } from './SwipeCard';
import { ActionBar } from './ActionBar';

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

  // Shared motion value for top card horizontal displacement
  const dragX = useMotionValue(0);

  // Real-time animation transforms for the underneath card!
  // As top card drags left/right, next card smoothly scales up and rises into view
  const nextCardScale = useTransform(dragX, [-200, 0, 200], [1, 0.94, 1]);
  const nextCardY = useTransform(dragX, [-200, 0, 200], [0, 14, 0]);
  const nextCardOpacity = useTransform(dragX, [-200, 0, 200], [1, 0.72, 1]);

  // Sync internal deck with prop
  useEffect(() => {
    setDeck(initialDeck);
  }, [initialDeck]);

  // Prefetch next 3 upcoming photos to eliminate blank flash
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

      // Reset drag value for next card
      dragX.set(0);

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
    [deck, dragX, onMatch, onShowToast]
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
      onShowToast('Database reset with fresh demo profiles!', 'success');
    } catch {
      onShowToast('Failed to reset demo database.', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  // 1. Loading Skeleton State
  if (isLoading && deck.length === 0) {
    return (
      <div className="w-full flex-1 flex flex-col items-center justify-between px-4 py-3 sm:py-4">
        {/* Card skeleton */}
        <div className="relative w-full max-w-sm aspect-[3/4.4] max-h-[560px] rounded-4xl bg-coy-surface border border-white/5 shimmer-box shadow-coy-card flex flex-col justify-end p-6">
          <div className="space-y-3">
            <div className="h-8 w-44 bg-white/10 rounded-xl" />
            <div className="h-4 w-28 bg-white/5 rounded-md" />
            <div className="h-10 w-full bg-white/5 rounded-xl mt-3" />
            <div className="flex gap-2 pt-2">
              <div className="h-6 w-20 bg-white/10 rounded-full" />
              <div className="h-6 w-20 bg-white/10 rounded-full" />
            </div>
          </div>
        </div>

        {/* Action buttons skeleton */}
        <div className="flex items-center justify-center gap-7 py-3">
          <div className="w-16 h-16 rounded-full bg-coy-surface shimmer-box border border-white/5" />
          <div className="w-12 h-12 rounded-full bg-coy-surface shimmer-box border border-white/5" />
          <div className="w-16 h-16 rounded-full bg-coy-surface shimmer-box border border-white/5" />
        </div>
      </div>
    );
  }

  // 2. Error State
  if (error && deck.length === 0) {
    return (
      <div className="w-full flex-1 flex flex-col items-center justify-center p-6 text-center max-w-sm mx-auto">
        <div className="w-16 h-16 rounded-3xl bg-coy-nope/10 border border-coy-nope/20 flex items-center justify-center text-coy-nope mb-4 shadow-lg">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="font-display text-2xl font-bold text-white mb-2">Connection Issue</h3>
        <p className="text-sm text-coy-muted mb-6 leading-relaxed">{error}</p>
        <button
          onClick={onRefreshFeed}
          className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold border border-white/10 transition flex items-center gap-2 active:scale-95"
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
      <div className="w-full flex-1 flex flex-col items-center justify-center p-6 text-center max-w-sm mx-auto">
        {/* Playful Empty State Illustration */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 20 }}
          className="relative w-24 h-24 rounded-4xl bg-gradient-to-tr from-coy-primary/20 via-pink-500/10 to-amber-500/10 border border-white/10 flex items-center justify-center mb-6 shadow-2xl"
        >
          <Compass className="w-12 h-12 text-coy-primary animate-pulse" />
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-coy-like/20 border border-coy-like/40 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-coy-like" />
          </div>
        </motion.div>

        <h3 className="font-display text-3xl font-bold text-white mb-2">
          You&apos;ve cleared the deck!
        </h3>
        <p className="text-sm text-coy-muted mb-8 leading-relaxed">
          No new profiles nearby right now. Your swipes are safe — nobody knows you were here. Reset the demo to explore again!
        </p>

        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={handleReset}
            disabled={isResetting}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-coy-primary to-pink-500 hover:from-coy-primaryHover hover:to-pink-600 disabled:opacity-50 text-white font-semibold text-sm shadow-coy-primary transition flex items-center justify-center gap-2 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-coy-primary"
          >
            <RotateCcw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
            <span>{isResetting ? 'Resetting Demo...' : 'Reset Demo Deck'}</span>
          </button>

          <button
            onClick={onRefreshFeed}
            className="w-full py-3 px-6 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] text-coy-sand font-medium text-sm border border-white/10 transition active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          >
            Check For New People
          </button>
        </div>

        {/* Security badge footer */}
        <div className="mt-8 flex items-center gap-1.5 text-xs text-coy-muted/80">
          <ShieldCheck className="w-4 h-4 text-coy-like" />
          <span>All decisions remain strictly private</span>
        </div>
      </div>
    );
  }

  // 4. Active Card Deck
  return (
    <div className="w-full flex-1 flex flex-col items-center justify-between px-4 py-2 sm:py-3">
      {/* Cards Stage Container */}
      <div className="relative w-full max-w-sm aspect-[3/4.4] max-h-[560px] flex items-center justify-center">
        {/* Next Card Stack Hint (Underneath top card) */}
        {nextCard && (
          <motion.div
            key={nextCard.id}
            style={{
              scale: nextCardScale,
              y: nextCardY,
              opacity: nextCardOpacity,
            }}
            className="absolute inset-0 z-0"
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
              initial={{ scale: 0.96, y: 8, opacity: 0.9 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={
                swipingExit
                  ? {
                      x: swipingExit.direction === 'like' ? 480 : -480,
                      rotate: swipingExit.direction === 'like' ? 24 : -24,
                      opacity: 0,
                      transition: { duration: 0.22, ease: 'easeOut' },
                    }
                  : { opacity: 0, scale: 0.9 }
              }
              transition={{ type: 'spring', stiffness: 320, damping: 25 }}
              className="absolute inset-0 z-10"
            >
              <SwipeCard
                profile={topCard}
                isTop={true}
                dragX={dragX}
                onSwipe={(dir) => handleSwipe(dir, topCard)}
                onOpenDetails={onOpenDetails}
              />
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Desktop Keyboard Helper Hint */}
      <div className="hidden sm:flex items-center justify-center gap-3 text-[11px] text-coy-muted my-1 select-none font-medium">
        <span className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 rounded-md bg-white/10 text-white font-mono text-[10px] border border-white/15">←</kbd>
          Pass
        </span>
        <span className="text-white/20">•</span>
        <span className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 rounded-md bg-white/10 text-white font-mono text-[10px] border border-white/15">→</kbd>
          Like
        </span>
      </div>

      {/* Action Buttons Bar */}
      <ActionBar
        onPass={() => handleSwipe('pass')}
        onLike={() => handleSwipe('like')}
        onInfo={() => topCard && onOpenDetails(topCard)}
        disabled={deck.length === 0}
      />
    </div>
  );
}
