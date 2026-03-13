import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getAuthUserFromRequest } from "@/lib/auth";
import { DuelModel } from "@/lib/models";
import { getIOServer } from "@/lib/socket";

function createDuelId(): string {
  return `duel_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function POST(request: Request): Promise<NextResponse> {
  const authUser = await getAuthUserFromRequest(request);
  if (!authUser) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  let duel = await DuelModel.findOne({
    status: "active",
    participants: { $size: 1 },
    "participants.0.userId": { $ne: authUser.userId },
  });

  if (!duel) {
    duel = await DuelModel.create({
      duelId: createDuelId(),
      participants: [
        {
          userId: authUser.userId,
          currentQuestion: 0,
          totalQuestions: 0,
          score: 0,
          finished: false,
          updatedAt: new Date(),
        },
      ],
      status: "active",
      winnerId: null,
      bountyAwarded: false,
    });

    return NextResponse.json({
      duelId: duel.duelId,
      participantsCount: duel.participants.length,
      status: duel.status,
      message: "waiting-for-opponent",
    });
  }

  const existingParticipant = duel.participants.some((p: { userId: string }) => p.userId === authUser.userId);
  if (!existingParticipant) {
    duel.participants.push({
      userId: authUser.userId,
      currentQuestion: 0,
      totalQuestions: 0,
      score: 0,
      finished: false,
      updatedAt: new Date(),
    });
  }

  duel.updatedAt = new Date();
  await duel.save();

  getIOServer()?.to(duel.duelId).emit("duel:ready", {
    duelId: duel.duelId,
    participants: duel.participants.map((p: { userId: string }) => ({ userId: p.userId })),
  });

  return NextResponse.json({
    duelId: duel.duelId,
    participantsCount: duel.participants.length,
    status: duel.status,
    message: "matched",
  });
}
