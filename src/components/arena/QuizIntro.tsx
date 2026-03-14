"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface QuizIntroProps {
  onComplete: () => void;
}

const MESSAGES = [
  "INITIALIZING KNOWLEDGE MATRIX...",
  "DECRYPTING QUESTION DATA...",
  "PREPARING NEURAL LINK..."
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
    <div className="w-full max-w-2xl mx-auto glass-panel p-12 relative overflow-hidden flex flex-col items-center justify-center min-h-[300px] z-10">
      <AnimatePresence mode="wait">
        {currentIndex < MESSAGES.length && (
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.4 }}
            className="text-center w-full"
          >
            <div className="pacman-container mb-8">
              <div className="pacman"></div>
              <div className="pacman-dot"></div>
              <div className="pacman-dot"></div>
              <div className="pacman-dot"></div>
            </div>
            <h2 className="cyber-text text-lg md:text-2xl tracking-widest text-shadow-md">
              {MESSAGES[currentIndex]}
            </h2>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
