import { NextResponse } from "next/server";
import { getAuthUserFromRequest } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { StorySessionModel } from "@/lib/models";

export async function GET(
  request: Request,
  context: { params: Promise<{ storyId: string }> },
): Promise<NextResponse> {
  const authUser = await getAuthUserFromRequest(request);
  if (!authUser) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { storyId } = await context.params;
  if (!storyId) {
    return NextResponse.json({ error: "storyId is required" }, { status: 400 });
  }

  await connectToDatabase();

  const storySession = await StorySessionModel.findOne({
    _id: storyId,
    userId: authUser.userId,
  }).lean();

  if (!storySession) {
    return NextResponse.json({ error: "Story session not found" }, { status: 404 });
  }

  return NextResponse.json({
    storySession: {
      id: String(storySession._id),
      subject: storySession.subject,
      subjectSlug: storySession.subjectSlug,
      sourceType: storySession.sourceType,
      sourceFileName: storySession.sourceFileName,
      topics: storySession.topics,
      quizQuestions: storySession.quizQuestions,
      createdAt: storySession.createdAt,
      updatedAt: storySession.updatedAt,
    },
  });
}
