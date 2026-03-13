"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Award, Sparkles } from "lucide-react";

interface LeaderboardUser {
  rank: number;
  userId: string;
  username: string;
  level: number;
  xp: number;
}

const avatarGradients = [
  "from-yellow-400 to-orange-500",
  "from-slate-300 to-slate-500",
  "from-amber-600 to-orange-700",
  "from-primary-sky to-primary-teal",
  "from-accent-purple to-pink-500",
  "from-emerald-400 to-teal-500",
  "from-rose-400 to-red-500",
];

export function Leaderboard() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then(async (response) => {
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { leaderboard: LeaderboardUser[] };
        setUsers(data.leaderboard ?? []);
      })
      .catch(() => {
        setUsers([]);
      });
  }, []);

  const topThree = useMemo(() => users.slice(0, 3), [users]);

  const getAvatarGradient = (index: number) => avatarGradients[index % avatarGradients.length];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="text-yellow-500" size={24} />;
      case 2:
        return <Medal className="text-slate-400" size={24} />;
      case 3:
        return <Award className="text-amber-600" size={24} />;
      default:
        return <span className="font-heading font-bold text-slate-400 w-6 text-center">{rank}</span>;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-50 border-yellow-200 shadow-[0_0_15px_rgba(234,179,8,0.2)] z-10 scale-[1.02]";
      case 2:
        return "bg-slate-50 border-slate-200";
      case 3:
        return "bg-orange-50 border-orange-200";
      default:
        return "bg-white border-slate-100 hover:bg-slate-50";
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
      {topThree.length >= 3 && (
        <div className="flex justify-center items-end gap-4 md:gap-8 h-64 mb-12 mt-8">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center gap-3 relative"
          >
            <div className={`w-20 h-20 rounded-full border-4 border-white shadow-lg bg-gradient-to-br ${getAvatarGradient(1)}`} />
            <div className="w-24 h-28 bg-gradient-to-t from-slate-200 to-slate-100 rounded-t-xl border border-slate-300 shadow-inner flex flex-col items-center justify-start pt-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-white/20" />
              <span className="font-heading font-black text-4xl text-slate-400 opacity-50 relative z-10">2</span>
            </div>
            <div className="absolute -bottom-10 text-center w-full">
              <p className="font-bold text-slate-700 truncate">{topThree[1].username}</p>
              <p className="text-xs text-primary-teal font-medium">{topThree[1].xp} XP</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex flex-col items-center gap-3 relative"
          >
            <div className="absolute -top-6 text-yellow-500 animate-bounce">
              <Sparkles size={24} />
            </div>
            <div className={`w-24 h-24 rounded-full border-4 border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.5)] bg-gradient-to-br ${getAvatarGradient(0)}`} />
            <div className="w-28 h-40 bg-gradient-to-t from-yellow-300 to-yellow-100 rounded-t-xl border border-yellow-400 shadow-inner flex flex-col items-center justify-start pt-4 relative overflow-hidden">
              <div className="absolute top-0 w-full h-1/2 bg-gradient-to-b from-white/40 to-transparent" />
              <span className="font-heading font-black text-6xl text-yellow-600 opacity-50 relative z-10">1</span>
            </div>
            <div className="absolute -bottom-10 text-center w-full">
              <p className="font-bold text-slate-800 truncate text-lg">{topThree[0].username}</p>
              <p className="text-sm text-primary-sky font-bold">{topThree[0].xp} XP</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col items-center gap-3 relative"
          >
            <div className={`w-20 h-20 rounded-full border-4 border-white shadow-lg bg-gradient-to-br ${getAvatarGradient(2)}`} />
            <div className="w-24 h-24 bg-gradient-to-t from-orange-200 to-orange-100 rounded-t-xl border border-orange-300 shadow-inner flex flex-col items-center justify-start pt-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-white/20" />
              <span className="font-heading font-black text-4xl text-orange-400 opacity-50 relative z-10">3</span>
            </div>
            <div className="absolute -bottom-10 text-center w-full">
              <p className="font-bold text-slate-700 truncate">{topThree[2].username}</p>
              <p className="text-xs text-primary-teal font-medium">{topThree[2].xp} XP</p>
            </div>
          </motion.div>
        </div>
      )}

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mt-8">
        <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          <div className="col-span-2 md:col-span-1">Rank</div>
          <div className="col-span-6 md:col-span-5">Learner</div>
          <div className="col-span-2 hidden md:block text-center">Level</div>
          <div className="col-span-4 text-right">XP Earned</div>
        </div>

        <div className="flex flex-col gap-3">
          {users.length === 0 && (
            <div className="p-4 rounded-xl bg-slate-50 text-sm text-slate-500 border border-slate-200">
              No users found in leaderboard yet.
            </div>
          )}

          {users.map((user, index) => (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.06 }}
              key={user.userId}
              className={`grid grid-cols-12 gap-4 items-center p-4 rounded-2xl border transition-all ${getRankBg(user.rank)}`}
            >
              <div className="col-span-2 md:col-span-1 flex justify-center">{getRankIcon(user.rank)}</div>

              <div className="col-span-6 md:col-span-5 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full border-2 border-white shadow-sm bg-gradient-to-br ${getAvatarGradient(index)}`} />
                <span className="font-bold text-slate-700">{user.username}</span>
              </div>

              <div className="col-span-2 hidden md:flex justify-center">
                <span className="font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full text-sm">{user.level}</span>
              </div>

              <div className="col-span-4 flex justify-end">
                <span className="font-bold text-primary-sky">{user.xp.toLocaleString()}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
