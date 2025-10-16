// Simple seedable PRNG so runs are repeatable if you want
export function mulberry32(seed: number) {
  return function() {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pick<T>(rand: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

export function pickWeighted<T extends string>(
  rand: () => number,
  weights: Record<T, number>
): T {
  const entries = Object.entries(weights) as [T, number][];
  const total = entries.reduce((s, [,w]) => s + w, 0);
  let r = rand() * total;
  for (const [key, w] of entries) {
    if ((r -= w) <= 0) return key;
  }
  return entries[entries.length - 1][0];
}
