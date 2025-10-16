import { nanoid } from "nanoid";
import { Theme, Tone, Structure, Quote } from "./schema";
import {
  truths, expands, resolves, affirmA, affirmB,
  versions, messages, internalTruths, internalRealise,
  expandByTheme, themeTags
} from "./data";
import { mulberry32, pick, pickWeighted } from "./rng";

export const THEMES: Theme[] = ["rebuilding", "soft_strength", "self_trust", "letting_go", "becoming"];
export const STRUCTURES: Structure[] = ["three_line", "affirmation", "internal", "two_line"];

export const WEIGHTS: Record<Tone, number> = {
  honest: 0.4,
  hopeful: 0.3,
  gentle: 0.2,
  empowered: 0.07,
  reflective: 0.03,
};

type GenOpts = {
  count: number;
  seed?: number;
  themeBias?: Partial<Record<Theme, number>>;
  recentWindow?: number; // number of recent unique hashes to avoid
  weekday?: number; // 0-6 (Sun-Sat) for romantic weights
};

const romanticThemeWeights: Record<number, Partial<Record<Theme, number>>> = {
  // 1=Mon ... 5=Fri (London week vibe)
  1: { rebuilding: 0.2, self_trust: 0.1 },
  2: { soft_strength: 0.2, rebuilding: 0.1 },
  3: { self_trust: 0.2, letting_go: 0.05 },
  4: { soft_strength: 0.2, becoming: 0.05 },
  5: { letting_go: 0.15, soft_strength: 0.1 },
  6: { becoming: 0.1, soft_strength: 0.1 }, // weekends gentle/reflective
  0: { becoming: 0.1, soft_strength: 0.1 },
};

function normaliseWeights<T extends string>(keys: T[], bias?: Partial<Record<T, number>>): Record<T, number> {
  const base = 1 / keys.length;
  const out: Record<T, number> = {} as any;
  for (const k of keys) out[k] = base + (bias?.[k] ?? 0);
  return out;
}

// very light hash
function hashKey(lines: string[]) {
  const s = lines.join("|");
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

function isReflectiveTruth(line: string) {
  return line.startsWith("not ") || line.includes("nothing") || line.includes("lost");
}

function needsVerb(line: string) {
  // Starts with a determiner/number/adjective and not already imperative/pronoun
  return /^(one|two|three|a|the|your|soft|quiet|gentle)\b/.test(line)
    && !/^(you|let|keep|take|choose|start|begin|stay|allow|move|set)\b/.test(line);
}

function hydrateImperative(line: string, rand: () => number) {
  if (!needsVerb(line)) return line;
  const verbs = ["take", "keep", "choose", "start", "begin", "move", "set", "allow"];
  const v = verbs[Math.floor(rand() * verbs.length)];
  return `${v} ${line}`;
}

function pickExpand(rand: () => number, theme: Theme, truthLine: string): string {
  const themeChance = rand() < 0.3;
  const themed = themeChance ? expandByTheme[theme] : undefined;

  const pool =
    isReflectiveTruth(truthLine)
      ? expands.active // lift the energy after reflective truth
      : rand() < 0.5
        ? expands.active
        : expands.reflective;

  if (themed && rand() < 0.7) return pick(rand, themed);
  return pick(rand, pool);
}

function buildLines(structure: Structure, rand: () => number, theme: Theme): string[] {
  switch (structure) {
    case "three_line": {
      const t = pick(rand, truths);
      let e = pickExpand(rand, theme, t);
      e = hydrateImperative(e, rand);
      const r = pick(rand, resolves);
      return [t + ".", e + ".", r + "."];
    }
    case "two_line":
      return [pick(rand, truths) + ".", pick(rand, resolves) + "."];
    case "affirmation":
      return [pick(rand, affirmA) + ".", pick(rand, affirmB) + "."];
    case "internal":
      return [pick(rand, internalTruths) + ",", pick(rand, internalRealise) + "."];
  }
}

function flatRhythm(lines: string[]) {
  const j = lines.join(" ");
  const asWhile = (j.match(/\b(as|while)\b/g) || []).length;
  return asWhile >= 2; // too many dependent clauses
}

export function generateQuotes(opts: GenOpts): Quote[] {
  const seed = opts.seed ?? Date.now();
  const rand = mulberry32(seed);
  const recent = new Set<string>();
  const results: Quote[] = [];

  const weekdayBias = opts.weekday != null ? romanticThemeWeights[opts.weekday] : undefined;
  const themeWeights = normaliseWeights(THEMES, { ...(opts.themeBias || {}), ...(weekdayBias || {}) });

  while (results.length < opts.count) {
    const theme = pickWeighted(rand, themeWeights as any) as Theme;
    const tone = pickWeighted(rand, WEIGHTS as any) as Tone;
    const structure = pick(rand, STRUCTURES);

    const lines = buildLines(structure, rand, theme);
    if (flatRhythm(lines)) continue;

    const key = hashKey(lines);
    if (recent.has(key)) continue;
    recent.add(key);
    if (opts.recentWindow && recent.size > opts.recentWindow) {
      recent.delete(recent.values().next().value as string);
    }

    results.push({
      id: nanoid(10),
      theme,
      tone,
      structure,
      lines,
      tags: [...new Set([tone, theme, ...themeTags[theme]])],
    });
  }
  return results;
}
