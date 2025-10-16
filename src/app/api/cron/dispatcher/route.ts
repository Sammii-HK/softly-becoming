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

// Runs daily @ 08:00 UTC (Hobby precision is hourly; this is fine)
export async function GET() {
  // 1) IG posts (your three dayparts)
  await hit("/api/cron/morning");
  await hit("/api/cron/afternoon");
  await hit("/api/cron/evening");

  // 2) Free daily email (every day)
  await hit("/api/email/daily");

  // 3) Sunday-only: send due paid letters
  const utcDay = new Date().getUTCDay(); // 0=Sun
  if (utcDay === 0) await hit("/api/letters/send-due");

  // 4) Monday-only: top up backlog (autoplan-batch)
  if (utcDay === 1) await hit("/api/letters/autoplan-batch", "POST", { weeks: 4 });

  return NextResponse.json({ ok: true });
}
