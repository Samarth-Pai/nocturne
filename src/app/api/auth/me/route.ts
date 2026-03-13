import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getAuthUserFromRequest } from "@/lib/auth";
import { UserModel } from "@/lib/models";

const ALLOWED_AVATARS = new Set(["default", "eren", "mikasa", "armin"]);

export async function GET(request: Request): Promise<NextResponse> {
  const authUser = await getAuthUserFromRequest(request);

  if (!authUser) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  await connectToDatabase();
  const user = await UserModel.findById(authUser.userId).lean();

  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      avatarId: user.avatarId ?? "default",
      avatarUrl: (user.avatarId ?? "default") === "default"
        ? "/avatar.png"
        : `/avatars/${user.avatarId}.png`,
      streak: user.streak,
      gamification: user.gamification,
    },
  });
}

export async function PATCH(request: Request): Promise<NextResponse> {
  const authUser = await getAuthUserFromRequest(request);

  if (!authUser) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { avatarId?: string };
  const avatarId = body.avatarId?.trim();

  if (!avatarId || !ALLOWED_AVATARS.has(avatarId)) {
    return NextResponse.json({ error: "invalid avatarId" }, { status: 400 });
  }

  await connectToDatabase();

  const user = await UserModel.findByIdAndUpdate(
    authUser.userId,
    { $set: { avatarId } },
    { new: true },
  ).lean();

  if (!user) {
    return NextResponse.json({ error: "user not found" }, { status: 404 });
  }

  return NextResponse.json({
    user: {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      avatarId: user.avatarId ?? "default",
      avatarUrl: (user.avatarId ?? "default") === "default"
        ? "/avatar.png"
        : `/avatars/${user.avatarId}.png`,
      streak: user.streak,
      gamification: user.gamification,
    },
  });
}
