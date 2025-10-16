import { z } from "zod";

export const Theme = z.enum(["rebuilding", "soft_strength", "self_trust", "letting_go", "becoming"]);
export type Theme = z.infer<typeof Theme>;

export const Tone = z.enum(["honest", "hopeful", "gentle", "empowered", "reflective"]);
export type Tone = z.infer<typeof Tone>;

export const Structure = z.enum(["three_line", "affirmation", "internal", "two_line"]);
export type Structure = z.infer<typeof Structure>;

export const Quote = z.object({
  id: z.string(),
  theme: Theme,
  tone: Tone,
  structure: Structure,
  lines: z.array(z.string()).min(1),
  tags: z.array(z.string()).default([]),
});
export type Quote = z.infer<typeof Quote>;
