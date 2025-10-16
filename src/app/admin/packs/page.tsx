'use client';

import { useState } from 'react';

export default function PacksAdminPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const generatePack = async (packName?: string, generateAll = false) => {
    setLoading(true);
    setResult(null);
    
    try {
      // Step 1: Generate pack to Vercel Blob
      const response = await fetch('/api/generate/pack-direct', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'your-admin-token'}`
        },
        body: JSON.stringify({ packName, generateAll })
      });
      
      const packData = await response.json();
      
      if (packData.success) {
        // Step 2: Auto-create Stripe products for successful packs
        const stripeResults = [];
        
        for (const pack of packData.results.packs) {
          if (pack.success && pack.metadata) {
            try {
              const stripeResponse = await fetch('/api/stripe/create-product', {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'your-admin-token'}`
                },
                body: JSON.stringify({
                  packId: pack.packId,
                  packName: pack.metadata.packName,
                  description: pack.metadata.description,
                  price: pack.metadata.price,
                  totalImages: pack.metadata.totalImages,
                  series: pack.metadata.series,
                  previewImageUrl: pack.previewUrl
                })
              });
              
              const stripeData = await stripeResponse.json();
              stripeResults.push({
                packId: pack.packId,
                stripeSuccess: stripeData.success,
                stripePriceId: stripeData.stripePriceId,
                stripeError: stripeData.error
              });
              
              console.log(`✅ Stripe product created for ${pack.packId}: ${stripeData.stripePriceId}`);
            } catch (stripeError) {
              stripeResults.push({
                packId: pack.packId,
                stripeSuccess: false,
                stripeError: stripeError instanceof Error ? stripeError.message : String(stripeError)
              });
            }
          }
        }
        
        // Combine results
        setResult({
          ...packData,
          stripeResults,
          message: `${packData.message} • Stripe: ${stripeResults.filter(r => r.stripeSuccess).length} created`
        });
      } else {
        setResult(packData);
      }
      
    } catch (error) {
      setResult({ 
        success: false, 
        error: 'Failed to generate pack',
        details: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setLoading(false);
    }
  };

  const availablePacks = [
    'soft-strength-collection',
    'rebuilding-journey', 
    'self-trust-quotes',
    'gentle-boundaries',
    'morning-affirmations'
  ];

  return (
    <main className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-serif mb-8">Digital Pack Generator</h1>
      
      <div className="bg-white rounded-lg border border-gray-100 p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">🚀 Direct-to-Blob Generation</h2>
        <p className="text-gray-600 mb-6">
          Generate packs directly to Vercel Blob storage. No local files created!
        </p>
        
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => generatePack(undefined, true)}
            disabled={loading}
            className="bg-purple-600 text-white px-6 py-3 rounded hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? 'Generating All...' : '🎨 Generate All Packs'}
          </button>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">Generate Single Pack:</label>
            <div className="flex gap-2">
              <select 
                id="pack-select"
                className="flex-1 border rounded px-3 py-2 text-sm"
              >
                {availablePacks.map(pack => (
                  <option key={pack} value={pack}>
                    {pack.replace(/-/g, ' ')}
                  </option>
                ))}
              </select>
              <button
                onClick={() => {
                  const select = document.getElementById('pack-select') as HTMLSelectElement;
                  generatePack(select.value);
                }}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
              >
                Generate
              </button>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded text-sm">
          <h3 className="font-medium mb-2">✨ Complete Automated Workflow:</h3>
          <ul className="space-y-1 text-blue-800">
            <li>• <strong>Step 1:</strong> Generate unique quotes & images → Vercel Blob</li>
            <li>• <strong>Step 2:</strong> Auto-create Stripe product & price</li>
            <li>• <strong>Step 3:</strong> Shop updates instantly with new products</li>
            <li>• <strong>Result:</strong> Ready to sell immediately!</li>
            <li>• <strong>Bonus:</strong> No local files (clean repo!)</li>
          </ul>
        </div>
      </div>

      {result && (
        <div className={`rounded-lg border p-6 mb-8 ${
          result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        }`}>
          <h3 className="font-semibold mb-3">
            {result.success ? '✅ Generation Complete' : '❌ Generation Failed'}
          </h3>
          
          {result.success && result.results && (
            <div className="space-y-4">
              <p className="text-green-700">{result.message}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white p-3 rounded">
                  <div className="text-2xl font-bold text-green-600">{result.results.successful}</div>
                  <div className="text-gray-600">Successful</div>
                </div>
                <div className="bg-white p-3 rounded">
                  <div className="text-2xl font-bold text-red-600">{result.results.failed}</div>
                  <div className="text-gray-600">Failed</div>
                </div>
              </div>

              {result.results.packs && (
                <details className="mt-4">
                  <summary className="cursor-pointer font-medium">View Complete Results</summary>
                  <div className="mt-3 space-y-3">
                    {result.results.packs.map((pack: any, index: number) => {
                      const stripeResult = result.stripeResults?.find((s: any) => s.packId === pack.packId);
                      
                      return (
                        <div key={index} className={`p-4 rounded border ${
                          pack.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                        }`}>
                          <div className="font-medium text-lg mb-2">{pack.packId}</div>
                          
                          {pack.success ? (
                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                              {/* Pack Generation Results */}
                              <div>
                                <h4 className="font-medium text-green-700 mb-1">📦 Pack Generation</h4>
                                <div className="space-y-1 text-green-600">
                                  <div>✅ Files: {pack.fileCount} images</div>
                                  <div>✅ ZIP: <a href={pack.zipUrl} className="underline" target="_blank">Blob URL</a></div>
                                  {pack.previewUrl && (
                                    <div>✅ Preview: <a href={pack.previewUrl} className="underline" target="_blank">Image</a></div>
                                  )}
                                </div>
                              </div>
                              
                              {/* Stripe Results */}
                              <div>
                                <h4 className="font-medium text-blue-700 mb-1">💳 Stripe Integration</h4>
                                {stripeResult ? (
                                  <div className={`space-y-1 ${stripeResult.stripeSuccess ? 'text-blue-600' : 'text-red-600'}`}>
                                    <div>{stripeResult.stripeSuccess ? '✅' : '❌'} Product: {stripeResult.stripeSuccess ? 'Created' : 'Failed'}</div>
                                    {stripeResult.stripePriceId && (
                                      <div>✅ Price ID: <code className="text-xs bg-gray-100 px-1 rounded">{stripeResult.stripePriceId}</code></div>
                                    )}
                                    {stripeResult.stripeError && (
                                      <div>❌ Error: {stripeResult.stripeError}</div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="text-gray-500">⏳ Processing...</div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="text-red-700">❌ Generation failed: {pack.error}</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </details>
              )}
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

      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold mb-3">🔒 Secure Download Flow</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p><strong>1. Customer Purchase:</strong> Stripe processes payment</p>
          <p><strong>2. Webhook Triggered:</strong> Creates secure 24-hour download link</p>
          <p><strong>3. Email Sent:</strong> Customer gets download link via email</p>
          <p><strong>4. Secure Download:</strong> Link verified before file access</p>
          <p><strong>5. Link Expires:</strong> After 24 hours for security</p>
        </div>
      </div>
    </main>
  );
}
