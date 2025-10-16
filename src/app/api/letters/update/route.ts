import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { assertAdmin } from "@/lib/auth/internal";
const prisma = new PrismaClient();

export async function POST(req: Request) {
  try { assertAdmin(req); } catch { return NextResponse.json({ error: "unauthorised" }, { status: 401 }); }
  const { id, subject, sendAt, status } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const letter = await prisma.letter.update({
    where: { id },
    data: {
      subject: subject ?? undefined,
      sendAt: sendAt ? new Date(sendAt) : undefined,
      status: status ?? undefined,
    }
  });
  return NextResponse.json({ ok: true, letter });
}
