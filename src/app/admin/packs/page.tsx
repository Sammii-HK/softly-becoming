'use client';

import { useState } from 'react';

export default function PacksAdminPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const generatePack = async (packName?: string, generateAll = false) => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/generate/pack-direct', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'your-admin-token'}`
        },
        body: JSON.stringify({ packName, generateAll })
      });
      
      const data = await response.json();
      setResult(data);
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
          <h3 className="font-medium mb-2">✨ What happens when you generate:</h3>
          <ul className="space-y-1 text-blue-800">
            <li>• Creates unique quote images directly in Vercel Blob</li>
            <li>• Automatically creates Stripe product & price</li>
            <li>• Updates your shop instantly</li>
            <li>• No local files created (clean repo!)</li>
            <li>• Ready for secure customer downloads</li>
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
                  <summary className="cursor-pointer font-medium">View Pack Details</summary>
                  <div className="mt-3 space-y-3">
                    {result.results.packs.map((pack: any, index: number) => (
                      <div key={index} className={`p-3 rounded text-sm ${
                        pack.success ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        <div className="font-medium">{pack.packId}</div>
                        {pack.success ? (
                          <div className="space-y-1 text-green-700">
                            <div>📦 Files: {pack.fileCount}</div>
                            <div>☁️ ZIP: <a href={pack.zipUrl} className="underline" target="_blank">View</a></div>
                            {pack.previewUrl && (
                              <div>🖼️ Preview: <a href={pack.previewUrl} className="underline" target="_blank">View</a></div>
                            )}
                          </div>
                        ) : (
                          <div className="text-red-700">Error: {pack.error}</div>
                        )}
                      </div>
                    ))}
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
