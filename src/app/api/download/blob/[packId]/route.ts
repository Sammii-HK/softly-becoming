import { NextRequest, NextResponse } from "next/server";
import { list } from '@vercel/blob';
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2023-10-16" });

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ packId: string }> }
) {
  const { packId } = await params;
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const sessionId = searchParams.get("session_id");

  if (!token && !sessionId) {
    return NextResponse.json(
      { error: "Download token or session ID required" },
      { status: 401 }
    );
  }

  try {
    // Verify authorization
    let isAuthorized = false;
    let customerEmail = "";

    if (sessionId) {
      // Verify Stripe session
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      
      if (session.metadata?.productId === packId && 
          session.payment_status === "paid") {
        isAuthorized = true;
        customerEmail = session.customer_details?.email || "";
      }
    } else if (token) {
      // Verify secure token
      isAuthorized = verifySecureToken(token, packId);
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Invalid or expired download link" },
        { status: 403 }
      );
    }

    // Find the pack in Vercel Blob
    const blobs = await list({
      prefix: `packs/`,
      limit: 1000
    });

    const packBlob = blobs.blobs.find(blob => 
      blob.pathname.includes(packId) && blob.pathname.endsWith('.zip')
    );

    if (!packBlob) {
      return NextResponse.json(
        { error: "Product pack not found in storage" },
        { status: 404 }
      );
    }

    // Log download for analytics
    console.log(`📦 Blob download: ${packId} by ${customerEmail}`);

    // Redirect to the blob URL (Vercel handles the actual file serving)
    return NextResponse.redirect(packBlob.url);

  } catch (error) {
    console.error("Blob download error:", error);
    return NextResponse.json(
      { error: "Download failed" },
      { status: 500 }
    );
  }
}

function verifySecureToken(token: string, packId: string): boolean {
  try {
    const crypto = require('crypto');
    const decoded = Buffer.from(token, 'base64url').toString();
    const [payload, signature] = decoded.split(':').slice(-2);
    
    const secret = process.env.BLOB_READ_WRITE_TOKEN || process.env.CRON_SHARED_SECRET;
    const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    
    if (signature !== expectedSignature) {
      return false;
    }
    
    // Check expiry
    const [, , expiryStr] = decoded.split(':');
    const expiry = parseInt(expiryStr);
    
    return Date.now() < expiry;
  } catch (error) {
    console.error('Token verification failed:', error);
    return false;
  }
}
