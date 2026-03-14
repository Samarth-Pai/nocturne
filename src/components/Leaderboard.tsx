"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Award, Sparkles } from "lucide-react";
import Image from "next/image";

interface LeaderboardUser {
  rank: number;
  userId: string;
  username: string;
  level: number;
  xp: number;
  avatarId?: string;
  avatarUrl?: string;
}

export function Leaderboard() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);

  useEffect(() => {
    const loadLeaderboard = () => {
      fetch("/api/leaderboard", { cache: "no-store" })
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
    };

    const onAvatarUpdated = () => {
      loadLeaderboard();
    };

    loadLeaderboard();
    window.addEventListener("avatar-updated", onAvatarUpdated);

    return () => {
      window.removeEventListener("avatar-updated", onAvatarUpdated);
    };
  }, []);

  const topThree = useMemo(() => users.slice(0, 3), [users]);

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
        return "bg-slate-800/90 border-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.3)] z-10 scale-[1.02]";
      case 2:
        return "bg-slate-800/80 border-slate-400 shadow-[0_0_15px_rgba(148,163,184,0.2)]";
      case 3:
        return "bg-slate-800/80 border-orange-400 shadow-[0_0_15px_rgba(251,146,60,0.2)]";
      default:
        return "bg-slate-900/40 border-slate-700/50 hover:bg-slate-800/60 transition-colors";
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
            <div className="w-20 h-20 rounded-full border-4 border-slate-400 shadow-[0_0_15px_rgba(148,163,184,0.3)] overflow-hidden bg-slate-800 relative">
              <Image
                src={topThree[1].avatarUrl ?? "/avatar.png"}
                alt={`${topThree[1].username} avatar`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
            <div className="w-24 h-28 bg-gradient-to-t from-slate-700 to-slate-800 rounded-t-xl border border-slate-600 shadow-inner flex flex-col items-center justify-start pt-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-white/5" />
              <span className="font-heading font-black text-4xl text-slate-300 opacity-80 relative z-10 drop-shadow-[0_0_5px_rgba(203,213,225,0.5)]">2</span>
            </div>
            <div className="absolute -bottom-10 text-center w-full">
              <p className="font-bold text-slate-100 truncate drop-shadow-md">{topThree[1].username}</p>
              <p className="text-xs text-primary-sky font-medium">{topThree[1].xp} XP</p>
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
            <div className="w-24 h-24 rounded-full border-4 border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.5)] overflow-hidden bg-white relative">
              <Image
                src={topThree[0].avatarUrl ?? "/avatar.png"}
                alt={`${topThree[0].username} avatar`}
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>
            <div className="w-28 h-40 bg-gradient-to-t from-yellow-600/50 to-yellow-400/20 rounded-t-xl border border-yellow-500 shadow-inner flex flex-col items-center justify-start pt-4 relative overflow-hidden">
              <div className="absolute top-0 w-full h-1/2 bg-gradient-to-b from-yellow-300/20 to-transparent" />
              <span className="font-heading font-black text-6xl text-yellow-400 opacity-90 relative z-10 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]">1</span>
            </div>
            <div className="absolute -bottom-10 text-center w-full">
              <p className="font-bold text-white truncate text-lg drop-shadow-md">{topThree[0].username}</p>
              <p className="text-sm text-yellow-400 font-bold drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]">{topThree[0].xp} XP</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col items-center gap-3 relative"
          >
            <div className="w-20 h-20 rounded-full border-4 border-orange-400 shadow-[0_0_15px_rgba(251,146,60,0.3)] overflow-hidden bg-slate-800 relative">
              <Image
                src={topThree[2].avatarUrl ?? "/avatar.png"}
                alt={`${topThree[2].username} avatar`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
            <div className="w-24 h-24 bg-gradient-to-t from-orange-600/50 to-orange-400/20 rounded-t-xl border border-orange-500 shadow-inner flex flex-col items-center justify-start pt-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-white/5" />
              <span className="font-heading font-black text-4xl text-orange-400 opacity-80 relative z-10 drop-shadow-[0_0_5px_rgba(251,146,60,0.5)]">3</span>
            </div>
            <div className="absolute -bottom-10 text-center w-full">
              <p className="font-bold text-slate-100 truncate drop-shadow-md">{topThree[2].username}</p>
              <p className="text-xs text-primary-sky font-medium">{topThree[2].xp} XP</p>
            </div>
          </motion.div>
        </div>
      )}

      <div className="glass-panel p-6 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)] mt-8">
        <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-slate-700/50 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          <div className="col-span-2 md:col-span-1">Rank</div>
          <div className="col-span-6 md:col-span-5">Learner</div>
          <div className="col-span-2 hidden md:block text-center">Level</div>
          <div className="col-span-4 text-right">XP Earned</div>
        </div>

        <div className="flex flex-col gap-3">
          {users.length === 0 && (
            <div className="p-4 rounded-xl bg-slate-800/50 text-sm text-slate-400 border border-slate-700/50">
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
                <div className="w-10 h-10 rounded-full border-2 border-slate-500 shadow-sm overflow-hidden bg-slate-800 relative">
                  <Image
                    src={user.avatarUrl ?? "/avatar.png"}
                    alt={`${user.username} avatar`}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
                <span className="font-bold text-slate-100">{user.username}</span>
              </div>

              <div className="col-span-2 hidden md:flex justify-center">
                <span className="font-bold text-slate-300 bg-slate-700/80 px-3 py-1 rounded-full text-sm border border-slate-600">{user.level}</span>
              </div>

              <div className="col-span-4 flex justify-end">
                <span className="font-bold text-primary-sky drop-shadow-[0_0_5px_rgba(56,189,248,0.4)]">{user.xp.toLocaleString()}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
