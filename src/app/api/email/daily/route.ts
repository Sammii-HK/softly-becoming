import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";
import { generateQuotes } from "@/lib/generator/builder";
import { guardQuote } from "@/lib/quality/contentGuard";
import { assertInternal } from "@/lib/auth/internal";

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY!);
// Note: Using Node.js runtime because Prisma Client requires Node.js APIs
// export const runtime = "edge";

export async function GET(req: Request) {
  try { assertInternal(req); } catch { return NextResponse.json({ error: "unauthorised" }, { status: 401 }); }

  const subs = await prisma.subscriber.findMany({ 
    where: { status: "ACTIVE", tier: "FREE" }, 
    select: { email: true, id: true }
  });
  if (subs.length === 0) return NextResponse.json({ ok: true, sent: 0 });

  const q = generateQuotes({ count: 5, seed: Date.now() })[0];
  const g = guardQuote(q.lines);
  const html = `
    <div style="font-family:serif;max-width:520px;margin:2rem auto;color:#333">
      <h2 style="font-weight:400;margin:0 0 16px">soft rebuild daily</h2>
      <p style="line-height:1.6">${g.lines.join("<br/>")}</p>
      <hr style="margin:24px 0;border:none;border-top:1px solid #eee"/>
      <p style="font-size:12px;opacity:.7">To unsubscribe, click here.</p>
    </div>`;

  // Send in batches to avoid rate limits
  const chunk = 800;
  let sent = 0;
  for (let i = 0; i < subs.length; i += chunk) {
    const slice = subs.slice(i, i + chunk).map(s => s.email);
    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: slice,
      subject: "today's note — soft rebuild",
      html,
    });
    sent += slice.length;
  }
  return NextResponse.json({ ok: true, sent });
}
