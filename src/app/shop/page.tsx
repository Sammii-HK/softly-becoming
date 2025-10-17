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

  useEffect(() => {
    fetch('/api/shop/products')
      .then(res => res.json())
      .then(data => setShopData(data))
      .catch(err => console.error('Failed to load products:', err))
      .finally(() => setLoading(false));
  }, []);

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

  // Filter products by selected series
  const filteredProducts = selectedSeries === 'all' 
    ? shopData.products 
    : shopData.products.filter(p => p.series === selectedSeries);

  // Get unique series for filter tabs
  const availableSeries = ['all', ...Array.from(new Set(shopData.products.map(p => p.series)))];

  return (
    <main className="min-h-screen bg-[#FAF9F7] text-[#3A3A3A]">
      {/* Header */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <h1 className="text-5xl font-serif mb-6">
            Beautiful Quote <span className="text-purple-400">Collections</span>
          </h1>
          <p className="text-xl opacity-80 mb-4">
            Professional quote graphics ready for your social media, website, or personal inspiration
          </p>
          <p className="text-lg opacity-60">
            Instant download • Personal & commercial licenses • Multiple formats included
          </p>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-wrap gap-2 py-4">
            {availableSeries.map((series) => (
              <button
                key={series}
                onClick={() => setSelectedSeries(series)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedSeries === series
                    ? 'bg-[#3A3A3A] text-[#FAF9F7]'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {series === 'all' ? 'All Products' : series.replace('-', ' ')}
                {series !== 'all' && (
                  <span className="ml-2 text-xs opacity-75">
                    ({shopData.products.filter(p => p.series === series).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        {filteredProducts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.packId} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-2xl font-serif mb-4">No products in this series yet</h3>
            <p className="text-gray-600 mb-8">
              Check back soon or browse all products
            </p>
            <button 
              onClick={() => setSelectedSeries('all')}
              className="bg-purple-400 text-white px-6 py-3 rounded-lg hover:bg-purple-500 transition-colors"
            >
              View All Products
            </button>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-serif text-center mb-12">What You Get</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="font-semibold mb-2">Phone-Optimized</h3>
              <p className="text-gray-600 text-sm">
                Beautiful phone wallpapers and Instagram formats. Perfect for mobile-first inspiration.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="font-semibold mb-2">Instant Download</h3>
              <p className="text-gray-600 text-sm">
                Get your files immediately after purchase. No waiting, no delays. Start using them right away.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💼</span>
              </div>
              <h3 className="font-semibold mb-2">Flexible Licensing</h3>
              <p className="text-gray-600 text-sm">
                Choose from personal, commercial, or extended licenses. Perfect for any use case.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="bg-purple-50 border-t border-purple-100">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h2 className="text-3xl font-serif mb-4">Get Free Daily Inspiration</h2>
          <p className="text-xl opacity-80 mb-8">
            Join thousands receiving gentle reflections every morning
          </p>
          <a 
            href="/inbox" 
            className="inline-block bg-purple-400 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-purple-500 transition-colors"
          >
            Join Free Newsletter
          </a>
        </div>
      </section>
    </main>
  );
}