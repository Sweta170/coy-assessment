'use client';

import React, { useState } from 'react';
import { Home, Compass, ShieldCheck } from 'lucide-react';
import { DiscoverView } from '../discover/DiscoverView';

export function AppShell() {
  const [activeTab, setActiveTab] = useState<'home' | 'discover'>('discover');

  return (
    <div className="flex justify-center min-h-screen bg-[#070A0F] text-slate-100">
      {/* Mobile-first viewport container (centered on tablet/desktop) */}
      <div className="w-full max-w-md h-screen flex flex-col bg-[#0B0F17] sm:border-x sm:border-white/10 shadow-2xl overflow-hidden relative">
        {/* Top App Header */}
        <header className="shrink-0 h-14 border-b border-white/10 bg-[#0B0F17]/90 backdrop-blur-md px-4 flex items-center justify-between z-30 select-none">
          {/* Brand Logo */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center shadow-md shadow-rose-500/20">
              <span className="text-white font-black text-sm tracking-tighter">C</span>
            </div>
            <span className="text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300">
              COY
            </span>
          </div>

          {/* Privacy Guarantee Pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/50 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold tracking-wide">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Mutual Only</span>
          </div>
        </header>

        {/* Tab Content */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {activeTab === 'home' ? (
            /* Home tab: Completely blank placeholder per specification */
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none">
              {/* Intentionally completely blank placeholder */}
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-600 mb-3">
                <Home className="w-6 h-6" />
              </div>
              <p className="text-xs text-slate-500 font-medium">Home Feed (Placeholder)</p>
            </div>
          ) : (
            /* Discover tab: All Coy swipe & match functionality lives here */
            <DiscoverView />
          )}
        </main>

        {/* Bottom Tab Bar (Home & Discover) */}
        <nav className="shrink-0 h-16 border-t border-white/10 bg-[#0B0F17]/95 backdrop-blur-lg px-6 flex items-center justify-around z-30 select-none">
          {/* Home Tab */}
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center w-20 py-1 transition-all ${
              activeTab === 'home'
                ? 'text-rose-400'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Home className="w-5 h-5 mb-1" />
            <span className="text-[11px] font-medium">Home</span>
          </button>

          {/* Discover Tab */}
          <button
            onClick={() => setActiveTab('discover')}
            className={`flex flex-col items-center justify-center w-20 py-1 transition-all relative ${
              activeTab === 'discover'
                ? 'text-rose-400'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Compass className="w-5 h-5 mb-1" />
            <span className="text-[11px] font-medium">Discover</span>
            {activeTab === 'discover' && (
              <span className="absolute -bottom-1 w-8 h-1 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full" />
            )}
          </button>
        </nav>
      </div>
    </div>
  );
}
