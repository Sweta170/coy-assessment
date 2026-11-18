'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Sparkles, Heart, ShieldCheck } from 'lucide-react';
import { PublicProfile } from '@/lib/matching/validation';

interface ProfileDetailModalProps {
  profile: PublicProfile | null;
  onClose: () => void;
  onLike?: (profile: PublicProfile) => void;
  onPass?: (profile: PublicProfile) => void;
  showActions?: boolean;
}

export function ProfileDetailModal({
  profile,
  onClose,
  onLike,
  onPass,
  showActions = false,
}: ProfileDetailModalProps) {
  if (!profile) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-md max-h-[90vh] bg-[#12161F] border border-white/10 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/80 hover:text-white transition"
            aria-label="Close profile details"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Scrollable content */}
          <div className="overflow-y-auto overflow-x-hidden flex-1 pb-6">
            {/* Main Photo */}
            <div className="relative w-full h-80 sm:h-96 bg-slate-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={profile.photo}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#12161F] via-transparent to-black/30" />
              <div className="absolute bottom-4 left-5 right-5">
                <div className="flex items-baseline gap-2">
                  <h2 className="text-2xl font-bold text-white">{profile.name}</h2>
                  <span className="text-xl text-white/70 font-normal">{profile.age}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-slate-300 text-sm">
                  <MapPin className="w-4 h-4 text-rose-400" />
                  <span>{profile.city}</span>
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="px-5 pt-4 space-y-5">
              {/* Privacy badge */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs font-medium">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Protected by Coy: Swipes remain strictly mutual-reveal only</span>
              </div>

              {/* Bio */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">About</h3>
                <p className="text-sm leading-relaxed text-slate-200 bg-white/5 p-3.5 rounded-2xl border border-white/5">
                  {profile.bio}
                </p>
              </div>

              {/* Interests */}
              <div>
                <div className="flex items-center gap-1.5 mb-2.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Interests</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest) => (
                    <span
                      key={interest}
                      className="px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-rose-500/10 to-purple-500/10 border border-rose-500/20 text-rose-200"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions (if shown) */}
          {showActions && (
            <div className="px-5 py-4 border-t border-white/5 bg-[#0e121a] flex items-center justify-center gap-6">
              <button
                onClick={() => {
                  onClose();
                  onPass?.(profile);
                }}
                className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 hover:bg-rose-500 hover:text-white transition transform active:scale-95 shadow-lg"
                title="Pass"
              >
                <X className="w-7 h-7" />
              </button>
              <button
                onClick={() => {
                  onClose();
                  onLike?.(profile);
                }}
                className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 hover:bg-emerald-500 hover:text-white transition transform active:scale-95 shadow-lg"
                title="Like"
              >
                <Heart className="w-7 h-7 fill-current" />
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
