import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { UserModel } from "@/lib/models";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const SEEDED_AVATARS = ["eren", "mikasa", "armin"] as const;

export async function GET(): Promise<NextResponse> {
  await connectToDatabase();

  const usersToBackfill = await UserModel.find(
    {
      $or: [
        { avatarId: { $exists: false } },
        { avatarId: null },
        { avatarId: "" },
        { avatarId: "default" },
      ],
    },
    { _id: 1 },
  )
    .sort({ createdAt: 1, _id: 1 })
    .lean();

  if (usersToBackfill.length > 0) {
    await UserModel.bulkWrite(
      usersToBackfill.map((user, index) => {
        return {
          updateOne: {
            filter: { _id: user._id },
            update: { $set: { avatarId: SEEDED_AVATARS[index % SEEDED_AVATARS.length] } },
          },
        };
      }),
      { ordered: false },
    );
  }

  const users = await UserModel.find({})
    .sort({ "gamification.xp": -1, "gamification.level": -1, createdAt: 1 })
    .limit(50)
    .lean();

  const leaderboard = users.map((user, index) => {
    const resolvedAvatarId = user.avatarId ?? SEEDED_AVATARS[index % SEEDED_AVATARS.length];

    return {
      avatarId: resolvedAvatarId,
      avatarUrl: resolvedAvatarId === "default" ? "/avatar.png" : `/avatars/${resolvedAvatarId}.png`,
      rank: index + 1,
      userId: user._id.toString(),
      username: user.name,
      level: user.gamification?.level ?? 1,
      xp: user.gamification?.xp ?? 0,
    };
  });

  return NextResponse.json({ leaderboard });
}
