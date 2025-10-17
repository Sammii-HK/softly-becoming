import { NextResponse } from "next/server";
import { prisma } from "@/lib/database/client";

export async function GET() {
  try {
    // Check if we have any email events in the database
    const eventCount = await prisma.emailEvent.count();
    const recentEvents = await prisma.emailEvent.findMany({
      take: 10,
      orderBy: { ts: 'desc' },
      include: {
        subscriber: {
          select: { email: true }
        }
      }
    });

    // Check subscribers
    const subscriberCount = await prisma.subscriber.count();
    const recentSubscribers = await prisma.subscriber.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { email: true, createdAt: true }
    });

    return NextResponse.json({
      debug: "Webhook Debug Info",
      timestamp: new Date().toISOString(),
      emailEvents: {
        total: eventCount,
        recent: recentEvents.map((event: any) => ({
          type: event.type,
          email: event.subscriber.email,
          messageId: event.messageId,
          timestamp: event.ts.toISOString()
        }))
      },
      subscribers: {
        total: subscriberCount,
        recent: recentSubscribers
      },
      webhookEndpoint: "https://softly-becoming.vercel.app/api/webhooks/resend",
      environment: {
        hasWebhookSecret: !!process.env.RESEND_WEBHOOK_SECRET,
        webhookSecretLength: process.env.RESEND_WEBHOOK_SECRET?.length || 0
      }
    });

  } catch (error) {
    console.error("Debug endpoint error:", error);
    return NextResponse.json({
      error: "Debug failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
