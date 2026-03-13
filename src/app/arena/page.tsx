import { QuizArena } from "@/components/arena/QuizArena";
import { Sidebar } from "@/components/Sidebar";

export default function ArenaPage() {
  return (
    <div className="flex h-screen w-full p-4 lg:p-8 gap-4 lg:gap-8 overflow-hidden z-10 relative">
      {/* 
        In a purely distraction-free mode we might hide the sidebar entirely.
        Here we keep it but it could be toggled off. 
      */}
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto pr-4 custom-scrollbar flex items-center justify-center">
        <QuizArena />
      </main>
    </div>
  );
}
