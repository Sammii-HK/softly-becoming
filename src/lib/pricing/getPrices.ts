/**
 * Pricing configuration for softly becoming digital image packs
 * Uses Stripe's native pricing capabilities for security and reliability
 */

export type Currency = 'GBP' | 'USD';
export type LicenseTier = 'personal' | 'commercial' | 'extended';

export interface PriceConfig {
  imageCount: number;
  tier: LicenseTier;
  currency: Currency;
}

// Base pricing matrix in GBP (Stripe will handle currency conversion)
const PRICING_MATRIX = {
  15: { personal: 800, commercial: 1500, extended: 2500 }, // £8.00, £15.00, £25.00 in pence
  25: { personal: 1200, commercial: 1900, extended: 2900 }, // £12.00, £19.00, £29.00
  35: { personal: 1800, commercial: 2700, extended: 3900 }, // £18.00, £27.00, £39.00
  50: { personal: 2200, commercial: 3200, extended: 4500 }, // £22.00, £32.00, £45.00
  999: { personal: 2800, commercial: 4200, extended: 5900 } // £28.00, £42.00, £59.00 (>50)
} as const;

/**
 * Get the appropriate price tier based on image count
 * Returns price in pence/cents for Stripe
 */
export function getBasePriceInCents(imageCount: number, tier: LicenseTier): number {
  // Validate input
  if (!imageCount || imageCount < 1) {
    throw new Error('Invalid image count: must be a positive number');
  }

  if (!['personal', 'commercial', 'extended'].includes(tier)) {
    throw new Error(`Invalid tier: ${tier}. Must be personal, commercial, or extended`);
  }

  // Find appropriate price tier
  let priceKey: keyof typeof PRICING_MATRIX;
  if (imageCount <= 15) {
    priceKey = 15;
  } else if (imageCount <= 25) {
    priceKey = 25;
  } else if (imageCount <= 35) {
    priceKey = 35;
  } else if (imageCount <= 50) {
    priceKey = 50;
  } else {
    priceKey = 999;
  }

  return PRICING_MATRIX[priceKey][tier];
}

/**
 * Get the default site currency with validation
 */
export function getDefaultCurrency(): Currency {
  const siteCurrency = process.env.SITE_CURRENCY;
  if (siteCurrency && ['GBP', 'USD'].includes(siteCurrency)) {
    return siteCurrency as Currency;
  }
  
  if (siteCurrency && !['GBP', 'USD'].includes(siteCurrency)) {
    console.warn(`Invalid SITE_CURRENCY: ${siteCurrency}, defaulting to GBP`);
  }
  
  return 'GBP';
}

/**
 * Get currency symbol for display
 */
export function getCurrencySymbol(currency: Currency): string {
  return currency === 'GBP' ? '£' : '$';
}

/**
 * Format price from cents/pence for display
 * Let Stripe handle the actual currency conversion
 */
export function formatPriceFromCents(priceInCents: number, currency: Currency): string {
  const symbol = getCurrencySymbol(currency);
  const price = priceInCents / 100;
  
  // Always show proper decimal places for currency
  return `${symbol}${price.toFixed(2)}`;
}
