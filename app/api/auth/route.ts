import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { serializeUser } from "@/lib/api-serializers";
import { User } from "@/lib/models/user";
import {
  clearSessionCookie,
  constantTimeEqual,
  getSession,
  hashPassword,
  setSessionCookie,
  verifyPassword,
} from "@/lib/session";

function publicAdmin() {
  return {
    id: "admin",
    name: "Administrator",
    email: process.env.ADMIN_EMAIL ?? "",
    role: "admin" as const,
  };
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) return NextResponse.json({ user: null });
    if (session.role === "admin") return NextResponse.json({ user: publicAdmin() });

    await connectToDatabase();
    const user = await User.findById(session.sub);
    return NextResponse.json({ user: user ? serializeUser(user) : null });
  } catch (error) {
    console.error("Could not read account session.", error);
    return NextResponse.json({ error: "Could not restore your session." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = typeof body.action === "string" ? body.action : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (action === "admin-login") {
      const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase() ?? "";
      const adminPassword = process.env.ADMIN_PASSWORD ?? "";
      if (
        !adminEmail ||
        !adminPassword ||
        !constantTimeEqual(email, adminEmail) ||
        !constantTimeEqual(password, adminPassword)
      ) {
        console.log({ email, password, adminEmail, adminPassword })
        return NextResponse.json({ error: "Invalid administrator credentials." }, { status: 401 });
      }
      const response = NextResponse.json({ user: publicAdmin() });
      setSessionCookie(response, "admin", "admin");
      return response;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }
    if (password.length < 8 || password.length > 128) {
      return NextResponse.json({ error: "Password must be between 8 and 128 characters." }, { status: 400 });
    }

    await connectToDatabase();
    let user;
    if (action === "register") {
      const name = typeof body.name === "string" ? body.name.trim() : "";
      if (!name || name.length > 120) {
        return NextResponse.json({ error: "Enter your name." }, { status: 400 });
      }
      user = await User.create({ name, email, passwordHash: await hashPassword(password) });
    } else if (action === "login") {
      const account = await User.findOne({ email }).select("+passwordHash");
      if (!account || !(await verifyPassword(password, account.passwordHash))) {
        return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
      }
      user = account;
    } else {
      return NextResponse.json({ error: "Unsupported account action." }, { status: 400 });
    }

    const response = NextResponse.json({ user: serializeUser(user) });
    setSessionCookie(response, "customer", user._id.toString());
    return response;
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }
    console.error("Could not authenticate account.", error);
    return NextResponse.json({ error: "Could not complete the account request." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session || session.role !== "customer") {
      return NextResponse.json({ error: "Sign in to update your profile." }, { status: 401 });
    }
    const body = await request.json();
    const updates: { name?: string; phone?: string; defaultAddress?: string } = {};
    if (typeof body.name === "string") updates.name = body.name.trim();
    if (typeof body.phone === "string") updates.phone = body.phone.trim();
    if (typeof body.defaultAddress === "string") updates.defaultAddress = body.defaultAddress.trim();
    if (!updates.name || updates.name.length > 120) {
      return NextResponse.json({ error: "Enter a valid name." }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findByIdAndUpdate(session.sub, { $set: updates }, { new: true, runValidators: true });
    if (!user) return NextResponse.json({ error: "Account not found." }, { status: 404 });
    return NextResponse.json({ user: serializeUser(user) });
  } catch (error) {
    console.error("Could not update account profile.", error);
    return NextResponse.json({ error: "Could not update your profile." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const response = NextResponse.json({ success: true });
  clearSessionCookie(response);
  return response;
}