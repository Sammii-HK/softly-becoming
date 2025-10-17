import { NextResponse } from "next/server";
import { prisma } from "@/lib/database/client";

export async function GET() {
  try {
    // Test database connection
    const subscriberCount = await prisma.subscriber.count();
    
    // Test environment variables
    const envCheck = {
      database: !!process.env.DATABASE_URL,
      resend: !!process.env.RESEND_API_KEY,
      stripe: !!process.env.STRIPE_SECRET_KEY,
      succulent: !!process.env.AYRSHARE_API_KEY,
      blob: !!process.env.BLOB_READ_WRITE_TOKEN,
      adminToken: !!process.env.ADMIN_TOKEN,
      publicAdminToken: !!process.env.NEXT_PUBLIC_ADMIN_TOKEN,
      emailFrom: !!process.env.EMAIL_FROM,
      testEmail: !!process.env.TEST_EMAIL,
      webhookSecrets: {
        resend: !!process.env.RESEND_WEBHOOK_SECRET,
        stripe: !!process.env.STRIPE_WEBHOOK_SECRET
      }
    };

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        subscriberCount
      },
      environment: envCheck,
      version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || "dev"
    });

  } catch (error) {
    console.error("Health check failed:", error);
    
    return NextResponse.json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
      database: {
        connected: false
      }
    }, { status: 500 });
  }
}
