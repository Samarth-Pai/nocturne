"use client";

import { motion } from "framer-motion";

interface DuelOverlayProps {
  userProgress: number; // 0 to 100
  opponentProgress: number; // 0 to 100
}

export function DuelOverlay({ userProgress, opponentProgress }: DuelOverlayProps) {

  return (
    <div className="w-full max-w-2xl mx-auto bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md shadow-lg flex flex-col gap-4">
      
      {/* User Progress */}
      <div>
        <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2">
          <span className="text-white">You</span>
          <span className="text-indigo-400">{userProgress}%</span>
        </div>
        <div className="w-full h-3 bg-black/50 rounded-full overflow-hidden border border-white/5">
          <motion.div
            className="h-full bg-linear-to-r from-indigo-500 to-purple-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
            initial={{ width: 0 }}
            animate={{ width: `${userProgress}%` }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.8 }}
          />
        </div>
      </div>

      {/* Opponent Progress */}
      <div>
        <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2 text-white/50">
          <span>Opponent</span>
          <span className="text-rose-400">{opponentProgress}%</span>
        </div>
        <div className="w-full h-3 bg-black/50 rounded-full overflow-hidden border border-white/5">
          <motion.div
            className="h-full bg-linear-to-r from-rose-500 to-orange-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]"
            initial={{ width: 0 }}
            animate={{ width: `${opponentProgress}%` }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.8 }}
          />
        </div>
      </div>

    </div>
  );
}
