import { createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { type NextRequest, NextResponse } from "next/server";

const scryptAsync = promisify(scrypt);
const cookieName = "friday_session";
const sessionLifetimeSeconds = 60 * 60 * 24 * 7;

export type Session = {
  sub: string;
  role: "customer" | "admin";
  exp: number;
};

function sessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must contain at least 32 characters.");
  }
  return secret;
}

function signature(value: string) {
  return createHmac("sha256", sessionSecret()).update(value).digest("base64url");
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password: string, storedHash: string) {
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) return false;
  const expected = Buffer.from(hash, "hex");
  const actual = (await scryptAsync(password, salt, expected.length)) as Buffer;
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function constantTimeEqual(left: string, right: string) {
  const leftDigest = createHmac("sha256", "compare").update(left).digest();
  const rightDigest = createHmac("sha256", "compare").update(right).digest();
  return timingSafeEqual(leftDigest, rightDigest);
}

export function setSessionCookie(response: NextResponse, role: Session["role"], sub: string) {
  const value = Buffer.from(
    JSON.stringify({
      sub,
      role,
      exp: Math.floor(Date.now() / 1000) + sessionLifetimeSeconds,
    } satisfies Session),
  ).toString("base64url");
  response.cookies.set(cookieName, `${value}.${signature(value)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: sessionLifetimeSeconds,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(cookieName, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getSession(request: NextRequest): Promise<Session | null> {
  const value = request.cookies.get(cookieName)?.value;
  if (!value) return null;

  const [payload, suppliedSignature] = value.split(".");
  if (!payload || !suppliedSignature) return null;

  try {
    if (!constantTimeEqual(signature(payload), suppliedSignature)) return null;
    const session = JSON.parse(Buffer.from(payload, "base64url").toString()) as Session;
    if (
      !session.sub ||
      !["customer", "admin"].includes(session.role) ||
      !Number.isFinite(session.exp) ||
      session.exp <= Date.now() / 1000
    ) {
      return null;
    }
    return session;
  } catch {
    return null;
  }
}