"use client";

import { motion } from "framer-motion";
import { AvatarDisplay } from "./dashboard/AvatarDisplay";
import { SubjectCard } from "./dashboard/SubjectCard";
import { useGameSounds } from "@/hooks/useGameSounds";
import { LevelUpModal } from "@/components/juice/LevelUpModal";
import { useState } from "react";
import { Sparkles } from "lucide-react";

export function Dashboard() {
  const { playClick } = useGameSounds();
  const [showLevelUp, setShowLevelUp] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    },
  };

  // Mock user data
  const userData = {
    level: 12,
    xp: 3450,
    maxXp: 5000,
    streak: 14
  };

  // Demo trigger for hackathon presentation
  const triggerLevelUp = () => {
    playClick();
    setShowLevelUp(true);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col items-center relative">
      <LevelUpModal isOpen={showLevelUp} newLevel={13} onClose={() => setShowLevelUp(false)} />

      {/* Header section */}
      <div className="w-full flex justify-between items-center mb-8">
        <div>
          <h1 className="font-heading font-black text-3xl md:text-4xl text-slate-800 tracking-tight">
            Welcome back, <span className="text-primary-sky">Alex!</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1">Ready to level up your knowledge today?</p>
        </div>
        
        {/* Hidden demo button for level up effect */}
        <button 
          onClick={triggerLevelUp}
          className="p-3 bg-white border border-slate-200 rounded-full shadow-sm hover:shadow-md text-yellow-500 transition-all hover:bg-yellow-50"
          title="Demo Level Up"
        >
           <Sparkles size={20} />
        </button>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8"
      >
        
        {/* Left Side: Subject Grid (2 columns on large screens) */}
        <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6 order-2 lg:order-1" onClick={playClick}>
          <motion.div variants={itemVariants} className="w-full">
            <SubjectCard 
              title="AP History" 
              progress={75} 
              xpValue={450} 
              colorScheme="sky" 
            />
          </motion.div>
          <motion.div variants={itemVariants} className="w-full">
            <SubjectCard 
              title="Biology 101" 
              progress={40} 
              xpValue={120} 
              colorScheme="teal" 
            />
          </motion.div>
          <motion.div variants={itemVariants} className="w-full md:col-span-2">
            <SubjectCard 
              title="Advanced Calculus" 
              progress={15} 
              xpValue={80} 
              colorScheme="coral" 
            />
          </motion.div>
          <motion.div variants={itemVariants} className="w-full md:col-span-2">
            <SubjectCard 
              title="Literature & Composition" 
              progress={90} 
              xpValue={800} 
              colorScheme="purple" 
            />
          </motion.div>
        </div>

        {/* Right Side: Central Avatar Display */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-5 flex flex-col items-center justify-start bg-white rounded-3xl p-6 shadow-sm border border-slate-100 order-1 lg:order-2"
        >
          <h2 className="font-heading font-bold text-xl text-slate-800 self-start mb-4">Your Hero</h2>
          <AvatarDisplay data={userData} />
        </motion.div>

      </motion.div>
    </div>
  );
}
