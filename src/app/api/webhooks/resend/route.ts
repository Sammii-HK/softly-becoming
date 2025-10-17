import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { createHmac } from "crypto";
const prisma = new PrismaClient();

// Verify webhook signature from Resend
function verifySignature(payload: string, signature: string, secret: string): boolean {
  if (!secret) {
    console.warn("⚠️  RESEND_WEBHOOK_SECRET not set - skipping signature verification");
    return true; // Allow through if secret not configured (for development)
  }

  try {
    // Resend uses HMAC-SHA256 with format: "sha256=<hash>"
    const expectedSignature = `sha256=${createHmac('sha256', secret).update(payload).digest('hex')}`;
    return signature === expectedSignature;
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}

export async function POST(req: Request) {
  try {
    // Get the raw body for signature verification
    const rawBody = await req.text();
    const signature = req.headers.get('resend-signature');
    const secret = process.env.RESEND_WEBHOOK_SECRET;

    // Verify the webhook signature
    if (signature && !verifySignature(rawBody, signature, secret || '')) {
      console.error("❌ Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Parse the JSON body
    const body = JSON.parse(rawBody);
    const type = body?.type as string;
    const email = body?.data?.to as string | undefined;
    
    console.log(`📧 Webhook received: ${type} for ${email}`);

    if (!email) return NextResponse.json({ ok: true });

    // Find subscriber in database
    const subscriber = await prisma.subscriber.findUnique({ where: { email } });
    if (!subscriber) {
      console.log(`⚠️  Subscriber not found for email: ${email}`);
      return NextResponse.json({ ok: true });
    }

    // Map Resend event types to our database types
    const eventType = type?.includes("delivered") ? "delivered"
                    : type?.includes("opened") ? "opened"
                    : type?.includes("clicked") ? "clicked"
                    : type?.includes("bounced") ? "bounced"
                    : type?.includes("complained") ? "complained"
                    : null;

    if (!eventType) {
      console.log(`⚠️  Unknown event type: ${type}`);
      return NextResponse.json({ ok: true });
    }

    // Store the email event
    await prisma.emailEvent.create({
      data: {
        subscriberId: subscriber.id,
        type: eventType,
        messageId: body?.data?.message_id || body?.data?.id,
        meta: body,
      }
    });

    console.log(`✅ Email event stored: ${eventType} for ${email}`);
    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
