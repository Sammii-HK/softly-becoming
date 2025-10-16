import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";
import { assertAdmin } from "@/lib/auth/internal";
const prisma = new PrismaClient();

export async function POST(req: Request) {
  try { assertAdmin(req); } catch { return NextResponse.json({ error: "unauthorised" }, { status: 401 }); }

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const letter = await prisma.letter.findUnique({ where: { id } });
  if (!letter) return NextResponse.json({ error: "not found" }, { status: 404 });

  const subs = await prisma.subscriber.findMany({
    where: { status: "ACTIVE", tier: "PAID" },
    select: { email: true }
  });

  const resend = new Resend(process.env.RESEND_API_KEY || "");
  const chunk = 800;
  for (let i = 0; i < subs.length; i += chunk) {
    const to = subs.slice(i, i + chunk).map((s: any) => s.email);
    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to, subject: letter.subject, html: letter.bodyHtml, text: letter.bodyText
    });
  }

  await prisma.letter.update({ where: { id }, data: { status: "SENT", sendAt: new Date() } });
  return NextResponse.json({ ok: true });
}
