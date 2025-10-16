import { NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2023-10-16" });
const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature")!;
  const raw = await req.text();
  
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(raw, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Handle successful payment for digital products
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // Check if this is a digital product purchase
    if (session.metadata?.type === "digital_product") {
      await handleDigitalProductDelivery(session);
    }
  }

  return NextResponse.json({ received: true });
}

async function handleDigitalProductDelivery(session: Stripe.Checkout.Session) {
  try {
    const productId = session.metadata?.productId;
    const productName = session.metadata?.productName;
    const customerEmail = session.customer_details?.email;
    
    if (!customerEmail || !productId || !productName) {
      console.error("Missing required data for product delivery:", {
        customerEmail,
        productId,
        productName
      });
      return;
    }

    // Generate download links using Vercel Blob
    const downloadLinks = await generateDownloadLinks(productId, session.id!);
    
    // Send delivery email
    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: customerEmail,
      subject: `Your ${productName} is ready for download! 🎨`,
      html: createDeliveryEmail(productName, downloadLinks, session.id!)
    });

    console.log(`✅ Digital product delivered to ${customerEmail}: ${productName}`);
    
  } catch (error) {
    console.error("Failed to deliver digital product:", error);
    
    // Send notification to admin about failed delivery
    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: process.env.EMAIL_FROM!, // Send to yourself
      subject: "🚨 Digital Product Delivery Failed",
      html: `
        <p>Failed to deliver digital product:</p>
        <ul>
          <li>Product: ${session.metadata?.productName}</li>
          <li>Customer: ${session.customer_details?.email}</li>
          <li>Session ID: ${session.id}</li>
          <li>Error: ${error}</li>
        </ul>
        <p>Please manually deliver the product to the customer.</p>
      `
    });
  }
}

async function generateDownloadLinks(productId: string, sessionId: string): Promise<string[]> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  
  // Generate secure download link for Vercel Blob
  const crypto = require('crypto');
  const secret = process.env.BLOB_READ_WRITE_TOKEN || process.env.CRON_SHARED_SECRET;
  const expiryTime = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
  
  const payload = `${productId}:${sessionId}:${expiryTime}`;
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  const token = Buffer.from(`${payload}:${signature}`).toString('base64url');
  
  return [
    `${baseUrl}/api/download/blob/${productId}?token=${token}`,
  ];
}

function createDeliveryEmail(productName: string, downloadLinks: string[], sessionId: string): string {
  return `
    <div style="font-family: serif; max-width: 600px; margin: 0 auto; color: #3A3A3A;">
      <div style="text-align: center; padding: 40px 20px;">
        <h1 style="font-size: 32px; margin-bottom: 16px;">Your ${productName} is Ready! 🎨</h1>
        <p style="font-size: 18px; opacity: 0.8; margin-bottom: 32px;">
          Thank you for your purchase. Your beautiful quote collection is ready for download.
        </p>
      </div>
      
      <div style="background: #FAF9F7; padding: 32px; border-radius: 8px; margin-bottom: 32px;">
        <h2 style="font-size: 24px; margin-bottom: 16px;">Download Your Files</h2>
        <p style="margin-bottom: 20px;">Click the button below to download your complete collection:</p>
        
        <div style="text-align: center; margin: 24px 0;">
          <a href="${downloadLinks[0]}" 
             style="background: #3A3A3A; color: #FAF9F7; padding: 16px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
            Download ${productName}
          </a>
        </div>
        
        <div style="font-size: 14px; opacity: 0.7; margin-top: 16px;">
          <p><strong>What's included:</strong></p>
          <ul>
            <li>High-quality PNG files (1080x1080 and 1080x1920)</li>
            <li>20 beautiful color variations</li>
            <li>Commercial use license included</li>
            <li>Organized folders for easy use</li>
          </ul>
        </div>
      </div>
      
      <div style="background: #E8F5E8; padding: 24px; border-radius: 8px; margin-bottom: 32px;">
        <h3 style="margin-bottom: 12px;">💡 Quick Start Tips</h3>
        <ul style="margin: 0; padding-left: 20px;">
          <li>Upload directly to Instagram, Pinterest, or your website</li>
          <li>Use for client work or your own business</li>
          <li>Print for physical products or wall art</li>
          <li>Mix and match colors to fit your brand</li>
        </ul>
      </div>
      
      <div style="text-align: center; padding: 20px;">
        <p style="margin-bottom: 16px;">Questions? We're here to help!</p>
        <p>
          <a href="mailto:hello@softrebuild.com" style="color: #3A3A3A;">hello@softrebuild.com</a>
        </p>
      </div>
      
      <div style="font-size: 12px; opacity: 0.6; text-align: center; padding-top: 20px; border-top: 1px solid #E5E5E5;">
        <p>Order ID: ${sessionId}</p>
        <p>Download links are valid for 30 days. Save your files locally.</p>
      </div>
    </div>
  `;
}
