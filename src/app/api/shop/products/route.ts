import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

interface ProductPack {
  packId: string;
  packName: string;
  series: string;
  version: string;
  generatedAt: string;
  totalImages: number;
  price: number;
  description: string;
  previewImage: string;
  format: string;
  theme?: string;
  stripePriceId: string;
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

    // Get all products from Stripe with metadata
    const stripeProducts = await stripe.products.list({
      active: true,
      expand: ['data.default_price'],
      limit: 100,
    });

    const allProducts: ProductPack[] = [];
    const seriesMap = new Map<string, ProductPack[]>();

    for (const product of stripeProducts.data) {
      // Only process products that have our pack metadata
      if (product.metadata?.packId && product.metadata?.series) {
        const defaultPrice = product.default_price as Stripe.Price;
        const price = defaultPrice ? (defaultPrice.unit_amount || 0) / 100 : 0;

        const productPack: ProductPack = {
          packId: product.metadata.packId,
          packName: product.name,
          series: product.metadata.series,
          version: product.metadata.version || "1.0",
          generatedAt: product.metadata.generatedAt || new Date(product.created * 1000).toISOString(),
          totalImages: parseInt(product.metadata.totalImages || "0"),
          price: price,
          description: product.description || "",
          previewImage: product.images[0] || "/api/og?text=" + encodeURIComponent(product.name),
          format: product.metadata.format || "square",
          theme: product.metadata.theme,
          stripePriceId: defaultPrice?.id || "",
        };

        allProducts.push(productPack);

        // Group by series
        if (!seriesMap.has(productPack.series)) {
          seriesMap.set(productPack.series, []);
        }
        seriesMap.get(productPack.series)!.push(productPack);
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
      source: "stripe" // Indicate data source
    });

  } catch (error) {
    console.error("Error fetching products from Stripe:", error);
    
    // Fallback to empty state with helpful message
    return NextResponse.json({
      series: [],
      products: [],
      totalProducts: 0,
      totalSeries: 0,
      error: "Failed to fetch products from Stripe",
      message: "Make sure Stripe is configured and products have proper metadata",
      lastUpdated: new Date().toISOString()
    });
  }
}