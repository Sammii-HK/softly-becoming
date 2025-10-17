import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function GET() {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({
        error: "Stripe not configured",
        hasStripeKey: false
      });
    }

    // Get all products from Stripe
    const products = await stripe.products.list({
      active: true,
      expand: ['data.default_price'],
      limit: 20,
    });

    const productData = products.data.map(product => {
      const defaultPrice = product.default_price as Stripe.Price;
      return {
        id: product.id,
        name: product.name,
        description: product.description,
        images: product.images,
        metadata: product.metadata,
        price: defaultPrice ? (defaultPrice.unit_amount || 0) / 100 : 0,
        priceId: defaultPrice?.id,
        created: new Date(product.created * 1000).toISOString(),
      };
    });

    return NextResponse.json({
      totalProducts: products.data.length,
      hasStripeKey: true,
      products: productData,
      debug: "This shows all products in your Stripe account"
    });

  } catch (error) {
    console.error("Stripe debug error:", error);
    return NextResponse.json({
      error: "Failed to fetch from Stripe",
      details: error instanceof Error ? error.message : "Unknown error",
      hasStripeKey: !!process.env.STRIPE_SECRET_KEY
    }, { status: 500 });
  }
}
