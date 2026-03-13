import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getAuthUserFromRequest } from "@/lib/auth";
import { QuestionModel, QuizAttemptModel } from "@/lib/models";

export async function GET(request: Request): Promise<NextResponse> {
  const authUser = await getAuthUserFromRequest(request);
  if (!authUser) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  const subjects = await QuestionModel.aggregate<{
    subject: string;
    subjectSlug: string;
    totalQuestions: number;
  }>([
    {
      $group: {
        _id: "$subjectSlug",
        subjectSlug: { $first: "$subjectSlug" },
        subject: { $first: "$subject" },
        totalQuestions: { $sum: 1 },
      },
    },
    { $project: { _id: 0, subject: 1, subjectSlug: 1, totalQuestions: 1 } },
  ]);

  const attemptStats = await QuizAttemptModel.aggregate<{
    subjectSlug: string;
    attempts: number;
    avgAccuracy: number;
    totalXp: number;
  }>([
    { $match: { userId: authUser.userId } },
    {
      $group: {
        _id: "$subjectSlug",
        subjectSlug: { $first: "$subjectSlug" },
        attempts: { $sum: 1 },
        avgAccuracy: { $avg: "$accuracy" },
        totalXp: { $sum: "$score" },
      },
    },
    { $project: { _id: 0, subjectSlug: 1, attempts: 1, avgAccuracy: 1, totalXp: 1 } },
  ]);

  const statsMap = new Map(attemptStats.map((item) => [item.subjectSlug, item]));

  const overview = subjects.map((subject) => {
    const stat = statsMap.get(subject.subjectSlug);

    return {
      subject: subject.subject,
      subjectSlug: subject.subjectSlug,
      totalQuestions: subject.totalQuestions,
      progress: stat ? Math.round(stat.avgAccuracy) : 0,
      xpValue: stat?.totalXp ?? 0,
      attempts: stat?.attempts ?? 0,
    };
  });

  return NextResponse.json({ subjects: overview });
}
