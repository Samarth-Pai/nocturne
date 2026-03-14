"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { io, type Socket } from "socket.io-client";
import { DuelOverlay } from "./DuelOverlay";
import { QuestionCard, type QuestionData } from "./QuestionCard";

type DuelStage = "lobby" | "waiting" | "playing" | "awaiting-result" | "finished";

interface AuthUser {
  id: string;
  name: string;
}

interface DuelResult {
  duelId: string;
  status: string;
  winnerId: string | null;
  bountyXpAwarded: number;
  participants: Array<{
    userId: string;
    score: number;
    totalQuestions: number;
    currentQuestion: number;
    finished: boolean;
  }>;
}

export function DuelArena() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [duelId, setDuelId] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [stage, setStage] = useState<DuelStage>("lobby");
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [opponentProgress, setOpponentProgress] = useState(0);
  const [result, setResult] = useState<DuelResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const duelIdRef = useRef<string | null>(null);

  const totalQuestions = questions.length;

  const userProgress = useMemo(() => {
    if (totalQuestions === 0) {
      return 0;
    }

    if (stage === "finished") {
      return 100;
    }

    return Math.round((currentIndex / totalQuestions) * 100);
  }, [currentIndex, stage, totalQuestions]);

  useEffect(() => {
    let active = true;
    let localSocket: Socket | null = null;

    async function bootstrap() {
      const token = localStorage.getItem("levelup_token");
      const authResponse = await fetch("/api/auth/me", {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (!authResponse.ok) {
        throw new Error("Please sign in to play duels.");
      }

      const authData = (await authResponse.json()) as { user: AuthUser };

      const questionsResponse = await fetch("/api/questions?limit=3", {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (!questionsResponse.ok) {
        throw new Error("Unable to load duel questions.");
      }

      const questionsData = (await questionsResponse.json()) as { questions: QuestionData[] };

      await fetch("/api/socket");

      const socketInstance = io({ path: "/api/socket" });
      localSocket = socketInstance;

      socketInstance.on("duel:ready", (payload: { duelId: string }) => {
        if (payload.duelId !== duelIdRef.current) {
          return;
        }

        setStage("playing");
      });

      socketInstance.on(
        "duel:progress",
        (payload: { duelId: string; userId: string; currentQuestion: number; totalQuestions: number }) => {
          if (!authData.user || payload.userId === authData.user.id || payload.duelId !== duelIdRef.current) {
            return;
          }

          const progress = Math.min(100, Math.round((payload.currentQuestion / Math.max(1, payload.totalQuestions)) * 100));
          setOpponentProgress(progress);
        },
      );

      socketInstance.on("duel:result", (payload: DuelResult) => {
        if (payload.duelId !== duelIdRef.current) {
          return;
        }

        setResult(payload);
        setStage("finished");
      });

      if (!active) {
        socketInstance.disconnect();
        return;
      }

      setAuthUser(authData.user);
      setQuestions(questionsData.questions);
      setSocket(socketInstance);
      setLoading(false);
    }

    bootstrap().catch((err: unknown) => {
      if (!active) {
        return;
      }

      setError(err instanceof Error ? err.message : "Unable to initialize duel mode.");
      setLoading(false);
    });

    return () => {
      active = false;
      localSocket?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socket || !duelId || !authUser) {
      return;
    }

    socket.emit("duel:join", { duelId, userId: authUser.id });

    return () => {
      socket.emit("duel:leave", { duelId, userId: authUser.id });
    };
  }, [socket, duelId, authUser]);

  async function createRoom(): Promise<void> {
    setError(null);
    const token = localStorage.getItem("levelup_token");

    const response = await fetch("/api/duel/room/create", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    const data = (await response.json()) as { duelId?: string; error?: string };

    if (!response.ok || !data.duelId) {
      setError(data.error ?? "Unable to create room.");
      return;
    }

    setDuelId(data.duelId);
    duelIdRef.current = data.duelId;
    setStage("waiting");
  }

  async function startDuel(): Promise<void> {
    setError(null);
    const token = localStorage.getItem("levelup_token");

    const response = await fetch("/api/duel/room/join", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    const data = (await response.json()) as { duelId?: string; error?: string };

    if (!response.ok || !data.duelId) {
      setError(data.error ?? "No waiting room is available.");
      return;
    }

    setDuelId(data.duelId);
    duelIdRef.current = data.duelId;
    setStage("playing");
  }

  function onAnswerSelected(isCorrect: boolean): void {
    if (isCorrect) {
      setScore((current) => current + 10);
    }
  }

  async function onNext(): Promise<void> {
    if (!duelId || !authUser) {
      return;
    }

    const token = localStorage.getItem("levelup_token");
    const nextIndex = currentIndex + 1;

    await fetch("/api/duel/progress", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        duelId,
        currentQuestion: nextIndex,
        totalQuestions,
        score,
      }),
    });

    if (nextIndex < totalQuestions) {
      setCurrentIndex(nextIndex);
      return;
    }

    const finishResponse = await fetch("/api/duel/finish", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        duelId,
        score,
        totalQuestions,
      }),
    });

    if (!finishResponse.ok) {
      setError("Unable to finalize duel result.");
      setStage("awaiting-result");
      return;
    }

    const finishData = (await finishResponse.json()) as DuelResult;

    if (finishData.status === "completed") {
      setResult(finishData);
      setStage("finished");
      return;
    }

    setStage("awaiting-result");
  }

  function resetState(): void {
    setDuelId(null);
    setStage("lobby");
    setCurrentIndex(0);
    setScore(0);
    setOpponentProgress(0);
    setResult(null);
    setError(null);
    duelIdRef.current = null;
  }

  if (loading) {
    return (
      <div className="glass-panel w-full max-w-3xl mx-auto p-8 text-center">
        <h2 className="cyber-text-subtle text-2xl font-bold text-white">Loading Duel Arena...</h2>
      </div>
    );
  }

  if (error && stage === "lobby") {
    return (
      <div className="glass-panel w-full max-w-3xl mx-auto p-8 text-center border-rose-500/30">
        <h2 className="cyber-text-subtle text-2xl font-bold text-rose-400">Duel unavailable</h2>
        <p className="mt-2 text-rose-300">{error}</p>
      </div>
    );
  }

  const myResult = result?.participants.find((p) => p.userId === authUser?.id);
  const opponentResult = result?.participants.find((p) => p.userId !== authUser?.id);
  const currentQuestion = stage === "playing" ? questions[currentIndex] : null;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-8 py-8">
      {(stage === "playing" || stage === "finished") && (
        <DuelOverlay userProgress={userProgress} opponentProgress={opponentProgress} />
      )}

      {stage === "lobby" && (
        <div className="glass-panel p-8 text-center">
          <h1 className="cyber-text text-3xl md:text-4xl mb-2">DUEL ROOMS</h1>
          <p className="mt-2 text-slate-400">Create a room, then a second player clicks Start Duel to match and begin.</p>
          {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={createRoom}
              className="rounded-xl bg-gradient-to-r from-accent-purple to-accent-pink px-6 py-3 text-sm font-bold text-white shadow-[0_0_15px_rgba(139,92,246,0.4)] hover:opacity-90 transition-opacity"
            >
              Create Room
            </button>
            <button
              type="button"
              onClick={startDuel}
              className="rounded-xl border border-primary-sky/50 bg-primary-sky/10 px-6 py-3 text-sm font-bold text-primary-sky hover:bg-primary-sky hover:text-slate-900 shadow-[0_0_10px_rgba(56,189,248,0.2)] hover:shadow-[0_0_20px_rgba(56,189,248,0.5)] transition-all"
            >
              Start Duel
            </button>
          </div>
        </div>
      )}

      {stage === "waiting" && (
        <div className="glass-panel p-8 text-center border-primary-sky/30">
          <h2 className="cyber-text-subtle text-2xl font-black text-primary-sky">ROOM CREATED</h2>
          <p className="mt-3 text-slate-300 font-mono text-sm">Room ID: <span className="text-white font-bold">{duelId}</span></p>
          <p className="mt-2 text-slate-400">Waiting for second player to click Start Duel...</p>
          <div className="mt-4 flex justify-center">
            <span className="inline-block w-2 h-2 bg-primary-sky rounded-full animate-ping" />
          </div>
          <button
            type="button"
            onClick={resetState}
            className="mt-5 rounded-xl border border-slate-600 bg-slate-800/50 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {stage === "awaiting-result" && (
        <div className="glass-panel p-8 text-center">
          <h2 className="cyber-text-subtle text-2xl font-black text-accent-orange">WAITING FOR OPPONENT</h2>
          <p className="mt-2 text-slate-400">You finished. Final result will appear when the opponent completes the duel.</p>
          <div className="mt-4 flex justify-center gap-2">
            {[0,1,2].map(i => (
              <span key={i} className="inline-block w-2 h-2 bg-accent-orange rounded-full animate-ping" style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {currentQuestion && (
          <QuestionCard
            key={currentQuestion.id}
            data={currentQuestion}
            onAnswerSelected={(isCorrect, _event) => onAnswerSelected(isCorrect)}
            onNext={onNext}
          />
        )}

        {stage === "finished" && (
          <motion.div
            key="duel-result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-8"
          >
            <h2 className="cyber-text text-2xl md:text-3xl mb-2">
              {result?.winnerId
                ? result.winnerId === authUser?.id ? "VICTORY" : "DEFEATED"
                : "DRAW"}
            </h2>
            <p className="text-slate-300 mt-2">
              {result?.winnerId
                ? result.winnerId === authUser?.id
                  ? <span className="text-yellow-400 font-bold">+{result.bountyXpAwarded} bounty XP earned!</span>
                  : "Better luck next time."
                : "Perfectly matched opponents."}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-slate-800/60 border border-primary-sky/30 p-4 text-center">
                <p className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-1">You</p>
                <p className="text-3xl font-black text-primary-sky drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]">{myResult?.score ?? score}</p>
                <p className="text-xs text-slate-500 mt-1">XP</p>
              </div>
              <div className="rounded-2xl bg-slate-800/60 border border-accent-pink/30 p-4 text-center">
                <p className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-1">Opponent</p>
                <p className="text-3xl font-black text-accent-pink drop-shadow-[0_0_8px_rgba(236,72,153,0.5)]">{opponentResult?.score ?? 0}</p>
                <p className="text-xs text-slate-500 mt-1">XP</p>
              </div>
            </div>

            <button
              type="button"
              onClick={resetState}
              className="mt-6 rounded-xl border border-accent-purple/50 bg-accent-purple/10 px-6 py-3 text-sm font-bold text-white hover:bg-accent-purple/20 hover:shadow-[0_0_15px_rgba(139,92,246,0.4)] transition-all"
            >
              Back to Duel Lobby
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
