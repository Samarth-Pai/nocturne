import { QuizArena } from "@/components/arena/QuizArena";

export default function ArenaPage() {
  return (
    <div className="flex w-full pt-8 min-h-screen">
      <main className="flex-1 overflow-y-auto px-4 lg:px-8 mt-10">
        <QuizArena />
      </main>
    </div>
  );
}
