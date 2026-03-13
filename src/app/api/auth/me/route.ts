import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getAuthUserFromRequest } from "@/lib/auth";
import { UserModel } from "@/lib/models";

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
      streak: user.streak,
      gamification: user.gamification,
    },
  });
}
