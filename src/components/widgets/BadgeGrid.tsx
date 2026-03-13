"use client";

import { motion } from "framer-motion";
import { Flame, Star, Trophy, Zap, BookOpen, Target, Crown, Rocket } from "lucide-react";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  unlocked: boolean;
}

const BADGES: Badge[] = [
  {
    id: "streak",
    name: "Streak Master",
    description: "Maintain a 7-day streak",
    icon: <Flame size={24} />,
    color: "from-orange-400 to-red-500",
    unlocked: true,
  },
  {
    id: "velocity",
    name: "Velocity Ace",
    description: "Complete a quiz in under 30s",
    icon: <Zap size={24} />,
    color: "from-blue-400 to-indigo-500",
    unlocked: true,
  },
  {
    id: "top_scorer",
    name: "Top Scorer",
    description: "Get 100% on 5 quizzes",
    icon: <Trophy size={24} />,
    color: "from-yellow-400 to-orange-500",
    unlocked: true,
  },
  {
    id: "knowledge",
    name: "Knowledge Seeker",
    description: "Complete 10 different modules",
    icon: <BookOpen size={24} />,
    color: "from-primary-teal to-emerald-500",
    unlocked: false,
  },
  {
    id: "consistency",
    name: "Consistency Pro",
    description: "Study for 14 days straight",
    icon: <Rocket size={24} />,
    color: "from-purple-400 to-pink-500",
    unlocked: false,
  },
  {
    id: "elite",
    name: "Learning Elite",
    description: "Reach level 20",
    icon: <Crown size={24} />,
    color: "from-amber-400 to-yellow-600",
    unlocked: false,
  },
];

export function BadgeGrid() {
  return (
    <div className="w-full">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {BADGES.map((badge) => (
          <motion.div
            key={badge.id}
            whileHover={{ scale: 1.05 }}
            className={`relative p-4 rounded-2xl border flex flex-col items-center text-center transition-all ${
              badge.unlocked 
                ? "bg-white border-slate-100 shadow-sm" 
                : "bg-slate-50 border-slate-100 opacity-60 grayscale"
            }`}
          >
            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${badge.color} flex items-center justify-center text-white mb-3 shadow-lg`}>
              {badge.icon}
            </div>
            <h3 className="font-bold text-slate-800 text-sm">{badge.name}</h3>
            <p className="text-[10px] text-slate-500 mt-1 leading-tight">{badge.description}</p>
            
            {!badge.unlocked && (
              <div className="absolute top-2 right-2">
                <div className="w-2 h-2 rounded-full bg-slate-300" />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
