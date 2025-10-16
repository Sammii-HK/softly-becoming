// Cute color palette - lots of pinks, purples, and blues with valid hex codes
const AESTHETIC_COLORS = [
  { bg: "#FEF9FF", text: "#4A1A5A", highlight: "#B83AAA" }, // soft pink bg, purple text, bright purple highlight
  { bg: "#FDF8FF", text: "#3A1A4A", highlight: "#9A2A8A" }, // pale purple bg, dark purple text, bright purple highlight
  { bg: "#FCF9FF", text: "#5A1A7A", highlight: "#C83ABA" }, // blush bg, purple text, magenta highlight
  { bg: "#FEF8FE", text: "#4A1A3A", highlight: "#B82A7A" }, // rose bg, dark text, rose highlight
  { bg: "#FDF9FE", text: "#3A1A2A", highlight: "#9A2A5A" }, // pink bg, dark text, pink highlight
  
  { bg: "#F9FCFF", text: "#1A2A5A", highlight: "#3A5AAA" }, // pale blue bg, blue text, bright blue highlight
  { bg: "#F8FBFF", text: "#0A1A4A", highlight: "#2A4A9A" }, // sky bg, navy text, blue highlight
  { bg: "#FAFDFF", text: "#1A3A6A", highlight: "#4A6ACA" }, // powder bg, blue text, bright blue highlight
  { bg: "#F7FAFF", text: "#0A2A5A", highlight: "#2A5ABA" }, // ice bg, blue text, bright blue highlight
  { bg: "#F9FDFF", text: "#1A4A7A", highlight: "#4A7ADA" }, // frost bg, blue text, bright blue highlight
  
  { bg: "#FEFAFF", text: "#4A1A6A", highlight: "#B83ACA" }, // lavender bg, purple text, bright purple highlight
  { bg: "#FDF9FF", text: "#3A1A5A", highlight: "#9A2ABA" }, // lilac bg, purple text, bright purple highlight
  { bg: "#FCF8FF", text: "#5A1A8A", highlight: "#CA3ADA" }, // violet bg, purple text, bright violet highlight
  { bg: "#FBF7FF", text: "#4A1A7A", highlight: "#BA3ACA" }, // periwinkle bg, purple text, bright purple highlight
  { bg: "#FAF6FF", text: "#6A1A9A", highlight: "#DA3AEA" }, // amethyst bg, purple text, bright purple highlight
  
  { bg: "#FFF9FE", text: "#5A1A4A", highlight: "#CA2A8A" }, // cotton candy bg, purple text, bright pink highlight
  { bg: "#FEF8FD", text: "#4A1A3A", highlight: "#BA2A7A" }, // ballet bg, dark text, pink highlight
  { bg: "#FDF7FC", text: "#3A1A2A", highlight: "#AA2A6A" }, // blush bg, dark text, pink highlight
  { bg: "#FCF6FB", text: "#5A1A4A", highlight: "#CA2A8A" }, // powder pink bg, purple text, bright pink highlight
  { bg: "#FBF5FA", text: "#4A1A3A", highlight: "#BA2A7A" }, // dusty rose bg, dark text, rose highlight
  
  { bg: "#F8F9FF", text: "#2A1A5A", highlight: "#6A3AAA" }, // whisper blue bg, purple text, blue-purple highlight
  { bg: "#F7F8FF", text: "#1A1A4A", highlight: "#5A3A9A" }, // mist bg, blue text, purple highlight
  { bg: "#F6F7FF", text: "#0A1A3A", highlight: "#4A3A8A" }, // cloud bg, navy text, purple highlight
  { bg: "#F5F6FF", text: "#1A0A4A", highlight: "#6A2A9A" }, // vapor bg, purple text, bright purple highlight
  { bg: "#F4F5FF", text: "#2A0A5A", highlight: "#7A2AAA" }, // haze bg, purple text, bright purple highlight
  
  { bg: "#FFF8FE", text: "#5A1A5A", highlight: "#DA3ADA" }, // fairy pink bg, purple text, bright magenta highlight
  { bg: "#FEF7FD", text: "#4A1A4A", highlight: "#CA3ACA" }, // tulle bg, purple text, bright purple highlight
  { bg: "#FDF6FC", text: "#3A1A3A", highlight: "#BA3ABA" }, // silk bg, dark text, purple highlight
  { bg: "#FCF5FB", text: "#5A1A5A", highlight: "#DA3ADA" }, // chiffon bg, purple text, bright magenta highlight
  { bg: "#FBF4FA", text: "#4A1A4A", highlight: "#CA3ACA" }, // organza bg, purple text, bright purple highlight
  
  { bg: "#F9FAFF", text: "#2A2A5A", highlight: "#6A6AAA" }, // pearl bg, blue-purple text, lavender highlight
  { bg: "#F8F9FE", text: "#1A2A4A", highlight: "#5A6A9A" }, // opal bg, blue text, blue-purple highlight
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
  return AESTHETIC_COLORS[hash % AESTHETIC_COLORS.length];
}

// New function to get highlight color for emphasis
export function getHighlightStyle(colors: any, text: string) {
  // Find the last line or most important part to highlight
  const lines = text.split('\n');
  const lastLine = lines[lines.length - 1];
  
  // Simple heuristic: highlight shorter lines (often the punchline)
  const shouldHighlight = lastLine.length < 50 || lines.length > 2;
  
  return shouldHighlight ? {
    background: `linear-gradient(120deg, ${colors.highlight}40 0%, ${colors.highlight}20 100%)`,
    padding: "4px 12px",
    borderRadius: "8px",
    display: "inline-block"
  } : {};
}

// Prevent orphaned words by adding non-breaking spaces
export function preventOrphanedWords(text: string): string {
  // Split into lines first to preserve intentional line breaks
  const lines = text.split('\n');
  
  return lines.map(line => {
    if (!line.trim()) return line;
    
    // Split the line into words
    const words = line.trim().split(/\s+/);
    
    // If less than 3 words, no orphan possible
    if (words.length < 3) return line;
    
    // Replace the space before the last word with a non-breaking space
    // This keeps the last two words together
    const result = words.slice(0, -2).join(' ') + ' ' + words.slice(-2).join('\u00A0');
    
    return result;
  }).join('\n');
}

// Add moderate spacing between paragraphs while preserving line breaks
export function enhanceParagraphSpacing(text: string): string {
  // Add a single space between newlines for subtle paragraph separation
  // This creates a middle ground between too tight and too loose
  return text.replace(/\n/g, '\n \n');
}

// Capitalize the word "i" grammatically
export function capitalizeI(text: string): string {
  // Replace standalone "i" with "I" (word boundaries ensure we don't affect words like "in", "it", etc.)
  return text.replace(/\bi\b/g, 'I');
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
  // Prevent orphaned words (widows/orphans)
  orphans: 2, // Minimum 2 lines at start of page/column
  widows: 2, // Minimum 2 lines at end of page/column
  // Add word spacing to help with line breaks
  wordSpacing: "0.1em",
} as const;
