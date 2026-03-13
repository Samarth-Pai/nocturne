import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { QuestionModel } from "@/lib/models";

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const subjectSlug = searchParams.get("subjectSlug")?.trim();
  const limitParam = Number(searchParams.get("limit") ?? "5");
  const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 20) : 5;

  await connectToDatabase();

  const query = subjectSlug ? { subjectSlug } : {};

  const questions = await QuestionModel.find(query)
    .sort({ createdAt: 1 })
    .limit(limit)
    .lean();

  return NextResponse.json({
    questions: questions.map((q) => ({
      id: q.id,
      questionId: q.questionId,
      subject: q.subject,
      subjectSlug: q.subjectSlug,
      topic: q.topic,
      difficulty: q.difficulty,
      question: q.question,
      options: q.options,
      correctOptionId: q.correctOptionId,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      tags: q.tags,
      source: q.source,
      isDummy: q.isDummy,
      createdAt: q.createdAt,
      updatedAt: q.updatedAt,
    })),
  });
}
