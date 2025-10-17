import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/auth/internal";
import { Resend } from "resend";

export async function POST(req: Request) {
  try { 
    assertAdmin(req); 
  } catch { 
    return NextResponse.json({ error: "unauthorised" }, { status: 401 }); 
  }

  const { type = "welcome" } = await req.json();
  
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM || !process.env.TEST_EMAIL) {
    return NextResponse.json({ 
      error: "Missing configuration", 
      missing: {
        apiKey: !process.env.RESEND_API_KEY,
        emailFrom: !process.env.EMAIL_FROM,
        testEmail: !process.env.TEST_EMAIL
      }
    }, { status: 400 });
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    const emailTemplates = {
      welcome: {
        subject: "🌸 Welcome to Softly Becoming - Test Email",
        html: `
          <div style="font-family: serif; max-width: 520px; margin: 2rem auto; color: #333;">
            <h2 style="font-weight: 400; margin: 0 0 16px; color: #666;">Welcome to Softly Becoming</h2>
            <p style="line-height: 1.6;">This is a test welcome email to verify your email system is working correctly.</p>
            <p style="line-height: 1.6;">One thoughtful note each morning, delivered with care.</p>
            <p style="line-height: 1.6; margin-top: 24px;">— Softly Becoming</p>
            <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;"/>
            <p style="font-size: 12px; opacity: 0.7; text-align: center;">
              Test sent at: ${new Date().toISOString()}
            </p>
          </div>
        `,
        text: `Welcome to Softly Becoming

This is a test welcome email to verify your email system is working correctly.

One thoughtful note each morning, delivered with care.

— Softly Becoming

Test sent at: ${new Date().toISOString()}`
      },
      newsletter: {
        subject: "🌱 Your Daily Reflection - Test Newsletter",
        html: `
          <div style="font-family: serif; max-width: 520px; margin: 2rem auto; color: #333;">
            <h2 style="font-weight: 400; margin: 0 0 16px; color: #666;">Your Daily Reflection</h2>
            <blockquote style="font-style: italic; font-size: 18px; line-height: 1.6; margin: 24px 0; padding-left: 20px; border-left: 3px solid #ddd;">
              "Growth happens in the quiet moments between who you were and who you're becoming."
            </blockquote>
            <p style="line-height: 1.6;">
              This is a test newsletter email. Your actual newsletters will contain beautiful, personalized reflections 
              designed to inspire gentle growth and self-discovery.
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="https://softly-becoming.vercel.app/shop" 
                 style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 6px; font-weight: 500;">
                Explore Our Shop
              </a>
            </div>
            <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;"/>
            <p style="font-size: 12px; opacity: 0.7; text-align: center;">
              Test newsletter sent at: ${new Date().toISOString()}
            </p>
          </div>
        `,
        text: `Your Daily Reflection

"Growth happens in the quiet moments between who you were and who you're becoming."

This is a test newsletter email. Your actual newsletters will contain beautiful, personalized reflections designed to inspire gentle growth and self-discovery.

Visit our shop: https://softly-becoming.vercel.app/shop

Test newsletter sent at: ${new Date().toISOString()}`
      }
    };

    const template = emailTemplates[type as keyof typeof emailTemplates] || emailTemplates.welcome;
    
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: process.env.TEST_EMAIL,
      subject: template.subject,
      html: template.html,
      text: template.text
    });

    return NextResponse.json({
      success: true,
      message: `Test ${type} email sent successfully!`,
      emailId: result.data?.id,
      sentTo: process.env.TEST_EMAIL,
      sentFrom: process.env.EMAIL_FROM,
      type
    });

  } catch (error) {
    console.error("Test email error:", error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      type
    }, { status: 500 });
  }
}
