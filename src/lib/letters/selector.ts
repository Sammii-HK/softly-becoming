import { guardQuote } from "@/lib/quality/contentGuard";

const MAX_WORDS = 12;
const MIN_WORDS = 4;

function score(line: string) {
  const words = line.trim().replace(/\.$/, "").split(/\s+/).length;
  let s = 0;
  if (/^you\b|^you're\b/i.test(line)) s += 3;          // second-person = sticky
  if (/^soft|^trust|^keep|^let's|^begin/i.test(line)) s += 1;
  if (/honest|gentle|soft|trust|again|enough/.test(line)) s += 1; // brand words
  if (words >= MIN_WORDS && words <= MAX_WORDS) s += 2; // good length
  if (/[?!]/.test(line)) s -= 1;                        // avoid shouty
  return s;
}

export function chooseKeepLine(candidates: string[]): string | null {
  // normalise & filter
  const cleaned = candidates
    .map(l => l.toLowerCase().trim())
    .map(l => (l.endsWith(".") ? l : `${l}.`));

  // disallow too clause-heavy or clinical language via guard
  const viable: { line: string; s: number }[] = [];
  for (const line of cleaned) {
    const g = guardQuote([line]);
    const j = g.lines.join(" ");
    if (g.reasons.includes("medical_claims") || g.reasons.includes("trauma_specifics")) continue;
    // quick rhythm: avoid two+ "as/while"
    if ((j.match(/\b(as|while)\b/g) || []).length >= 2) continue;
    viable.push({ line, s: score(line) });
  }

  if (!viable.length) return null;
  viable.sort((a, b) => b.s - a.s);
  return viable[0].line.replace(/\.$/, ""); // templater adds punctuation style
}
