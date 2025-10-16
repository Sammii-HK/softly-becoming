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

    // Create THREE prices for different license tiers
    const personalPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(price * 100), // Base personal price
      currency: 'usd',
      nickname: 'Personal License',
      metadata: {
        packId,
        series: series || 'unknown',
        tier: 'personal'
      }
    });

    const commercialPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(price * 1.8 * 100), // +80% for commercial
      currency: 'usd',
      nickname: 'Commercial License',
      metadata: {
        packId,
        series: series || 'unknown',
        tier: 'commercial'
      }
    });

    const extendedPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(price * 2.5 * 100), // +150% for extended
      currency: 'usd',
      nickname: 'Extended License',
      metadata: {
        packId,
        series: series || 'unknown',
        tier: 'extended'
      }
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
      prices: {
        personal: {
          id: personalPrice.id,
          amount: personalPrice.unit_amount,
          formatted: `$${price}`
        },
        commercial: {
          id: commercialPrice.id,
          amount: commercialPrice.unit_amount,
          formatted: `$${Math.round(price * 1.8)}`
        },
        extended: {
          id: extendedPrice.id,
          amount: extendedPrice.unit_amount,
          formatted: `$${Math.round(price * 2.5)}`
        }
      },
      defaultPriceId: personalPrice.id, // Default to personal
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
