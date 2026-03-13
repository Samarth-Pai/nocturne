"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface XPParticleBurstProps {
  x: number;
  y: number;
  onComplete: () => void;
}

export function XPParticleBurst({ x, y, onComplete }: XPParticleBurstProps) {
  const [particles, setParticles] = useState<{ id: number; dx: number; dy: number }[]>([]);

  useEffect(() => {
    // Generate 15 particles
    const newParticles = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      // Random spread
      dx: (Math.random() - 0.5) * 150,
      // Mostly upwards motion
      dy: -Math.random() * 200 - 50,
    }));
    setParticles(newParticles);

    // Cleanup and trigger onComplete after animation finishes
    const timer = setTimeout(() => {
      onComplete();
    }, 1000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className="fixed pointer-events-none z-50"
      // Position the origin of the burst at the click coordinates
      style={{ left: x, top: y }}
    >
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          animate={{
            opacity: 0,
            x: p.dx,
            y: p.dy,
            scale: Math.random() * 0.5 + 0.5,
          }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute w-3 h-3 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.8)]"
        />
      ))}
    </div>
  );
}
