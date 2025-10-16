import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { assertAdmin } from "@/lib/auth/internal";
const prisma = new PrismaClient();

export async function GET(req: Request) {
  try { assertAdmin(req); } catch { return NextResponse.json({ error: "unauthorised" }, { status: 401 }); }
  const letters = await prisma.letter.findMany({
    orderBy: [{ status: "asc" }, { sendAt: "asc" }, { createdAt: "desc" }],
    take: 200
  });
  return NextResponse.json({ letters });
}
