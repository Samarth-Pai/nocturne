"use client";

import { motion } from "framer-motion";
import { Play } from "lucide-react";
import Link from "next/link";

interface SubjectCardProps {
  title: string;
  progress: number;
  xpValue: number;
  colorScheme: "sky" | "teal" | "coral" | "purple";
}

const colorMap = {
  sky: "from-primary-sky/10 to-primary-sky/5 border-primary-sky/20 hover:border-primary-sky text-primary-sky",
  teal: "from-primary-teal/10 to-primary-teal/5 border-primary-teal/20 hover:border-primary-teal text-primary-teal",
  coral: "from-primary-coral/10 to-primary-coral/5 border-primary-coral/20 hover:border-coral text-primary-coral",
  purple: "from-accent-purple/10 to-accent-purple/5 border-accent-purple/20 hover:border-accent-purple text-accent-purple",
};

const bgMap = {
  sky: "bg-primary-sky",
  teal: "bg-primary-teal",
  coral: "bg-primary-coral",
  purple: "bg-accent-purple",
};

export function SubjectCard({ title, progress, xpValue, colorScheme }: SubjectCardProps) {
  const styles = colorMap[colorScheme];
  const barColor = bgMap[colorScheme];

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      className={`relative w-full rounded-3xl border-2 bg-gradient-to-br ${styles} p-6 shadow-sm transition-colors duration-300 group flex flex-col justify-between min-h-[180px]`}
    >
      <div className="flex justify-between items-start mb-6">
        <h3 className="font-heading font-bold text-xl text-slate-800">{title}</h3>
        <span className="font-bold text-sm bg-white/50 backdrop-blur-md px-3 py-1 rounded-full shadow-sm text-slate-600">
          +{xpValue} XP
        </span>
      </div>

      <div>
        <div className="flex justify-between text-sm font-semibold text-slate-600 mb-2">
          <span>Mastery</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 w-full bg-white/50 rounded-full overflow-hidden mb-6">
          <div 
            className={`h-full ${barColor} rounded-full`} 
            style={{ width: `${progress}%` }} 
          />
        </div>

        <Link
          href="/arena"
          className="flex items-center justify-center gap-2 w-full bg-white text-slate-800 font-bold py-3 rounded-xl shadow-sm hover:shadow-md transition-all group-hover:bg-slate-50"
        >
          <Play size={16} className={`text-slate-800 opacity-70`} />
          Start Quiz
        </Link>
      </div>
    </motion.div>
  );
}
