'use client';

import React from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { MapPin, Heart, X, ChevronUp } from 'lucide-react';
import { PublicProfile } from '@/lib/matching/validation';

interface SwipeCardProps {
  profile: PublicProfile;
  isTop: boolean;
  onSwipe: (direction: 'like' | 'pass') => void;
  onOpenDetails: (profile: PublicProfile) => void;
  dragX?: ReturnType<typeof useMotionValue<number>>;
}

export function SwipeCard({
  profile,
  isTop,
  onSwipe,
  onOpenDetails,
  dragX,
}: SwipeCardProps) {
  // Motion values for top card physics
  const fallbackX = useMotionValue(0);
  const activeX = dragX || fallbackX;

  // Rotation: tilts up to 15 degrees in proportion to drag
  const rotate = useTransform(activeX, [-260, 260], [-15, 15]);

  // Live feedback stamps: fade in linearly from 15px to 85px displacement
  const likeOpacity = useTransform(activeX, [15, 85], [0, 1]);
  const nopeOpacity = useTransform(activeX, [-15, -85], [0, 1]);

  // Dynamic ambient background glow tint tied to drag direction & distance
  const ambientGlow = useTransform(
    activeX,
    [-180, 0, 180],
    [
      'radial-gradient(circle at 100% 50%, rgba(244, 63, 94, 0.28) 0%, transparent 70%)',
      'radial-gradient(circle, transparent 0%, transparent 100%)',
      'radial-gradient(circle at 0% 50%, rgba(16, 185, 129, 0.28) 0%, transparent 70%)',
    ]
  );

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 110;
    const velocityThreshold = 450;

    if (info.offset.x > threshold || info.velocity.x > velocityThreshold) {
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(15);
      onSwipe('like');
    } else if (info.offset.x < -threshold || info.velocity.x < -velocityThreshold) {
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10);
      onSwipe('pass');
    }
  };

  if (!isTop) {
    // Underneath card (Stack hint)
    return (
      <div className="absolute inset-0 select-none pointer-events-none rounded-4xl overflow-hidden shadow-coy-card bg-[#11141D] border border-white/5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={profile.photo}
          alt={profile.name}
          className="w-full h-full object-cover filter brightness-[0.7] blur-[0.2px]"
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex items-baseline gap-2">
            <h3 className="font-display text-2xl font-bold text-white/90">{profile.name}</h3>
            <span className="font-display text-xl text-coy-sand/60">{profile.age}</span>
          </div>
          <p className="text-xs text-coy-sand/60 flex items-center gap-1.5 mt-1 font-medium">
            <MapPin className="w-3.5 h-3.5" />
            {profile.city}
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      style={{ x: activeX, rotate }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.85}
      onDragEnd={handleDragEnd}
      whileTap={{ cursor: 'grabbing' }}
      onClick={() => onOpenDetails(profile)}
      className="absolute inset-0 cursor-grab active:cursor-grabbing select-none rounded-4xl overflow-hidden shadow-coy-card bg-[#11141D] border border-white/10 touch-none z-10 group"
    >
      {/* Profile Photo */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={profile.photo}
        alt={profile.name}
        className="w-full h-full object-cover pointer-events-none"
        draggable={false}
      />

      {/* Dynamic Ambient Color Scrim (Tied to live drag distance) */}
      <motion.div
        style={{ background: ambientGlow }}
        className="absolute inset-0 pointer-events-none z-10 transition-colors"
      />

      {/* Multi-stop Bottom Scrim Gradient for WCAG AA Text Contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 via-black/15 to-transparent pointer-events-none" />

      {/* LIKE Stamp Badge */}
      <motion.div
        style={{ opacity: likeOpacity }}
        className="absolute top-8 left-7 z-30 pointer-events-none px-4 py-2 border-[3px] border-coy-like text-coy-like font-black font-sans text-xl tracking-wider rounded-2xl -rotate-12 bg-black/50 backdrop-blur-md flex items-center gap-2 shadow-coy-like"
      >
        <Heart className="w-5 h-5 fill-coy-like" />
        LIKE
      </motion.div>

      {/* NOPE Stamp Badge */}
      <motion.div
        style={{ opacity: nopeOpacity }}
        className="absolute top-8 right-7 z-30 pointer-events-none px-4 py-2 border-[3px] border-coy-nope text-coy-nope font-black font-sans text-xl tracking-wider rounded-2xl rotate-12 bg-black/50 backdrop-blur-md flex items-center gap-2 shadow-coy-nope"
      >
        <X className="w-5 h-5 stroke-[3]" />
        NOPE
      </motion.div>

      {/* Expand Sheet Pill Hint (Top Right) */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetails(profile);
          }}
          className="px-3 py-1.5 rounded-full bg-black/50 hover:bg-black/75 backdrop-blur-md border border-white/15 text-white/80 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all shadow-md group-hover:border-white/30"
          aria-label="Expand profile"
        >
          <span>Bio</span>
          <ChevronUp className="w-3.5 h-3.5 transition-transform group-hover:-translate-y-0.5" />
        </button>
      </div>

      {/* Profile Details at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 text-white pointer-events-none z-20">
        <div className="flex items-baseline gap-2.5">
          <h2 className="font-display text-3xl font-bold tracking-tight text-white drop-shadow-md">
            {profile.name}
          </h2>
          <span className="font-display text-2xl font-light text-coy-sand drop-shadow-sm">
            {profile.age}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-coy-sand/90 font-medium mt-1">
          <MapPin className="w-3.5 h-3.5 text-coy-primary shrink-0" />
          <span>{profile.city}</span>
        </div>

        <p className="text-xs sm:text-sm text-slate-200 mt-2.5 line-clamp-2 leading-relaxed font-normal text-slate-200/90">
          {profile.bio}
        </p>

        {/* Interests Pills */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {profile.interests.slice(0, 3).map((interest) => (
            <span
              key={interest}
              className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/[0.08] backdrop-blur-md border border-white/10 text-slate-200 shadow-sm"
            >
              {interest}
            </span>
          ))}
          {profile.interests.length > 3 && (
            <span className="px-2 py-1 rounded-full text-[11px] font-medium bg-black/40 border border-white/10 text-coy-sand/70">
              +{profile.interests.length - 3}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
