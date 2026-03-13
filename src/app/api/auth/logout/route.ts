import { NextResponse } from "next/server";
import { authCookieName } from "@/lib/auth";

export async function POST(): Promise<NextResponse> {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(authCookieName, "", {
    path: "/",
    maxAge: 0,
  });

  return response;
}
