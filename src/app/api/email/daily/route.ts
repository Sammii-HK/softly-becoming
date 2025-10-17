import { NextResponse } from "next/server";
import { Resend } from "resend";
import { generateQuotes } from "@/lib/generator/builder";
import { guardQuote } from "@/lib/quality/contentGuard";
import { assertInternal } from "@/lib/auth/internal";
import { prisma } from "@/lib/database/client";
// Note: Using Node.js runtime because Prisma Client requires Node.js APIs
// export const runtime = "edge";

export async function GET(req: Request) {
  try { assertInternal(req); } catch { return NextResponse.json({ error: "unauthorised" }, { status: 401 }); }

  const subs = await prisma.subscriber.findMany({ 
    where: { status: "ACTIVE", tier: "FREE" }, 
    select: { email: true, id: true }
  });
  if (subs.length === 0) return NextResponse.json({ ok: true, sent: 0 });

  // Generate newsletter-optimized quote
  const quotes = generateQuotes({ count: 20, seed: Date.now() });
  let selectedQuote = null;
  
  // Find a quote that passes quality guards
  for (const q of quotes) {
    const g = guardQuote(q.lines);
    if (g.ok) {
      selectedQuote = { quote: q, guarded: g };
      break;
    }
  }
  
  if (!selectedQuote) {
    console.error("No suitable quote found for newsletter");
    return NextResponse.json({ error: "No suitable content" }, { status: 500 });
  }

  const { quote, guarded } = selectedQuote;
  
  // Create beautiful newsletter HTML
  const html = createNewsletterTemplate(guarded.lines, quote.theme, quote.tone);
  const subject = createNewsletterSubject(guarded.lines[0], quote.theme);

  // Send in batches to avoid rate limits
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "Email service not configured" }, { status: 500 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const chunk = 800;
  let sent = 0;
  for (let i = 0; i < subs.length; i += chunk) {
    const slice = subs.slice(i, i + chunk).map((s: any) => s.email);
    try {
      await resend.emails.send({
        from: process.env.EMAIL_FROM!,
        to: slice,
        subject,
        html,
      });
      sent += slice.length;
    } catch (error) {
      console.error(`Failed to send batch ${i}-${i + chunk}:`, error);
      // Continue with other batches
    }
  }
  return NextResponse.json({ ok: true, sent, quote: quote.theme });
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
