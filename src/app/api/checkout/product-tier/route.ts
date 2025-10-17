import { NextResponse } from "next/server";
import Stripe from "stripe";
import { BASE_PACK_PRICES } from "@/lib/pricing/strategy";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2023-10-16" });

export async function POST(req: Request) {
  try {
    const { productId, priceId, productName, tier = 'personal' } = await req.json();

    if (!productId || !productName || !priceId) {
      return NextResponse.json(
        { error: "Missing required fields: productId, productName, priceId" },
        { status: 400 }
      );
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/shop/success?session_id={CHECKOUT_SESSION_ID}&product=${productId}&tier=${tier}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/shop?cancelled=1`,
      metadata: {
        productId,
        productName,
        tier,
        type: "digital_product"
      },
      customer_creation: "always",
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
      invoice_creation: {
        enabled: true,
        invoice_data: {
          description: `${productName} - ${tier.charAt(0).toUpperCase() + tier.slice(1)} License`,
          metadata: {
            productId,
            tier,
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

function getLicenseDescription(tier: string): string {
  switch (tier) {
    case 'personal':
      return 'Personal use license - Perfect for personal social media and inspiration';
    case 'commercial':
      return 'Commercial license - Use for business, client work, and monetized content';
    case 'extended':
      return 'Extended license - Full commercial rights including merchandise and resale';
    default:
      return 'Digital quote collection with usage rights';
  }
}
