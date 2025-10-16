import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const testEmail = searchParams.get("email") || "test@example.com";

  // Check environment variables
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({
      success: false,
      error: "RESEND_API_KEY not configured",
      config: {
        hasApiKey: false,
        hasEmailFrom: !!process.env.EMAIL_FROM,
        emailFrom: process.env.EMAIL_FROM || "not set"
      }
    }, { status: 400 });
  }

  if (!process.env.EMAIL_FROM) {
    return NextResponse.json({
      success: false,
      error: "EMAIL_FROM not configured",
      config: {
        hasApiKey: true,
        hasEmailFrom: false,
        emailFrom: "not set"
      }
    }, { status: 400 });
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: testEmail,
      subject: "🧪 Resend Test Email - Soft Rebuild",
      html: `
        <div style="font-family: serif; max-width: 520px; margin: 2rem auto; color: #333;">
          <h2 style="font-weight: 400; margin: 0 0 16px; color: #666;">Resend Test Email</h2>
          <p style="line-height: 1.6;">
            This is a test email to verify that your Resend integration is working correctly.
          </p>
          <p style="line-height: 1.6;">
            <strong>Test Details:</strong><br/>
            • Sent at: ${new Date().toISOString()}<br/>
            • To: ${testEmail}<br/>
            • From: ${process.env.EMAIL_FROM}
          </p>
          <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;"/>
          <p style="font-size: 12px; opacity: 0.7; text-align: center;">
            Soft Rebuild - Email Service Test
          </p>
        </div>
      `,
      text: `Resend Test Email

This is a test email to verify that your Resend integration is working correctly.

Test Details:
- Sent at: ${new Date().toISOString()}
- To: ${testEmail}
- From: ${process.env.EMAIL_FROM}

Soft Rebuild - Email Service Test`
    });

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully!",
      emailId: result.data?.id,
      sentTo: testEmail,
      sentFrom: process.env.EMAIL_FROM,
      config: {
        hasApiKey: true,
        hasEmailFrom: true,
        emailFrom: process.env.EMAIL_FROM
      }
    });

  } catch (error) {
    console.error("Resend test error:", error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      config: {
        hasApiKey: true,
        hasEmailFrom: true,
        emailFrom: process.env.EMAIL_FROM
      }
    }, { status: 500 });
  }
}
