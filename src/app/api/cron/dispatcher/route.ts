import { NextResponse } from "next/server";

// fire-and-forget internal hits
async function hit(path: string, method: "GET"|"POST" = "GET", body?: any) {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}${path}`;
  await fetch(url, {
    method,
    headers: { "Content-Type": "application/json", "X-Internal": process.env.CRON_SHARED_SECRET! },
    body: body ? JSON.stringify(body) : undefined,
  });
}

// Runs daily @ 07:00 UTC - schedules all posts with specific times
export async function GET() {
  const today = new Date();
  const utcDay = today.getUTCDay(); // 0=Sun, 1=Mon
  
  console.log(`🗓️ Daily dispatcher running for ${today.toISOString()}`);
  
  try {
    // 1) Schedule 3 social posts for different times today using Succulent scheduling
    const scheduledPosts = await schedulePostsWithTimes();
    
    // 2) Send daily email immediately
    await hit("/api/email/daily");
    
    // 3) Sunday-only: send due paid letters
    if (utcDay === 0) {
      await hit("/api/letters/send-due");
    }
    
    // 4) Monday-only: top up backlog (autoplan-batch)
    if (utcDay === 1) {
      await hit("/api/letters/autoplan-batch", "POST", { weeks: 4 });
    }

    return NextResponse.json({ 
      ok: true, 
      scheduledPosts: scheduledPosts.length,
      emailSent: true,
      weeklyLetters: utcDay === 0,
      autoplan: utcDay === 1,
      posts: scheduledPosts
    });
    
  } catch (error) {
    console.error("Dispatcher error:", error);
    return NextResponse.json({ 
      ok: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}

async function schedulePostsWithTimes() {
  const today = new Date();
  
  // Calculate posting times for today
  const postingTimes = [
    { 
      time: new Date(today.setUTCHours(8, 0, 0, 0)), 
      name: "morning",
      seed: Date.now() 
    },
    { 
      time: new Date(today.setUTCHours(14, 0, 0, 0)), 
      name: "afternoon",
      seed: Date.now() + 1000 
    },
    { 
      time: new Date(today.setUTCHours(20, 0, 0, 0)), 
      name: "evening",
      seed: Date.now() + 2000 
    }
  ];
  
  const scheduledPosts = [];
  
  for (const { time, name, seed } of postingTimes) {
    try {
      // Use the posts/schedule-batch endpoint to schedule with specific time
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/posts/schedule-batch`, {
        method: 'POST',
        headers: { 
          "Content-Type": "application/json", 
          "X-Internal": process.env.CRON_SHARED_SECRET! 
        },
        body: JSON.stringify({
          count: 1,
          startDate: time.toISOString(),
          seed,
          intervalHours: 0 // Single post
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        scheduledPosts.push({
          name,
          scheduledFor: time.toISOString(),
          result
        });
        console.log(`✅ Scheduled ${name} post for ${time.toISOString()}`);
      } else {
        console.error(`❌ Failed to schedule ${name} post`);
      }
      
    } catch (error) {
      console.error(`Error scheduling ${name} post:`, error);
    }
  }
  
  return scheduledPosts;
}
