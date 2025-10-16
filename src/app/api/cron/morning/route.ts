import { NextResponse } from "next/server";
import { postOne } from "@/lib/runner/post-one";
import { assertInternal } from "@/lib/auth/internal";

// Note: Using Node.js runtime because postOne uses ioredis which requires Node.js APIs
// export const runtime = "edge";

export async function GET(req: Request) {
  try { assertInternal(req); } catch { return NextResponse.json({ error: "unauthorised" }, { status: 401 }); }
  
  const weekday = new Date().getUTCDay();
  const res = await postOne({ seed: Date.now(), weekday });
  return NextResponse.json(res);
}
