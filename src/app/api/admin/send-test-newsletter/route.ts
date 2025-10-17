import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/auth/internal";
import { Resend } from "resend";

export async function POST(req: Request) {
  try {
    assertAdmin(req);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { email, html, subject } = await req.json();

    if (!email || !html || !subject) {
      return NextResponse.json(
        { error: "Email, HTML, and subject required" },
        { status: 400 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 }
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    
    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: email,
      subject: `[TEST] ${subject}`,
      html,
    });

    return NextResponse.json({
      success: true,
      message: `Test newsletter sent to ${email}`
    });

  } catch (error) {
    console.error("Test newsletter error:", error);
    return NextResponse.json(
      { error: "Failed to send test newsletter" },
      { status: 500 }
    );
  }
}
