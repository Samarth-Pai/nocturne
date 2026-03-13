import { DuelArena } from "@/components/arena/DuelArena";

export default function DuelPage() {
  return (
    <div className="flex w-full pt-8 min-h-screen">
      <main className="flex-1 overflow-y-auto px-4 lg:px-8 mt-10">
        <DuelArena />
      </main>
    </div>
  );
}
