import { motion } from "framer-motion";
import { useState } from "react";
import { Sparkles, Zap, Flame, Camera } from "lucide-react";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { AvatarPickerModal } from "./AvatarPickerModal";

interface AvatarLevelData {
  level: number;
  xp: number;
  maxXp: number;
  streak: number;
}

export function AvatarDisplay({ data }: { data: AvatarLevelData }) {
  const { level, xp, maxXp, streak } = data;
  const progressPercent = Math.min((xp / maxXp) * 100, 100);
  const { avatarId, avatarUrl, changeAvatar } = useUserPreferences();
  const [isPickerOpen, setIsPickerOpen] = useState(false);

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
        <div 
          onClick={() => setIsPickerOpen(true)}
          className="relative z-10 w-48 h-48 rounded-full bg-slate-900 border-4 border-accent-purple/40 shadow-[0_0_25px_rgba(139,92,246,0.3)] flex items-center justify-center overflow-hidden hover:border-accent-purple transition-all group/circle"
        >
          {/* Pixel Art Avatar */}
          <div className="relative w-full h-full p-2">
            <img 
              src={avatarUrl} 
              alt="Avatar" 
              className="w-full h-full object-contain"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>
          
          {/* Change Avatar Overlay on Hover */}
          <div className="absolute inset-0 bg-slate-900/70 flex flex-col items-center justify-center opacity-0 group-hover/circle:opacity-100 transition-opacity">
            <Camera className="text-primary-sky mb-2 drop-shadow-[0_0_5px_rgba(56,189,248,0.8)]" size={24} />
            <span className="text-primary-sky text-xs font-bold uppercase tracking-wider">Change Avatar</span>
          </div>
        </div>

        {/* Level Badge Overlay */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 border-2 border-primary-teal/60 bg-slate-900 text-primary-teal font-bold px-6 py-2 rounded-full shadow-[0_0_10px_rgba(45,212,191,0.4)] flex items-center gap-2">
          <Sparkles size={16} />
          Level {level}
        </div>
        
        {/* Streak Indicator Overlay */}
        <div className="absolute -top-4 -right-4 border-2 border-accent-orange/60 bg-slate-900 text-accent-orange font-bold w-14 h-14 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.4)] flex flex-col items-center justify-center">
          <Flame size={18} />
          <span className="text-xs leading-none">{streak}</span>
        </div>
      </motion.div>

      {/* XP Bar */}
      <div className="w-full max-w-sm mt-12 bg-slate-800/60 rounded-2xl p-4 border border-purple-500/20 shadow-[0_0_15px_rgba(139,92,246,0.1)]">
        <div className="flex justify-between items-end mb-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Experience</span>
          <span className="text-sm font-bold text-primary-sky drop-shadow-[0_0_5px_rgba(56,189,248,0.5)]">{xp} / {maxXp} XP</span>
        </div>
        <div className="h-3 w-full bg-slate-700/80 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-accent-purple to-primary-sky rounded-full relative shadow-[0_0_8px_rgba(56,189,248,0.5)]"
          >
            <div className="absolute top-0 right-0 w-8 h-full bg-white/20 blur" />
          </motion.div>
        </div>
      </div>

      <AvatarPickerModal 
        isOpen={isPickerOpen} 
        onClose={() => setIsPickerOpen(false)} 
        currentAvatarId={avatarId}
        onSelect={changeAvatar}
      />
    </div>
  );
}
