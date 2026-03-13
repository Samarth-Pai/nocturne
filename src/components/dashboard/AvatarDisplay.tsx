"use client";

import { motion } from "framer-motion";
import { Sparkles, Zap, Flame } from "lucide-react";

interface AvatarLevelData {
  level: number;
  xp: number;
  maxXp: number;
  streak: number;
}

export function AvatarDisplay({ data }: { data: AvatarLevelData }) {
  const { level, xp, maxXp, streak } = data;
  const progressPercent = Math.min((xp / maxXp) * 100, 100);

  // Simulated unlocks based on level
  const hasOutfit = level >= 3;
  const hasAccessory = level >= 5;
  const hasGlow = level >= 8;

  return (
    <div className="w-full flex flex-col items-center justify-center p-8 relative">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="relative group cursor-pointer"
      >
        {/* Animated Aura for High Level */}
        {hasGlow && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-8 bg-gradient-to-r from-primary-teal/20 via-primary-sky/20 to-accent-purple/20 rounded-full blur-xl z-0"
          />
        )}

        {/* The Avatar Frame */}
        <div className="relative z-10 w-48 h-48 rounded-full bg-white border-4 border-primary-sky/20 shadow-xl flex items-center justify-center overflow-hidden">
          {/* Pixel Art Avatar */}
          <div className="relative w-full h-full p-2">
            <img 
              src="/avatar.png" 
              alt="Avatar" 
              className="w-full h-full object-contain"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>
        </div>

        {/* Level Badge Overlay */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 border-4 border-white bg-primary-teal text-white font-bold px-6 py-2 rounded-full shadow-lg flex items-center gap-2">
          <Sparkles size={16} />
          Level {level}
        </div>
        
        {/* Streak Indicator Overlay */}
        <div className="absolute -top-4 -right-4 border-4 border-white bg-accent-orange text-white font-bold w-14 h-14 rounded-full shadow-lg flex flex-col items-center justify-center">
          <Flame size={18} />
          <span className="text-xs leading-none">{streak}</span>
        </div>
      </motion.div>

      {/* XP Bar */}
      <div className="w-full max-w-sm mt-12 bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
        <div className="flex justify-between items-end mb-2">
          <span className="text-sm font-bold text-slate-500 uppercase tracking-wide">Experience</span>
          <span className="text-sm font-bold text-primary-sky">{xp} / {maxXp} XP</span>
        </div>
        <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-primary-sky to-primary-teal rounded-full relative"
          >
            <div className="absolute top-0 right-0 w-8 h-full bg-white/30 blur" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
