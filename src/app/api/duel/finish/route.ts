import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getAuthUserFromRequest } from "@/lib/auth";
import { DuelModel, UserModel } from "@/lib/models";
import { getIOServer } from "@/lib/socket";

const WIN_BOUNTY_XP = 50;

interface DuelParticipantSnapshot {
  userId: string;
  score: number;
  updatedAt: Date;
}

function resolveWinner(participants: DuelParticipantSnapshot[]): string | null {
  if (participants.length === 0) {
    return null;
  }

  const sorted = [...participants].sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }

    return a.updatedAt.getTime() - b.updatedAt.getTime();
  });

  if (!sorted[1]) {
    return sorted[0].userId;
  }

  if (sorted[0].score === sorted[1].score) {
    return null;
  }

  return sorted[0].userId;
}

export async function POST(request: Request): Promise<NextResponse> {
  const authUser = await getAuthUserFromRequest(request);
  if (!authUser) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    duelId?: string;
    score?: number;
    totalQuestions?: number;
  };

  if (!body.duelId) {
    return NextResponse.json({ error: "duelId is required" }, { status: 400 });
  }

  await connectToDatabase();

  const duel = await DuelModel.findOne({ duelId: body.duelId });
  if (!duel) {
    return NextResponse.json({ error: "duel not found" }, { status: 404 });
  }

  const participant = duel.participants.find((p: { userId: string }) => p.userId === authUser.userId);
  if (!participant) {
    return NextResponse.json({ error: "participant not found" }, { status: 403 });
  }

  participant.finished = true;
  participant.score = Math.max(0, body.score ?? participant.score);
  participant.currentQuestion = Math.max(participant.currentQuestion, body.totalQuestions ?? participant.currentQuestion);
  participant.totalQuestions = Math.max(participant.totalQuestions, body.totalQuestions ?? participant.totalQuestions);
  participant.updatedAt = new Date();

  const allFinished =
    duel.participants.length > 1 && duel.participants.every((p: { finished: boolean }) => p.finished);
  const fallbackFinished = duel.participants.length === 1 && participant.finished;

  let winnerId: string | null = duel.winnerId;
  if (allFinished || fallbackFinished) {
    winnerId = resolveWinner(
      duel.participants.map((p: { userId: string; score: number; updatedAt: Date }) => ({
        userId: p.userId,
        score: p.score,
        updatedAt: p.updatedAt,
      })),
    );
    duel.winnerId = winnerId;
    duel.status = "completed";

    if (winnerId && !duel.bountyAwarded) {
      await UserModel.updateOne(
        { _id: winnerId },
        {
          $inc: {
            "gamification.xp": WIN_BOUNTY_XP,
          },
        },
      );
      duel.bountyAwarded = true;
    }
  }

  duel.updatedAt = new Date();
  await duel.save();

  const resultPayload = {
    duelId: duel.duelId,
    status: duel.status,
    winnerId,
    bountyAwarded: duel.bountyAwarded,
    bountyXpAwarded: winnerId ? WIN_BOUNTY_XP : 0,
    participants: duel.participants.map((p: {
      userId: string;
      score: number;
      totalQuestions: number;
      currentQuestion: number;
      finished: boolean;
    }) => ({
      userId: p.userId,
      score: p.score,
      totalQuestions: p.totalQuestions,
      currentQuestion: p.currentQuestion,
      finished: p.finished,
    })),
  };

  if (duel.status === "completed") {
    getIOServer()?.to(duel.duelId).emit("duel:result", resultPayload);
  }

  return NextResponse.json(resultPayload);
}
