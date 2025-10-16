import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2023-10-16" });

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID required" },
        { status: 400 }
      );
    }

    // Verify the Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 403 }
      );
    }

    const productId = session.metadata?.productId;
    if (!productId) {
      return NextResponse.json(
        { error: "No product associated with this session" },
        { status: 400 }
      );
    }

    // Generate secure download token (expires in 24 hours)
    const downloadToken = generateSecureDownloadToken(
      productId, 
      session.customer_details?.email || "",
      24 // hours
    );

    const downloadUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/download/${productId}?token=${downloadToken}`;

    return NextResponse.json({
      success: true,
      downloadUrl,
      expiresIn: "24 hours",
      productId
    });

  } catch (error) {
    console.error("Secure download error:", error);
    return NextResponse.json(
      { error: "Failed to generate download link" },
      { status: 500 }
    );
  }
}

function generateSecureDownloadToken(productId: string, email: string, hoursValid: number): string {
  const crypto = require('crypto');
  const secret = process.env.DOWNLOAD_SECRET || process.env.CRON_SHARED_SECRET || "fallback";
  
  const expiryTime = Date.now() + (hoursValid * 60 * 60 * 1000);
  const payload = `${productId}:${email}:${expiryTime}`;
  
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  // Encode payload + signature
  return Buffer.from(`${payload}:${signature}`).toString('base64url');
}
