import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";
import { assertInternal } from "@/lib/auth/internal";
const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY!);

export async function GET(req: Request) {
  try { assertInternal(req); } catch { return NextResponse.json({ error: "unauthorised" }, { status: 401 }); }

  const now = new Date();
  const due = await prisma.letter.findMany({
    where: { status: "SCHEDULED", sendAt: { lte: now } },
    orderBy: { sendAt: "asc" },
    take: 3
  });
  if (!due.length) return NextResponse.json({ ok: true, sent: 0 });

  const subs = await prisma.subscriber.findMany({
    where: { status: "ACTIVE", tier: "PAID" },
    select: { email: true }
  });

  for (const letter of due) {
    const chunk = 800;
    for (let i = 0; i < subs.length; i += chunk) {
      const to = subs.slice(i, i + chunk).map(s => s.email);
      await resend.emails.send({
        from: process.env.EMAIL_FROM!,
        to, subject: letter.subject, html: letter.bodyHtml, text: letter.bodyText
      });
    }
    await prisma.letter.update({ where: { id: letter.id }, data: { status: "SENT" } });
  }
  return NextResponse.json({ ok: true, sent: due.length });
}
