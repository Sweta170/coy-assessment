'use client';

import React from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { MapPin, Info, Heart, X, Sparkles } from 'lucide-react';
import { PublicProfile } from '@/lib/matching/validation';

interface SwipeCardProps {
  profile: PublicProfile;
  isTop: boolean;
  onSwipe: (direction: 'like' | 'pass') => void;
  onOpenDetails: (profile: PublicProfile) => void;
}

export function SwipeCard({
  profile,
  isTop,
  onSwipe,
  onOpenDetails,
}: SwipeCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-18, 18]);

  // Opacities for LIKE and PASS overlay badges
  const likeOpacity = useTransform(x, [20, 100], [0, 1]);
  const passOpacity = useTransform(x, [-20, -100], [0, 1]);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    const velocityThreshold = 400;

    if (info.offset.x > threshold || info.velocity.x > velocityThreshold) {
      onSwipe('like');
    } else if (info.offset.x < -threshold || info.velocity.x < -velocityThreshold) {
      onSwipe('pass');
    }
  };

  if (!isTop) {
    // Background card (stack hint)
    return (
      <div className="absolute inset-0 select-none pointer-events-none rounded-3xl overflow-hidden shadow-xl border border-white/5 bg-[#12161F]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={profile.photo}
          alt={profile.name}
          className="w-full h-full object-cover filter brightness-[0.7] blur-[0.5px]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-white/90">{profile.name}</h3>
            <span className="text-xl text-white/60">{profile.age}</span>
          </div>
          <p className="text-xs text-white/60 flex items-center gap-1 mt-1">
            <MapPin className="w-3.5 h-3.5" />
            {profile.city}
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      style={{ x, rotate }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDragEnd={handleDragEnd}
      whileTap={{ cursor: 'grabbing' }}
      className="absolute inset-0 cursor-grab active:cursor-grabbing select-none rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-[#12161F] touch-none z-10"
    >
      {/* Profile Photo */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={profile.photo}
        alt={profile.name}
        className="w-full h-full object-cover pointer-events-none"
        draggable={false}
      />

      {/* Top Vignette & Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-black/20 to-black/30 pointer-events-none" />

      {/* LIKE Stamp Badge */}
      <motion.div
        style={{ opacity: likeOpacity }}
        className="absolute top-8 left-8 z-30 pointer-events-none px-4 py-2 border-4 border-emerald-400 text-emerald-400 font-black text-2xl tracking-wider rounded-2xl -rotate-12 bg-black/40 backdrop-blur-sm flex items-center gap-2 shadow-lg"
      >
        <Heart className="w-6 h-6 fill-emerald-400" />
        LIKE
      </motion.div>

      {/* PASS Stamp Badge */}
      <motion.div
        style={{ opacity: passOpacity }}
        className="absolute top-8 right-8 z-30 pointer-events-none px-4 py-2 border-4 border-rose-500 text-rose-500 font-black text-2xl tracking-wider rounded-2xl rotate-12 bg-black/40 backdrop-blur-sm flex items-center gap-2 shadow-lg"
      >
        <X className="w-6 h-6 stroke-[3]" />
        PASS
      </motion.div>

      {/* Info Icon Button (top right) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onOpenDetails(profile);
        }}
        className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-black/70 transition shadow-md"
        aria-label="View profile info"
      >
        <Info className="w-5 h-5" />
      </button>

      {/* Profile Details at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 text-white pointer-events-none">
        <div className="flex items-baseline gap-2.5">
          <h2 className="text-3xl font-bold tracking-tight text-white drop-shadow">
            {profile.name}
          </h2>
          <span className="text-2xl font-light text-slate-300 drop-shadow">
            {profile.age}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium mt-1">
          <MapPin className="w-3.5 h-3.5 text-rose-400" />
          <span>{profile.city}</span>
        </div>

        <p className="text-xs sm:text-sm text-slate-200 mt-2.5 line-clamp-2 leading-relaxed drop-shadow-sm font-normal">
          {profile.bio}
        </p>

        {/* Interests Pills */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {profile.interests.slice(0, 3).map((interest) => (
            <span
              key={interest}
              className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-black/40 backdrop-blur-md border border-white/15 text-slate-200"
            >
              {interest}
            </span>
          ))}
          {profile.interests.length > 3 && (
            <span className="px-2 py-1 rounded-full text-[11px] font-medium bg-black/30 border border-white/10 text-slate-400">
              +{profile.interests.length - 3}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
