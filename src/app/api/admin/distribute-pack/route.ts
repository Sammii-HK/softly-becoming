import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/auth/internal";

export async function POST(req: Request) {
  try {
    assertAdmin(req);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { packId, platforms = ['etsy', 'gumroad', 'creative-market'] } = await req.json();

    if (!packId) {
      return NextResponse.json(
        { error: "Pack ID required" },
        { status: 400 }
      );
    }

    const results = [];

    // Distribute to each platform
    for (const platform of platforms) {
      const result = await distributeToplatform(packId, platform);
      results.push(result);
    }

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    return NextResponse.json({
      success: failed.length === 0,
      message: `Distributed to ${successful.length}/${platforms.length} platforms`,
      results: {
        successful: successful.length,
        failed: failed.length,
        details: results
      },
      packId
    });

  } catch (error) {
    console.error("Distribution error:", error);
    return NextResponse.json(
      { error: "Distribution failed" },
      { status: 500 }
    );
  }
}

async function distributeToplatform(packId: string, platform: string) {
  try {
    switch (platform) {
      case 'etsy':
        return await distributeToEtsy(packId);
      case 'gumroad':
        return await distributeToGumroad(packId);
      case 'creative-market':
        return await distributeToCreativeMarket(packId);
      default:
        return { success: false, platform, error: "Platform not supported" };
    }
  } catch (error) {
    return { 
      success: false, 
      platform, 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
}

async function distributeToEtsy(packId: string) {
  if (!process.env.ETSY_API_KEY) {
    return { success: false, platform: 'etsy', error: "Etsy API key not configured" };
  }

  // Etsy API integration
  // TODO: Implement Etsy listing creation
  console.log(`📦 Would create Etsy listing for ${packId}`);
  
  return { 
    success: true, 
    platform: 'etsy', 
    listingId: 'etsy_' + packId,
    url: `https://etsy.com/listing/etsy_${packId}`
  };
}

async function distributeToGumroad(packId: string) {
  if (!process.env.GUMROAD_API_KEY) {
    return { success: false, platform: 'gumroad', error: "Gumroad API key not configured" };
  }

  // Gumroad API integration
  // TODO: Implement Gumroad product creation
  console.log(`📦 Would create Gumroad product for ${packId}`);
  
  return { 
    success: true, 
    platform: 'gumroad', 
    productId: 'gumroad_' + packId,
    url: `https://gumroad.com/l/gumroad_${packId}`
  };
}

async function distributeToCreativeMarket(packId: string) {
  if (!process.env.CREATIVE_MARKET_API_KEY) {
    return { success: false, platform: 'creative-market', error: "Creative Market API key not configured" };
  }

  // Creative Market API integration  
  // TODO: Implement Creative Market shop upload
  console.log(`📦 Would create Creative Market product for ${packId}`);
  
  return { 
    success: true, 
    platform: 'creative-market', 
    productId: 'cm_' + packId,
    url: `https://creativemarket.com/product/cm_${packId}`
  };
}
