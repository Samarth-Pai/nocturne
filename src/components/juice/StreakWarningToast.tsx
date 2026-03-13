"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Flame, X } from "lucide-react";
import { useState, useEffect } from "react";

export function StreakWarningToast() {
  const [isVisible, setIsVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState(14400); // 4 hours in seconds

  useEffect(() => {
    // Simulate checking streak status on mount
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isVisible || timeLeft <= 0) return;
    
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isVisible, timeLeft]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed top-24 left-1/2 -translate-x-1/2 z-[40] w-[90%] max-w-md pointer-events-auto"
        >
          <div className="bg-white rounded-2xl shadow-xl border border-orange-200 p-4 flex items-start gap-4 overflow-hidden relative group cursor-pointer hover:shadow-2xl transition-shadow">
             {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent pointer-events-none" />
            
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center shrink-0 border border-orange-200 relative z-10">
              <Flame size={24} className="text-accent-orange" />
            </div>
            
            <div className="flex-1 relative z-10">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1">
                <motion.span
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  Your streak is at risk!
                </motion.span>
                <Flame size={14} className="text-orange-500" />
              </h3>
              <p className="text-slate-500 text-xs mt-1 font-medium">
                Complete a quiz in the next <span className="font-bold text-orange-600 font-mono">{formatTime(timeLeft)}</span> to keep your 14-day streak alive.
              </p>
            </div>

            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsVisible(false);
              }}
              className="p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors relative z-10"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
