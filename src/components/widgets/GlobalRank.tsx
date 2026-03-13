import { BentoBox } from "../BentoBox";
import { Trophy } from "lucide-react";

export function GlobalRank() {
  const rankNumber = 1337;
  const percentile = "Top 5%";

  return (
    <BentoBox className="flex flex-col justify-between p-6 group">
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
          <Trophy size={20} />
        </div>
        <div className="text-right">
          <span className="text-sm text-white/50 font-medium tracking-wide uppercase">Rank</span>
          <div className="text-3xl font-black text-white">#{rankNumber.toLocaleString()}</div>
        </div>
      </div>

      <div className="mt-6 flex items-end justify-between">
        <div>
          <span className="text-xs text-white/50 block mb-1 uppercase tracking-widest">Standing</span>
          <span className="text-sm font-semibold text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]">
            {percentile}
          </span>
        </div>
        
        {/* Decorative mini bar chart */}
        <div className="flex items-end gap-1 opacity-50 h-8">
          <div className="w-1.5 h-3 bg-white/20 rounded-full" />
          <div className="w-1.5 h-5 bg-white/20 rounded-full" />
          <div className="w-1.5 h-4 bg-white/20 rounded-full" />
          <div className="w-1.5 h-8 bg-emerald-500 rounded-full" />
        </div>
      </div>
    </BentoBox>
  );
}
