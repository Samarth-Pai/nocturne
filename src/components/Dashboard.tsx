"use client";

import { motion } from "framer-motion";
import { AvatarDisplay } from "./dashboard/AvatarDisplay";
import { SubjectCard } from "./dashboard/SubjectCard";
import { useGameSounds } from "@/hooks/useGameSounds";
import { LevelUpModal } from "@/components/juice/LevelUpModal";
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { BadgeGrid } from "./widgets/BadgeGrid";
import { getNextLevelXp } from "@/lib/levels";

interface WeakSubject {
  subject: string;
  subjectSlug: string;
  attemptedCount: number;
  accuracy: number | null;
  reason: "not-attempted" | "low-accuracy";
}

interface SubjectOverview {
  subject: string;
  subjectSlug: string;
  progress: number;
  xpValue: number;
}

const colorSchemes: Array<"sky" | "teal" | "coral" | "purple"> = ["sky", "teal", "coral", "purple"];

export function Dashboard() {
  const { playClick } = useGameSounds();
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [weakSubjects, setWeakSubjects] = useState<WeakSubject[]>([]);
  const [subjects, setSubjects] = useState<SubjectOverview[]>([]);
  const [userData, setUserData] = useState({ level: 1, xp: 0, maxXp: 50, streak: 0, name: "" });

  useEffect(() => {
    const token = localStorage.getItem("levelup_token");
    
    fetch("/api/auth/me", {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
      .then(async (response) => {
        if (!response.ok) return;
        const data = await response.json();
        if (data.user) {
          const lvl = data.user.gamification?.level ?? 1;
          setUserData({
            name: data.user.name ?? "",
            level: lvl,
            xp: data.user.gamification?.xp ?? 0,
            maxXp: getNextLevelXp(lvl),
            streak: data.user.streak?.count ?? 0,
          });
        }
      })
      .catch(() => {});

    fetch("/api/analytics/weak-subjects", {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
      .then(async (response) => {
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { weakSubjects: WeakSubject[] };
        setWeakSubjects(data.weakSubjects ?? []);
      })
      .catch(() => {
        setWeakSubjects([]);
      });

    fetch("/api/subjects/overview", {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
      .then(async (response) => {
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { subjects: SubjectOverview[] };
        setSubjects(data.subjects ?? []);
      })
      .catch(() => {
        setSubjects([]);
      });
  }, []);

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
      transition: { type: "spring" as const, stiffness: 300, damping: 24 }
    },
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
          <h1 className="font-heading font-black text-3xl md:text-4xl cyber-text-subtle tracking-tight text-white">
            Welcome back, <span className="text-primary-teal drop-shadow-[0_0_8px_rgba(45,212,191,0.5)]">{userData.name || "Hero"}!</span>
          </h1>
          <p className="text-slate-300 font-medium mt-1">Ready to level up your knowledge today?</p>
        </div>
        
        {/* Hidden demo button for level up effect */}
        <button 
          onClick={triggerLevelUp}
          className="p-3 bg-slate-900/50 backdrop-blur-md border border-accent-purple/50 rounded-full shadow-[0_0_10px_rgba(139,92,246,0.2)] text-accent-orange transition-all hover:bg-accent-purple/20 hover:shadow-[0_0_15px_rgba(139,92,246,0.6)]"
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
          {weakSubjects.slice(0, 4).map((weak, index) => {
            const subject = subjects.find((item) => item.subjectSlug === weak.subjectSlug);
            const progress = weak.reason === "not-attempted" ? 0 : (weak.accuracy ?? 0);

            return (
            <motion.div
              key={weak.subjectSlug}
              variants={itemVariants}
              className={`w-full ${index >= 2 ? "md:col-span-2" : ""}`}
            >
              <SubjectCard
                title={weak.subject}
                progress={progress}
                xpValue={subject?.xpValue ?? 0}
                colorScheme={colorSchemes[index % colorSchemes.length]}
                href={`/arena?subjectSlug=${encodeURIComponent(weak.subjectSlug)}&subject=${encodeURIComponent(weak.subject)}`}
              />
            </motion.div>
            );
          })}

          {weakSubjects.length === 0 && (
            <motion.div variants={itemVariants} className="w-full md:col-span-2 glass-panel p-6 text-center text-slate-300">
              No weak or unattempted subjects right now.
            </motion.div>
          )}
        </div>

        {/* Right Side: Central Avatar Display */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-5 flex flex-col items-center justify-start glass-panel p-6 order-1 lg:order-2"
        >
          <h2 className="cyber-text-subtle text-xl text-accent-purple self-start mb-4">YOUR HERO</h2>
          <AvatarDisplay data={userData} />
          <div className="w-full mt-8 pt-8 border-t border-slate-700/50">
            <h3 className="cyber-text-subtle text-lg text-slate-200 mb-6 drop-shadow-md">RECENT BADGES</h3>
            <BadgeGrid />
          </div>

          <div className="w-full mt-8 pt-8 border-t border-slate-700/50">
            <h3 className="cyber-text-subtle text-lg text-slate-200 mb-4 drop-shadow-md">WEAKEST SUBJECTS</h3>
            <div className="space-y-3">
              {weakSubjects.length === 0 && (
                <p className="text-sm text-slate-400">No weak subjects yet. Play more quizzes to unlock analytics.</p>
              )}

              {weakSubjects.map((subject) => (
                <div key={subject.subjectSlug} className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-3 text-left hover:bg-slate-800/60 transition-colors">
                  <p className="text-sm font-bold text-primary-sky drop-shadow-[0_0_5px_rgba(56,189,248,0.3)]">{subject.subject}</p>
                  <p className="text-xs text-slate-300 mt-1">
                    {subject.reason === "not-attempted"
                      ? "Not attempted yet"
                      : `Accuracy: ${subject.accuracy ?? 0}% across ${subject.attemptedCount} attempt(s)`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
