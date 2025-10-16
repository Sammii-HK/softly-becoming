import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { assertAdmin } from "@/lib/auth/internal";
const prisma = new PrismaClient();

export async function POST(req: Request) {
  try { assertAdmin(req); } catch { return NextResponse.json({ error: "unauthorised" }, { status: 401 }); }
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await prisma.letter.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
