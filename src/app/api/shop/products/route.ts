import { NextResponse } from "next/server";
import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";

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
  stripePriceId?: string;
}

interface SeriesData {
  seriesName: string;
  packs: ProductPack[];
  lastUpdated: string;
}

export async function GET() {
  try {
    const productsDir = join(process.cwd(), 'product-packs');
    
    if (!existsSync(productsDir)) {
      return NextResponse.json({ 
        series: [],
        products: [],
        message: "No products generated yet. Run 'npm run generate:packs' to create some!" 
      });
    }

    const seriesFolders = readdirSync(productsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    const allSeries: SeriesData[] = [];
    const allProducts: ProductPack[] = [];

    for (const seriesName of seriesFolders) {
      const seriesDir = join(productsDir, seriesName);
      const indexFile = join(seriesDir, 'series-index.json');
      
      if (existsSync(indexFile)) {
        try {
          const seriesData: SeriesData = JSON.parse(readFileSync(indexFile, 'utf8'));
          
          // Add Stripe price IDs based on series and pack name
          const processedPacks = seriesData.packs.map(pack => ({
            ...pack,
            stripePriceId: generateStripePriceId(pack.packId),
            previewImage: `/product-packs/${seriesName}/${pack.previewImage}`
          }));

          allSeries.push({
            ...seriesData,
            packs: processedPacks
          });
          
          allProducts.push(...processedPacks);
        } catch (error) {
          console.error(`Error reading series index for ${seriesName}:`, error);
        }
      }
    }

    // Sort products by creation date (newest first)
    allProducts.sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());

    return NextResponse.json({
      series: allSeries,
      products: allProducts,
      totalProducts: allProducts.length,
      totalSeries: allSeries.length,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

function generateStripePriceId(packId: string): string {
  // Generate consistent Stripe price IDs based on pack ID
  return `price_${packId.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`;
}
