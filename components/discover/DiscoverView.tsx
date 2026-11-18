'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Flame, Heart } from 'lucide-react';
import { CardStack } from './CardStack';
import { MatchesGrid } from './MatchesGrid';
import { MatchOverlay } from './MatchOverlay';
import { ProfileSheet } from './ProfileSheet';
import { ToastContainer, ToastMessage } from '../ui/Toast';
import { MatchItem, PublicProfile } from '@/lib/matching/validation';

export function DiscoverView() {
  const [subView, setSubView] = useState<'swipe' | 'matches'>('swipe');
  const [feed, setDeck] = useState<PublicProfile[]>([]);
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);
  const [isLoadingMatches, setIsLoadingMatches] = useState(true);
  const [feedError, setFeedError] = useState<string | null>(null);

  // Active celebration modal
  const [matchedProfile, setMatchedProfile] = useState<PublicProfile | null>(null);

  // Active profile sheet
  const [selectedProfile, setSelectedProfile] = useState<PublicProfile | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: 'error' | 'success' | 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch feed
  const fetchFeed = useCallback(async () => {
    try {
      setIsLoadingFeed(true);
      setFeedError(null);
      const res = await fetch('/api/feed');
      if (!res.ok) throw new Error('Failed to load profiles');
      const data: PublicProfile[] = await res.json();
      setDeck(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error fetching feed';
      setFeedError(msg);
      addToast(msg, 'error');
    } finally {
      setIsLoadingFeed(false);
    }
  }, [addToast]);

  // Fetch matches
  const fetchMatches = useCallback(async () => {
    try {
      setIsLoadingMatches(true);
      const res = await fetch('/api/matches');
      if (!res.ok) throw new Error('Failed to load matches');
      const data: MatchItem[] = await res.json();
      setMatches(data);
    } catch (err) {
      console.error('Error fetching matches:', err);
    } finally {
      setIsLoadingMatches(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchFeed();
    fetchMatches();
  }, [fetchFeed, fetchMatches]);

  // Handle a new match event
  const handleMatch = useCallback((profile: PublicProfile) => {
    setMatchedProfile(profile);
    // Refresh matches list in background
    fetchMatches();
  }, [fetchMatches]);

  // Reset database handler
  const handleResetDb = async () => {
    const res = await fetch('/api/reset', { method: 'POST' });
    if (!res.ok) throw new Error('Reset failed');
    await fetchFeed();
    await fetchMatches();
  };

  const handleOpenSheet = (profile: PublicProfile) => {
    setSelectedProfile(profile);
    setIsSheetOpen(true);
  };

  const handleCloseSheet = () => {
    setIsSheetOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative">
      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Discover Sub-view Segmented Switcher */}
      <div className="shrink-0 px-4 pt-2 pb-1 max-w-sm w-full mx-auto z-20">
        <div className="relative flex items-center justify-between p-1 bg-[#12151E] rounded-2xl border border-white/[0.08] shadow-inner">
          {/* Swipe Tab Button */}
          <button
            type="button"
            onClick={() => setSubView('swipe')}
            className={`relative flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors duration-150 z-10 ${
              subView === 'swipe' ? 'text-white' : 'text-coy-muted hover:text-slate-200'
            }`}
          >
            {subView === 'swipe' && (
              <motion.div
                layoutId="subViewPill"
                transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                className="absolute inset-0 bg-gradient-to-r from-coy-primary to-pink-500 rounded-xl shadow-coy-primary"
              />
            )}
            <Flame className="w-4 h-4 z-10" />
            <span className="z-10">Discover</span>
          </button>

          {/* Matches Tab Button */}
          <button
            type="button"
            onClick={() => setSubView('matches')}
            className={`relative flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors duration-150 z-10 ${
              subView === 'matches' ? 'text-white' : 'text-coy-muted hover:text-slate-200'
            }`}
          >
            {subView === 'matches' && (
              <motion.div
                layoutId="subViewPill"
                transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                className="absolute inset-0 bg-gradient-to-r from-coy-primary to-pink-500 rounded-xl shadow-coy-primary"
              />
            )}
            <Heart className="w-4 h-4 fill-current z-10" />
            <span className="z-10">Matches</span>
            {matches.length > 0 && (
              <span
                className={`z-10 px-1.5 py-0.2 rounded-full text-[10px] font-black transition-colors ${
                  subView === 'matches'
                    ? 'bg-white text-coy-primary'
                    : 'bg-coy-primary text-white'
                }`}
              >
                {matches.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Sub-view Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {subView === 'swipe' ? (
          <CardStack
            initialDeck={feed}
            isLoading={isLoadingFeed}
            error={feedError}
            onMatch={handleMatch}
            onRefreshFeed={fetchFeed}
            onResetDb={handleResetDb}
            onShowToast={addToast}
            onOpenDetails={handleOpenSheet}
          />
        ) : (
          <MatchesGrid
            matches={matches}
            isLoading={isLoadingMatches}
            onSelectMatch={handleOpenSheet}
            onSwitchToSwipe={() => setSubView('swipe')}
          />
        )}
      </div>

      {/* "It's a Match!" Full Screen Overlay */}
      <MatchOverlay
        matchedProfile={matchedProfile}
        onKeepSwiping={() => setMatchedProfile(null)}
        onViewMatches={() => {
          setMatchedProfile(null);
          setSubView('matches');
        }}
      />

      {/* Bottom Profile Sheet */}
      <ProfileSheet
        profile={selectedProfile}
        isOpen={isSheetOpen}
        onClose={handleCloseSheet}
        showActions={subView === 'swipe'}
      />
    </div>
  );
}
