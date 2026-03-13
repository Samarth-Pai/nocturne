import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { authCookieName, signAuthToken } from "@/lib/auth";
import { UserModel } from "@/lib/models";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
      name?: string;
    };

    const email = body.email?.trim().toLowerCase();
    const password = body.password?.trim();
    const name = body.name?.trim();

    if (!email || !password || !name) {
      return NextResponse.json({ error: "name, email and password are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "password must be at least 6 characters" }, { status: 400 });
    }

    await connectToDatabase();

    const existing = await UserModel.findOne({ email }).lean();
    if (existing) {
      return NextResponse.json({ error: "email already exists" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const created = await UserModel.create({
      email,
      passwordHash,
      name,
      avatarId: "default",
      streak: {
        count: 0,
        lastActive: null,
      },
      gamification: {
        xp: 0,
        level: 1,
        streak: {
          count: 0,
          lastActive: null,
        },
      },
    });

    const token = signAuthToken({
      userId: created._id.toString(),
      email: created.email,
      name: created.name,
    });

    const avatarId = created.avatarId ?? "default";

    const response = NextResponse.json({
      user: {
        id: created._id.toString(),
        email: created.email,
        name: created.name,
        avatarId,
        avatarUrl: avatarId === "default" ? "/avatar.png" : `/avatars/${avatarId}.png`,
        streak: created.streak,
        gamification: created.gamification,
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
  } catch {
    return NextResponse.json(
      { error: "Unable to create account right now. Please try again." },
      { status: 500 },
    );
  }
}
