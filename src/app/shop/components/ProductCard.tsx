'use client';

import { useState } from 'react';
import { getBasePriceInCents, formatPriceFromCents, getDefaultCurrency, type LicenseTier, type Currency } from '@/lib/pricing/getPrices';

interface ProductPack {
  packId: string;
  packName: string;
  series: string;
  description: string;
  totalImages: number;
  previewImage: string;
  format: string;
  prices?: {
    personal: { priceId: string; amount: number; formatted: string };
    commercial: { priceId: string; amount: number; formatted: string };
    extended: { priceId: string; amount: number; formatted: string };
  };
}

interface ProductCardProps {
  product: ProductPack;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [selectedTier, setSelectedTier] = useState<LicenseTier>('commercial');
  const [loading, setLoading] = useState(false);
  const currency = getDefaultCurrency();

  // Use Stripe prices as SSOT (already formatted from API) or fallback to calculated prices
  const prices = product.prices || {
    personal: { priceId: '', amount: 399, formatted: '£3.99' },
    commercial: { priceId: '', amount: 799, formatted: '£7.99' },
    extended: { priceId: '', amount: 1299, formatted: '£12.99' }
  };

  const handlePurchase = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/checkout/product-tier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.packId,
          priceId: prices[selectedTier].priceId,
          productName: `${product.packName} (${selectedTier} license)`
        })
      });
      
      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Purchase failed:', error);
      alert('Sorry, something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      {/* Product Preview */}
      <div className="aspect-square bg-gray-50 relative overflow-hidden">
        <img 
          src={product.previewImage}
          alt={`Preview of ${product.packName}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = `/api/og?text=${encodeURIComponent(product.packName)}`;
          }}
        />
        <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-medium">
          {product.totalImages} images
        </div>
        <div className="absolute top-4 left-4 bg-black/70 text-white px-2 py-1 rounded text-xs">
          {product.series.replace('-', ' ')}
        </div>
      </div>

      {/* Product Info */}
      <div className="p-6">
        <h3 className="text-xl font-serif mb-2">{product.packName}</h3>
        <p className="text-gray-600 mb-4 text-sm">{product.description}</p>
        
        {/* License Tier Selection */}
        <div className="mb-6">
          <h4 className="font-medium mb-3 text-sm">choose your licence:</h4>
          <div className="space-y-2">
            {(['personal', 'commercial', 'extended'] as const).map((tier) => (
              <label key={tier} className={`flex items-center justify-between p-3 border-2 rounded-lg cursor-pointer transition-all ${
                selectedTier === tier 
                  ? 'border-gray-900 bg-gray-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name={`tier-${product.packId}`}
                    value={tier}
                    checked={selectedTier === tier}
                    onChange={(e) => setSelectedTier(e.target.value as LicenseTier)}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded-full border-2 transition-all ${
                    selectedTier === tier 
                      ? 'border-gray-900 bg-gray-900' 
                      : 'border-gray-300'
                  }`}>
                    {selectedTier === tier && (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-sm capitalize">
                      {tier}
                      {tier === 'commercial' && (
                        <span className="ml-2 text-xs px-2 py-0.5 bg-gray-900 text-white rounded-full">
                          most popular
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-600">
                      {tier === 'personal' && 'for your own use only'}
                      {tier === 'commercial' && 'for client work, up to 5,000 uses'}
                      {tier === 'extended' && 'unlimited commercial rights'}
                    </div>
                  </div>
                </div>
                <div className="text-lg font-light">
                  {prices[tier].formatted}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Purchase Button */}
        <button
          onClick={handlePurchase}
          disabled={loading}
          className="w-full bg-gray-900 text-white py-4 px-4 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 transition-all"
        >
          {loading ? 'processing...' : 'get the pack'}
        </button>

        <div className="text-xs text-gray-500 mt-3 text-center">
          instant download. licence included.
        </div>
      </div>
    </div>
  );
}
