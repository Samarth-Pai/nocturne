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
        <h1 className="font-heading font-black text-3xl md:text-4xl text-slate-800 tracking-tight">
          Story <span className="text-primary-sky">Mode</span>
        </h1>
        <p className="mt-2 text-slate-600">
          Upload PDF or text. Learn each generated topic with image cards, then finish a 5-question quiz.
        </p>
      </div>

      {stage === "upload" && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject (e.g. Operating Systems)"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-primary-sky"
            />
            <input
              value={subjectSlug}
              onChange={(e) => setSubjectSlug(e.target.value)}
              placeholder="Subject Slug (optional)"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-primary-sky"
            />
          </div>

          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Paste your source text here (optional if uploading file)..."
            className="mt-4 h-36 w-full rounded-xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-primary-sky"
          />

          <div className="mt-4 rounded-xl border border-dashed border-slate-300 p-4 bg-slate-50">
            <input
              type="file"
              accept=".pdf,.txt"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-slate-700"
            />
            {file && <p className="mt-2 text-sm text-slate-500">Selected: {file.name}</p>}
          </div>

          {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}

          <button
            type="button"
            onClick={createStorySession}
            disabled={!canSubmitUpload || creating}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
          >
            {creating && <Loader2 size={16} className="animate-spin" />}
            {creating ? "Generating Story..." : "Generate Story Mode"}
          </button>

          <div className="mt-8 border-t border-slate-200 pt-5">
            <h3 className="font-heading font-bold text-lg text-slate-800">Saved Stories</h3>
            <p className="text-sm text-slate-500 mt-1">Re-attempt previously generated stories anytime.</p>

            {loadingSavedStories && <p className="text-sm text-slate-500 mt-3">Loading saved stories...</p>}

            {!loadingSavedStories && savedStories.length === 0 && (
              <p className="text-sm text-slate-500 mt-3">No stories yet. Generate your first one above.</p>
            )}

            {!loadingSavedStories && savedStories.length > 0 && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {savedStories.map((item) => (
                  <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="font-bold text-slate-800">{item.subject}</p>
                    <p className="text-xs mt-1 text-slate-500">{item.topicCount} topics • {item.quizCount} quiz questions</p>
                    <p className="text-xs mt-1 text-slate-500">
                      {new Date(item.createdAt).toLocaleString()} • {item.sourceType.toUpperCase()}
                    </p>
                    <button
                      type="button"
                      onClick={() => openSavedStory(item.id)}
                      disabled={loadingStoryId === item.id}
                      className="mt-3 rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white disabled:opacity-60"
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
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Topic {topicIndex + 1} of {storySession.topics.length}
          </p>
          <h2 className="mt-2 font-heading font-black text-2xl text-slate-800">{currentTopic.topic}</h2>

          {currentTopic.imagePath ? (
            <Image
              src={currentTopic.imagePath}
              alt={`Illustration for ${currentTopic.topic}`}
              width={1200}
              height={900}
              className="mt-4 w-full max-h-105 object-contain rounded-2xl border border-slate-200 bg-slate-50"
            />
          ) : (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-8 text-sm text-slate-500">
              Image unavailable for this topic.
            </div>
          )}

          <p className="mt-5 text-slate-700 leading-7 whitespace-pre-wrap">{currentTopic.explanation}</p>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={goToNextTopic}
              className="rounded-xl bg-primary-sky px-5 py-3 text-sm font-bold text-white"
            >
              {topicIndex + 1 < storySession.topics.length ? "Next Topic" : "Start 5-Question Quiz"}
            </button>
          </div>
        </motion.section>
      )}

      {stage === "quiz" && storySession && currentQuizQuestion && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-center">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Quiz {quizIndex + 1} / {storySession.quizQuestions.length}
            </p>
            <p className="text-xs font-bold text-primary-sky">{quizProgress}%</p>
          </div>

          <div
            className={`mt-3 h-2 rounded-full bg-slate-100 overflow-hidden transition-all ${isGlow ? "shadow-[0_0_14px_rgba(56,189,248,0.8)]" : ""}`}
          >
            <div className="h-full bg-primary-sky transition-all" style={{ width: `${quizProgress}%` }} />
          </div>

          <p className="mt-4 text-xs text-slate-500 font-bold uppercase tracking-wide">Combo: x{Math.max(1, currentCombo)}</p>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuizQuestion.id}
              initial={{ opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -28 }}
              transition={{ duration: 0.22 }}
            >
              <p className="mt-5 text-sm font-bold text-slate-500 uppercase tracking-wide">{currentQuizQuestion.topic}</p>
              <h2 className="mt-2 font-heading font-bold text-2xl text-slate-800">{currentQuizQuestion.question}</h2>

              <div className="mt-5 grid grid-cols-1 gap-3">
                {currentQuizQuestion.options.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setSelectedOption(option.id)}
                    className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors ${
                      selectedOption === option.id
                        ? "border-primary-sky bg-primary-sky/10 text-slate-900"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span className="mr-2 font-bold uppercase">{option.id}.</span>
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
            className="mt-6 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
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
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm text-center">
          <h2 className="font-heading font-black text-3xl text-slate-800">Story Complete</h2>
          <p className="mt-3 text-lg text-slate-700">
            You answered {finalCorrect} / {storySession.quizQuestions.length} correctly.
          </p>
          <p className="mt-1 text-slate-500">XP earned: {finalCorrect * 20}</p>

          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              onClick={restartStoryMode}
              className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700"
            >
              Create New Story
            </button>
            <Link href="/profile" className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white">
              View Quiz History
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
