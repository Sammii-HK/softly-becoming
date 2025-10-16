import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2023-10-16" });

export async function POST(req: Request) {
  try {
    const { productId, priceId, productName } = await req.json();

    if (!productId || !priceId || !productName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create Stripe checkout session for one-time payment
    const session = await stripe.checkout.sessions.create({
      mode: "payment", // One-time payment, not subscription
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/shop/success?session_id={CHECKOUT_SESSION_ID}&product=${productId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/shop?cancelled=1`,
      metadata: {
        productId,
        productName,
        type: "digital_product"
      },
      // Collect customer info for delivery
      customer_creation: "always",
      // Custom fields for delivery
      custom_fields: [
        {
          key: "delivery_email",
          label: {
            type: "custom",
            custom: "Email for product delivery"
          },
          type: "text",
          optional: false
        }
      ],
      // Enable automatic tax calculation if configured
      automatic_tax: { enabled: false },
      // Invoice creation for record keeping
      invoice_creation: {
        enabled: true,
        invoice_data: {
          description: `Digital Product: ${productName}`,
          metadata: {
            productId,
            type: "digital_product"
          }
        }
      }
    });

    return NextResponse.json({ url: session.url });

  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
