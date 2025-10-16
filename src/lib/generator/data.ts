import { Theme } from "./schema";

/**
 * CORE POOLS
 * Keep lowercase. Avoid "ing" starts in truth lines to maintain strong openings.
 */

export const truths = [
  "you didn't ruin your life",
  "you're allowed to start again",
  "soft doesn't mean weak",
  "you are not behind",
  "healing is not a race",
  "you are allowed to grow slowly",
  "you're not late to your own life",
  "you can be soft and still be brave",
  "your pace is not a problem",
  "beginning again is a skill",
  "you don't have to earn your rest",
  "you are allowed to change your mind",
  "healing can look like small choices",
  "you don't have to prove your pain",
  "you're learning to trust yourself",
  "not everything lost was meant to stay",
  "you can rebuild quietly",
  "you are becoming the person you needed",
] as const;

/**
 * EXPANDS split by rhythm type so we can pair well with "reflective" truths.
 */
export const expands = {
  active: [
    "you're rebuilding it, piece by piece",
    "you're becoming someone you can trust",
    "take one honest step at a time",
    "you are allowed to rest",
    "you can choose the softer path",
    "you can start where you are",
    "you can keep what is true",
    "you can set a kinder pace",
    "you can let yourself be new",
    "you can stay with what matters",
  ],
  reflective: [
    "even when no one sees you",
    "slow is still progress",
    "even if nobody claps for you",
    "in the quiet, ordinary days",
    "especially when it feels too slow",
    "in ways that won't make sense to everyone",
    "as you forgive your old self",
    "as you let the noise fall away",
    "as you learn what peace feels like",
    "while you make room for rest",
  ],
} as const;

export const resolves = [
  "that's still strength",
  "that's still growth",
  "that counts",
  "that is enough",
  "keep going, gently",
  "let it be enough",
  "that's what courage looks like",
  "keep choosing the kinder path",
  "softness will carry you further",
  "there is time for you",
  "you're already on your way",
  "this is how you come home",
  "make it gentle, not perfect",
  "you get to try again",
  "trust the slow becoming",
  "the quiet work still matters",
  "your softness is a strength",
  "you're doing beautifully",
] as const;

export const affirmA = [
  "you are enough",
  "you are still growing",
  "you are safe to try again",
  "you are allowed to be new",
  "you are learning to trust yourself",
] as const;

export const affirmB = [
  "this time you'll be kinder",
  "you don't need anyone's permission",
  "it can be soft and still be strong",
  "you can rest without guilt",
  "you can change your mind",
] as const;

export const versions = [
  "the version of you who almost gave up",
  "the softer version of you",
  "the tired version of you",
  "the braver version of you",
] as const;

export const messages = [
  "i'm proud of how far you've come",
  "it's okay to let go now",
  "you're not too late",
  "you're allowed to start again",
  "you're allowed to rest",
] as const;

export const internalTruths = [
  "sometimes i think i should be further along",
  "sometimes i forget i'm allowed to begin again",
  "sometimes i feel small when i'm growing",
] as const;

export const internalRealise = [
  "but then i remember slow is still progress",
  "but then i remember i am becoming",
  "but then i remember soft can be strong",
] as const;

/**
 * Optional theme colouring for 30% of expands
 */
export const expandByTheme: Record<Theme, string[]> = {
  rebuilding: [
    "you can rebuild with both hands free",
    "you can lay one true brick today",
    "you can keep what loves you and leave the rest",
  ],
  soft_strength: [
    "you can hold your boundaries without hardness",
    "you can let kindness lead",
    "you can be gentle and still be firm",
  ],
  self_trust: [
    "you can listen in and choose yourself",
    "you can believe what your body tells you",
    "you can follow the quiet yes",
  ],
  letting_go: [
    "you can put down what hurts to carry",
    "you can end what ended",
    "you can love without holding on",
  ],
  becoming: [
    "you can bloom where you are",
    "you can surprise yourself",
    "you can grow past what you outgrew",
  ],
};

export const themeTags: Record<Theme, string[]> = {
  rebuilding: ["rebuilding", "healing", "again"],
  soft_strength: ["soft", "strength", "gentle"],
  self_trust: ["self_trust", "intuition", "becoming"],
  letting_go: ["release", "boundaries", "peace"],
  becoming: ["becoming", "change", "bloom"],
};
