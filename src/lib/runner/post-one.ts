import { generateQuotes } from "@/lib/generator/builder";
import { postToAyrshare } from "@/lib/scheduler/ayrshare";
import { markPosted, hasPosted } from "@/lib/state/store";
import { createHash } from "node:crypto";
import { guardQuote } from "@/lib/quality/contentGuard";
import { buildCaption } from "@/lib/quality/caption";
import { logPost } from "@/lib/state/logger";

function hashLines(lines: string[]) {
  return createHash("sha1").update(lines.join("|")).digest("hex").slice(0, 16);
}

export async function postOne(opts: { seed?: number; weekday?: number }) {
  // Generate a bigger pool to allow the guard to filter aggressively
  const pool = generateQuotes({ count: 40, seed: opts.seed, weekday: opts.weekday, recentWindow: 500 });

  for (const q of pool) {
    // Guardrails: readability + safety + punctuation
    const guarded = guardQuote(q.lines);
    if (!guarded.ok) continue;

    const hash = hashLines(guarded.lines);
    if (await hasPosted(hash)) continue;

    const text = encodeURIComponent(guarded.lines.join("\n"));
    const imageUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/og?text=${text}`;

    const caption = buildCaption(guarded.lines[0]);

    const result = await postToAyrshare({ caption, mediaUrls: [imageUrl] });
    await markPosted(hash);
    await logPost({ ts: Date.now(), hash, theme: q.theme, tone: q.tone, structure: q.structure });

    return { ok: true, posted: { quote: { ...q, lines: guarded.lines }, imageUrl, result } };
  }
  return { ok: false, reason: "no_acceptable_quote_in_pool" };
}
