import { Leaderboard } from "@/components/Leaderboard";

export default function LeaderboardPage() {
  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col items-center">
      
      {/* Header section */}
      <div className="w-full flex justify-between items-center mb-8 relative z-10">
        <div>
          <h1 className="cyber-text-subtle text-3xl md:text-4xl text-white tracking-tight drop-shadow-md">
            GLOBAL <span className="text-primary-sky drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]">LEADERBOARD</span>
          </h1>
          <p className="text-slate-300 font-medium mt-1">See how you stack up against the top learners.</p>
        </div>
      </div>

      <Leaderboard />

      {/* Decorative background blobs */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-primary-sky/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-primary-teal/5 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}
