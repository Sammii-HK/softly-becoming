import { NextResponse } from "next/server";
import { readRecent } from "@/lib/state/logger";

// Note: Using Node.js runtime because ioredis requires Node.js APIs
// export const runtime = "edge";

export async function GET() {
  const rows = await readRecent(200);
  const byTheme: Record<string, number> = {};
  const byTone: Record<string, number> = {};
  for (const r of rows) {
    byTheme[r.theme] = (byTheme[r.theme] || 0) + 1;
    byTone[r.tone] = (byTone[r.tone] || 0) + 1;
  }
  return NextResponse.json({ count: rows.length, byTheme, byTone, sample: rows.slice(0, 10) });
}
