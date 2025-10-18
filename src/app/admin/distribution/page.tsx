"use client";

import { useState } from "react";

export default function DistributionPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [selectedPack, setSelectedPack] = useState("");

  const distributePack = async (packId: string, platforms: string[]) => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/distribute-pack', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'your-admin-token'}`
        },
        body: JSON.stringify({ packId, platforms })
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: "Distribution failed",
        details: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      <div className="mb-8">
        <h1 className="text-3xl font-serif mb-4">Multi-Platform Distribution</h1>
        <p className="text-gray-600 mb-6">
          Distribute your quote packs to multiple marketplaces with one click.
        </p>
      </div>

      {/* Distribution Controls */}
      <div className="bg-white rounded-lg border border-gray-100 p-6 mb-8">
        <h2 className="text-xl font-semibold mb-6">📦 Distribute Pack</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Pack Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Select Pack</label>
            <select 
              value={selectedPack}
              onChange={(e) => setSelectedPack(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Choose a pack...</option>
              <option value="soft-strength-collection">Soft Strength Collection</option>
              <option value="rebuilding-journey">Rebuilding Journey</option>
              <option value="self-trust-quotes">Self Trust Quotes</option>
              <option value="gentle-boundaries">Gentle Boundaries</option>
              <option value="morning-affirmations">Morning Affirmations</option>
            </select>
          </div>

          {/* Platform Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Target Platforms</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="mr-2" />
                <span className="text-sm">🛍️ Etsy</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="mr-2" />
                <span className="text-sm">📦 Gumroad</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="mr-2" />
                <span className="text-sm">🎨 Creative Market</span>
              </label>
            </div>
          </div>
        </div>

        <button
          onClick={() => distributePack(selectedPack, ['etsy', 'gumroad', 'creative-market'])}
          disabled={loading || !selectedPack}
          className="mt-6 w-full bg-purple-600 text-white py-3 px-6 rounded hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? 'Distributing...' : '🚀 Distribute to All Platforms'}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className={`rounded-lg border p-6 mb-8 ${
          result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        }`}>
          <h3 className="font-semibold mb-3">
            {result.success ? '✅ Distribution Complete' : '❌ Distribution Failed'}
          </h3>
          
          {result.success && (
            <div className="space-y-4">
              <p className="text-green-700">{result.message}</p>
              
              <div className="grid md:grid-cols-3 gap-4">
                {result.results?.details?.map((platform: any, index: number) => (
                  <div key={index} className={`p-4 rounded border ${
                    platform.success ? 'bg-green-100 border-green-200' : 'bg-red-100 border-red-200'
                  }`}>
                    <h4 className="font-medium mb-2">{platform.platform}</h4>
                    {platform.success ? (
                      <div className="text-sm space-y-1">
                        <p className="text-green-700">✅ Listed successfully</p>
                        {platform.url && (
                          <a href={platform.url} target="_blank" className="text-blue-600 hover:underline block">
                            View listing →
                          </a>
                        )}
                      </div>
                    ) : (
                      <p className="text-red-700 text-sm">❌ {platform.error}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.error && (
            <div className="text-red-700">
              <p>{result.error}</p>
              {result.details && <p className="text-sm mt-2">{result.details}</p>}
            </div>
          )}
        </div>
      )}

      {/* Platform Info */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <h3 className="font-semibold mb-3">🛍️ Etsy</h3>
          <div className="space-y-2 text-sm">
            <p><strong>Audience:</strong> Craft & DIY enthusiasts</p>
            <p><strong>Commission:</strong> 6.5% + payment fees</p>
            <p><strong>Best for:</strong> Personal use graphics</p>
            <p><strong>Avg. price:</strong> £3-8</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold mb-3">📦 Gumroad</h3>
          <div className="space-y-2 text-sm">
            <p><strong>Audience:</strong> Content creators</p>
            <p><strong>Commission:</strong> 3.5% + payment fees</p>
            <p><strong>Best for:</strong> Commercial licenses</p>
            <p><strong>Avg. price:</strong> £8-15</p>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <h3 className="font-semibold mb-3">🎨 Creative Market</h3>
          <div className="space-y-2 text-sm">
            <p><strong>Audience:</strong> Professional designers</p>
            <p><strong>Commission:</strong> 30-70% split</p>
            <p><strong>Best for:</strong> Premium graphics</p>
            <p><strong>Avg. price:</strong> £15-30</p>
          </div>
        </div>
      </div>

      {/* Revenue Projection */}
      <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
        <h3 className="font-semibold mb-4">💰 Revenue Projection</h3>
        <div className="grid md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">4x</div>
            <div className="text-gray-600">Platform reach</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">£200+</div>
            <div className="text-gray-600">Monthly potential</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">24/7</div>
            <div className="text-gray-600">Passive sales</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">Global</div>
            <div className="text-gray-600">Market access</div>
          </div>
        </div>
      </div>
    </main>
  );
}
