"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { Sparkles, Trophy } from "lucide-react";
import { playLevelUpSound } from "@/lib/audio";

interface LevelUpModalProps {
  isOpen: boolean;
  newLevel: number;
  onClose: () => void;
}

export function LevelUpModal({ isOpen, newLevel, onClose }: LevelUpModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      playLevelUpSound();
      
      // Fire confetti
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
      }, 250);

      // Auto close after 5 seconds
      const timeout = setTimeout(() => {
        onClose();
      }, 5000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    } else {
      setTimeout(() => setMounted(false), 500); // Allow exit animation to run
    }
  }, [isOpen, onClose]);

  if (!mounted && !isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm pointer-events-auto"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ scale: 0.8, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="relative z-10 bg-white rounded-3xl p-8 md:p-12 shadow-2xl border-4 border-yellow-400 max-w-lg w-full text-center pointer-events-auto flex flex-col items-center"
          >
            {/* Spinning background effect */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute -top-32 -z-10 w-64 h-64 bg-yellow-400/20 rounded-full blur-3xl"
            />

            <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg mb-6 border-4 border-white">
              <Trophy size={48} className="text-white" />
            </div>

            <h2 className="font-heading font-black text-5xl text-slate-800 mb-2 tracking-tight">
              LEVEL UP!
            </h2>
            
            <div className="flex items-center justify-center gap-3 text-2xl font-bold text-primary-sky mb-6">
              <Sparkles className="text-yellow-500" />
              You are now Level {newLevel}
              <Sparkles className="text-yellow-500" />
            </div>

            <div className="w-full bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8">
              <p className="font-bold text-slate-700 mb-3">NEW REWARD UNLOCKED</p>
              <div className="flex items-center justify-center gap-4">
                <div className="w-16 h-16 bg-slate-200 rounded-xl flex items-center justify-center shadow-inner border border-slate-300">
                   <div className="w-10 h-6 bg-primary-coral rounded-t-lg" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-800">Crimson Jacket</p>
                  <p className="text-sm text-slate-500">Avatar Customization</p>
                </div>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="w-full py-4 rounded-xl font-bold text-white text-lg bg-gradient-to-r from-primary-sky to-primary-teal shadow-md hover:shadow-lg transition-transform hover:-translate-y-1 active:translate-y-0"
            >
              Continue Your Journey
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
