'use client';

import { useState } from 'react';

export default function StripeAdminPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const syncAllProducts = async (syncAll = false) => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/stripe/sync-products', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'your-admin-token'}`
        },
        body: JSON.stringify({ syncAll })
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ 
        success: false, 
        error: 'Failed to sync products',
        details: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setLoading(false);
    }
  };

  const createSingleProduct = async () => {
    const packId = prompt('Enter pack ID to create in Stripe:');
    if (!packId) return;

    setLoading(true);
    
    try {
      const response = await fetch('/api/stripe/create-product', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'your-admin-token'}`
        },
        body: JSON.stringify({
          packId,
          packName: `Pack ${packId}`,
          description: 'Beautiful quote graphics',
          price: 29,
          totalImages: 25,
          series: 'custom'
        })
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ 
        success: false, 
        error: 'Failed to create product',
        details: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-serif mb-8">Stripe Product Management</h1>
      
      <div className="bg-white rounded-lg border border-gray-100 p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Sync Products to Stripe</h2>
        <p className="text-gray-600 mb-6">
          Automatically create or update Stripe products from your generated packs.
        </p>
        
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => syncAllProducts(false)}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Syncing...' : 'Sync New Products'}
          </button>
          
          <button
            onClick={() => syncAllProducts(true)}
            disabled={loading}
            className="bg-purple-600 text-white px-6 py-3 rounded hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? 'Syncing...' : 'Sync All Products'}
          </button>
          
          <button
            onClick={createSingleProduct}
            disabled={loading}
            className="border border-gray-300 px-6 py-3 rounded hover:bg-gray-50 disabled:opacity-50"
          >
            Create Single Product
          </button>
        </div>

        <div className="text-sm text-gray-500">
          <p><strong>Sync New:</strong> Only creates products that don't exist in Stripe</p>
          <p><strong>Sync All:</strong> Updates existing products and creates new ones</p>
        </div>
      </div>

      {result && (
        <div className={`rounded-lg border p-6 ${
          result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        }`}>
          <h3 className="font-semibold mb-3">
            {result.success ? '✅ Success' : '❌ Error'}
          </h3>
          
          {result.success && result.results && (
            <div className="space-y-3">
              <p className="text-green-700">{result.message}</p>
              
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div className="bg-white p-3 rounded">
                  <div className="text-2xl font-bold text-green-600">{result.results.created}</div>
                  <div className="text-gray-600">Created</div>
                </div>
                <div className="bg-white p-3 rounded">
                  <div className="text-2xl font-bold text-blue-600">{result.results.updated}</div>
                  <div className="text-gray-600">Updated</div>
                </div>
                <div className="bg-white p-3 rounded">
                  <div className="text-2xl font-bold text-gray-600">{result.results.skipped}</div>
                  <div className="text-gray-600">Skipped</div>
                </div>
                <div className="bg-white p-3 rounded">
                  <div className="text-2xl font-bold text-red-600">{result.results.errors}</div>
                  <div className="text-gray-600">Errors</div>
                </div>
              </div>

              {result.results.products && result.results.products.length > 0 && (
                <details className="mt-4">
                  <summary className="cursor-pointer font-medium">View Product Details</summary>
                  <div className="mt-3 space-y-2">
                    {result.results.products.map((product: any, index: number) => (
                      <div key={index} className="bg-white p-3 rounded text-sm">
                        <div className="font-medium">{product.packName}</div>
                        <div className="text-gray-600">
                          ID: {product.packId} | Price: ${product.price} | Status: {product.status}
                        </div>
                        <div className="text-xs text-gray-500">
                          Stripe Price ID: {product.stripePriceId}
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          )}

          {result.stripePriceId && (
            <div className="text-green-700">
              <p>Product created successfully!</p>
              <p className="text-sm">Stripe Price ID: <code>{result.stripePriceId}</code></p>
            </div>
          )}

          {result.error && (
            <div className="text-red-700">
              <p>{result.error}</p>
              {result.details && <p className="text-sm">{result.details}</p>}
            </div>
          )}
        </div>
      )}

      <div className="bg-gray-50 rounded-lg p-6 mt-8">
        <h3 className="font-semibold mb-3">💡 How It Works</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p><strong>Automatic:</strong> When you run <code>npm run generate:packs</code>, Stripe products are created automatically</p>
          <p><strong>Manual:</strong> Use the buttons above to sync existing packs to Stripe</p>
          <p><strong>Updates:</strong> Product details, prices, and images are kept in sync</p>
          <p><strong>Metadata:</strong> Each Stripe product includes pack ID, series, and image count</p>
        </div>
      </div>
    </main>
  );
}
