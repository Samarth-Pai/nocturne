"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { AvatarDisplay } from "./dashboard/AvatarDisplay";
import { SubjectCard } from "./dashboard/SubjectCard";
import { useGameSounds } from "@/hooks/useGameSounds";
import { LevelUpModal } from "@/components/juice/LevelUpModal";
import { useEffect, useState } from "react";
import { Sparkles, BookOpen, Swords, Trophy, Zap, Flame, Star } from "lucide-react";
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
      <div className="w-full flex justify-between items-center mb-6">
        <div>
          <h1 className="font-heading font-black text-3xl md:text-4xl cyber-text-subtle tracking-tight text-white">
            Welcome back, <span className="text-primary-teal drop-shadow-[0_0_8px_rgba(45,212,191,0.5)]">{userData.name || "Hero"}!</span>
          </h1>
          <p className="text-slate-400 font-medium mt-1">Ready to level up your knowledge today?</p>
        </div>
        
        {/* Demo Level Up Button */}
        <button 
          onClick={triggerLevelUp}
          className="p-3 bg-slate-900/50 backdrop-blur-md border border-accent-purple/50 rounded-full shadow-[0_0_10px_rgba(139,92,246,0.2)] text-accent-orange transition-all hover:bg-accent-purple/20 hover:shadow-[0_0_15px_rgba(139,92,246,0.6)]"
          title="Demo Level Up"
        >
           <Sparkles size={20} />
        </button>
      </div>

      {/* Stat Chips Row */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="w-full grid grid-cols-3 gap-4 mb-6"
      >
        {[
          { icon: <Zap size={18} className="text-accent-purple" />, label: "Total XP", value: `${userData.xp} XP`, glow: "shadow-[0_0_12px_rgba(139,92,246,0.2)] border-accent-purple/20" },
          { icon: <Star size={18} className="text-primary-sky" />, label: "Level", value: `Lv. ${userData.level}`, glow: "shadow-[0_0_12px_rgba(56,189,248,0.2)] border-primary-sky/20" },
          { icon: <Flame size={18} className="text-accent-orange" />, label: "Daily Streak", value: `${userData.streak} days`, glow: "shadow-[0_0_12px_rgba(245,158,11,0.2)] border-accent-orange/20" },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            variants={itemVariants}
            className={`glass-panel px-4 py-3 flex items-center gap-3 border ${stat.glow}`}
          >
            <div className="p-2 bg-slate-800/80 rounded-lg border border-slate-700/50">
              {stat.icon}
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">{stat.label}</p>
              <p className="text-lg font-black text-white">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Action Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
      >
        {[
          {
            href: "/story",
            icon: <BookOpen size={22} />,
            label: "Story Mode",
            desc: "AI-generated topic cards from your notes",
            from: "from-accent-purple",
            to: "to-primary-sky",
            glow: "hover:shadow-[0_0_25px_rgba(139,92,246,0.4)]",
          },
          {
            href: "/duel",
            icon: <Swords size={22} />,
            label: "Duel Arena",
            desc: "Challenge a rival in real-time",
            from: "from-accent-pink",
            to: "to-accent-orange",
            glow: "hover:shadow-[0_0_25px_rgba(236,72,153,0.4)]",
          },
          {
            href: "/leaderboard",
            icon: <Trophy size={22} />,
            label: "Leaderboard",
            desc: "See how you rank globally",
            from: "from-accent-orange",
            to: "to-primary-teal",
            glow: "hover:shadow-[0_0_25px_rgba(245,158,11,0.4)]",
          },
        ].map((action) => (
          <motion.div key={action.href} variants={itemVariants}>
            <Link
              href={action.href}
              className={`flex items-center gap-4 glass-panel p-4 border border-slate-700/30 ${action.glow} hover:-translate-y-1 transition-all duration-200 group`}
            >
              <div className={`p-3 rounded-xl bg-gradient-to-br ${action.from} ${action.to} text-white shadow-md group-hover:scale-110 transition-transform`}>
                {action.icon}
              </div>
              <div>
                <p className="font-bold text-white text-sm">{action.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{action.desc}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8"
      >
        
        {/* Left Side: Subject Grid */}
        <div className="lg:col-span-7 flex flex-col gap-6 order-2 lg:order-1">
          <div className="flex items-center justify-between">
            <h2 className="cyber-text-subtle text-lg text-slate-200">FOCUS AREAS</h2>
            <Link href="/subjects" className="text-xs font-bold text-primary-sky hover:text-white transition-colors">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" onClick={playClick}>
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
                <Link
                  key={subject.subjectSlug}
                  href={`/arena?subjectSlug=${encodeURIComponent(subject.subjectSlug)}&subject=${encodeURIComponent(subject.subject)}`}
                  className="block rounded-xl border border-slate-700/50 bg-slate-800/40 p-3 text-left hover:bg-slate-800/60 hover:border-primary-sky/40 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-primary-sky drop-shadow-[0_0_5px_rgba(56,189,248,0.3)]">{subject.subject}</p>
                    <span className="text-xs font-bold text-slate-500 group-hover:text-primary-sky transition-colors">Practice →</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {subject.reason === "not-attempted"
                      ? "Not attempted yet"
                      : `Accuracy: ${subject.accuracy ?? 0}% across ${subject.attemptedCount} attempt(s)`}
                  </p>
                  {subject.reason !== "not-attempted" && (
                    <div className="mt-2 h-1 w-full bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-sky rounded-full"
                        style={{ width: `${subject.accuracy ?? 0}%` }}
                      />
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
