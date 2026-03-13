"use client";

import { Sidebar } from "./Sidebar";
import { CurrentLearningPath } from "./widgets/CurrentLearningPath";
import { DailyStreak } from "./widgets/DailyStreak";
import { XPLevel } from "./widgets/XPLevel";
import { GlobalRank } from "./widgets/GlobalRank";
import { motion } from "framer-motion";

export function Dashboard() {
  return (
    <div className="flex h-screen w-full p-4 lg:p-8 gap-4 lg:gap-8 overflow-hidden z-10 relative">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
        <div className="max-w-6xl mx-auto py-4">
          
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-8"
          >
            <h1 className="text-4xl font-black tracking-tight text-white/90">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">Player</span>
            </h1>
            <p className="text-white/50 mt-2">Your journey awaits. Ready to level up?</p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 auto-rows-[160px]"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
          >
            <CurrentLearningPath />
            <DailyStreak />
            <XPLevel />
            <GlobalRank />

            {/* Placeholder for future widgets to complete a fuller grid look */}
            <div className="col-span-1 md:col-span-2 rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-md flex items-center justify-center text-white/20 border-dashed">
              <span className="text-sm uppercase tracking-widest font-mono">Unlock at Lvl. 50</span>
            </div>
             <div className="col-span-1 md:col-span-2 rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-md flex items-center justify-center text-white/20 border-dashed">
              <span className="text-sm uppercase tracking-widest font-mono">Incoming Transmission...</span>
            </div>

          </motion.div>
        </div>
      </main>
    </div>
  );
}
