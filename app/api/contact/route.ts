import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { ContactMessage } from "@/lib/models/contact-message";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const subject = typeof body.subject === "string" ? body.subject.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";
    if (
      !name || name.length > 120 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !subject || subject.length > 200 ||
      !message || message.length > 5000
    ) {
      return NextResponse.json({ error: "Enter a valid name, email, subject, and message." }, { status: 400 });
    }
    await connectToDatabase();
    const saved = await ContactMessage.create({ name, email, subject, message });
    return NextResponse.json({ success: true, id: saved._id.toString() }, { status: 201 });
  } catch (error) {
    console.error("Could not save contact message.", error);
    return NextResponse.json({ error: "Could not send your message. Please try again." }, { status: 500 });
  }
}
