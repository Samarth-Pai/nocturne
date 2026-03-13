"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface FloatingXPProps {
  startX: number;
  startY: number;
  label: string;
  onComplete: () => void;
}

export function FloatingXP({ startX, startY, label, onComplete }: FloatingXPProps) {
  const [targetPos, setTargetPos] = useState({ x: startX, y: startY - 100 });

  useEffect(() => {
    // Find the progress bar or the XP score element to fly towards
    const targetEl = document.getElementById("quiz-progress-bar") || document.getElementById("xp-score-indicator");
    if (targetEl) {
      const rect = targetEl.getBoundingClientRect();
      setTargetPos({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    }

    const timer = setTimeout(() => {
      onComplete();
    }, 1000); // Animation duration is 1 second

    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ x: startX, y: startY, opacity: 0, scale: 0.5 }}
      animate={{
        x: [startX, startX, targetPos.x],
        y: [startY, startY - 50, targetPos.y],
        opacity: [0, 1, 1, 0],
        scale: [0.5, 1.2, 1, 0.5],
      }}
      transition={{
        duration: 1,
        times: [0, 0.2, 0.8, 1],
        ease: "easeInOut",
      }}
      className="fixed pointer-events-none z-50 font-black text-2xl text-emerald-500 drop-shadow-md whitespace-nowrap"
      style={{ translateX: "-50%", translateY: "-50%" }}
    >
      {label}
    </motion.div>
  );
}
