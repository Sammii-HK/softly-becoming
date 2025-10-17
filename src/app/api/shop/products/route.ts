import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2023-10-16" });

interface ProductPack {
  packId: string;
  packName: string;
  series: string;
  version: string;
  generatedAt: string;
  totalImages: number;
  description: string;
  previewImage: string;
  format: string;
  theme?: string;
  prices: {
    personal: { priceId: string; amount: number; formatted: string };
    commercial: { priceId: string; amount: number; formatted: string };
    extended: { priceId: string; amount: number; formatted: string };
  };
}

interface SeriesData {
  seriesName: string;
  packs: ProductPack[];
  lastUpdated: string;
}

export async function GET() {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({
        series: [],
        products: [],
        message: "Stripe not configured. Add STRIPE_SECRET_KEY environment variable."
      });
    }

    // Get all products from Stripe (SSOT)
    const stripeProducts = await stripe.products.list({
      active: true,
      limit: 100,
    });

    // Get all prices for these products
    const allPrices = await stripe.prices.list({
      active: true,
      limit: 300, // Enough for all license tiers
    });

    const allProducts: ProductPack[] = [];
    const seriesMap = new Map<string, ProductPack[]>();

    for (const product of stripeProducts.data) {
      // Only process products that have our pack metadata
      if (product.metadata?.packId && product.metadata?.totalImages) {
        // Find all prices for this product, grouped by license tier
        const productPrices = allPrices.data.filter(price => price.product === product.id);
        
        const prices = {
          personal: productPrices.find(p => p.metadata?.licenseType === 'personal'),
          commercial: productPrices.find(p => p.metadata?.licenseType === 'commercial'),
          extended: productPrices.find(p => p.metadata?.licenseType === 'extended')
        };

        // Only include products that have all three license tiers
        if (prices.personal && prices.commercial && prices.extended) {
          const productPack: ProductPack = {
            packId: product.metadata.packId,
            packName: product.name,
            series: product.metadata.series || 'unknown',
            version: product.metadata.version || "1.0",
            generatedAt: product.metadata.generatedAt || new Date(product.created * 1000).toISOString(),
            totalImages: parseInt(product.metadata.totalImages),
            description: product.description || "",
            previewImage: product.images[0] || `/api/og?text=${encodeURIComponent(product.name)}&branding=true`,
            format: product.metadata.format || "both",
            theme: product.metadata.theme,
            prices: {
              personal: {
                priceId: prices.personal.id,
                amount: prices.personal.unit_amount || 0,
                formatted: `£${((prices.personal.unit_amount || 0) / 100).toFixed(2)}`
              },
              commercial: {
                priceId: prices.commercial.id,
                amount: prices.commercial.unit_amount || 0,
                formatted: `£${((prices.commercial.unit_amount || 0) / 100).toFixed(2)}`
              },
              extended: {
                priceId: prices.extended.id,
                amount: prices.extended.unit_amount || 0,
                formatted: `£${((prices.extended.unit_amount || 0) / 100).toFixed(2)}`
              }
            }
          };

          allProducts.push(productPack);

          // Group by series
          if (!seriesMap.has(productPack.series)) {
            seriesMap.set(productPack.series, []);
          }
          seriesMap.get(productPack.series)!.push(productPack);
        }
      }
    }

    // Convert series map to array
    const allSeries: SeriesData[] = Array.from(seriesMap.entries()).map(([seriesName, packs]) => ({
      seriesName,
      packs: packs.sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()),
      lastUpdated: new Date().toISOString(),
    }));

    // Sort products by creation date (newest first)
    allProducts.sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());

    return NextResponse.json({
      series: allSeries,
      products: allProducts,
      totalProducts: allProducts.length,
      totalSeries: allSeries.length,
      lastUpdated: new Date().toISOString(),
      source: "stripe",
      message: allProducts.length === 0 ? "No products found in Stripe. Generate some packs to get started!" : undefined
    });

  } catch (error) {
    console.error("Error fetching products from Stripe:", error);
    
    return NextResponse.json({
      series: [],
      products: [],
      totalProducts: 0,
      totalSeries: 0,
      error: "Failed to fetch products from Stripe",
      message: "Make sure Stripe is configured and products exist with proper license tiers",
      lastUpdated: new Date().toISOString()
    }, { status: 500 });
  }
}