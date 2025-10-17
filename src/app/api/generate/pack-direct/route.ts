import { NextRequest, NextResponse } from "next/server";
import { generateAndUploadPack } from "@/lib/storage/blob-direct";
import { assertAdmin } from "@/lib/auth/internal";

// Predefined pack configurations
// Impulse buy pricing - based on our informed pricing strategy
const PACK_CONFIGS = [
  {
    name: 'soft-strength-collection',
    series: 'soft-strength',
    count: 15,
    theme: 'soft_strength',
    format: 'both' as const,
    description: 'Beautiful quotes about finding strength in gentleness. Instagram posts + phone wallpapers included.'
  },
  {
    name: 'rebuilding-journey',
    series: 'rebuilding',
    count: 15,
    theme: 'rebuilding',
    format: 'both' as const,
    description: 'Inspiring quotes for women starting over and rebuilding their lives with intention.'
  },
  {
    name: 'self-trust-quotes',
    series: 'self-trust',
    count: 15,
    theme: 'becoming',
    format: 'both' as const,
    description: 'Empowering quotes about trusting yourself and your inner wisdom.'
  },
  {
    name: 'gentle-boundaries',
    series: 'boundaries',
    count: 15,
    theme: 'letting_go',
    format: 'both' as const,
    description: 'Learn to set boundaries with kindness. Perfect for people-pleasers learning to say no.'
  },
  {
    name: 'morning-affirmations',
    series: 'daily-rituals',
    count: 15,
    theme: 'becoming',
    format: 'both' as const,
    description: 'Start your day with gentle affirmations. Perfect for morning routines and self-care.'
  }
];

// Generate date-based seed for unique quotes each time
function generateDateBasedSeed(baseTheme: string): number {
  const now = new Date();
  const dateString = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}-${now.getMinutes()}`;
  const themeHash = baseTheme.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return parseInt(dateString.replace(/-/g, '')) + themeHash;
}

// Create pack config with dynamic seed and volume numbering
async function createPackConfig(baseConfig: any) {
  const dynamicSeed = generateDateBasedSeed(baseConfig.theme || baseConfig.name);
  
  // Get existing volume count from Stripe for this series
  let volumeNumber = 1;
  try {
    const stripe = new (await import('stripe')).default(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2023-10-16",
    });
    
    const existingProducts = await stripe.products.list({
      active: true,
      limit: 100,
    });
    
    // Count existing products with the same base name
    const sameThemeCount = existingProducts.data.filter(product => 
      product.name.toLowerCase().includes(baseConfig.name.toLowerCase()) ||
      product.metadata?.series === baseConfig.series
    ).length;
    
    volumeNumber = sameThemeCount + 1;
  } catch (error) {
    console.log("Could not fetch existing products for volume numbering, using timestamp");
    volumeNumber = Math.floor(Date.now() / 1000) % 1000; // Fallback to timestamp-based
  }
  
  const volumeName = volumeNumber === 1 ? baseConfig.name : `${baseConfig.name}-vol${volumeNumber}`;
  const volumeDescription = volumeNumber === 1 
    ? baseConfig.description 
    : `Volume ${volumeNumber}: ${baseConfig.description}`;
  
  return {
    ...baseConfig,
    seed: dynamicSeed,
    name: volumeName,
    description: volumeDescription,
    volume: volumeNumber
  };
}

export async function POST(req: NextRequest) {
  try {
    // Admin authentication
    assertAdmin(req);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { packName, generateAll = false } = await req.json();

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({
        error: "Vercel Blob not configured. Add BLOB_READ_WRITE_TOKEN environment variable.",
        setup: "Go to Vercel Dashboard → Storage → Create Blob storage"
      }, { status: 400 });
    }

    const results = [];

    if (generateAll) {
      // Generate all predefined packs with dynamic seeds and volume numbers
      for (const baseConfig of PACK_CONFIGS) {
        const dynamicConfig = await createPackConfig(baseConfig);
        const result = await generateAndUploadPack(dynamicConfig);
        results.push(result);
        
        // Delay between packs to ensure different timestamps and volume numbers
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    } else if (packName) {
      // Generate specific pack with dynamic seed and volume number
      const baseConfig = PACK_CONFIGS.find(p => p.name === packName);
      if (!baseConfig) {
        return NextResponse.json({
          error: `Pack "${packName}" not found`,
          available: PACK_CONFIGS.map(p => p.name)
        }, { status: 404 });
      }
      
      const dynamicConfig = await createPackConfig(baseConfig);
      const result = await generateAndUploadPack(dynamicConfig);
      results.push(result);
    } else {
      return NextResponse.json({
        error: "Pack name required or set generateAll: true",
        available: PACK_CONFIGS.map(p => p.name)
      }, { status: 400 });
    }

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    return NextResponse.json({
      success: failed.length === 0,
      message: `Generated ${successful.length} packs, ${failed.length} failed`,
      results: {
        successful: successful.length,
        failed: failed.length,
        packs: results
      }
    });

  } catch (error) {
    console.error("Pack generation error:", error);
    return NextResponse.json(
      { error: "Pack generation failed" },
      { status: 500 }
    );
  }
}
