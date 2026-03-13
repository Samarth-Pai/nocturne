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

  const body = (await request.json()) as {
    duelId?: string;
    currentQuestion?: number;
    totalQuestions?: number;
    score?: number;
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

  participant.currentQuestion = Math.max(0, body.currentQuestion ?? participant.currentQuestion);
  participant.totalQuestions = Math.max(participant.totalQuestions, body.totalQuestions ?? participant.totalQuestions);
  participant.score = Math.max(0, body.score ?? participant.score);
  participant.updatedAt = new Date();

  duel.updatedAt = new Date();
  await duel.save();

  const payload = {
    duelId: duel.duelId,
    userId: authUser.userId,
    currentQuestion: participant.currentQuestion,
    totalQuestions: participant.totalQuestions,
    score: participant.score,
    updatedAt: participant.updatedAt,
  };

  getIOServer()?.to(duel.duelId).emit("duel:progress", payload);

  return NextResponse.json({ ok: true, progress: payload });
}
