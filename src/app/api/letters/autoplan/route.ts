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

function nextSundayAt(hour: number, minute = 0) {
  const now = new Date();
  const day = now.getUTCDay(); // 0=Sun
  const add = (7 - day) % 7 || 7; // next Sunday (if Sunday today, schedule next week)
  const dt = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + add, hour, minute, 0));
  return dt;
}

export async function POST(req: Request) {
  try { assertInternal(req); } catch { return NextResponse.json({ error: "unauthorised" }, { status: 401 }); }
  const { theme, subject, seed, count = 80, hourUTC = 8 } = await req.json().catch(() => ({}));

  // 1) Big pool to choose from
  const pool = generateQuotes({ count, seed: seed ?? Date.now(), recentWindow: 800 });

  // 2) Extract candidate keeps: prefer resolves (line3), then strong line1s
  const candidates: string[] = [];
  for (const q of pool) {
    const g = guardQuote(q.lines);
    if (!g.ok) continue;
    const l1 = g.lines[0].replace(/\.$/, "");
    const l3 = g.lines[g.lines.length - 1].replace(/\.$/, "");
    if (q.structure === "three_line") {
      candidates.push(l3, l1);
    } else if (q.structure === "two_line") {
      candidates.push(l1);
    } else if (q.structure === "affirmation") {
      candidates.push(l1);
    }
  }

  // 3) Pick a great keep
  let keep = chooseKeepLine(candidates);
  if (!keep) return NextResponse.json({ ok: false, error: "no_keep_found" }, { status: 422 });
  if (await wasUsedKeep(keep)) {
    // cheap retry with a different pool
    const altPool = generateQuotes({ count, seed: (seed ?? Date.now()) + 7 });
    const altCandidates = altPool.flatMap(q => [q.lines[0], q.lines.at(-1) || ""]).map(s => s || "");
    keep = chooseKeepLine(altCandidates) || keep;
  }

  // 4) Build the longform
  const letterJson = buildLetterFromKeep({ lineToKeep: keep, theme, subject });
  const html = renderHtml(letterJson);
  const text = renderText(letterJson);

  // 5) Store scheduled for next Sunday
  const sendAt = nextSundayAt(hourUTC);
  const slug = slugify(`${letterJson.subject}-${sendAt.toISOString().slice(0,10)}`, { lower: true, strict: true });

  const letter = await prisma.letter.create({
    data: {
      slug,
      subject: letterJson.subject,
      theme: letterJson.theme,
      lineToKeep: letterJson.lineToKeep,
      bodyJson: letterJson as any,
      bodyHtml: html,
      bodyText: text,
      status: "SCHEDULED",
      sendAt
    }
  });

  await markUsedKeep(keep);

  return NextResponse.json({ ok: true, letter });
}
