import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/lib/api-response";
import { getDatabase } from "@/lib/mongodb";
import {
  createSessionToken,
  getSession,
  isSessionSecretConfigured,
  passwordHash,
  SESSION_COOKIE,
  sessionCookieOptions,
  verifyConfiguredSecret,
  verifyPassword,
} from "@/lib/server-auth";

export const runtime = "nodejs";

type UserDocument = {
  _id: ObjectId;
  name: string;
  email: string;
  phone?: string;
  defaultAddress?: string;
  passwordSalt: string;
  passwordHash: string;
  createdAt: Date;
};

function publicUser(user: Pick<UserDocument, "_id" | "name" | "email" | "phone" | "defaultAddress">) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    defaultAddress: user.defaultAddress || "",
  };
}

function setSession(response: NextResponse, user: {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
}) {
  response.cookies.set(
    SESSION_COOKIE,
    createSessionToken(user),
    sessionCookieOptions(),
  );
  return response;
}

export async function GET() {
  const session = await getSession();
  return NextResponse.json({
    user: session
      ? { id: session.id, name: session.name, email: session.email, role: session.role }
      : null,
  });
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return apiError("Request body must be valid JSON.", 400);
  }

  const action = body.action;
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!isSessionSecretConfigured()) {
    return apiError("SESSION_SECRET must be configured with at least 32 characters.", 503);
  }

  if (action === "admin-login") {
    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminEmail || !adminPassword) {
      return apiError("Admin credentials are not configured on the server.", 503);
    }
    if (
      email !== adminEmail ||
      !verifyConfiguredSecret(password, adminPassword)
    ) {
      return apiError("The admin email or password is incorrect.", 401);
    }
    return setSession(
      NextResponse.json({
        user: { id: "admin", name: "Friday Admin", email: adminEmail, role: "admin" },
      }),
      { id: "admin", name: "Friday Admin", email: adminEmail, role: "admin" },
    );
  }

  if (action !== "register" && action !== "login") {
    return apiError("Unsupported authentication action.", 400);
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return apiError("Enter a valid email address.", 400);
  }
  if (password.length < 8 || password.length > 256) {
    return apiError("Password must be between 8 and 256 characters.", 400);
  }

  try {
    const db = await getDatabase();
    const users = db.collection<UserDocument>("users");
    if (action === "register") {
      const name = typeof body.name === "string" ? body.name.trim() : "";
      if (!name || name.length > 100) {
        return apiError("Enter a name up to 100 characters.", 400);
      }
      const credentials = passwordHash(password);
      const user: UserDocument = {
        _id: new ObjectId(),
        name,
        email,
        passwordSalt: credentials.salt,
        passwordHash: credentials.hash,
        createdAt: new Date(),
      };
      await users.insertOne(user);
      const response = NextResponse.json({ user: publicUser(user) }, { status: 201 });
      return setSession(response, {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: "customer",
      });
    }

    const user = await users.findOne({ email });
    if (
      !user ||
      !verifyPassword(password, user.passwordSalt, user.passwordHash)
    ) {
      return apiError("The email or password is incorrect.", 401);
    }
    const response = NextResponse.json({ user: publicUser(user) });
    return setSession(response, {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: "customer",
    });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === 11000
    ) {
      return apiError("An account with that email already exists.", 409);
    }
    console.error("Authentication request failed.", error);
    return apiError("The account service is unavailable. Please try again.", 503);
  }
}

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "customer" || !ObjectId.isValid(session.id)) {
    return apiError("Sign in to update your account.", 401);
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return apiError("Request body must be valid JSON.", 400);
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const defaultAddress =
    typeof body.defaultAddress === "string" ? body.defaultAddress.trim() : "";
  if (!name || name.length > 100 || phone.length > 40 || defaultAddress.length > 500) {
    return apiError("Check the name, phone, and address fields.", 400);
  }

  try {
    const db = await getDatabase();
    const users = db.collection<UserDocument>("users");
    const id = new ObjectId(session.id);
    const result = await users.findOneAndUpdate(
      { _id: id },
      { $set: { name, phone, defaultAddress } },
      { returnDocument: "after" },
    );
    if (!result) return apiError("Account not found.", 404);

    const user = publicUser(result);
    const response = NextResponse.json({ user });
    response.cookies.set(
      SESSION_COOKIE,
      createSessionToken({
        id: user.id,
        name: user.name,
        email: user.email,
        role: "customer",
      }),
      sessionCookieOptions(),
    );
    return response;
  } catch (error) {
    console.error("Account update failed.", error);
    return apiError("Could not update your account.", 503);
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE, "", { ...sessionCookieOptions(), maxAge: 0 });
  return response;
}
