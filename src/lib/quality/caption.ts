import { toUK } from "./ukSpelling";

const CTAs = [
  "Likes and comments help more than you know and make a huge difference to me.",
  "If this resonated, a like or comment really helps the post reach more people.",
  "Your likes and comments genuinely help visibility and keep this project going.",
];

const Closers = [
  "Thank you for being here.",
  "I'm growing this from the ground up. Thank you for the support.",
  "I appreciate you more than you know.",
];

const Hashtags = [
  "#softstrength", "#rebuilding", "#healing"
]; // max 3, no label

export function buildCaption(firstLine: string) {
  const cta = CTAs[Math.floor(Math.random() * CTAs.length)];
  const close = Closers[Math.floor(Math.random() * Closers.length)];

  // Sentence case for first line in caption
  const lead = firstLine.charAt(0).toUpperCase() + firstLine.slice(1);

  const body = `${lead}

This one's for the women rebuilding softly.

${cta}
Comment a 🤍 if this reached you.

${close}
${Hashtags.join(" ")}`;

  return toUK(body);
}
