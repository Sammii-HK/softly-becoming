import { NextResponse } from "next/server";
import slugify from "slugify";
import { PrismaClient } from "@prisma/client";
import { buildLetterFromKeep } from "@/lib/letters/templater";
import { renderHtml, renderText } from "@/lib/letters/render";
import { assertAdmin } from "@/lib/auth/internal";
const prisma = new PrismaClient();

export async function POST(req: Request) {
  try { assertAdmin(req); } catch { return NextResponse.json({ error: "unauthorised" }, { status: 401 }); }
  const { lines, theme, startDate, cadenceDays = 7 } = await req.json();
  if (!Array.isArray(lines) || !lines.length) return NextResponse.json({ error: "lines[] required" }, { status: 400 });

  const base = startDate ? new Date(startDate) : new Date();
  const out: any[] = [];
  for (let i = 0; i < lines.length; i++) {
    const json = buildLetterFromKeep({ lineToKeep: lines[i], theme });
    const sendAt = new Date(base.getTime() + i * cadenceDays * 86400000);
    const slug = slugify(`${json.subject}-${sendAt.toISOString().slice(0,10)}`, { lower: true, strict: true });

    const letter = await prisma.letter.create({
      data: {
        slug, subject: json.subject, theme: json.theme, lineToKeep: json.lineToKeep,
        bodyJson: json as any, bodyHtml: renderHtml(json), bodyText: renderText(json),
        status: "SCHEDULED", sendAt
      }
    });
    out.push(letter);
  }
  return NextResponse.json({ ok: true, count: out.length, letters: out });
}
