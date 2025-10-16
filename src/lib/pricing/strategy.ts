// Competitive pricing strategy for digital quote packs

export interface PricingTier {
  personal: number;
  commercial: number;
  extended: number;
}

export interface PackPricing {
  basePrice: number;
  tiers: PricingTier;
  description: string;
}

// Base pricing calculator
export function calculatePackPricing(imageCount: number, format: string, theme: string): PackPricing {
  // Base competitive pricing
  let basePrice = 0;
  
  // Image count pricing (competitive with market)
  if (imageCount <= 15) {
    basePrice = 12; // Small packs
  } else if (imageCount <= 25) {
    basePrice = 19; // Medium packs  
  } else if (imageCount <= 35) {
    basePrice = 27; // Large packs
  } else if (imageCount <= 50) {
    basePrice = 35; // XL packs
  } else {
    basePrice = 45; // XXL packs
  }

  // Format multiplier
  const formatMultiplier = format === 'both' ? 1.4 : 1.0; // Both formats = 40% more value
  
  // Premium theme multiplier
  const premiumThemes = ['self_trust', 'letting_go'];
  const themeMultiplier = premiumThemes.includes(theme) ? 1.2 : 1.0;
  
  const finalBase = Math.round(basePrice * formatMultiplier * themeMultiplier);

  return {
    basePrice: finalBase,
    tiers: {
      personal: finalBase,                    // Personal use only
      commercial: Math.round(finalBase * 1.8), // Commercial use (+80%)
      extended: Math.round(finalBase * 2.5)    // Extended commercial (+150%)
    },
    description: getPackDescription(imageCount, format)
  };
}

// Predefined competitive base prices
export const BASE_PACK_PRICES = {
  'soft-strength-collection': { personal: 19, commercial: 34, extended: 47 },
  'rebuilding-journey': { personal: 16, commercial: 29, extended: 39 },
  'self-trust-quotes': { personal: 22, commercial: 39, extended: 55 },
  'gentle-boundaries': { personal: 18, commercial: 32, extended: 45 },
  'morning-affirmations': { personal: 14, commercial: 25, extended: 35 },
  'mixed-inspiration-pack': { personal: 39, commercial: 69, extended: 97 }
} as const;

function getPackDescription(imageCount: number, format: string): string {
  const formatText = format === 'both' ? 'Square & Portrait formats' : 
                    format === 'portrait' ? 'Portrait format (stories)' : 
                    'Square format (posts)';
  
  return `${imageCount} beautiful quote graphics • ${formatText} • 10 color variations`;
}

// License descriptions
export const LICENSE_TIERS = {
  personal: {
    name: "Personal License",
    description: "Perfect for personal social media and inspiration",
    includes: [
      "✅ Personal social media use",
      "✅ Personal website/blog", 
      "✅ Personal inspiration/motivation",
      "❌ No commercial use",
      "❌ No client work",
      "❌ No resale"
    ]
  },
  commercial: {
    name: "Commercial License", 
    description: "Great for businesses, coaches, and content creators",
    includes: [
      "✅ Everything in Personal",
      "✅ Business social media",
      "✅ Client work & projects",
      "✅ Website/blog monetization",
      "✅ Print products (limited)",
      "❌ No resale as digital products"
    ]
  },
  extended: {
    name: "Extended License",
    description: "Full rights for maximum flexibility",
    includes: [
      "✅ Everything in Commercial", 
      "✅ Unlimited print products",
      "✅ Include in digital courses",
      "✅ Merchandise & physical products",
      "✅ Apps & software",
      "❌ Cannot resell as standalone quote packs"
    ]
  }
} as const;

export function getStripePriceId(packName: string, tier: 'personal' | 'commercial' | 'extended'): string {
  return `price_${packName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_${tier}`;
}
