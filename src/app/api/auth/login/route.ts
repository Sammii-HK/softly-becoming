import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";
import { SignJWT } from "jose";

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Valid email required" },
        { status: 400 }
      );
    }

    // Check if subscriber exists
    const subscriber = await prisma.subscriber.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, email: true, name: true, tier: true, status: true, stripeId: true }
    });

    if (!subscriber || subscriber.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Email not found in our subscriber list" },
        { status: 404 }
      );
    }

    // Generate magic link token (expires in 15 minutes)
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || process.env.CRON_SHARED_SECRET);
    const token = await new SignJWT({ 
      email: subscriber.email,
      subscriberId: subscriber.id,
      tier: subscriber.tier,
      stripeId: subscriber.stripeId
    })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('15m')
    .setIssuedAt()
    .sign(secret);

    // Send magic link email
    const magicLink = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/verify?token=${token}`;
    
    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: email,
      subject: "Your Softly Becoming Account Access",
      html: createMagicLinkEmail(subscriber.name || "there", magicLink),
      text: `Hi ${subscriber.name || "there"},\n\nClick this link to access your account:\n${magicLink}\n\nThis link expires in 15 minutes for security.\n\n— Softly Becoming`
    });

    return NextResponse.json({
      success: true,
      message: "Magic link sent! Check your email to access your account."
    });

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Failed to send login link" },
      { status: 500 }
    );
  }
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function createMagicLinkEmail(name: string, magicLink: string): string {
  return `
    <div style="font-family: serif; max-width: 600px; margin: 0 auto; color: #3A3A3A;">
      <div style="text-align: center; padding: 40px 20px;">
        <h1 style="font-size: 28px; margin-bottom: 16px;">Welcome back! 🌸</h1>
        <p style="font-size: 18px; opacity: 0.8; margin-bottom: 32px;">
          Hi ${name}, access your Softly Becoming account
        </p>
      </div>
      
      <div style="background: #FAF9F7; padding: 32px; border-radius: 8px; margin-bottom: 32px;">
        <p style="margin-bottom: 24px;">Click the button below to securely access your account:</p>
        
        <div style="text-align: center; margin: 24px 0;">
          <a href="${magicLink}" 
             style="background: #3A3A3A; color: #FAF9F7; padding: 16px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
            Access My Account
          </a>
        </div>
        
        <p style="font-size: 14px; opacity: 0.7; margin-top: 16px;">
          This link expires in 15 minutes for security. If you didn't request this, you can safely ignore this email.
        </p>
      </div>
      
      <div style="text-align: center; padding: 20px; font-size: 12px; opacity: 0.6;">
        <p>Softly Becoming - Gentle transformation, daily</p>
      </div>
    </div>
  `;
}
