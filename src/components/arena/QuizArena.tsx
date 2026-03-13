"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { QuestionCard, type QuestionData } from "./QuestionCard";
import { XPParticleBurst } from "./XPParticleBurst";
import { FloatingXP } from "./FloatingXP";

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
  const [floatingXPs, setFloatingXPs] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [isGlow, setIsGlow] = useState(false);

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

  function handleAnswer(isCorrect: boolean, event: React.MouseEvent): void {
    if (isCorrect) {
      setCorrectAnswers((current) => current + 1);
      setScore((current) => current + 10);

      const { clientX, clientY } = event;
      setParticles((current) => [...current, { id: Date.now(), x: clientX, y: clientY }]);
      setFloatingXPs((current) => [...current, { id: Date.now(), x: clientX, y: clientY }]);
      
      // Delay the glow slightly so it happens when the floating XP approaches the progress bar
      setTimeout(() => {
        setIsGlow(true);
        setTimeout(() => setIsGlow(false), 600);
      }, 700);
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
      const data = (await response.json()) as CompletePayload;
      setStreakCount(data.streak?.count ?? null);
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
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-3 px-2">
        <div className="flex justify-between items-center">
          <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
            Question {Math.min(currentIndex + 1, questions.length)} of {questions.length}
          </p>
          <p id="xp-score-indicator" className="text-sm font-bold text-primary-sky">{score} XP</p>
        </div>
        <div 
          id="quiz-progress-bar"
          className={`w-full h-2 bg-slate-100 rounded-full overflow-hidden transition-all duration-300 ${isGlow ? 'shadow-[0_0_15px_rgba(56,189,248,0.8)]' : ''}`}
        >
          <div 
            className="h-full bg-primary-sky transition-all duration-500" 
            style={{ width: `${(Math.min(currentIndex, questions.length) / Math.max(1, questions.length)) * 100}%` }} 
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {currentQuestion && (
          <QuestionCard
            key={currentQuestion.id}
            data={currentQuestion}
            onAnswerSelected={handleAnswer}
            onNext={handleNext}
          />
        )}

        {!currentQuestion && (
          <motion.div
            key="practice-result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm text-center"
          >
            <h2 className="font-heading text-4xl font-black text-slate-800">Practice Complete</h2>
            <p className="mt-3 text-slate-600 text-lg">Score: {score}</p>
            <p className="mt-1 text-slate-500">Correct Answers: {correctAnswers}/{questions.length}</p>
            {streakCount !== null && (
              <p className="mt-2 text-primary-teal font-bold">Daily Streak: {streakCount} day(s)</p>
            )}

            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={resetQuiz}
                className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700"
              >
                Play Again
              </button>
              <Link
                href="/profile"
                className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white"
              >
                View Quiz History
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
          onComplete={() => removeFloatingXP(fxp.id)}
        />
      ))}
    </div>
  );
}
