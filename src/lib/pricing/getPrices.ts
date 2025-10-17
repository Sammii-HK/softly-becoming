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

// Impulse buy pricing matrix in GBP (Stripe will handle currency conversion)
const PRICING_MATRIX = {
  15: { personal: 399, commercial: 799, extended: 1299 }, // £3.99, £7.99, £12.99 in pence
  25: { personal: 599, commercial: 999, extended: 1599 }, // £5.99, £9.99, £15.99
  35: { personal: 799, commercial: 1299, extended: 1999 }, // £7.99, £12.99, £19.99
  50: { personal: 999, commercial: 1599, extended: 2499 }, // £9.99, £15.99, £24.99
  999: { personal: 1299, commercial: 1999, extended: 2999 } // £12.99, £19.99, £29.99 (>50)
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
