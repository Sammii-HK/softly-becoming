import { NextResponse } from "next/server";
import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";
// Removed getProductById - using simpler approach
// Removed packageZip - using existing Vercel Blob system instead
import { sendOrderEmail } from "@/lib/fulfilment/sendEmail";
import { LicenseTier, Currency } from "@/lib/pricing/getPrices";
import path from "path";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2023-10-16" });
const prisma = new PrismaClient();

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  
  if (!sig) {
    console.error('Missing Stripe signature header');
    return new NextResponse("Missing signature", { status: 400 });
  }

  let raw: string;
  try {
    raw = await req.text();
  } catch (error) {
    console.error('Failed to read request body:', error);
    return new NextResponse("Failed to read request body", { status: 400 });
  }

  // Validate environment variables at runtime
  if (!process.env.STRIPE_SECRET_KEY) {
    return new NextResponse("Stripe not configured", { status: 500 });
  }
  
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return new NextResponse("Webhook secret not configured", { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    // Handle subscription events (comprehensive newsletter lifecycle)
    if (event.type === "checkout.session.completed") {
      const s = event.data.object as Stripe.Checkout.Session;
      const email = s.customer_details?.email;
      const subscriberId = s.metadata?.subscriberId;
      
      // Handle subscription checkout
      if (email && subscriberId && s.mode === "subscription") {
        try {
          await prisma.subscriber.update({
            where: { id: subscriberId },
            data: { tier: "PAID", stripeId: String(s.customer) || undefined },
          });
          console.log(`✅ Newsletter subscription: ${subscriberId} upgraded to PAID tier`);
        } catch (error) {
          console.error(`Failed to update subscriber ${subscriberId}:`, error);
        }
      }
      
      // Handle product order fulfillment (digital products)
      if (s.metadata?.productId && s.metadata?.license && s.mode === "payment") {
        await handleOrderFulfillment(s);
      }
    }

    // Subscription created (new paid newsletter subscriber)
    if (event.type === "customer.subscription.created") {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = String(sub.customer);
      
      try {
        // Get customer details
        const customer = await stripe.customers.retrieve(customerId);
        
        if (customer && !customer.deleted && customer.email) {
          // Create or update subscriber
          await prisma.subscriber.upsert({
            where: { email: customer.email },
            update: { 
              tier: "PAID", 
              stripeId: customerId,
              status: "ACTIVE"
            },
            create: { 
              email: customer.email,
              name: customer.name || undefined,
              tier: "PAID", 
              stripeId: customerId,
              status: "ACTIVE",
              source: "stripe_subscription"
            }
          });
          console.log(`✅ New paid subscriber created: ${customer.email}`);
        }
      } catch (error) {
        console.error(`Failed to create subscriber for customer ${customerId}:`, error);
      }
    }

    // Subscription updated (plan changes, etc.)
    if (event.type === "customer.subscription.updated") {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = String(sub.customer);
      
      // Check if subscription is still active
      const isActive = sub.status === "active" || sub.status === "trialing";
      
      try {
        await prisma.subscriber.updateMany({
          where: { stripeId: customerId },
          data: { 
            tier: isActive ? "PAID" : "FREE",
            status: isActive ? "ACTIVE" : "ACTIVE" // Keep them subscribed to free tier
          },
        });
        console.log(`✅ Subscription updated: ${customerId} → ${isActive ? 'PAID' : 'FREE'}`);
      } catch (error) {
        console.error(`Failed to update subscription for customer ${customerId}:`, error);
      }
    }

    // Subscription deleted/cancelled
    if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = String(sub.customer);
      
      try {
        await prisma.subscriber.updateMany({
          where: { stripeId: customerId },
          data: { tier: "FREE" }, // Downgrade to free tier, keep subscribed
        });
        console.log(`✅ Subscription cancelled: ${customerId} downgraded to FREE tier`);
      } catch (error) {
        console.error(`Failed to downgrade customer ${customerId}:`, error);
      }
    }

    // Payment failed (subscription)
    if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = String(invoice.customer);
      
      // Don't immediately downgrade - Stripe handles retry logic
      console.log(`⚠️ Payment failed for customer ${customerId}, Stripe will retry`);
    }

    // Handle refunds
    if (event.type === "charge.refunded") {
      const charge = event.data.object as Stripe.Charge;
      console.log("✅ Charge refunded:", charge.id);
      
      // For digital products, just log the refund
      // Customer support can handle manually if needed
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle digital product fulfillment after successful payment
 */
async function handleOrderFulfillment(session: Stripe.Checkout.Session) {
  try {
    const { productId, license } = session.metadata || {};
    const customerEmail = session.customer_details?.email;
    
    // Basic validation
    if (!productId || !license || !customerEmail) {
      console.error("Missing required session data for fulfillment:", session.id);
      return;
    }

    if (session.payment_status !== 'paid') {
      console.error("Payment not completed:", session.payment_status, "for session:", session.id);
      return;
    }

    // Generate secure download URL using your existing blob system
    const downloadUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/download/blob/${productId}?session_id=${session.id}`;

    // Send confirmation email
    try {
      await sendOrderEmail({
        customerEmail,
        orderId: session.id, // Use session ID as order ID
        productTitle: productId,
        licenseType: license as LicenseTier,
        downloadUrl,
        amount: (session.amount_total || 0) / 100,
        currency: 'USD' // Simplified
      });
      console.log("✅ Digital product delivered:", productId, "to", customerEmail);
    } catch (emailError) {
      console.error("❌ Email delivery failed for session:", session.id, emailError);
    }

  } catch (error) {
    console.error("❌ Product fulfillment error:", error);
  }
}
