"use client";

import { motion } from "framer-motion";
import { Play } from "lucide-react";
import Link from "next/link";

interface SubjectCardProps {
  title: string;
  progress: number;
  xpValue: number;
  colorScheme: "sky" | "teal" | "coral" | "purple";
  href?: string;
}

const colorMap = {
  sky: "from-primary-sky/20 to-primary-sky/5 border-primary-sky/30 hover:border-primary-sky text-primary-sky hover:shadow-[0_0_20px_rgba(56,189,248,0.3)]",
  teal: "from-primary-teal/20 to-primary-teal/5 border-primary-teal/30 hover:border-primary-teal text-primary-teal hover:shadow-[0_0_20px_rgba(45,212,191,0.3)]",
  coral: "from-primary-coral/20 to-primary-coral/5 border-primary-coral/30 hover:border-coral text-primary-coral hover:shadow-[0_0_20px_rgba(255,107,107,0.3)]",
  purple: "from-accent-purple/20 to-accent-purple/5 border-accent-purple/30 hover:border-accent-purple text-accent-purple hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]",
};

const bgMap = {
  sky: "bg-primary-sky",
  teal: "bg-primary-teal",
  coral: "bg-primary-coral",
  purple: "bg-accent-purple",
};

export function SubjectCard({ title, progress, xpValue, colorScheme, href = "/arena" }: SubjectCardProps) {
  const styles = colorMap[colorScheme];
  const barColor = bgMap[colorScheme];

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      className={`relative w-full rounded-3xl border border-slate-700/50 bg-slate-900/60 backdrop-blur-md p-6 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)] transition-all duration-300 group flex flex-col justify-between min-h-[180px] bg-gradient-to-br ${styles}`}
    >
      <div className="flex justify-between items-start mb-6">
        <h3 className="cyber-text-subtle text-xl text-slate-100 drop-shadow-md">{title}</h3>
        <span className="font-bold text-sm bg-slate-800/80 border border-slate-600 backdrop-blur-md px-3 py-1 rounded-full shadow-sm text-slate-300">
          +{xpValue} XP
        </span>
      </div>

      <div>
        <div className="flex justify-between text-sm font-semibold text-slate-400 mb-2">
          <span className="tracking-wide">MASTERY</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 w-full bg-slate-800/80 rounded-full overflow-hidden mb-6">
          <div 
            className={`h-full ${barColor} rounded-full`} 
            style={{ width: `${progress}%` }} 
          />
        </div>

        <Link
          href={href}
          className="flex items-center justify-center gap-2 w-full bg-slate-800/80 border border-slate-700/50 text-slate-200 font-bold py-3 rounded-xl shadow-sm hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all group-hover:bg-slate-700 group-hover:text-white"
        >
          <Play size={16} className={`text-slate-300 opacity-90 group-hover:text-white group-hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]`} />
          START QUIZ
        </Link>
      </div>
    </motion.div>
  );
}
