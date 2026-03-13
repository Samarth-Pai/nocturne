import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { UserModel } from "@/lib/models";

export async function GET(): Promise<NextResponse> {
  await connectToDatabase();

  const users = await UserModel.find({})
    .sort({ "gamification.xp": -1, "gamification.level": -1, createdAt: 1 })
    .limit(50)
    .lean();

  const leaderboard = users.map((user, index) => ({
    rank: index + 1,
    userId: user._id.toString(),
    username: user.name,
    level: user.gamification?.level ?? 1,
    xp: user.gamification?.xp ?? 0,
  }));

  return NextResponse.json({ leaderboard });
}
