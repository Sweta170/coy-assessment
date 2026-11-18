'use client';

import React, { useState } from 'react';
import { ShieldCheck, Sparkles } from 'lucide-react';
import { DiscoverView } from '../discover/DiscoverView';
import { TabBar } from './TabBar';

export function AppShell() {
  const [activeTab, setActiveTab] = useState<'home' | 'discover'>('discover');

  return (
    <div className="relative flex justify-center min-h-screen bg-[#06070A] text-slate-100 overflow-x-hidden selection:bg-coy-primary selection:text-white">
      {/* Desktop Ambient Background Accents (Visible only on larger screens) */}
      <div className="fixed inset-0 pointer-events-none hidden md:block overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-[420px] w-96 h-96 rounded-full bg-coy-primary/10 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/2 translate-x-[420px] w-96 h-96 rounded-full bg-purple-600/10 blur-[130px]" />
      </div>

      {/* Mobile-first viewport container */}
      <div className="relative w-full max-w-[420px] h-[100dvh] flex flex-col bg-[#0A0C12] sm:border-x sm:border-white/[0.08] sm:shadow-2xl overflow-hidden z-10">
        {/* Top App Header */}
        <header className="shrink-0 h-14 border-b border-white/[0.08] bg-[#0A0C12]/90 backdrop-blur-xl px-4 flex items-center justify-between z-30 select-none">
          {/* Brand Wordmark with Editorial Font */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-coy-primary to-pink-500 flex items-center justify-center shadow-coy-primary">
              <span className="text-white font-display font-black text-sm tracking-tighter">C</span>
            </div>
            <span className="font-display text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-coy-sand">
              Coy
            </span>
          </div>

          {/* Privacy Guarantee Pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/25 text-emerald-400 text-[11px] font-semibold tracking-wide">
            <ShieldCheck className="w-3.5 h-3.5 text-coy-like shrink-0" />
            <span>Mutual Only</span>
          </div>
        </header>

        {/* Tab Content */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {activeTab === 'home' ? (
            /* Home tab: Completely blank placeholder per specification */
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-slate-700 mb-2">
                <Sparkles className="w-5 h-5 text-slate-600" />
              </div>
              <p className="text-xs text-slate-600 font-medium">Home Feed (Blank)</p>
            </div>
          ) : (
            /* Discover tab: All Coy swipe & match functionality lives here */
            <DiscoverView />
          )}
        </main>

        {/* Bottom Tab Bar with Animated Indicator */}
        <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  );
}
