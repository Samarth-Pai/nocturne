"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { XPParticleBurst } from "@/components/arena/XPParticleBurst";
import { FloatingXP } from "@/components/arena/FloatingXP";
import { playErrorSound, playSuccessSound } from "@/lib/audio";

type OptionId = "a" | "b" | "c" | "d";

interface StoryTopic {
  topic: string;
  explanation: string;
  imagePath: string | null;
  imageFilename: string | null;
}

interface StoryQuizOption {
  id: OptionId;
  text: string;
}

interface StoryQuizQuestion {
  id: string;
  topic: string;
  question: string;
  options: StoryQuizOption[];
  correctOptionId: OptionId;
  explanation: string;
}

interface StorySessionPayload {
  id: string;
  subject: string;
  subjectSlug: string;
  topics: StoryTopic[];
  quizQuestions: StoryQuizQuestion[];
}

interface SavedStorySummary {
  id: string;
  subject: string;
  subjectSlug: string;
  topicCount: number;
  quizCount: number;
  sourceType: "text" | "pdf" | "txt" | "mixed";
  sourceFileName: string | null;
  createdAt: string;
}

type Stage = "upload" | "story" | "quiz" | "result";

export default function StoryModePage() {
  const [subject, setSubject] = useState("");
  const [subjectSlug, setSubjectSlug] = useState("");
  const [textInput, setTextInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [stage, setStage] = useState<Stage>("upload");
  const [storySession, setStorySession] = useState<StorySessionPayload | null>(null);
  const [topicIndex, setTopicIndex] = useState(0);

  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<OptionId | null>(null);
  const [answers, setAnswers] = useState<Record<string, OptionId>>({});
  const [savingResult, setSavingResult] = useState(false);
  const [finalCorrect, setFinalCorrect] = useState(0);

  const [savedStories, setSavedStories] = useState<SavedStorySummary[]>([]);
  const [loadingSavedStories, setLoadingSavedStories] = useState(true);
  const [loadingStoryId, setLoadingStoryId] = useState<string | null>(null);

  const [currentCombo, setCurrentCombo] = useState(0);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [floatingXPs, setFloatingXPs] = useState<Array<{ id: number; x: number; y: number; label: string }>>([]);
  const [isGlow, setIsGlow] = useState(false);

  const currentTopic = storySession?.topics[topicIndex] ?? null;
  const currentQuizQuestion = storySession?.quizQuestions[quizIndex] ?? null;

  const canSubmitUpload = Boolean(textInput.trim() || file);

  const quizProgress = useMemo(() => {
    if (!storySession?.quizQuestions?.length) {
      return 0;
    }

    return Math.round((quizIndex / storySession.quizQuestions.length) * 100);
  }, [quizIndex, storySession?.quizQuestions]);

  async function loadSavedStories(): Promise<void> {
    setLoadingSavedStories(true);

    try {
      const token = localStorage.getItem("levelup_token");
      const response = await fetch("/api/story", {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (!response.ok) {
        throw new Error("Unable to load saved stories.");
      }

      const payload = (await response.json()) as { stories?: SavedStorySummary[] };
      setSavedStories(payload.stories ?? []);
    } catch {
      setSavedStories([]);
    } finally {
      setLoadingSavedStories(false);
    }
  }

  useEffect(() => {
    loadSavedStories().catch(() => {
      setSavedStories([]);
      setLoadingSavedStories(false);
    });
  }, []);

  async function createStorySession(): Promise<void> {
    if (!canSubmitUpload) {
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const token = localStorage.getItem("levelup_token");
      const formData = new FormData();
      formData.append("subject", subject || "General");
      formData.append("subjectSlug", subjectSlug);
      formData.append("textInput", textInput);
      if (file) {
        formData.append("file", file);
      }

      const response = await fetch("/api/story", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      });

      const payload = (await response.json()) as {
        error?: string;
        storySession?: StorySessionPayload;
      };

      if (!response.ok || !payload.storySession) {
        throw new Error(payload.error ?? "Could not generate story mode content.");
      }

      setStorySession(payload.storySession);
      setTopicIndex(0);
      setQuizIndex(0);
      setAnswers({});
      setSelectedOption(null);
      setFinalCorrect(0);
      setCurrentCombo(0);
      setParticles([]);
      setFloatingXPs([]);
      setIsGlow(false);
      setStage("story");
      await loadSavedStories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create story session.");
    } finally {
      setCreating(false);
    }
  }

  async function openSavedStory(storyId: string): Promise<void> {
    setLoadingStoryId(storyId);
    setError(null);

    try {
      const token = localStorage.getItem("levelup_token");
      const response = await fetch(`/api/story/${encodeURIComponent(storyId)}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      const payload = (await response.json()) as {
        error?: string;
        storySession?: StorySessionPayload;
      };

      if (!response.ok || !payload.storySession) {
        throw new Error(payload.error ?? "Could not open story session.");
      }

      setStorySession(payload.storySession);
      setTopicIndex(0);
      setQuizIndex(0);
      setAnswers({});
      setSelectedOption(null);
      setFinalCorrect(0);
      setCurrentCombo(0);
      setParticles([]);
      setFloatingXPs([]);
      setIsGlow(false);
      setStage("story");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open story session.");
    } finally {
      setLoadingStoryId(null);
    }
  }

  function goToNextTopic(): void {
    if (!storySession) {
      return;
    }

    const next = topicIndex + 1;
    if (next < storySession.topics.length) {
      setTopicIndex(next);
      return;
    }

    setStage("quiz");
    setQuizIndex(0);
    setSelectedOption(null);
  }

  async function submitCurrentQuizAnswer(): Promise<void> {
    if (!storySession || !currentQuizQuestion || !selectedOption) {
      return;
    }

    const nextAnswers = {
      ...answers,
      [currentQuizQuestion.id]: selectedOption,
    };

    setAnswers(nextAnswers);

    const isCorrect = selectedOption === currentQuizQuestion.correctOptionId;
    const burstX = typeof window !== "undefined" ? window.innerWidth / 2 : 600;
    const burstY = typeof window !== "undefined" ? window.innerHeight / 2 : 300;

    if (isCorrect) {
      playSuccessSound();
      const nextCombo = currentCombo + 1;
      setCurrentCombo(nextCombo);

      const comboBonus = nextCombo >= 2 ? nextCombo : 1;
      const xp = 20 * comboBonus;
      const label = nextCombo >= 2 ? `+${xp} XP (Combo x${nextCombo})` : `+${xp} XP`;

      const id = Date.now();
      setParticles((current) => [...current, { id, x: burstX, y: burstY }]);
      setFloatingXPs((current) => [...current, { id, x: burstX, y: burstY, label }]);
      setIsGlow(true);
      setTimeout(() => setIsGlow(false), 550);
    } else {
      playErrorSound();
      setCurrentCombo(0);
    }

    const nextIndex = quizIndex + 1;
    if (nextIndex < storySession.quizQuestions.length) {
      setQuizIndex(nextIndex);
      setSelectedOption(null);
      return;
    }

    const correct = storySession.quizQuestions.reduce((count, question) => {
      const picked = nextAnswers[question.id];
      return count + (picked === question.correctOptionId ? 1 : 0);
    }, 0);

    setFinalCorrect(correct);
    setSavingResult(true);

    try {
      const token = localStorage.getItem("levelup_token");
      await fetch("/api/quiz/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          subject: storySession.subject,
          subjectSlug: storySession.subjectSlug,
          totalQuestions: storySession.quizQuestions.length,
          correctAnswers: correct,
          score: correct * 20,
        }),
      });
    } finally {
      setSavingResult(false);
      setStage("result");
    }
  }

  function restartStoryMode(): void {
    setStage("upload");
    setStorySession(null);
    setTopicIndex(0);
    setQuizIndex(0);
    setSelectedOption(null);
    setAnswers({});
    setFinalCorrect(0);
    setCurrentCombo(0);
    setParticles([]);
    setFloatingXPs([]);
    setIsGlow(false);
    setError(null);
  }

  function removeParticles(id: number): void {
    setParticles((current) => current.filter((particle) => particle.id !== id));
  }

  function removeFloatingXP(id: number): void {
    setFloatingXPs((current) => current.filter((fxp) => fxp.id !== id));
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <div className="mb-8">
        <h1 className="cyber-text-subtle text-3xl md:text-4xl text-white tracking-tight drop-shadow-md">
          STORY <span className="text-primary-sky drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]">MODE</span>
        </h1>
        <p className="mt-2 text-slate-300">
          Upload PDF or text. Learn each generated topic with image cards, then finish a 5-question quiz.
        </p>
      </div>

      {stage === "upload" && (
        <section className="glass-panel p-6 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject (e.g. Operating Systems)"
              className="w-full rounded-xl border border-slate-700/50 bg-slate-800/50 px-4 py-3 text-white outline-none focus:border-primary-sky placeholder:text-slate-500 transition-colors"
            />
            <input
              value={subjectSlug}
              onChange={(e) => setSubjectSlug(e.target.value)}
              placeholder="Subject Slug (optional)"
              className="w-full rounded-xl border border-slate-700/50 bg-slate-800/50 px-4 py-3 text-white outline-none focus:border-primary-sky placeholder:text-slate-500 transition-colors"
            />
          </div>

          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Paste your source text here (optional if uploading file)..."
            className="mt-4 h-36 w-full rounded-xl border border-slate-700/50 bg-slate-800/50 p-4 text-white outline-none focus:border-primary-sky placeholder:text-slate-500 transition-colors"
          />

          <div className="mt-4 rounded-xl border border-dashed border-slate-600 p-4 bg-slate-800/30">
            <input
              type="file"
              accept=".pdf,.txt"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-sky file:text-slate-900 hover:file:bg-primary-sky/80"
            />
            {file && <p className="mt-2 text-sm text-slate-400">Selected: {file.name}</p>}
          </div>

          {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}

          <button
            type="button"
            onClick={createStorySession}
            disabled={!canSubmitUpload || creating}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary-sky px-5 py-3 text-sm font-bold text-slate-900 shadow-[0_0_10px_rgba(56,189,248,0.4)] disabled:opacity-60 hover:bg-white hover:shadow-[0_0_15px_rgba(255,255,255,0.6)] transition-all"
          >
            {creating && <Loader2 size={16} className="animate-spin" />}
            {creating ? "Generating Story..." : "Generate Story Mode"}
          </button>

          <div className="mt-8 border-t border-slate-700/50 pt-5">
            <h3 className="cyber-text-subtle text-lg text-accent-purple drop-shadow-md">SAVED STORIES</h3>
            <p className="text-sm text-slate-400 mt-1">Re-attempt previously generated stories anytime.</p>

            {loadingSavedStories && <p className="text-sm text-slate-500 mt-3">Loading saved stories...</p>}

            {!loadingSavedStories && savedStories.length === 0 && (
              <p className="text-sm text-slate-500 mt-3">No stories yet. Generate your first one above.</p>
            )}

            {!loadingSavedStories && savedStories.length > 0 && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {savedStories.map((item) => (
                  <div key={item.id} className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-4 hover:bg-slate-800/60 transition-colors">
                    <p className="font-bold text-slate-100 drop-shadow-sm">{item.subject}</p>
                    <p className="text-xs mt-1 text-slate-400">{item.topicCount} topics • {item.quizCount} quiz questions</p>
                    <p className="text-xs mt-1 text-slate-400">
                      {new Date(item.createdAt).toLocaleString()} • {item.sourceType.toUpperCase()}
                    </p>
                    <button
                      type="button"
                      onClick={() => openSavedStory(item.id)}
                      disabled={loadingStoryId === item.id}
                      className="mt-3 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-xs font-bold text-slate-300 disabled:opacity-60 hover:bg-slate-700 hover:text-white transition-colors"
                    >
                      {loadingStoryId === item.id ? "Opening..." : "Attempt Again"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {stage === "story" && storySession && currentTopic && (
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]"
        >
          <p className="text-xs font-bold uppercase tracking-wide text-primary-sky drop-shadow-[0_0_3px_rgba(56,189,248,0.5)]">
            Topic {topicIndex + 1} of {storySession.topics.length}
          </p>
          <h2 className="mt-2 text-2xl font-black text-white font-heading drop-shadow-md">{currentTopic.topic}</h2>

          {currentTopic.imagePath ? (
            <Image
              src={currentTopic.imagePath}
              alt={`Illustration for ${currentTopic.topic}`}
              width={1200}
              height={900}
              className="mt-4 w-full max-h-105 object-contain rounded-2xl border border-slate-700/50 bg-slate-900/50"
            />
          ) : (
            <div className="mt-4 rounded-2xl border border-slate-700/50 bg-slate-800/40 p-8 text-sm text-slate-400">
              Image unavailable for this topic.
            </div>
          )}

          <p className="mt-5 text-slate-200 leading-7 whitespace-pre-wrap">{currentTopic.explanation}</p>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={goToNextTopic}
              className="rounded-xl border border-primary-sky/50 bg-primary-sky/20 px-5 py-3 text-sm font-bold text-primary-sky shadow-[0_0_10px_rgba(56,189,248,0.2)] hover:bg-primary-sky hover:text-slate-900 hover:shadow-[0_0_15px_rgba(56,189,248,0.5)] transition-all"
            >
              {topicIndex + 1 < storySession.topics.length ? "Next Topic" : "Start 5-Question Quiz"}
            </button>
          </div>
        </motion.section>
      )}

      {stage === "quiz" && storySession && currentQuizQuestion && (
        <section className="glass-panel p-6 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)] relative overflow-hidden">
          <div className="flex justify-between items-center">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Quiz {quizIndex + 1} / {storySession.quizQuestions.length}
            </p>
            <p className="text-xs font-bold text-primary-sky">{quizProgress}%</p>
          </div>

          <div
            className={`mt-3 h-2 rounded-full bg-slate-800/80 overflow-hidden transition-all ${isGlow ? "shadow-[0_0_14px_rgba(56,189,248,0.8)]" : ""}`}
          >
            <div className="h-full bg-primary-sky transition-all shadow-[0_0_8px_rgba(56,189,248,0.8)]" style={{ width: `${quizProgress}%` }} />
          </div>

          <p className="mt-4 text-xs text-accent-orange font-bold uppercase tracking-wide drop-shadow-[0_0_3px_rgba(245,158,11,0.5)]">Combo: x{Math.max(1, currentCombo)}</p>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuizQuestion.id}
              initial={{ opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -28 }}
              transition={{ duration: 0.22 }}
            >
              <p className="mt-5 text-sm font-bold text-primary-sky uppercase tracking-wide drop-shadow-[0_0_3px_rgba(56,189,248,0.5)]">{currentQuizQuestion.topic}</p>
              <h2 className="mt-2 font-heading font-black text-2xl text-white drop-shadow-md">{currentQuizQuestion.question}</h2>

              <div className="mt-5 grid grid-cols-1 gap-3">
                {currentQuizQuestion.options.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setSelectedOption(option.id)}
                    className={`rounded-xl border px-4 py-3 text-left text-sm font-bold transition-all ${
                      selectedOption === option.id
                        ? "border-primary-sky bg-primary-sky/20 text-white shadow-[0_0_10px_rgba(56,189,248,0.3)]"
                        : "border-slate-700/50 bg-slate-800/40 text-slate-300 hover:bg-slate-700/60 hover:text-white"
                    }`}
                  >
                    <span className="mr-2 font-black uppercase text-primary-sky">{option.id}.</span>
                    {option.text}
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          <button
            type="button"
            disabled={!selectedOption || savingResult}
            onClick={submitCurrentQuizAnswer}
            className="mt-6 rounded-xl bg-primary-sky px-5 py-3 text-sm font-bold text-slate-900 shadow-[0_0_10px_rgba(56,189,248,0.4)] disabled:opacity-60 hover:bg-white hover:shadow-[0_0_15px_rgba(255,255,255,0.6)] transition-all"
          >
            {quizIndex + 1 < storySession.quizQuestions.length ? "Next Question" : "Finish Story Quiz"}
          </button>

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
        </section>
      )}

      {stage === "result" && storySession && (
        <section className="glass-panel p-8 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)] text-center">
          <h2 className="cyber-text-subtle font-black text-3xl text-accent-pink drop-shadow-md">STORY COMPLETE</h2>
          <p className="mt-3 text-lg text-slate-200">
            You answered <span className="text-primary-sky font-bold drop-shadow-[0_0_5px_rgba(56,189,248,0.5)]">{finalCorrect} / {storySession.quizQuestions.length}</span> correctly.
          </p>
          <p className="mt-1 text-slate-400 font-bold">XP earned: <span className="text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]">{finalCorrect * 20}</span></p>

          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              onClick={restartStoryMode}
              className="rounded-xl border border-slate-600 bg-slate-800/80 px-5 py-3 text-sm font-bold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              Create New Story
            </button>
            <Link href="/profile" className="rounded-xl bg-primary-sky px-5 py-3 text-sm font-bold text-slate-900 shadow-[0_0_10px_rgba(56,189,248,0.4)] hover:bg-white hover:shadow-[0_0_15px_rgba(255,255,255,0.6)] transition-all">
              View Quiz History
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
