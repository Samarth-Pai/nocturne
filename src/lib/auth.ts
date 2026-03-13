import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { type JwtUserPayload } from "@/types/auth";

const TOKEN_COOKIE = "levelup_token";
const EXPIRY = "7d";

function getJwtSecret(): string {
  const secret = process.env.AUTH_JWT_SECRET;

  if (!secret) {
    throw new Error("AUTH_JWT_SECRET is not set");
  }

  return secret;
}

export function signAuthToken(payload: JwtUserPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: EXPIRY });
}

export function verifyAuthToken(token: string): JwtUserPayload {
  const decoded = jwt.verify(token, getJwtSecret());

  if (typeof decoded === "string") {
    throw new Error("Invalid auth token payload");
  }

  return decoded as JwtUserPayload;
}

export async function getAuthUserFromRequest(request: Request): Promise<JwtUserPayload | null> {
  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(TOKEN_COOKIE)?.value ?? null;
  const token = bearerToken ?? cookieToken;

  if (!token) {
    return null;
  }

  try {
    return verifyAuthToken(token);
  } catch {
    return null;
  }
}

export const authCookieName = TOKEN_COOKIE;
