// Lightweight, deterministic content linting/repair for quotes & captions.

type GuardResult = { ok: boolean; lines: string[]; reasons: string[] };

const bannedPunctuation = /—|–/g; // no em/en dashes
const shouty = /!{2,}/;           // avoid shouting
const medicalClaims = /\b(diagnosed|cure|clinical|therapy|ptsd|depression|anxiety disorder)\b/i;
const traumaSpecifics = /\b(assault|abuse|self\-harm|suicide)\b/i;

function normaliseQuotes(lines: string[]): string[] {
  // strip forbidden punctuation, trim whitespace, enforce terminal periods except "letter" structure lines handled earlier
  return lines.map(l => l.replace(bannedPunctuation, "-").trim());
}

function hasVerb(line: string) {
  // very simple heuristic: contains a verb-ish lead (you/let/keep/take/choose/start/begin/stay/allow/can/are) or present participle with aux
  return /^(you|let|keep|take|choose|start|begin|stay|allow|can|are|you're)\b/i.test(line);
}

function middleNeedsVerb(l2: string) {
  // if line starts as a noun phrase (one/the/your/quiet/gentle/soft) without a verb
  return /^(one|two|the|your|quiet|gentle|soft)\b/i.test(l2) && !hasVerb(l2);
}

function hydrateImperative(line: string): string {
  if (!middleNeedsVerb(line)) return line;
  const verbs = ["take","keep","choose","start","begin","set","allow","move"];
  const v = verbs[Math.floor(Math.random() * verbs.length)];
  return `${v} ${line}`;
}

function tooManyDependents(lines: string[]) {
  const joined = lines.join(" ");
  const count = (joined.match(/\b(as|while)\b/g) || []).length;
  return count >= 2;
}

export function guardQuote(raw: string[]): GuardResult {
  const reasons: string[] = [];
  let lines = normaliseQuotes(raw);

  // safety filters
  const joined = lines.join(" ");
  if (medicalClaims.test(joined)) reasons.push("medical_claims");
  if (traumaSpecifics.test(joined)) reasons.push("trauma_specifics");
  if (shouty.test(joined)) reasons.push("shouty_punctuation");

  // readability & rhythm
  if (tooManyDependents(lines)) reasons.push("flat_rhythm");

  // imperative hydration for middle line (three_line only heuristic: length 3)
  if (lines.length === 3) {
    lines[1] = hydrateImperative(lines[1]);
  }

  // terminal punctuation: ensure '.', except "love," and "me."
  lines = lines.map(l => {
    if (l.endsWith(".") || l.endsWith(",") || l.endsWith("?")) return l;
    // preserve 'love,' style in letters
    if (/^(love|me),?$/i.test(l)) return l.endsWith(",") ? l : `${l},`;
    return `${l}.`;
  });

  // fail if any hard safety issues
  const hardFail = reasons.some(r => ["medical_claims","trauma_specifics"].includes(r));
  // soft fails (we'll let the generator try another option upstream)
  const ok = !hardFail && !reasons.includes("flat_rhythm");

  return { ok, lines, reasons };
}
