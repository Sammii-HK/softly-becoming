/**
 * Gumroad API integration for automatic product creation
 * Docs: https://help.gumroad.com/article/280-gumroad-api
 */

interface GumroadProduct {
  packId: string;
  name: string;
  description: string;
  price: number;
  downloadUrl: string;
  previewImage: string;
}

export async function createGumroadProduct(product: GumroadProduct) {
  if (!process.env.GUMROAD_API_KEY) {
    throw new Error("Gumroad API key not configured");
  }

  const productData = {
    name: product.name,
    description: formatGumroadDescription(product.description),
    price: product.price * 100, // Gumroad uses cents
    summary: `Beautiful quote graphics for social media and inspiration`,
    content_url: product.downloadUrl,
    preview_url: product.previewImage,
    tags: "quotes,graphics,instagram,social media,inspiration,digital download",
    published: false, // Start as draft
    require_shipping: false,
    customize_receipt: true,
    receipt_message: `Thank you for your purchase! 🌸

Your quote collection is ready for download. Use these beautiful graphics for:
• Social media posts
• Phone wallpapers  
• Personal inspiration
• Website graphics

Need help? Reply to this email anytime!

With love,
Softly Becoming ✨`,
    variants: [
      {
        name: "Personal License",
        price: Math.round(product.price * 0.5 * 100), // £3.99 → £2 for personal
        summary: "For personal use only"
      },
      {
        name: "Commercial License", 
        price: product.price * 100, // Full price for commercial
        summary: "For business and client work"
      },
      {
        name: "Extended License",
        price: Math.round(product.price * 2 * 100), // 2x price for extended
        summary: "Unlimited commercial rights"
      }
    ]
  };

  try {
    const response = await fetch('https://api.gumroad.com/v2/products', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GUMROAD_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(productData)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gumroad API error: ${error}`);
    }

    const result = await response.json();

    return {
      success: true,
      platform: 'gumroad',
      productId: result.product.id,
      url: result.product.short_url,
      editUrl: `https://gumroad.com/products/${result.product.id}/edit`
    };

  } catch (error) {
    console.error("Gumroad product creation failed:", error);
    throw error;
  }
}

function formatGumroadDescription(description: string): string {
  return `${description}

🎨 **WHAT'S INCLUDED:**
• High-resolution PNG files (300 DPI)
• Multiple beautiful color variations
• Square format (1080x1080) for Instagram posts
• Portrait format (1080x1920) for stories & phone wallpapers
• Commercial license for business use
• Organized file structure for easy use

💖 **PERFECT FOR:**
• Social media managers
• Content creators
• Life coaches
• Wellness brands
• Personal inspiration
• Website graphics

✨ **ABOUT THE CREATOR:**
Softly Becoming creates gentle, thoughtful designs for women rebuilding their lives with intention. Each quote is carefully crafted to inspire and empower.

📱 **INSTANT DOWNLOAD:**
Files are delivered immediately after purchase. No waiting, no shipping - start using right away!

💼 **COMMERCIAL LICENSE INCLUDED:**
Use for client work, social media management, and business projects up to 5,000 uses.

❤️ **SATISFACTION GUARANTEED:**
Not happy? Contact us within 30 days for a full refund.

#QuoteGraphics #SocialMediaTemplates #InstagramGraphics #DigitalDownload #WomenEmpowerment #InspirationQuotes`;
}
