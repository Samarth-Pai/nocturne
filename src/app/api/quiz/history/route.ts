import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getAuthUserFromRequest } from "@/lib/auth";
import { QuizAttemptModel } from "@/lib/models";

export async function GET(request: Request): Promise<NextResponse> {
  const authUser = await getAuthUserFromRequest(request);
  if (!authUser) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  const attempts = await QuizAttemptModel.find({ userId: authUser.userId })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  return NextResponse.json({ attempts });
}
