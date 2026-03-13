import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { authCookieName, signAuthToken } from "@/lib/auth";
import { UserModel } from "@/lib/models";

export async function POST(request: Request): Promise<NextResponse> {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };

    const email = body.email?.trim().toLowerCase();
    const password = body.password?.trim();

    if (!email || !password) {
      return NextResponse.json({ error: "email and password are required" }, { status: 400 });
    }

    await connectToDatabase();

    const user = await UserModel.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "invalid credentials" }, { status: 401 });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      return NextResponse.json({ error: "invalid credentials" }, { status: 401 });
    }

    const token = signAuthToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
    });

    const avatarId = user.avatarId ?? "default";

    const response = NextResponse.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        avatarId,
        avatarUrl: avatarId === "default" ? "/avatar.png" : `/avatars/${avatarId}.png`,
        streak: user.streak,
        gamification: user.gamification,
      },
      token,
    });

    response.cookies.set(authCookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
}
