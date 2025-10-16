import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import slugify from "slugify";
import { buildLetterFromKeep } from "@/lib/letters/templater";
import { renderHtml, renderText } from "@/lib/letters/render";
import { assertAdmin } from "@/lib/auth/internal";
const prisma = new PrismaClient();

export async function POST(req: Request) {
  try { assertAdmin(req); } catch { return NextResponse.json({ error: "unauthorised" }, { status: 401 }); }
  const { lineToKeep, theme, subject, sendAt } = await req.json();

  if (!lineToKeep) return NextResponse.json({ error: "lineToKeep required" }, { status: 400 });

  const json = buildLetterFromKeep({ lineToKeep, theme, subject });
  const slug = slugify(`${json.subject}-${Date.now()}`, { lower: true, strict: true });
  const bodyHtml = renderHtml(json);
  const bodyText = renderText(json);

  const letter = await prisma.letter.create({
    data: {
      slug, subject: json.subject, theme: json.theme, lineToKeep: json.lineToKeep,
      bodyJson: json as any, bodyHtml, bodyText,
      status: sendAt ? "SCHEDULED" : "DRAFT",
      sendAt: sendAt ? new Date(sendAt) : null
    }
  });

  return NextResponse.json({ ok: true, letter });
}
