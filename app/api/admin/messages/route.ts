import { isValidObjectId } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { ContactMessage, type ContactMessageStatus } from "@/lib/models/contact-message";
import { getSession } from "@/lib/session";

async function requireAdmin(request: NextRequest) {
  return (await getSession(request))?.role === "admin";
}

export async function GET(request: NextRequest) {
  try {
    if (!(await requireAdmin(request))) {
      return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
    }
    await connectToDatabase();
    const status = request.nextUrl.searchParams.get("status") ?? "all";
    if (status !== "all" && !["new", "read", "resolved"].includes(status)) {
      return NextResponse.json({ error: "Select a valid message status." }, { status: 400 });
    }
    const requestedPage = Number(request.nextUrl.searchParams.get("page") ?? 1);
    const pageSize = Number(request.nextUrl.searchParams.get("pageSize") ?? 20);
    if (!Number.isInteger(requestedPage) || requestedPage < 1) {
      return NextResponse.json({ error: "Page must be a positive integer." }, { status: 400 });
    }
    if (![10, 20, 50].includes(pageSize)) {
      return NextResponse.json({ error: "Page size must be 10, 20, or 50." }, { status: 400 });
    }
    const filter =
      status === "all"
        ? {}
        : { status: status as ContactMessageStatus };
    const total = await ContactMessage.countDocuments(filter);
    const pages = Math.ceil(total / pageSize);
    const page = pages ? Math.min(requestedPage, pages) : 1;
    const messages = await ContactMessage.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize);
    return NextResponse.json({
      messages: messages.map((item) => ({
        id: item._id.toString(),
        name: item.name,
        email: item.email,
        subject: item.subject,
        message: item.message,
        status: item.status,
        createdAt: item.createdAt.toISOString(),
      })),
      total,
      page,
      pageSize,
      pages,
    });
  } catch (error) {
    console.error("Could not load contact messages.", error);
    return NextResponse.json({ error: "Could not load contact messages." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!(await requireAdmin(request))) {
      return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
    }
    const body = await request.json();
    const statuses: ContactMessageStatus[] = ["new", "read", "resolved"];
    if (
      typeof body.id !== "string" ||
      !isValidObjectId(body.id) ||
      !statuses.includes(body.status)
    ) {
      return NextResponse.json({ error: "A valid message id and status are required." }, { status: 400 });
    }
    await connectToDatabase();
    const message = await ContactMessage.findByIdAndUpdate(
      body.id,
      { $set: { status: body.status } },
      { new: true, runValidators: true },
    );
    if (!message) return NextResponse.json({ error: "Message not found." }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Could not update contact message.", error);
    return NextResponse.json({ error: "Could not update contact message." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!(await requireAdmin(request))) {
      return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
    }
    const id = request.nextUrl.searchParams.get("id");
    if (!id || !isValidObjectId(id)) {
      return NextResponse.json({ error: "A valid message id is required." }, { status: 400 });
    }
    await connectToDatabase();
    const message = await ContactMessage.findByIdAndDelete(id);
    if (!message) return NextResponse.json({ error: "Message not found." }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Could not delete contact message.", error);
    return NextResponse.json({ error: "Could not delete contact message." }, { status: 500 });
  }
}
