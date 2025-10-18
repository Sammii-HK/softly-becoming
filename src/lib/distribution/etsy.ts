/**
 * Etsy API integration for automatic product listing
 * Docs: https://developers.etsy.com/documentation/
 */

interface EtsyProduct {
  packId: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  tags: string[];
  category: string;
}

export async function createEtsyListing(product: EtsyProduct) {
  if (!process.env.ETSY_API_KEY || !process.env.ETSY_SHOP_ID) {
    throw new Error("Etsy API credentials not configured");
  }

  const listingData = {
    quantity: 999, // Digital product - unlimited
    title: product.title,
    description: formatEtsyDescription(product.description),
    price: product.price,
    who_made: "i_did",
    when_made: "2020_2024",
    taxonomy_id: 2322, // Digital graphics category
    shipping_template_id: null, // No shipping for digital
    materials: ["digital download", "quote graphics", "PNG files"],
    tags: product.tags.slice(0, 13), // Etsy max 13 tags
    is_digital: true,
    digital_file_url: getPackDownloadUrl(product.packId),
    should_auto_renew: true,
    state: "draft" // Start as draft for review
  };

  try {
    const response = await fetch(`https://openapi.etsy.com/v3/application/shops/${process.env.ETSY_SHOP_ID}/listings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.ETSY_API_KEY}`,
        'Content-Type': 'application/json',
        'x-api-key': process.env.ETSY_API_KEY
      },
      body: JSON.stringify(listingData)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Etsy API error: ${error}`);
    }

    const result = await response.json();
    
    // Upload images to the listing
    if (product.images.length > 0) {
      await uploadEtsyImages(result.listing_id, product.images);
    }

    return {
      success: true,
      platform: 'etsy',
      listingId: result.listing_id,
      url: `https://etsy.com/listing/${result.listing_id}`,
      status: result.state
    };

  } catch (error) {
    console.error("Etsy listing creation failed:", error);
    throw error;
  }
}

function formatEtsyDescription(description: string): string {
  return `${description}

🌸 WHAT YOU GET:
• High-quality PNG files (300 DPI)
• Multiple color variations
• Both square (1080x1080) and portrait (1080x1920) formats
• Commercial license included
• Instant digital download

💖 PERFECT FOR:
• Instagram posts & stories
• Pinterest pins
• Facebook posts
• Website graphics
• Phone wallpapers
• Personal inspiration

✨ ABOUT SOFTLY BECOMING:
Supporting women in gentle transformation through beautiful, thoughtful design.

📧 Questions? Message us anytime - we're here to help!

#quotegraphics #digitaldownload #instagramtemplates #socialmediagraphics #womenempowerment`;
}

async function uploadEtsyImages(listingId: number, imageUrls: string[]) {
  // TODO: Implement image upload to Etsy listing
  console.log(`📸 Would upload ${imageUrls.length} images to Etsy listing ${listingId}`);
}

function getPackDownloadUrl(packId: string): string {
  // Return secure download URL for the pack
  return `${process.env.NEXT_PUBLIC_BASE_URL}/api/download/blob/${packId}`;
}
