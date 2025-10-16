'use client';

import { useState } from 'react';
import { BASE_PACK_PRICES, LICENSE_TIERS } from '@/lib/pricing/strategy';

interface ProductPack {
  packId: string;
  packName: string;
  series: string;
  description: string;
  totalImages: number;
  previewImage: string;
  format: string;
}

interface ProductCardProps {
  product: ProductPack;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [selectedTier, setSelectedTier] = useState<'personal' | 'commercial' | 'extended'>('personal');
  const [loading, setLoading] = useState(false);

  // Get pricing for this product
  const pricing = BASE_PACK_PRICES[product.packId as keyof typeof BASE_PACK_PRICES] || {
    personal: 19,
    commercial: 34,
    extended: 47
  };

  const handlePurchase = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/checkout/product-tier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.packId,
          tier: selectedTier,
          productName: product.packName,
          customPrice: pricing[selectedTier]
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
          <h4 className="font-medium mb-3">Choose Your License:</h4>
          <div className="space-y-2">
            {(['personal', 'commercial', 'extended'] as const).map((tier) => (
              <label key={tier} className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name={`tier-${product.packId}`}
                    value={tier}
                    checked={selectedTier === tier}
                    onChange={(e) => setSelectedTier(e.target.value as any)}
                    className="text-purple-600"
                  />
                  <div>
                    <div className="font-medium text-sm">
                      {LICENSE_TIERS[tier].name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {LICENSE_TIERS[tier].description}
                    </div>
                  </div>
                </div>
                <div className="text-lg font-serif">
                  ${pricing[tier]}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Selected License Details */}
        <div className="mb-6 p-3 bg-gray-50 rounded-lg">
          <h5 className="font-medium text-sm mb-2">What's included:</h5>
          <div className="space-y-1">
            {LICENSE_TIERS[selectedTier].includes.slice(0, 4).map((item, index) => (
              <div key={index} className="text-xs text-gray-600">
                {item}
              </div>
            ))}
            {LICENSE_TIERS[selectedTier].includes.length > 4 && (
              <div className="text-xs text-gray-500">
                +{LICENSE_TIERS[selectedTier].includes.length - 4} more...
              </div>
            )}
          </div>
        </div>

        {/* Purchase Button */}
        <button
          onClick={handlePurchase}
          disabled={loading}
          className="w-full bg-[#3A3A3A] text-[#FAF9F7] py-3 px-4 rounded hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {loading ? 'Processing...' : `Buy ${LICENSE_TIERS[selectedTier].name} - $${pricing[selectedTier]}`}
        </button>

        <div className="text-xs text-gray-400 mt-3 text-center">
          Instant download • 30-day money-back guarantee
        </div>
      </div>
    </div>
  );
}
