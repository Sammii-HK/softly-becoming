import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/auth/internal";
import { generateQuotes } from "@/lib/generator/builder";
import { guardQuote } from "@/lib/quality/contentGuard";

export async function POST(req: Request) {
  try {
    assertAdmin(req);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { count = 7 } = await req.json();
    
    const previews = [];
    
    // Generate previews for the next week
    for (let day = 0; day < count; day++) {
      const seed = Date.now() + (day * 86400000); // Different seed per day
      const quotes = generateQuotes({ count: 20, seed });
      
      // Find first suitable quote
      let selectedQuote = null;
      for (const q of quotes) {
        const g = guardQuote(q.lines);
        if (g.ok) {
          selectedQuote = { quote: q, guarded: g };
          break;
        }
      }
      
      if (selectedQuote) {
        const { quote, guarded } = selectedQuote;
        const html = createNewsletterTemplate(guarded.lines, quote.theme, quote.tone);
        const subject = createNewsletterSubject(guarded.lines[0], quote.theme);
        
        previews.push({
          quote: {
            lines: guarded.lines,
            theme: quote.theme,
            tone: quote.tone,
            structure: quote.structure,
            tags: quote.tags
          },
          subject,
          html,
          seed
        });
      }
    }

    return NextResponse.json({
      success: true,
      previews,
      count: previews.length
    });

  } catch (error) {
    console.error("Newsletter preview error:", error);
    return NextResponse.json(
      { error: "Failed to generate previews" },
      { status: 500 }
    );
  }
}

function createNewsletterTemplate(lines: string[], theme: string, tone: string): string {
  const today = new Date().toLocaleDateString('en-GB', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return `
    <div style="font-family: ui-serif, Georgia, serif; max-width: 520px; margin: 2rem auto; color: #3A3A3A; background: #FAF9F7; padding: 40px 32px; border-radius: 12px;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="font-size: 28px; font-weight: 300; margin: 0 0 8px; color: #3A3A3A;">Softly Becoming</h1>
        <p style="font-size: 14px; color: #666; margin: 0; text-transform: uppercase; letter-spacing: 1px;">Daily Gentle Notes</p>
        <p style="font-size: 12px; color: #999; margin: 8px 0 0;">${today}</p>
      </div>

      <!-- Quote Content -->
      <div style="background: white; padding: 32px; border-radius: 8px; margin-bottom: 24px; border-left: 4px solid #A78BFA;">
        <div style="font-size: 20px; line-height: 1.6; font-style: italic; margin-bottom: 16px;">
          ${lines.map((line, index) => 
            index === lines.length - 1 
              ? `<span style="color: #A78BFA; font-weight: 500;">${line}</span>`
              : line
          ).join('<br/>')}
        </div>
        <div style="font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 1px; margin-top: 16px;">
          ${theme.replace('_', ' ')} • ${tone}
        </div>
      </div>

      <!-- Gentle CTA -->
      <div style="text-align: center; margin: 24px 0;">
        <p style="font-size: 14px; color: #666; margin-bottom: 16px;">
          If this gentle note reached you today, consider sharing the love.
        </p>
        <a href="https://softly-becoming.vercel.app/shop?utm_source=newsletter&utm_medium=email&utm_campaign=daily" 
           style="display: inline-block; background: #A78BFA; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500;">
          Explore Quote Collections
        </a>
      </div>

      <!-- Footer -->
      <div style="border-top: 1px solid #E5E5E5; padding-top: 24px; text-align: center;">
        <div style="margin-bottom: 16px;">
          <a href="https://www.instagram.com/softly.becoming.studio/" style="color: #999; text-decoration: none; margin: 0 8px;">Instagram</a>
          <a href="https://uk.pinterest.com/softlybecomingstudio/" style="color: #999; text-decoration: none; margin: 0 8px;">Pinterest</a>
          <a href="https://x.com/softly_becoming" style="color: #999; text-decoration: none; margin: 0 8px;">X</a>
        </div>
        <p style="font-size: 12px; color: #999; margin: 8px 0;">
          Softly Becoming • Supporting gentle transformation
        </p>
        <p style="font-size: 11px; color: #ccc; margin: 8px 0;">
          <a href="{{unsubscribe}}" style="color: #ccc;">Unsubscribe</a> • 
          <a href="https://softly-becoming.vercel.app/privacy" style="color: #ccc;">Privacy</a>
        </p>
      </div>
    </div>
  `;
}

function createNewsletterSubject(firstLine: string, theme: string): string {
  const subjects = [
    `${firstLine.split('.')[0]}`,
    `gentle note: ${firstLine.split('.')[0].toLowerCase()}`,
    `today's reflection`,
    `morning wisdom`,
    `a gentle reminder`
  ];
  
  // Use theme to pick subject style
  if (theme.includes('strength')) {
    return subjects[0]; // Direct quote
  } else if (theme.includes('trust')) {
    return subjects[1]; // Gentle note format
  } else {
    return subjects[Math.floor(Math.random() * subjects.length)];
  }
}
