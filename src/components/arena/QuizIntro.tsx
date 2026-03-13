"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface QuizIntroProps {
  onComplete: () => void;
}

const MESSAGES = [
  "Initializing knowledge system...",
  "Loading question matrix...",
  "Preparing challenge..."
];

export function QuizIntro({ onComplete }: QuizIntroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex >= MESSAGES.length) {
      // Delay slightly after the last message before completing
      const timer = setTimeout(onComplete, 500);
      return () => clearTimeout(timer);
    }

    // Show each message for 1.8 seconds
    const timer = setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 1800);

    return () => clearTimeout(timer);
  }, [currentIndex, onComplete]);

  return (
    <div className="w-full max-w-2xl mx-auto rounded-3xl border border-slate-200 bg-white p-12 shadow-sm relative overflow-hidden flex items-center justify-center min-h-[300px]">
      <AnimatePresence mode="wait">
        {currentIndex < MESSAGES.length && (
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-primary-sky animate-spin mx-auto mb-6" />
            <h2 className="text-xl md:text-2xl font-heading font-black text-slate-700 tracking-tight">
              {MESSAGES[currentIndex]}
            </h2>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
