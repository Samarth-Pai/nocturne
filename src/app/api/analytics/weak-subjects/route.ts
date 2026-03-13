import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getAuthUserFromRequest } from "@/lib/auth";
import { QuestionModel, QuizAttemptModel } from "@/lib/models";

interface WeakSubject {
  subject: string;
  subjectSlug: string;
  attemptedCount: number;
  accuracy: number | null;
  reason: "not-attempted" | "low-accuracy";
}

export async function GET(request: Request): Promise<NextResponse> {
  const authUser = await getAuthUserFromRequest(request);
  if (!authUser) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  const subjects = await QuestionModel.aggregate<{ subject: string; subjectSlug: string }>([
    {
      $group: {
        _id: "$subjectSlug",
        subjectSlug: { $first: "$subjectSlug" },
        subject: { $first: "$subject" },
      },
    },
    { $project: { _id: 0, subject: 1, subjectSlug: 1 } },
  ]);

  const attemptStats = await QuizAttemptModel.aggregate<{
    subjectSlug: string;
    attemptedCount: number;
    accuracy: number;
  }>([
    { $match: { userId: authUser.userId } },
    {
      $group: {
        _id: "$subjectSlug",
        subjectSlug: { $first: "$subjectSlug" },
        attemptedCount: { $sum: 1 },
        accuracy: { $avg: "$accuracy" },
      },
    },
    { $project: { _id: 0, subjectSlug: 1, attemptedCount: 1, accuracy: 1 } },
  ]);

  const statsMap = new Map(attemptStats.map((stat) => [stat.subjectSlug, stat]));

  const ranked: WeakSubject[] = subjects.map((subject) => {
    const stat = statsMap.get(subject.subjectSlug);

    if (!stat) {
      return {
        subject: subject.subject,
        subjectSlug: subject.subjectSlug,
        attemptedCount: 0,
        accuracy: null,
        reason: "not-attempted",
      };
    }

    return {
      subject: subject.subject,
      subjectSlug: subject.subjectSlug,
      attemptedCount: stat.attemptedCount,
      accuracy: Math.round(stat.accuracy),
      reason: "low-accuracy",
    };
  });

  ranked.sort((a, b) => {
    if (a.reason !== b.reason) {
      return a.reason === "not-attempted" ? -1 : 1;
    }

    const aAcc = a.accuracy ?? -1;
    const bAcc = b.accuracy ?? -1;
    return aAcc - bAcc;
  });

  return NextResponse.json({ weakSubjects: ranked.slice(0, 2) });
}
