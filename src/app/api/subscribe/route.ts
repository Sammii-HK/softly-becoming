import { NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const schema = z.object({
      email: z.string().email(),
      name: z.string().optional(),
      source: z.string().optional(),
    });
    
    const parse = schema.safeParse({
      email: form.get("email"),
      name: form.get("name") || undefined,
      source: form.get("source") || "web",
    });
    
    if (!parse.success) {
      console.error("Validation failed:", parse.error);
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { email, name, source } = parse.data;

    // Database operations with error handling
    try {
      const existing = await prisma.subscriber.findUnique({ where: { email } });
      if (!existing) {
        await prisma.subscriber.create({ data: { email, name, source } });
        console.log("✅ New subscriber created:", email);
      } else if (existing.status !== "ACTIVE") {
        await prisma.subscriber.update({ where: { email }, data: { status: "ACTIVE" } });
        console.log("✅ Subscriber reactivated:", email);
      } else {
        console.log("✅ Subscriber already active:", email);
      }
    } catch (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json({ error: "Database unavailable" }, { status: 500 });
    }

    // Send welcome email with error handling
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: process.env.EMAIL_FROM!,
          to: email,
          subject: "Welcome to Softly Becoming 🌸",
          html: `
            <div style="font-family: serif; max-width: 520px; margin: 2rem auto; color: #333;">
              <h2 style="font-weight: 400; margin: 0 0 16px; color: #666;">Welcome to Softly Becoming</h2>
              <p style="line-height: 1.6;">Thank you for joining our gentle community.</p>
              <p style="line-height: 1.6;">One thoughtful note each morning, delivered with care.</p>
              <p style="line-height: 1.6; margin-top: 24px;">— Softly Becoming</p>
            </div>
          `,
        });
        console.log("✅ Welcome email sent:", email);
      } catch (emailError) {
        console.error("Email error (non-blocking):", emailError);
        // Don't fail the subscription if email fails
      }
    }

    return NextResponse.json({ ok: true });
    
  } catch (error) {
    console.error("Subscribe endpoint error:", error);
    return NextResponse.json({ error: "Subscription failed" }, { status: 500 });
  }
}
