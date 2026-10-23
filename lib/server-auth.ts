import {
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "friday_session";
const SESSION_AGE_SECONDS = 60 * 60 * 24 * 7;
const sessionSecret = process.env.SESSION_SECRET;

export function isSessionSecretConfigured() {
  return Boolean(sessionSecret && sessionSecret.length >= 32);
}

export type Session = {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
  expiresAt: number;
};

export function passwordHash(password: string, salt = randomBytes(16).toString("hex")) {
  return {
    salt,
    hash: scryptSync(password, salt, 64).toString("hex"),
  };
}

export function verifyPassword(password: string, salt: string, expectedHash: string) {
  const actual = scryptSync(password, salt, 64);
  const expected = Buffer.from(expectedHash, "hex");
  return expected.length === actual.length && timingSafeEqual(actual, expected);
}

export function verifyConfiguredSecret(candidate: string, expected: string) {
  const actual = createHmac("sha256", "friday-admin-secret").update(candidate).digest();
  const configured = createHmac("sha256", "friday-admin-secret").update(expected).digest();
  return timingSafeEqual(actual, configured);
}

function sign(value: string) {
  if (!sessionSecret || sessionSecret.length < 32) {
    throw new Error("SESSION_SECRET must contain at least 32 characters.");
  }
  return createHmac("sha256", sessionSecret).update(value).digest("base64url");
}

export function createSessionToken(user: Omit<Session, "expiresAt">) {
  const payload: Session = {
    ...user,
    expiresAt: Math.floor(Date.now() / 1000) + SESSION_AGE_SECONDS,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || !sessionSecret || sessionSecret.length < 32) return null;

  const [encoded, signature, ...extra] = token.split(".");
  if (!encoded || !signature || extra.length) return null;

  const expected = Buffer.from(sign(encoded));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return null;
  }

  try {
    const session = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    ) as Session;
    if (
      !session.id ||
      !session.email ||
      !["customer", "admin"].includes(session.role) ||
      session.expiresAt <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_AGE_SECONDS,
  };
}
