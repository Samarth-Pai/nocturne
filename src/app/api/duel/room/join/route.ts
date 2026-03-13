import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getAuthUserFromRequest } from "@/lib/auth";
import { DuelModel } from "@/lib/models";
import { getIOServer } from "@/lib/socket";

export async function POST(request: Request): Promise<NextResponse> {
  const authUser = await getAuthUserFromRequest(request);
  if (!authUser) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  const duel = await DuelModel.findOne({
    status: "active",
    participants: { $size: 1 },
    "participants.0.userId": { $ne: authUser.userId },
  }).sort({ createdAt: 1 });

  if (!duel) {
    return NextResponse.json({ error: "no waiting room found" }, { status: 404 });
  }

  duel.participants.push({
    userId: authUser.userId,
    currentQuestion: 0,
    totalQuestions: 0,
    score: 0,
    finished: false,
    updatedAt: new Date(),
  });
  duel.updatedAt = new Date();
  await duel.save();

  const payload = {
    duelId: duel.duelId,
    participants: duel.participants.map((p: { userId: string }) => ({ userId: p.userId })),
  };

  getIOServer()?.to(duel.duelId).emit("duel:ready", payload);

  return NextResponse.json({
    duelId: duel.duelId,
    status: duel.status,
    participantsCount: duel.participants.length,
    message: "matched",
  });
}
