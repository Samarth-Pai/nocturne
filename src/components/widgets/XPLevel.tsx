import { BentoBox } from "../BentoBox";
import { Star } from "lucide-react";

export function XPLevel() {
  const level = 42;
  const xpCurrent = 8450;
  const xpNext = 10000;
  const progressPercent = (xpCurrent / xpNext) * 100;

  return (
    <BentoBox className="flex flex-col justify-between p-6">
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
          <Star size={20} />
        </div>
        <div className="text-right">
          <span className="text-sm text-white/50 font-medium tracking-wide uppercase">Level</span>
          <div className="text-3xl font-black text-white">{level}</div>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex justify-between text-xs font-mono text-white/50 mb-2">
          <span>{xpCurrent.toLocaleString()} XP</span>
          <span>{xpNext.toLocaleString()} XP</span>
        </div>
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </BentoBox>
  );
}
