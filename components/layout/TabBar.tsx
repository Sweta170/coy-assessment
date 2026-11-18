'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Home, Compass } from 'lucide-react';

interface TabBarProps {
  activeTab: 'home' | 'discover';
  onTabChange: (tab: 'home' | 'discover') => void;
  matchesCount?: number;
}

export function TabBar({
  activeTab,
  onTabChange,
  matchesCount = 0,
}: TabBarProps) {
  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(8);
    }
  };

  return (
    <nav className="shrink-0 h-16 sm:h-20 border-t border-white/[0.08] bg-[#0A0C12]/90 backdrop-blur-2xl px-6 flex items-center justify-around z-30 select-none pb-safe">
      {/* Home Tab */}
      <button
        type="button"
        onClick={() => {
          triggerHaptic();
          onTabChange('home');
        }}
        className={`relative flex flex-col items-center justify-center w-24 h-12 rounded-2xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-coy-primary ${
          activeTab === 'home'
            ? 'text-white'
            : 'text-coy-muted hover:text-slate-200'
        }`}
        aria-label="Home Feed"
      >
        {activeTab === 'home' && (
          <motion.div
            layoutId="activeTabPill"
            transition={{ type: 'spring', damping: 24, stiffness: 320 }}
            className="absolute inset-0 bg-white/[0.07] rounded-2xl border border-white/10"
          />
        )}
        <Home className={`w-5 h-5 mb-0.5 z-10 transition-transform ${activeTab === 'home' ? 'scale-110 text-coy-primary' : ''}`} />
        <span className="text-[11px] font-semibold tracking-wide z-10">Home</span>
      </button>

      {/* Discover Tab */}
      <button
        type="button"
        onClick={() => {
          triggerHaptic();
          onTabChange('discover');
        }}
        className={`relative flex flex-col items-center justify-center w-24 h-12 rounded-2xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-coy-primary ${
          activeTab === 'discover'
            ? 'text-white'
            : 'text-coy-muted hover:text-slate-200'
        }`}
        aria-label="Discover Profiles"
      >
        {activeTab === 'discover' && (
          <motion.div
            layoutId="activeTabPill"
            transition={{ type: 'spring', damping: 24, stiffness: 320 }}
            className="absolute inset-0 bg-white/[0.07] rounded-2xl border border-white/10"
          />
        )}
        <div className="relative z-10">
          <Compass className={`w-5 h-5 mb-0.5 transition-transform ${activeTab === 'discover' ? 'scale-110 text-coy-primary' : ''}`} />
          {matchesCount > 0 && activeTab !== 'discover' && (
            <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-coy-primary ring-2 ring-[#0A0C12]" />
          )}
        </div>
        <span className="text-[11px] font-semibold tracking-wide z-10">Discover</span>
      </button>
    </nav>
  );
}
