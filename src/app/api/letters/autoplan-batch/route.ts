import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { generateQuotes } from "@/lib/generator/builder";
import { guardQuote } from "@/lib/quality/contentGuard";
import { buildLetterFromKeep } from "@/lib/letters/templater";
import { renderHtml, renderText } from "@/lib/letters/render";
import { chooseKeepLine } from "@/lib/letters/selector";
import { wasUsedKeep, markUsedKeep } from "@/lib/letters/seen";
import slugify from "slugify";
import { assertInternal } from "@/lib/auth/internal";

const prisma = new PrismaClient();

function addDaysUTC(d: Date, days: number) {
  const dt = new Date(d.getTime());
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt;
}

export async function POST(req: Request) {
  try { assertInternal(req); } catch { return NextResponse.json({ error: "unauthorised" }, { status: 401 }); }
  const { weeks = 4, startSundayUTC, theme, seed, hourUTC = 8 } = await req.json().catch(() => ({}));
  const created: any[] = [];

  const start = startSundayUTC ? new Date(startSundayUTC) : (() => {
    const now = new Date();
    const day = now.getUTCDay();
    const add = (7 - day) % 7 || 7;
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + add, hourUTC, 0, 0));
  })();

  for (let w = 0; w < weeks; w++) {
    const pool = generateQuotes({ count: 100, seed: (seed ?? Date.now()) + w, recentWindow: 1000 });
    const candidates: string[] = [];
    for (const q of pool) {
      const g = guardQuote(q.lines);
      if (!g.ok) continue;
      const l1 = g.lines[0].replace(/\.$/, "");
      const l3 = g.lines[g.lines.length - 1].replace(/\.$/, "");
      if (q.structure === "three_line") candidates.push(l3, l1);
      else candidates.push(l1);
    }
    let keep = chooseKeepLine(candidates);
    if (!keep) continue;
    if (await wasUsedKeep(keep)) continue;

    const json = buildLetterFromKeep({ lineToKeep: keep, theme });
    const bodyHtml = renderHtml(json);
    const bodyText = renderText(json);
    const sendAt = addDaysUTC(start, w * 7);
    const slug = slugify(`${json.subject}-${sendAt.toISOString().slice(0,10)}`, { lower: true, strict: true });

    const letter = await prisma.letter.create({
      data: {
        slug, subject: json.subject, theme: json.theme, lineToKeep: json.lineToKeep,
        bodyJson: json as any, bodyHtml, bodyText, status: "SCHEDULED", sendAt
      }
    });
    await markUsedKeep(keep);
    created.push(letter);
  }

  return NextResponse.json({ ok: true, count: created.length, letters: created });
}
