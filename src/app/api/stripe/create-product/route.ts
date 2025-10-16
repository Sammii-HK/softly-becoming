import { NextResponse } from "next/server";
import Stripe from "stripe";
import { assertAdmin } from "@/lib/auth/internal";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2023-10-16" });

export async function POST(req: Request) {
  try {
    // Admin authentication
    assertAdmin(req);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const {
      packId,
      packName,
      description,
      price,
      totalImages,
      series,
      previewImageUrl
    } = await req.json();

    if (!packId || !packName || !price) {
      return NextResponse.json(
        { error: "Missing required fields: packId, packName, price" },
        { status: 400 }
      );
    }

    // Create Stripe product
    const product = await stripe.products.create({
      name: packName,
      description: description || `${totalImages} beautiful quote graphics for social media`,
      images: previewImageUrl ? [previewImageUrl] : [],
      metadata: {
        packId,
        series: series || 'unknown',
        totalImages: totalImages?.toString() || '0',
        type: 'digital_product',
        createdBy: 'softly-becoming-studio'
      },
      // Mark as digital product
      type: 'good',
      // Add product details
      shippable: false,
      // SEO-friendly URL
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/shop-dynamic?product=${packId}`
    });

    // Create price for the product
    const priceObj = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(price * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        packId,
        series: series || 'unknown'
      }
      // One-time payment (recurring is undefined by default)
    });

    return NextResponse.json({
      success: true,
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        images: product.images,
        metadata: product.metadata
      },
      price: {
        id: priceObj.id,
        unit_amount: priceObj.unit_amount,
        currency: priceObj.currency,
        formatted: `$${price}`
      },
      stripePriceId: priceObj.id, // Use this in your checkout
      message: `Product "${packName}" created successfully in Stripe`
    });

  } catch (error) {
    console.error("Stripe product creation error:", error);
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { 
          error: "Stripe API error", 
          details: error.message,
          type: error.type 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create Stripe product" },
      { status: 500 }
    );
  }
}
