import { toUK } from "./ukSpelling";

const InspirationalClosers = [
  "You are exactly where you need to be.",
  "Trust the gentle process of becoming.",
  "Your journey is sacred and worthy.",
  "Every small step is transformation.",
  "You're growing beautifully, even when it doesn't feel like it.",
  "Gentle progress is still progress.",
  "Your softness is your strength."
];

// Dynamic hashtags based on quote theme and content
const ThemeHashtags = {
  'soft_strength': ['#gentlestrength', '#softpower', '#quietconfidence'],
  'rebuilding': ['#rebuilding', '#startingover', '#secondchances'],
  'self_trust': ['#selftrust', '#innerwisdom', '#trustyourself'],
  'letting_go': ['#lettinggo', '#gentleboundaries', '#release'],
  'becoming': ['#becoming', '#transformation', '#growth'],
  'healing': ['#gentlehealing', '#healingjourney', '#selfcompassion']
};

const UniversalHashtags = [
  '#softlybecoming', '#gentlewisdom', '#authenticself', 
  '#mindfulmoments', '#selfkindness', '#gentletransformation',
  '#quietstrength', '#intentionalliving', '#selfacceptance'
];

export function buildCaption(firstLine: string, theme = 'becoming', fullQuote?: string[]) {
  const closer = InspirationalClosers[Math.floor(Math.random() * InspirationalClosers.length)];
  
  // Get theme-specific hashtags
  const themeHashtags = ThemeHashtags[theme as keyof typeof ThemeHashtags] || ThemeHashtags['becoming'];
  const universalHashtags = UniversalHashtags.slice(0, 2); // Pick 2 universal ones
  
  // Mix theme and universal hashtags (max 5 total)
  const allHashtags = [...themeHashtags, ...universalHashtags].slice(0, 5);

  // Sentence case for first line in caption
  const lead = firstLine.charAt(0).toUpperCase() + firstLine.slice(1);

  // Create inspiring, non-needy caption
  const body = `${lead}

For the women choosing to rebuild with intention.

${closer}

${allHashtags.join(" ")}`;

  return toUK(body);
}
