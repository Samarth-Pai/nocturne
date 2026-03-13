import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getAuthUserFromRequest } from "@/lib/auth";
import { DuelModel } from "@/lib/models";

function createDuelId(): string {
  return `duel_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function POST(request: Request): Promise<NextResponse> {
  const authUser = await getAuthUserFromRequest(request);
  if (!authUser) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  const existingWaiting = await DuelModel.findOne({
    status: "active",
    participants: { $size: 1 },
    "participants.0.userId": authUser.userId,
  });

  if (existingWaiting) {
    return NextResponse.json({
      duelId: existingWaiting.duelId,
      status: existingWaiting.status,
      participantsCount: existingWaiting.participants.length,
      message: "waiting-for-opponent",
    });
  }

  const duel = await DuelModel.create({
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
    status: duel.status,
    participantsCount: duel.participants.length,
    message: "waiting-for-opponent",
  });
}
