import { NextResponse } from "next/server";
import Stripe from "stripe";
import { assertAdmin } from "@/lib/auth/internal";
import { getBasePriceInCents, type LicenseTier } from "@/lib/pricing/getPrices";

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
      totalImages,
      series,
      previewImageUrl,
      format = 'both'
    } = await req.json();

    if (!packId || !packName || !totalImages) {
      return NextResponse.json(
        { error: "Missing required fields: packId, packName, totalImages" },
        { status: 400 }
      );
    }

    // Create base Stripe product
    const product = await stripe.products.create({
      name: packName,
      description: description || `${totalImages} beautiful quote graphics for social media and phone wallpapers`,
      images: previewImageUrl ? [previewImageUrl] : [],
      metadata: {
        packId,
        series: series || 'unknown',
        totalImages: totalImages?.toString() || '0',
        format: format,
        type: 'digital_product',
        createdBy: 'softly-becoming-studio',
        generatedAt: new Date().toISOString()
      },
      type: 'good',
      shippable: false,
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/shop?product=${packId}`
    });

    // Create pricing for each license tier using our pricing matrix
    const licenseTypes: LicenseTier[] = ['personal', 'commercial', 'extended'];
    const createdPrices = [];

    for (const tier of licenseTypes) {
      const priceInPence = getBasePriceInCents(totalImages, tier);
      
      const price = await stripe.prices.create({
        product: product.id,
        currency: 'gbp',
        unit_amount: priceInPence,
        nickname: `${packName} - ${tier} license`,
        metadata: {
          packId,
          licenseType: tier,
          totalImages: totalImages.toString(),
          pricePerImage: (priceInPence / totalImages / 100).toFixed(3)
        }
      });

      createdPrices.push({
        tier,
        priceId: price.id,
        amount: priceInPence,
        formatted: `£${(priceInPence / 100).toFixed(2)}`,
        perImage: `£${(priceInPence / totalImages / 100).toFixed(2)}`
      });
    }

    return NextResponse.json({
      success: true,
      message: `Product "${packName}" created successfully with 3 license tiers`,
      product: {
        id: product.id,
        name: product.name,
        packId,
        totalImages,
        series,
        format
      },
      pricing: createdPrices,
      stripeDashboard: `https://dashboard.stripe.com/products/${product.id}`
    });

  } catch (error) {
    console.error("Stripe product creation error:", error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      details: "Failed to create Stripe product with license tiers"
    }, { status: 500 });
  }
}