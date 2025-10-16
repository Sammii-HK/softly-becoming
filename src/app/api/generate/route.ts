import { NextRequest, NextResponse } from "next/server";
import { generateQuotes } from "@/lib/generator/builder";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const count = Number(searchParams.get("count") ?? "20");
  const seed = searchParams.get("seed") ? Number(searchParams.get("seed")) : undefined;
  const quotes = generateQuotes({ count, seed });
  return NextResponse.json({ count: quotes.length, quotes });
}
