'use client';

import { useState, useEffect } from 'react';
import ProductCard from './components/ProductCard';

interface ProductPack {
  packId: string;
  packName: string;
  series: string;
  version: string;
  generatedAt: string;
  totalImages: number;
  price: number;
  description: string;
  previewImage: string;
  format: string;
  theme?: string;
  stripePriceId: string;
}

interface SeriesData {
  seriesName: string;
  packs: ProductPack[];
  lastUpdated: string;
}

interface ShopData {
  series: SeriesData[];
  products: ProductPack[];
  totalProducts: number;
  totalSeries: number;
}

export default function DynamicShopPage() {
  const [shopData, setShopData] = useState<ShopData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeries, setSelectedSeries] = useState<string>('all');
  const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/shop/products')
      .then(res => res.json())
      .then(data => setShopData(data))
      .catch(err => console.error('Failed to load products:', err))
      .finally(() => setLoading(false));
  }, []);

  const handlePurchase = async (product: ProductPack) => {
    setPurchaseLoading(product.packId);
    
    try {
      const response = await fetch('/api/checkout/product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.packId,
          priceId: product.stripePriceId,
          productName: product.packName
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
      setPurchaseLoading(null);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FAF9F7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading our beautiful quote collections...</p>
        </div>
      </main>
    );
  }

  if (!shopData || shopData.totalProducts === 0) {
    return (
      <main className="min-h-screen bg-[#FAF9F7] text-[#3A3A3A]">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h1 className="text-4xl font-serif mb-6">Digital Quote Collections</h1>
          <p className="text-xl opacity-80 mb-8">
            No products available yet. Check back soon for beautiful quote collections!
          </p>
          <a href="/" className="bg-[#3A3A3A] text-[#FAF9F7] px-6 py-3 rounded hover:opacity-90">
            Back to Home
          </a>
        </div>
      </main>
    );
  }

  const filteredProducts = selectedSeries === 'all' 
    ? shopData.products 
    : shopData.products.filter(p => p.series === selectedSeries);

  return (
    <main className="min-h-screen bg-[#FAF9F7] text-[#3A3A3A]">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-serif mb-6">Digital Quote Collections</h1>
          <p className="text-xl opacity-80 mb-4 max-w-3xl mx-auto">
            Beautiful, ready-to-use quote graphics for your social media, website, or personal inspiration.
          </p>
          <p className="opacity-70 mb-8">
            {shopData.totalProducts} products across {shopData.totalSeries} series • Instant download • Commercial use included
          </p>
        </div>

        {/* Series Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setSelectedSeries('all')}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                selectedSeries === 'all' 
                  ? 'bg-[#3A3A3A] text-[#FAF9F7]' 
                  : 'bg-white text-[#3A3A3A] hover:bg-gray-100'
              }`}
            >
              All Products ({shopData.totalProducts})
            </button>
            {shopData.series.map(series => (
              <button
                key={series.seriesName}
                onClick={() => setSelectedSeries(series.seriesName)}
                className={`px-4 py-2 rounded-full text-sm transition-colors capitalize ${
                  selectedSeries === series.seriesName 
                    ? 'bg-[#3A3A3A] text-[#FAF9F7]' 
                    : 'bg-white text-[#3A3A3A] hover:bg-gray-100'
                }`}
              >
                {series.seriesName.replace('-', ' ')} ({series.packs.length})
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {filteredProducts.map((product) => (
            <ProductCard key={product.packId} product={product} />
          ))}
        </div>

        {/* Generate More CTA */}
        <div className="text-center bg-white rounded-lg border border-gray-100 p-8">
          <h2 className="text-2xl font-serif mb-4">Want More Collections?</h2>
          <p className="text-gray-600 mb-6">
            We're constantly creating new quote collections. Each pack is unique and generated fresh!
          </p>
          <div className="flex gap-4 justify-center">
            <a href="/inbox" className="bg-[#3A3A3A] text-[#FAF9F7] px-6 py-3 rounded hover:opacity-90">
              Get Notified of New Packs
            </a>
            <a href="/" className="border border-[#3A3A3A] px-6 py-3 rounded hover:bg-[#3A3A3A] hover:text-[#FAF9F7]">
              Back to Home
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
