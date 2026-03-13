import { BentoBox } from "../BentoBox";
import { BookOpen, ChevronRight, PlayCircle } from "lucide-react";

export function CurrentLearningPath() {
  const currentChapter = "Chapter 4: The Array Awakening";
  const progressText = "75% Complete";
  const progressPercent = 75;

  return (
    <BentoBox className="col-span-1 md:col-span-2 lg:col-span-3 row-span-2 flex flex-col justify-between py-6 group relative overflow-hidden">
      
      {/* Decorative Blur */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold tracking-wide uppercase text-xs">
            <BookOpen size={16} />
            <h2>Story Mode</h2>
          </div>
          <span className="text-white/50 text-xs font-mono">{progressText}</span>
        </div>
        <h3 className="text-2xl font-bold text-white mt-1 group-hover:text-indigo-300 transition-colors">
          {currentChapter}
        </h3>
        <p className="text-sm text-white/70 mt-3 max-w-md">
          Master the fundamentals of data structures to unlock the gates of the Silicon Citadel. The journey continues...
        </p>
      </div>

      <div className="mt-8">
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        
        <button className="flex items-center justify-center gap-2 w-full md:w-auto bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-medium transition-all group-hover:shadow-[0_0_20px_rgba(99,102,241,0.3)]">
          <PlayCircle size={18} />
          Continue Quest
          <ChevronRight size={16} className="opacity-50 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
        </button>
      </div>

    </BentoBox>
  );
}
