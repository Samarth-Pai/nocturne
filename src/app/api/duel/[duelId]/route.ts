import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getAuthUserFromRequest } from "@/lib/auth";
import { DuelModel } from "@/lib/models";

type Params = {
  params: Promise<{ duelId: string }>;
};

export async function GET(request: Request, { params }: Params): Promise<NextResponse> {
  const authUser = await getAuthUserFromRequest(request);
  if (!authUser) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { duelId } = await params;

  await connectToDatabase();
  const duel = await DuelModel.findOne({ duelId }).lean();

  if (!duel) {
    return NextResponse.json({ error: "duel not found" }, { status: 404 });
  }

  const isParticipant = duel.participants.some((p: { userId: string }) => p.userId === authUser.userId);
  if (!isParticipant) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  return NextResponse.json({ duel });
}
