"use client";
import { useEffect, useState } from "react";

type Quote = {
  id: string;
  theme: string;
  tone: string;
  lines: string[];
  tags: string[];
};

export default function Preview() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/generate?count=12&seed=42")
      .then(r => r.json())
      .then(data => {
        setQuotes(data.quotes || []);
        setLoading(false);
      })
      .catch(error => {
        console.error("Failed to load quotes:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FAF9F7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading beautiful quotes...</p>
        </div>
      </main>
    );
  }

  if (quotes.length === 0) {
    return (
      <main className="min-h-screen bg-[#FAF9F7] flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">No quotes available</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-[#3A3A3A] text-[#FAF9F7] px-6 py-3 rounded hover:opacity-90"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF9F7] text-[#3A3A3A]">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif mb-4">Quote Preview</h1>
          <p className="text-xl opacity-70 mb-2">
            See the gentle wisdom that inspires our community
          </p>
          <p className="text-sm opacity-60">
            Generated with seed=42 for consistency • Refreshed daily on social media
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {quotes.map((q: Quote) => (
            <div key={q.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="text-xs text-gray-500 mb-4 uppercase tracking-wide">
                {q.theme.replace('_', ' ')} • {q.tone}
              </div>
              <blockquote className="font-serif text-lg leading-relaxed mb-4 italic">
                "{q.lines.join(' ')}"
              </blockquote>
              <div className="text-xs text-gray-400 flex flex-wrap gap-1">
                {q.tags.map(tag => (
                  <span key={tag} className="bg-gray-100 px-2 py-1 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-100 max-w-2xl mx-auto">
            <h2 className="text-2xl font-serif mb-4">Love These Quotes?</h2>
            <p className="text-gray-600 mb-6">
              Get beautiful quote graphics like these delivered to your inbox daily, 
              or browse our complete collections for your own projects.
            </p>
            <div className="flex gap-4 justify-center">
              <a 
                href="/inbox" 
                className="bg-[#3A3A3A] text-[#FAF9F7] px-6 py-3 rounded hover:opacity-90"
              >
                Join Daily Newsletter
              </a>
              <a 
                href="/shop" 
                className="border border-[#3A3A3A] px-6 py-3 rounded hover:bg-[#3A3A3A] hover:text-[#FAF9F7] transition-colors"
              >
                Browse Quote Collections
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
