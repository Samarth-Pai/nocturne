import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getAuthUserFromRequest } from "@/lib/auth";
import { QuizAttemptModel, UserModel } from "@/lib/models";
import { calculateLevel } from "@/lib/levels";

function getDayStamp(date: Date): string {
  return `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`;
}

export async function POST(request: Request): Promise<NextResponse> {
  const authUser = await getAuthUserFromRequest(request);
  if (!authUser) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    subject?: string;
    subjectSlug?: string;
    totalQuestions?: number;
    correctAnswers?: number;
    score?: number;
  };

  const subject = body.subject?.trim() || "General";
  const subjectSlug = body.subjectSlug?.trim() || "general";
  const totalQuestions = Math.max(1, Number(body.totalQuestions ?? 0));
  const correctAnswers = Math.max(0, Number(body.correctAnswers ?? 0));
  const score = Math.max(0, Number(body.score ?? 0));

  if (!Number.isFinite(totalQuestions) || !Number.isFinite(correctAnswers) || !Number.isFinite(score)) {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  const accuracy = Math.round((Math.min(correctAnswers, totalQuestions) / totalQuestions) * 100);

  await connectToDatabase();

  await QuizAttemptModel.create({
    userId: authUser.userId,
    subject,
    subjectSlug,
    totalQuestions,
    correctAnswers: Math.min(correctAnswers, totalQuestions),
    score,
    accuracy,
  });

  const user = await UserModel.findById(authUser.userId);
  if (!user) {
    return NextResponse.json({ error: "user not found" }, { status: 404 });
  }

  const now = new Date();
  const today = getDayStamp(now);
  const previousActive = user.streak?.lastActive ? new Date(user.streak.lastActive) : null;
  const previousDay = previousActive ? getDayStamp(previousActive) : null;

  let nextStreak = user.streak?.count ?? 0;

  if (!previousDay) {
    nextStreak = 1;
  } else if (previousDay !== today) {
    const diffMs = now.getTime() - previousActive!.getTime();
    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
    nextStreak = diffDays === 1 ? nextStreak + 1 : 1;
  }

  user.streak = {
    count: nextStreak,
    lastActive: now,
  };

  const previousXp = user.gamification?.xp ?? 0;
  const previousLevel = calculateLevel(previousXp);
  const newXp = previousXp + score;
  const newLevel = calculateLevel(newXp);
  const experiencedLevelUp = newLevel > previousLevel;

  user.gamification = {
    ...user.gamification,
    xp: newXp,
    level: newLevel,
    streak: {
      count: nextStreak,
      lastActive: now,
    },
  };

  await user.save();

  return NextResponse.json({
    ok: true,
    streak: user.streak,
    gamification: user.gamification,
    experiencedLevelUp,
    newLevel,
    attempt: {
      subject,
      subjectSlug,
      totalQuestions,
      correctAnswers: Math.min(correctAnswers, totalQuestions),
      score,
      accuracy,
    },
  });
}
