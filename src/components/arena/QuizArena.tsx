"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { QuestionCard, type QuestionData } from "./QuestionCard";
import { XPParticleBurst } from "./XPParticleBurst";
import { FloatingXP } from "./FloatingXP";
import { QuizIntro } from "./QuizIntro";
import { LevelUpModal } from "@/components/juice/LevelUpModal";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { playSuccessSound, playErrorSound } from "@/lib/audio";

interface AuthUser {
  id: string;
  name: string;
}

interface ApiQuestion extends QuestionData {
  subject: string;
  subjectSlug: string;
}

interface CompletePayload {
  streak?: {
    count: number;
    lastActive: string | null;
  };
}

export function QuizArena() {
  const searchParams = useSearchParams();
  const selectedSubjectSlug = searchParams?.get("subjectSlug")?.trim() ?? "";
  const selectedSubjectName = searchParams?.get("subject")?.trim() ?? "";

  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [questions, setQuestions] = useState<ApiQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [streakCount, setStreakCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [floatingXPs, setFloatingXPs] = useState<Array<{ id: number; x: number; y: number; label: string }>>([]);
  const [isGlow, setIsGlow] = useState(false);
  const [currentCombo, setCurrentCombo] = useState(0);
  const [hasUsedHint, setHasUsedHint] = useState(false);
  const [hasShownIntro, setHasShownIntro] = useState(false);
  
  // Power-up States
  const [usedFiftyFifty, setUsedFiftyFifty] = useState(false);
  const [usedSkip, setUsedSkip] = useState(false);
  const [usedDoubleXP, setUsedDoubleXP] = useState(false);
  const [isDoubleXPActive, setIsDoubleXPActive] = useState(false);
  const [levelUpData, setLevelUpData] = useState({ show: false, level: 0 });

  const { avatarId } = useUserPreferences();

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      const token = localStorage.getItem("levelup_token");

      const meResponse = await fetch("/api/auth/me", {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (!meResponse.ok) {
        throw new Error("Please sign in first.");
      }

      const meData = (await meResponse.json()) as { user: AuthUser };

      const query = selectedSubjectSlug
        ? `/api/questions?limit=5&subjectSlug=${encodeURIComponent(selectedSubjectSlug)}`
        : "/api/questions?limit=5";

      const questionResponse = await fetch(query, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (!questionResponse.ok) {
        throw new Error("Unable to load quiz questions.");
      }

      const questionData = (await questionResponse.json()) as { questions: ApiQuestion[] };

      if (!active) {
        return;
      }

      setAuthUser(meData.user);
      setQuestions(questionData.questions);
      setLoading(false);
    }

    bootstrap().catch((err: unknown) => {
      if (!active) {
        return;
      }

      setError(err instanceof Error ? err.message : "Unable to load practice arena.");
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [selectedSubjectSlug]);

  const currentQuestion = !isFinished ? questions[currentIndex] : null;
  const isBossQuestion = !isFinished && ((currentIndex + 1) % 5 === 0);

  function handleAnswer(isCorrect: boolean, event: React.MouseEvent): void {
    if (isCorrect) {
      playSuccessSound();
      const newCombo = currentCombo + 1;
      const multiplier = newCombo >= 2 ? newCombo : 1;
      let baseXp = isBossQuestion ? 50 : 10;
      
      if (isDoubleXPActive) {
        baseXp *= 2;
        setIsDoubleXPActive(false); // consume the buff
      }
      
      // Eren bonus: +5 XP for Science
      let extraBonus = 0;
      if (avatarId === "eren" && currentQuestion?.subject.toLowerCase().includes("science")) {
        extraBonus = 5;
      }
      
      const xpEarned = (baseXp * multiplier) + extraBonus;
      
      setCurrentCombo(newCombo);
      setCorrectAnswers((current) => current + 1);
      setScore((current) => current + xpEarned);

      let labelText = `+${xpEarned} XP`;
      if (newCombo >= 2) labelText += ` (Combo x${newCombo})`;
      if (isDoubleXPActive) labelText += ` (Double XP)`;
      if (extraBonus > 0) labelText += ` (Eren Bonus)`;
      
      const { clientX, clientY } = event;
      setParticles((current) => [...current, { id: Date.now(), x: clientX, y: clientY }]);
      setFloatingXPs((current) => [...current, { id: Date.now(), x: clientX, y: clientY, label: labelText }]);
      
      // Delay the glow slightly so it happens when the floating XP approaches the progress bar
      setTimeout(() => {
        setIsGlow(true);
        setTimeout(() => setIsGlow(false), 600);
      }, 700);
    } else {
      playErrorSound();
      // Mikasa bonus: 10% chance to prevent streak loss
      if (avatarId === "mikasa" && Math.random() < 0.10) {
        // Mikasa saved it! Do not reset currentCombo.
        const { clientX, clientY } = event;
        setFloatingXPs((current) => [...current, { id: Date.now(), x: clientX, y: clientY, label: "Streak Saved! (Mikasa)" }]);
      } else {
        setCurrentCombo(0);
      }
    }
  }

  async function handleNext(): Promise<void> {
    const nextIndex = currentIndex + 1;

    if (nextIndex < questions.length) {
      setCurrentIndex(nextIndex);
      return;
    }

    setIsFinished(true);

    const token = localStorage.getItem("levelup_token");
    const primarySubject = selectedSubjectName || questions[0]?.subject || "General";
    const primarySlug = selectedSubjectSlug || questions[0]?.subjectSlug || "general";

    const response = await fetch("/api/quiz/complete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        subject: primarySubject,
        subjectSlug: primarySlug,
        totalQuestions: questions.length,
        correctAnswers,
        score,
      }),
    });

    if (response.ok) {
      const data = (await response.json()) as CompletePayload & { experiencedLevelUp?: boolean, newLevel?: number };
      setStreakCount(data.streak?.count ?? null);
      if (data.experiencedLevelUp && data.newLevel) {
        setLevelUpData({ show: true, level: data.newLevel });
      }
    }
  }

  function removeParticles(id: number): void {
    setParticles((current) => current.filter((particle) => particle.id !== id));
  }

  function removeFloatingXP(id: number): void {
    setFloatingXPs((current) => current.filter((fxp) => fxp.id !== id));
  }

  function resetQuiz(): void {
    setCurrentIndex(0);
    setScore(0);
    setCorrectAnswers(0);
    setIsFinished(false);
    setParticles([]);
    setFloatingXPs([]);
    setIsGlow(false);
    setCurrentCombo(0);
    setHasUsedHint(false);
    setHasShownIntro(false);
    setUsedFiftyFifty(false);
    setUsedSkip(false);
    setUsedDoubleXP(false);
    setIsDoubleXPActive(false);
  }

  if (loading) {
    return (
      <div className="w-full max-w-3xl mx-auto rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h2 className="font-heading text-2xl font-bold text-slate-800">Loading Practice Quiz...</h2>
      </div>
    );
  }

  if (error || !authUser) {
    return (
      <div className="w-full max-w-3xl mx-auto rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center shadow-sm">
        <h2 className="font-heading text-2xl font-bold text-rose-700">Quiz unavailable</h2>
        <p className="mt-2 text-rose-600">{error ?? "Please sign in to continue."}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-10 py-8 relative">
      <LevelUpModal 
        isOpen={levelUpData.show} 
        newLevel={levelUpData.level} 
        onClose={() => setLevelUpData(prev => ({ ...prev, show: false }))} 
      />
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-4 px-2">
        <div className="text-center mb-2 animate-flicker">
          <h1 className="cyber-text text-xl md:text-3xl">K A M U I&nbsp;&nbsp;L E A R N I N G&nbsp;&nbsp;S Y S T E M</h1>
        </div>
        <div className="flex justify-between items-center text-slate-200">
          <p className="cyber-text-subtle text-xs md:text-sm font-bold tracking-widest">
            QUESTION {Math.min(currentIndex + 1, questions.length)} OF {questions.length}
          </p>
          <p id="xp-score-indicator" className="cyber-text-subtle text-xs md:text-sm font-bold text-accent-pink">{score} XP</p>
        </div>
        <div 
          id="quiz-progress-bar"
          className={`w-full h-2 bg-slate-800/80 rounded-full overflow-hidden transition-all duration-300 ${isGlow ? 'shadow-[0_0_20px_rgba(236,72,153,0.8)]' : 'shadow-[0_0_5px_rgba(139,92,246,0.3)]'}`}
        >
          <div 
            className="h-full bg-gradient-to-r from-accent-purple to-accent-pink transition-all duration-500" 
            style={{ width: `${(Math.min(currentIndex, questions.length) / Math.max(1, questions.length)) * 100}%` }} 
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!hasShownIntro && !isFinished && (
          <QuizIntro key="quiz-intro" onComplete={() => setHasShownIntro(true)} />
        )}

        {hasShownIntro && currentQuestion && (
          <QuestionCard
            key={currentQuestion.id}
            data={currentQuestion}
            isBoss={isBossQuestion}
            onAnswerSelected={handleAnswer}
            onNext={handleNext}
            onUseHint={avatarId === "armin" && !hasUsedHint ? () => setHasUsedHint(true) : undefined}
            onUseFiftyFifty={!usedFiftyFifty ? () => setUsedFiftyFifty(true) : undefined}
            onUseSkip={!usedSkip ? () => { setUsedSkip(true); handleNext(); } : undefined}
            onUseDoubleXP={!usedDoubleXP ? () => { setUsedDoubleXP(true); setIsDoubleXPActive(true); } : undefined}
            isDoubleXPActive={isDoubleXPActive}
          />
        )}

        {!currentQuestion && (
          <motion.div
            key="practice-result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-10 text-center relative z-10"
          >
            <h2 className="cyber-text text-3xl md:text-5xl mb-4">SYSTEM CALIBRATED</h2>
            <p className="mt-4 cyber-text-subtle text-lg text-accent-pink">Final Score: {score} XP</p>
            <p className="mt-2 cyber-text-subtle text-sm text-slate-300">Accuracy: {correctAnswers}/{questions.length}</p>
            {streakCount !== null && (
              <p className="mt-4 cyber-text-subtle text-sm text-accent-purple font-bold">Daily Streak: {streakCount}</p>
            )}

            <div className="mt-8 flex justify-center gap-4">
              <button
                type="button"
                onClick={resetQuiz}
                className="rounded-xl border border-accent-purple bg-slate-900/50 px-6 py-3 text-sm font-bold text-white hover:bg-accent-purple/20 hover:shadow-[0_0_15px_rgba(139,92,246,0.6)] transition-all"
              >
                REBOOT SEQUENCE
              </button>
              <Link
                href="/profile"
                className="rounded-xl bg-accent-pink px-6 py-3 text-sm font-bold text-slate-900 shadow-[0_0_15px_rgba(236,72,153,0.6)] hover:bg-white hover:shadow-[0_0_25px_rgba(255,255,255,0.8)] transition-all"
              >
                ACCESS ARCHIVES
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {particles.map((particle) => (
        <XPParticleBurst
          key={particle.id}
          x={particle.x}
          y={particle.y}
          onComplete={() => removeParticles(particle.id)}
        />
      ))}

      {floatingXPs.map((fxp) => (
        <FloatingXP
          key={fxp.id}
          startX={fxp.x}
          startY={fxp.y}
          label={fxp.label}
          onComplete={() => removeFloatingXP(fxp.id)}
        />
      ))}
    </div>
  );
}
