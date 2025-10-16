import { NextRequest, NextResponse } from "next/server";
import { generateAndUploadPack } from "@/lib/storage/blob-direct";
import { assertAdmin } from "@/lib/auth/internal";

// Predefined pack configurations
const PACK_CONFIGS = [
  {
    name: 'soft-strength-collection',
    series: 'soft-strength',
    count: 25,
    seed: 12345,
    theme: 'soft_strength',
    format: 'both' as const,
    price: 29,
    description: 'Beautiful quotes about finding strength in gentleness. Both square and portrait formats included.'
  },
  {
    name: 'rebuilding-journey',
    series: 'rebuilding',
    count: 20,
    seed: 54321,
    theme: 'rebuilding',
    format: 'square' as const,
    price: 24,
    description: 'Inspiring quotes for women starting over and rebuilding their lives with intention.'
  },
  {
    name: 'self-trust-quotes',
    series: 'self-trust',
    count: 30,
    seed: 98765,
    theme: 'self_trust',
    format: 'portrait' as const,
    price: 34,
    description: 'Powerful quotes about trusting yourself and your inner wisdom. Perfect for Instagram stories.'
  },
  {
    name: 'gentle-boundaries',
    series: 'boundaries',
    count: 20,
    seed: 22222,
    theme: 'letting_go',
    format: 'both' as const,
    price: 27,
    description: 'Learn to set boundaries with kindness. Perfect for people-pleasers learning to say no.'
  },
  {
    name: 'morning-affirmations',
    series: 'daily-rituals',
    count: 15,
    seed: 33333,
    theme: 'becoming',
    format: 'square' as const,
    price: 22,
    description: 'Start your day with gentle affirmations. Perfect for morning routines and self-care.'
  }
];

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
      // Generate all predefined packs
      for (const config of PACK_CONFIGS) {
        const result = await generateAndUploadPack(config);
        results.push(result);
        
        // Delay between packs
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } else if (packName) {
      // Generate specific pack
      const config = PACK_CONFIGS.find(p => p.name === packName);
      if (!config) {
        return NextResponse.json({
          error: `Pack "${packName}" not found`,
          available: PACK_CONFIGS.map(p => p.name)
        }, { status: 404 });
      }
      
      const result = await generateAndUploadPack(config);
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
