import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/auth/internal";
import { prisma } from "@/lib/database/client";

export async function GET(req: Request) {
  try { 
    assertAdmin(req); 
  } catch { 
    return NextResponse.json({ error: "unauthorised" }, { status: 401 }); 
  }

  try {
    // Get email event counts
    const eventCounts = await prisma.emailEvent.groupBy({
      by: ['type'],
      _count: {
        id: true
      }
    });

    // Get total unique emails sent (approximate based on delivered events)
    const totalDelivered = eventCounts.find((e: any) => e.type === 'delivered')?._count.id || 0;
    const totalOpened = eventCounts.find((e: any) => e.type === 'opened')?._count.id || 0;
    const totalClicked = eventCounts.find((e: any) => e.type === 'clicked')?._count.id || 0;
    const totalBounced = eventCounts.find((e: any) => e.type === 'bounced')?._count.id || 0;
    const totalComplained = eventCounts.find((e: any) => e.type === 'complained')?._count.id || 0;

    // Calculate rates (using delivered as base for open/click rates)
    const openRate = totalDelivered > 0 ? (totalOpened / totalDelivered) * 100 : 0;
    const clickRate = totalDelivered > 0 ? (totalClicked / totalDelivered) * 100 : 0;

    // Get recent events with subscriber email
    const recentEvents = await prisma.emailEvent.findMany({
      take: 50,
      orderBy: { ts: 'desc' },
      include: {
        subscriber: {
          select: { email: true }
        }
      }
    });

    // Total emails approximation (delivered + bounced as minimum)
    const totalEmails = totalDelivered + totalBounced;

    const metrics = {
      totalEmails,
      delivered: totalDelivered,
      opened: totalOpened,
      clicked: totalClicked,
      bounced: totalBounced,
      complained: totalComplained,
      openRate,
      clickRate,
      recentEvents: recentEvents.map((event: any) => ({
        id: event.id,
        type: event.type,
        email: event.subscriber.email,
        timestamp: event.ts.toISOString(),
        messageId: event.messageId
      }))
    };

    return NextResponse.json(metrics);

  } catch (error) {
    console.error("Email metrics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch email metrics" }, 
      { status: 500 }
    );
  }
}
