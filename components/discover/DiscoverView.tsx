'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Flame, Heart, Shield, RefreshCw } from 'lucide-react';
import { CardStack } from './CardStack';
import { MatchesList } from './MatchesList';
import { MatchOverlay } from './MatchOverlay';
import { ProfileDetailModal } from './ProfileDetailModal';
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

  // Profile detail modal
  const [selectedProfile, setSelectedProfile] = useState<PublicProfile | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: 'error' | 'success' | 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
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

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Discover Sub-view Navigation Bar */}
      <div className="shrink-0 px-4 pt-2 pb-1 max-w-md w-full mx-auto">
        <div className="flex items-center justify-between p-1 bg-slate-900/90 rounded-2xl border border-white/10 shadow-inner">
          <button
            onClick={() => setSubView('swipe')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
              subView === 'swipe'
                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>Swipe Deck</span>
          </button>

          <button
            onClick={() => setSubView('matches')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
              subView === 'matches'
                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Heart className="w-4 h-4 fill-current" />
            <span>Matches</span>
            {matches.length > 0 && (
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  subView === 'matches'
                    ? 'bg-white text-rose-600'
                    : 'bg-rose-500 text-white'
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
            onOpenDetails={(profile) => setSelectedProfile(profile)}
          />
        ) : (
          <MatchesList
            matches={matches}
            isLoading={isLoadingMatches}
            onSelectMatch={(match) => setSelectedProfile(match)}
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

      {/* Profile Detail Modal */}
      <ProfileDetailModal
        profile={selectedProfile}
        onClose={() => setSelectedProfile(null)}
      />
    </div>
  );
}
