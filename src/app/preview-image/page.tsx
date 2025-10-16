"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

type Quote = {
  id: string;
  theme: string;
  tone: string;
  lines: string[];
  tags: string[];
};

export default function PreviewImage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [format, setFormat] = useState<'square' | 'portrait'>('square');
  const [seed, setSeed] = useState(42);

  useEffect(() => {
    fetch(`/api/generate?count=12&seed=${seed}`)
      .then(r => r.json())
      .then(data => {
        setQuotes(data.quotes || []);
        setLoading(false);
      });
  }, [seed]);

  const getImageUrl = (quote: Quote) => {
    const text = encodeURIComponent(quote.lines.join("\n"));
    const endpoint = format === 'square' ? '/api/og' : '/api/og-portrait';
    return `${endpoint}?text=${text}`;
  };

  if (loading) return <div className="p-10">Loading quote images...</div>;

  return (
    <main className="p-10">
      <div className="mb-8">
        <h1 className="text-2xl mb-4">Quote Image Preview</h1>
        
        <div className="flex gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Seed:</label>
            <input
              type="number"
              value={seed}
              onChange={(e) => setSeed(Number(e.target.value))}
              className="border rounded px-3 py-2 w-32"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Format:</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as 'square' | 'portrait')}
              className="border rounded px-3 py-2"
            >
              <option value="square">Square (1080x1080)</option>
              <option value="portrait">Portrait (1080x1920)</option>
            </select>
          </div>
        </div>
        
        <p className="text-sm opacity-70 mb-2">
          Using seed={seed} for reproducible results. Change seed to see different quotes.
        </p>
        <p className="text-sm opacity-70">
          These are the actual images that would be posted to social media.
        </p>
      </div>

      <div className={`grid gap-6 ${format === 'square' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
        {quotes.map((quote) => (
          <div key={quote.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="relative">
              <Image
                src={getImageUrl(quote)}
                alt={`Quote: ${quote.lines.join(' ')}`}
                width={format === 'square' ? 540 : 270}
                height={format === 'square' ? 540 : 480}
                className="w-full h-auto"
                unoptimized // Since these are dynamically generated
              />
            </div>
            
            <div className="p-4">
              <div className="text-xs text-gray-500 mb-2">
                {quote.theme} · {quote.tone} · {quote.id}
              </div>
              <div className="text-sm text-gray-700 mb-2">
                {quote.lines.join(" / ")}
              </div>
              <div className="text-xs text-gray-400">
                {quote.tags.join(" • ")}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium mb-2">How to use different seeds:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Same seed = same quotes (reproducible)</li>
          <li>• Different seed = different quotes</li>
          <li>• Current time: {Date.now()}</li>
          <li>• Try seeds like: 42, 100, 1000, {Date.now()}</li>
        </ul>
      </div>
    </main>
  );
}
