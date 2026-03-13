import { BentoBox } from "../BentoBox";
import { Flame } from "lucide-react";

export function DailyStreak() {
  const streak = 14;

  return (
    <BentoBox className="flex flex-col items-center justify-center p-6 bg-gradient-to-t from-orange-500/10 to-transparent group">
      <div className="relative mb-2 mt-4 text-orange-400 group-hover:text-orange-300 transition-colors animate-flicker">
        <Flame size={48} fill="currentColor" />
        <div className="absolute inset-0 bg-orange-500/30 blur-xl rounded-full" />
      </div>

      <div className="text-center mt-2">
        <span className="text-4xl font-black text-white tracking-tighter shadow-sm">
          {streak}
        </span>
        <h3 className="text-xs uppercase tracking-widest text-orange-300 font-semibold mt-1">
          Day Streak
        </h3>
      </div>
    </BentoBox>
  );
}
