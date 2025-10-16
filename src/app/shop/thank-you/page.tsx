'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function ThankYouContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const isUpgrade = searchParams.get('upgrade') === 'true';
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      // In a real implementation, you'd fetch order details from your API
      // For now, we'll show a generic success message
      setLoading(false);
    }
  }, [sessionId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FAF9F7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">processing your order...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF9F7] text-gray-900">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="text-center space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-4xl font-light">
              {isUpgrade ? 'licence upgraded 🤍' : 'thank you 🤍'}
            </h1>
            <p className="text-xl text-gray-700">
              {isUpgrade 
                ? 'your updated download is ready' 
                : 'your download is ready. we\'ve also emailed you the link and your licence.'
              }
            </p>
          </div>

          {/* Order Status */}
          <div className="bg-white p-8 rounded-lg border border-gray-200">
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-green-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">payment successful</span>
              </div>
              
              <div className="text-sm text-gray-600">
                <p>order: {sessionId?.slice(-8) || 'processing'}</p>
                <p>check your email for download link and licence details</p>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="space-y-6">
            <div className="text-left bg-gray-50 p-6 rounded-lg">
              <h2 className="font-medium mb-3">what happens next:</h2>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-start gap-3">
                  <span className="text-gray-400 mt-1">1.</span>
                  <span>check your email for the download link</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-gray-400 mt-1">2.</span>
                  <span>download and extract your image pack</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-gray-400 mt-1">3.</span>
                  <span>review your licence agreement (included in download)</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-gray-400 mt-1">4.</span>
                  <span>start creating beautiful content</span>
                </div>
              </div>
            </div>

            {/* Upgrade CTA - only show for non-extended licenses */}
            {!isUpgrade && (
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="font-medium mb-2">need broader rights later?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  you can upgrade your licence any time with the difference only.
                </p>
                <p className="text-sm">
                  <a 
                    href="mailto:orders@softlybecoming.com" 
                    className="text-gray-900 underline hover:no-underline"
                  >
                    reply to your confirmation email to upgrade
                  </a>
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/shop" 
                className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-center"
              >
                browse more packs
              </a>
              <a 
                href="/inbox" 
                className="px-6 py-3 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors text-center"
              >
                get notified of new releases
              </a>
            </div>
          </div>

          {/* Support */}
          <div className="border-t border-gray-200 pt-8">
            <p className="text-sm text-gray-600">
              questions or need help? 
              <a 
                href="mailto:orders@softlybecoming.com" 
                className="text-gray-900 underline hover:no-underline ml-1"
              >
                get in touch
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#FAF9F7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">loading...</p>
        </div>
      </main>
    }>
      <ThankYouContent />
    </Suspense>
  );
}
