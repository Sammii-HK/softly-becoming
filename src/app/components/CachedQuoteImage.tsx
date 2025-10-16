'use client';

import { useState, useEffect } from 'react';

interface CachedQuoteImageProps {
  quotes: string[];
  className?: string;
}

export default function CachedQuoteImage({ quotes, className }: CachedQuoteImageProps) {
  const [currentQuote, setCurrentQuote] = useState(0);
  const [cachedImages, setCachedImages] = useState<string[]>([]);

  // Pre-generate a few cached image URLs on component mount
  useEffect(() => {
    const cached = quotes.slice(0, 3).map(quote => 
      `/api/og?text=${encodeURIComponent(quote)}&branding=true`
    );
    setCachedImages(cached);
  }, [quotes]);

  // Cycle through cached quotes every 12 seconds
  useEffect(() => {
    if (cachedImages.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % cachedImages.length);
    }, 12000);
    
    return () => clearInterval(interval);
  }, [cachedImages.length]);

  if (cachedImages.length === 0) {
    return (
      <div className={`aspect-square bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl flex items-center justify-center ${className}`}>
        <div className="text-center p-8">
          <div className="text-2xl font-serif italic text-gray-600 leading-relaxed">
            "gentle wisdom<br />for your journey"
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`aspect-square rounded-2xl overflow-hidden shadow-lg relative group ${className}`}>
      <img 
        src={cachedImages[currentQuote]}
        alt={`Featured quote: ${quotes[currentQuote]?.split('\n')[0]}...`}
        className="w-full h-full object-cover transition-opacity duration-1000"
        onError={(e) => {
          // Fallback to gradient background
          e.currentTarget.style.display = 'none';
          e.currentTarget.nextElementSibling?.classList.remove('hidden');
        }}
      />
      
      {/* Fallback content */}
      <div className="hidden absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-2xl font-serif italic text-gray-700 leading-relaxed">
            "{quotes[currentQuote]?.split('\n').slice(0, 2).join(' ')}"
          </div>
          <div className="text-2xl font-serif italic text-purple-600 mt-2">
            {quotes[currentQuote]?.split('\n').slice(-1)[0]}
          </div>
        </div>
      </div>
      
      {/* Cycling indicator */}
      <div className="absolute bottom-4 left-4 flex gap-2">
        {cachedImages.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentQuote 
                ? 'bg-white shadow-lg' 
                : 'bg-white/50'
            }`}
          />
        ))}
      </div>
      
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
    </div>
  );
}
