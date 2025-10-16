'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const productId = searchParams.get('product');

  return (
    <main className="min-h-screen bg-[#FAF9F7] text-[#3A3A3A]">
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <div className="mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-4xl font-serif mb-4">Thank You! 🌸</h1>
          <p className="text-xl opacity-80 mb-6">
            Your digital quote collection is on its way!
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-100 p-8 mb-8">
          <h2 className="text-2xl font-serif mb-4">What happens next?</h2>
          <div className="space-y-4 text-left">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mt-0.5">1</span>
              <div>
                <p className="font-medium">Check your email</p>
                <p className="text-gray-600 text-sm">Your download link will arrive within 5 minutes</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mt-0.5">2</span>
              <div>
                <p className="font-medium">Download your files</p>
                <p className="text-gray-600 text-sm">All images organized by color and format</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mt-0.5">3</span>
              <div>
                <p className="font-medium">Start creating!</p>
                <p className="text-gray-600 text-sm">Use immediately for your social media, website, or projects</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-gray-600">
            Need help? Email us at{' '}
            <a href="mailto:hello@softrebuild.com" className="underline">
              hello@softrebuild.com
            </a>
          </p>
          
          <div className="flex gap-4 justify-center">
            <a 
              href="/shop" 
              className="border border-[#3A3A3A] px-6 py-3 rounded hover:bg-[#3A3A3A] hover:text-[#FAF9F7] transition-colors"
            >
              Browse More Products
            </a>
            <a 
              href="/" 
              className="bg-[#3A3A3A] text-[#FAF9F7] px-6 py-3 rounded hover:opacity-90 transition-opacity"
            >
              Back to Home
            </a>
          </div>
        </div>

        {sessionId && (
          <div className="mt-8 text-xs text-gray-500">
            Order ID: {sessionId}
          </div>
        )}
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAF9F7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
