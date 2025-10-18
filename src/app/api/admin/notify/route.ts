import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/auth/internal";
import { sendContentNotification, sendPerformanceAlert } from "@/lib/notifications/pushover";

export async function POST(req: Request) {
  try {
    assertAdmin(req);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { type, data } = await req.json();

    let result;
    
    switch (type) {
      case 'pack_generated':
        result = await sendContentNotification('pack_generated', data);
        break;
      case 'newsletter_sent':
        result = await sendContentNotification('newsletter_sent', data);
        break;
      case 'post_published':
        result = await sendContentNotification('post_published', data);
        break;
      case 'performance_alert':
        result = await sendPerformanceAlert(data.type || 'email', data.metric, data.value, data.threshold);
        break;
      default:
        return NextResponse.json(
          { error: "Invalid notification type" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: "Notification sent successfully",
      result
    });

  } catch (error) {
    console.error("Notification error:", error);
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 }
    );
  }
}
