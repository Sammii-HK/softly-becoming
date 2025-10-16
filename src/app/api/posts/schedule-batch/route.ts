import { NextRequest, NextResponse } from "next/server";
import { assertInternal } from "@/lib/auth/internal";
import { schedulePosts } from "@/lib/runner/schedule-posts";

export async function POST(req: NextRequest) {
  try { 
    assertInternal(req); 
  } catch { 
    return NextResponse.json({ error: "unauthorised" }, { status: 401 }); 
  }

  try {
    const body = await req.json();
    const { 
      count = 10, 
      startDate, 
      intervalHours = 8, 
      seed,
      theme 
    } = body;

    if (!startDate) {
      return NextResponse.json({ 
        error: "startDate is required (ISO 8601 format)" 
      }, { status: 400 });
    }

    const start = new Date(startDate);
    if (isNaN(start.getTime())) {
      return NextResponse.json({ 
        error: "Invalid startDate format. Use ISO 8601 (e.g., 2024-01-15T10:30:00Z)" 
      }, { status: 400 });
    }

    console.log(`🚀 Starting batch post scheduling...`);
    
    const result = await schedulePosts({
      count,
      startDate: start,
      intervalHours,
      seed,
      theme
    });

    return NextResponse.json({
      success: result.success,
      message: `Scheduled ${result.scheduled} posts, ${result.failed} failed`,
      scheduled: result.scheduled,
      failed: result.failed,
      posts: result.successfulPosts,
      ...(result.failedPosts.length > 0 && { failures: result.failedPosts })
    });

  } catch (error) {
    console.error("❌ Batch scheduling error:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
