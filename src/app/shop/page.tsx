'use client';

import { useState, useEffect } from 'react';

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

interface ShopData {
  products: ProductPack[];
  totalProducts: number;
}

export default function ShopPage() {
  const [shopData, setShopData] = useState<ShopData | null>(null);
  const [loading, setLoading] = useState(true);
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

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'phone':
      case 'portrait': return '📱';
      case 'square': return '⬜';
      case 'both': return '📱📖';
      default: return '🎨';
    }
  };

  const getFormatLabel = (format: string) => {
    switch (format) {
      case 'phone':
      case 'portrait': return 'Phone Wallpapers';
      case 'square': return 'Instagram Posts';
      case 'both': return 'Posts + Wallpapers';
      default: return 'Digital Graphics';
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FAF9F7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-purple-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading our beautiful collections...</p>
        </div>
      </main>
    );
  }

  if (!shopData || shopData.totalProducts === 0) {
    return (
      <main className="min-h-screen bg-[#FAF9F7] text-[#3A3A3A]">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h1 className="text-4xl font-serif mb-6">Beautiful Quote Collections</h1>
          <p className="text-xl opacity-80 mb-8">
            Our collections are being prepared. Check back soon for gentle wisdom you can use everywhere!
          </p>
          <a 
            href="/" 
            className="inline-block bg-[#3A3A3A] text-[#FAF9F7] px-6 py-3 rounded hover:opacity-90 transition-opacity"
          >
            Back to Home
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF9F7] text-[#3A3A3A]">
      {/* Header */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <h1 className="text-5xl font-serif mb-6">
            Beautiful Quote <span className="text-purple-400">Collections</span>
          </h1>
          <p className="text-xl opacity-80 mb-4">
            Professional quote graphics for your social media, website, or personal inspiration
          </p>
          <p className="text-lg opacity-60">
            Instant download • Personal & commercial licenses • Multiple formats
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {shopData.products.map((product) => (
            <div key={product.packId} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              {/* Product Image */}
              <div className="aspect-square bg-gradient-to-br from-purple-50 to-pink-50 p-8 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-3">{getFormatIcon(product.format)}</div>
                  <div className="text-sm font-medium text-gray-600">{getFormatLabel(product.format)}</div>
                  <div className="text-xs text-gray-500 mt-1">{product.totalImages} images</div>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-serif mb-2 capitalize">
                    {product.packName.replace(/-/g, ' ')}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Features */}
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                      {product.totalImages} images
                    </span>
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      Commercial license
                    </span>
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      Instant download
                    </span>
                  </div>
                </div>

                {/* Pricing */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">£{product.price}</span>
                    <span className="text-gray-500 text-sm">one-time</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    £{(product.price / product.totalImages).toFixed(2)} per image
                  </div>
                </div>

                {/* Purchase Button */}
                <button
                  onClick={() => handlePurchase(product)}
                  disabled={purchaseLoading === product.packId}
                  className="w-full bg-[#3A3A3A] text-[#FAF9F7] py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {purchaseLoading === product.packId ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-white rounded-full animate-spin"></div>
                      Processing...
                    </span>
                  ) : (
                    'Get This Collection'
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center mt-2">
                  Secure checkout via Stripe
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {shopData.products.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-2xl font-serif mb-4">Collections Coming Soon</h3>
            <p className="text-gray-600 mb-8">
              We're preparing beautiful quote collections for you. Check back soon!
            </p>
            <a 
              href="/inbox" 
              className="inline-block bg-purple-400 text-white px-6 py-3 rounded-lg hover:bg-purple-500 transition-colors"
            >
              Join Newsletter for Updates
            </a>
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
                Beautiful phone wallpapers and Instagram posts. All formats optimized for mobile-first inspiration.
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
              <h3 className="font-semibold mb-2">Commercial License</h3>
              <p className="text-gray-600 text-sm">
                Use for client work, social media management, or your business. Full commercial rights included.
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