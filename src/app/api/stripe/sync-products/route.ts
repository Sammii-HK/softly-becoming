import { NextResponse } from "next/server";
import Stripe from "stripe";
import { readFileSync, readdirSync, existsSync, writeFileSync } from "fs";
import { join } from "path";
import { assertAdmin } from "@/lib/auth/internal";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2023-10-16" });

interface ProductPack {
  packId: string;
  packName: string;
  series: string;
  price: number;
  description: string;
  totalImages: number;
  previewImage?: string;
}

export async function POST(req: Request) {
  try {
    // Admin authentication
    assertAdmin(req);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { syncAll = false } = await req.json();

    // Get all product packs
    const productsDir = join(process.cwd(), 'product-packs');
    
    if (!existsSync(productsDir)) {
      return NextResponse.json({ 
        error: "No product packs found. Generate some packs first!" 
      }, { status: 404 });
    }

    const seriesFolders = readdirSync(productsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    const results = {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: 0,
      products: [] as any[]
    };

    for (const seriesName of seriesFolders) {
      const seriesDir = join(productsDir, seriesName);
      const indexFile = join(seriesDir, 'series-index.json');
      
      if (!existsSync(indexFile)) continue;

      try {
        const seriesData = JSON.parse(readFileSync(indexFile, 'utf8'));
        
        for (const pack of seriesData.packs) {
          try {
            // Check if product already exists in Stripe
            const existingProducts = await stripe.products.search({
              query: `metadata['packId']:'${pack.packId}'`
            });

            let stripeProduct;
            let stripePrice;

            if (existingProducts.data.length > 0 && !syncAll) {
              // Product exists, skip
              results.skipped++;
              stripeProduct = existingProducts.data[0];
              
              // Get existing price
              const prices = await stripe.prices.list({
                product: stripeProduct.id,
                limit: 1
              });
              stripePrice = prices.data[0];
              
              console.log(`⏭️ Skipped existing product: ${pack.packName}`);
            } else {
              // Create new product or update existing
              const previewImageUrl = pack.previewImage 
                ? `${process.env.NEXT_PUBLIC_BASE_URL}/product-packs/${seriesName}/${pack.previewImage}`
                : undefined;

              if (existingProducts.data.length > 0) {
                // Update existing product
                stripeProduct = await stripe.products.update(existingProducts.data[0].id, {
                  name: pack.packName,
                  description: pack.description,
                  images: previewImageUrl ? [previewImageUrl] : [],
                  metadata: {
                    packId: pack.packId,
                    series: pack.series,
                    totalImages: pack.totalImages?.toString() || '0',
                    type: 'digital_product',
                    lastSynced: new Date().toISOString()
                  }
                });

                // Update or create price
                const existingPrices = await stripe.prices.list({
                  product: stripeProduct.id,
                  limit: 1
                });

                if (existingPrices.data.length > 0) {
                  // Archive old price and create new one if price changed
                  const oldPrice = existingPrices.data[0];
                  if (oldPrice.unit_amount !== pack.price * 100) {
                    await stripe.prices.update(oldPrice.id, { active: false });
                    
                    stripePrice = await stripe.prices.create({
                      product: stripeProduct.id,
                      unit_amount: Math.round(pack.price * 100),
                      currency: 'usd',
                      metadata: {
                        packId: pack.packId,
                        series: pack.series
                      }
                    });
                  } else {
                    stripePrice = oldPrice;
                  }
                } else {
                  stripePrice = await stripe.prices.create({
                    product: stripeProduct.id,
                    unit_amount: Math.round(pack.price * 100),
                    currency: 'usd',
                    metadata: {
                      packId: pack.packId,
                      series: pack.series
                    }
                  });
                }

                results.updated++;
                console.log(`✅ Updated product: ${pack.packName}`);
              } else {
                // Create new product
                stripeProduct = await stripe.products.create({
                  name: pack.packName,
                  description: pack.description,
                  images: previewImageUrl ? [previewImageUrl] : [],
                  metadata: {
                    packId: pack.packId,
                    series: pack.series,
                    totalImages: pack.totalImages?.toString() || '0',
                    type: 'digital_product',
                    createdBy: 'soft-rebuild-sync'
                  },
                  type: 'good',
                  shippable: false
                });

                stripePrice = await stripe.prices.create({
                  product: stripeProduct.id,
                  unit_amount: Math.round(pack.price * 100),
                  currency: 'usd',
                  metadata: {
                    packId: pack.packId,
                    series: pack.series
                  }
                });

                results.created++;
                console.log(`🆕 Created product: ${pack.packName}`);
              }
            }

            // Update local pack data with Stripe IDs
            pack.stripeProductId = stripeProduct.id;
            pack.stripePriceId = stripePrice.id;
            pack.lastSyncedAt = new Date().toISOString();

            results.products.push({
              packId: pack.packId,
              packName: pack.packName,
              stripeProductId: stripeProduct.id,
              stripePriceId: stripePrice.id,
              price: pack.price,
              status: existingProducts.data.length > 0 ? 'updated' : 'created'
            });

          } catch (packError) {
            console.error(`❌ Error processing pack ${pack.packId}:`, packError);
            results.errors++;
          }
        }

        // Save updated series data with Stripe IDs
        writeFileSync(indexFile, JSON.stringify(seriesData, null, 2));

      } catch (seriesError) {
        console.error(`❌ Error processing series ${seriesName}:`, seriesError);
        results.errors++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Stripe sync completed: ${results.created} created, ${results.updated} updated, ${results.skipped} skipped, ${results.errors} errors`,
      results
    });

  } catch (error) {
    console.error("Stripe sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync products with Stripe" },
      { status: 500 }
    );
  }
}
