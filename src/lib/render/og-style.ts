// Expanded cute pastel color palette
const PASTEL_COLORS = [
  { bg: "#FFF5F7", text: "#4A3B47" }, // soft pink
  { bg: "#F0F4FF", text: "#3B4A5C" }, // soft blue
  { bg: "#F5FFF0", text: "#3B5C3B" }, // soft green
  { bg: "#FFF8F0", text: "#5C4A3B" }, // soft peach
  { bg: "#F8F0FF", text: "#4A3B5C" }, // soft lavender
  { bg: "#F0FFFA", text: "#3B5C4A" }, // soft mint
  { bg: "#FFF0F8", text: "#5C3B4A" }, // soft rose
  { bg: "#F5F0FF", text: "#473B5C" }, // soft periwinkle
  { bg: "#FFF9F0", text: "#5C4B3B" }, // soft cream
  { bg: "#F0F8FF", text: "#3B485C" }, // soft sky
  { bg: "#F8FFF0", text: "#485C3B" }, // soft sage
  { bg: "#FFF0F5", text: "#5C3B48" }, // soft blush
  { bg: "#F0FFF8", text: "#3B5C48" }, // soft seafoam
  { bg: "#F5F8FF", text: "#3B475C" }, // soft powder
  { bg: "#FFF8F5", text: "#5C483B" }, // soft sand
  { bg: "#F8F5FF", text: "#483B5C" }, // soft lilac
  { bg: "#F0FFF0", text: "#3B5C3B" }, // soft honeydew
  { bg: "#FFF5F0", text: "#5C3B3B" }, // soft coral
  { bg: "#F5FFF8", text: "#3B5C45" }, // soft spring
  { bg: "#F8F0F5", text: "#5C3B48" }, // soft mauve
] as const;

// Simple hash function to get consistent color for same text
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

export function getColorForText(text: string) {
  const hash = hashString(text);
  return PASTEL_COLORS[hash % PASTEL_COLORS.length];
}

export const baseStyle = {
  width: "1080px",
  height: "1080px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "120px", // More breathing room
} as const;

export const textStyle = {
  fontSize: 48, // Smaller, more elegant
  lineHeight: 1.4, // More breathing room between lines
  letterSpacing: "-0.005em",
  whiteSpace: "pre-wrap",
  textAlign: "left", // Back to left-aligned as requested
  maxWidth: "560px", // Shorter lines to avoid orphaned words
} as const;
