'use client';

import React from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { X, MapPin, Heart, ShieldCheck, Sparkles, ChevronDown } from 'lucide-react';
import { PublicProfile } from '@/lib/matching/validation';

interface ProfileSheetProps {
  profile: PublicProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onLike?: (profile: PublicProfile) => void;
  onPass?: (profile: PublicProfile) => void;
  showActions?: boolean;
}

export function ProfileSheet({
  profile,
  isOpen,
  onClose,
  onLike,
  onPass,
  showActions = true,
}: ProfileSheetProps) {
  if (!profile || !isOpen) return null;

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // If dragged down > 80px or with downward velocity > 300, close sheet
    if (info.offset.y > 80 || info.velocity.y > 300) {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(10);
      }
      onClose();
    }
  };

  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(15);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Draggable Bottom Sheet */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 260 }}
          drag="y"
          dragConstraints={{ top: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          className="relative w-full max-w-md max-h-[88vh] bg-[#10131A] border-t border-white/10 rounded-t-4xl shadow-2xl flex flex-col z-10 overflow-hidden touch-none"
        >
          {/* Grab Handle */}
          <div className="pt-3 pb-2 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing">
            <div className="w-12 h-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors" />
          </div>

          {/* Close Pill Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition active:scale-95"
            aria-label="Close sheet"
          >
            <ChevronDown className="w-5 h-5" />
          </button>

          {/* Scrollable Sheet Content */}
          <div className="overflow-y-auto overscroll-contain flex-1 px-5 pb-8 space-y-6">
            {/* Header Hero Photo */}
            <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden bg-slate-900 border border-white/5 mt-1 shadow-inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={profile.photo}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#10131A] via-transparent to-transparent" />
            </div>

            {/* Profile Identity */}
            <div className="pt-1">
              <div className="flex items-baseline gap-2.5">
                <h2 className="font-display text-3xl font-bold tracking-tight text-white">
                  {profile.name}
                </h2>
                <span className="font-display text-2xl font-light text-coy-sand">
                  {profile.age}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-sm text-coy-sand/80 mt-1.5 font-medium">
                <MapPin className="w-4 h-4 text-coy-primary" />
                <span>{profile.city}</span>
              </div>
            </div>

            {/* Privacy Protection Callout */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-slate-900/60 border border-emerald-500/25 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-coy-like shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-emerald-300">
                  Protected by Coy Zero-Knowledge
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  Your likes and passes are completely confidential. Neither of you will ever know unless you both like each other.
                </p>
              </div>
            </div>

            {/* About Section */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-coy-muted font-sans">
                About
              </h3>
              <p className="text-sm text-slate-200 leading-relaxed bg-white/[0.03] p-4 rounded-2xl border border-white/5">
                {profile.bio}
              </p>
            </div>

            {/* Interests Section */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-coy-muted font-sans">
                  Passions & Interests
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest) => (
                  <span
                    key={interest}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-slate-200 transition"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>

            {/* Sheet Action Bar */}
            {showActions && (
              <div className="pt-4 flex items-center justify-center gap-8 border-t border-white/5">
                <button
                  onClick={() => {
                    triggerHaptic();
                    onClose();
                    onPass?.(profile);
                  }}
                  className="w-16 h-16 rounded-full bg-slate-900 border border-white/10 hover:border-coy-nope/50 flex items-center justify-center text-coy-nope hover:bg-coy-nope/10 shadow-lg transition active:scale-90"
                  aria-label="Pass"
                >
                  <X className="w-8 h-8 stroke-[2.5]" />
                </button>

                <button
                  onClick={() => {
                    triggerHaptic();
                    onClose();
                    onLike?.(profile);
                  }}
                  className="w-16 h-16 rounded-full bg-gradient-to-tr from-coy-primary to-pink-500 text-white shadow-coy-primary flex items-center justify-center hover:scale-105 transition active:scale-90"
                  aria-label="Like"
                >
                  <Heart className="w-8 h-8 fill-current" />
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
