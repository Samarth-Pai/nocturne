import { QuizArena } from "@/components/arena/QuizArena";
import { Suspense } from "react";

export default function ArenaPage() {
  return (
    <div className="flex w-full pt-8 min-h-screen">
      <main className="flex-1 overflow-y-auto px-4 lg:px-8 mt-10">
        <Suspense
          fallback={
            <div className="w-full max-w-3xl mx-auto rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <h2 className="font-heading text-2xl font-bold text-slate-800">Loading Practice Quiz...</h2>
            </div>
          }
        >
          <QuizArena />
        </Suspense>
      </main>
    </div>
  );
}
