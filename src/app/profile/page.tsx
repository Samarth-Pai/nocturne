"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Award, Clock, Star, Settings } from "lucide-react";
import { AvatarDisplay } from "@/components/dashboard/AvatarDisplay";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  streak: {
    count: number;
    lastActive: string | null;
  };
  gamification: {
    xp: number;
    level: number;
    streak: {
      count: number;
      lastActive: string | null;
    };
  };
}

interface QuizAttempt {
  _id: string;
  subject: string;
  subjectSlug: string;
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  accuracy: number;
  createdAt: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("levelup_token");

    fetch("/api/auth/me", {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
      .then(async (response) => {
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { user: AuthUser };
        setUser(data.user);
      })
      .catch(() => undefined);

    fetch("/api/quiz/history", {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
      .then(async (response) => {
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { attempts: QuizAttempt[] };
        setAttempts(data.attempts ?? []);
      })
      .catch(() => undefined);
  }, []);

  const userData = {
    level: user?.gamification?.level ?? 1,
    xp: user?.gamification?.xp ?? 0,
    maxXp: 5000,
    streak: user?.streak?.count ?? 0,
  };

  const averageAccuracy = useMemo(() => {
    if (attempts.length === 0) {
      return 0;
    }

    const sum = attempts.reduce((acc, attempt) => acc + attempt.accuracy, 0);
    return Math.round(sum / attempts.length);
  }, [attempts]);

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col items-center"
        >
          <div className="mb-6">
            <AvatarDisplay data={userData} />
          </div>
          <h1 className="text-2xl font-black text-slate-800 font-heading">{user?.name ?? "Learner"}</h1>
          <p className="text-slate-500 font-medium">{user?.email ?? "Student"}</p>

          <div className="w-full h-px bg-slate-100 my-8" />

          <div className="w-full space-y-4">
            <div className="flex items-center justify-between text-sm font-bold text-slate-500">
              <span className="flex items-center gap-2"><Award size={18} /> XP</span>
              <span className="text-primary-sky">{user?.gamification?.xp ?? 0}</span>
            </div>
            <div className="flex items-center justify-between text-sm font-bold text-slate-500">
              <span className="flex items-center gap-2"><Clock size={18} /> Daily Streak</span>
              <span className="text-primary-teal">{user?.streak?.count ?? 0}</span>
            </div>
            <div className="flex items-center justify-between text-sm font-bold text-slate-500">
              <span className="flex items-center gap-2"><Star size={18} /> Quiz Attempts</span>
              <span className="text-accent-purple">{attempts.length}</span>
            </div>
          </div>

          <button className="mt-8 w-full py-3 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2">
            <Settings size={18} />
            Edit Profile
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 space-y-8"
        >
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 mb-6 font-heading">Performance Summary</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl">
                <span className="text-sm font-bold text-slate-500 block mb-1">ACCURACY</span>
                <span className="text-3xl font-black text-primary-sky">{averageAccuracy}%</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl">
                <span className="text-sm font-bold text-slate-500 block mb-1">CURRENT STREAK</span>
                <span className="text-3xl font-black text-accent-orange">{user?.streak?.count ?? 0} Days</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 mb-6 font-heading">Quiz Attempt History</h2>
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {attempts.length === 0 && (
                <p className="text-sm text-slate-500">No quiz attempts yet. Start with Practice Arena.</p>
              )}

              {attempts.map((attempt) => (
                <div key={attempt._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <p className="font-bold text-slate-800">{attempt.subject}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(attempt.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-primary-sky">{attempt.score} XP</p>
                      <p className="text-xs text-slate-500">{attempt.correctAnswers}/{attempt.totalQuestions} correct</p>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">Accuracy: {attempt.accuracy}%</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
