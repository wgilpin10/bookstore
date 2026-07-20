import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, AUTH_SECRET } from "@/lib/config";
import { AuthUser } from "@/types/user";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function encodePayload(user: AuthUser): string {
  return Buffer.from(
    JSON.stringify({
      id: user.id,
      username: user.username,
      email: user.email ?? "",
      isSuperAdmin: user.isSuperAdmin,
    }),
    "utf8"
  ).toString("base64url");
}

function sign(encodedPayload: string): string {
  return createHmac("sha256", AUTH_SECRET)
    .update(encodedPayload)
    .digest("base64url");
}

function createSessionToken(user: AuthUser): string {
  const payload = encodePayload(user);
  return `${payload}.${sign(payload)}`;
}

function parseSessionToken(token: string): AuthUser | null {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = sign(payload);
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);

  if (left.length !== right.length || !timingSafeEqual(left, right)) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as Partial<AuthUser>;

    if (!parsed.id || !parsed.username) return null;

    return {
      id: String(parsed.id),
      username: String(parsed.username),
      email: parsed.email ? String(parsed.email) : undefined,
      isSuperAdmin: Boolean(parsed.isSuperAdmin),
    };
  } catch {
    return null;
  }
}

export async function createSession(user: AuthUser): Promise<void> {
  const store = await cookies();
  store.set(AUTH_COOKIE_NAME, createSessionToken(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(AUTH_COOKIE_NAME);
}

export async function getSessionUser(): Promise<AuthUser | null> {
  const store = await cookies();
  const token = store.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  return parseSessionToken(token);
}

export async function requireSessionUser(): Promise<AuthUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}
