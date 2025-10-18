"use client";

import { useState } from "react";

export default function AdminDashboard() {
  const [sending, setSending] = useState<string | null>(null);

  const sendTestEmail = async (type: 'welcome' | 'newsletter') => {
    setSending(type);
    try {
      const response = await fetch('/api/admin/send-test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert(`✅ Test ${type} email sent successfully to ${result.sentTo}!`);
      } else {
        alert(`❌ Failed to send test email: ${result.error}`);
      }
    } catch (error) {
      alert(`❌ Error sending test email: ${error}`);
    } finally {
      setSending(null);
    }
  };

  const sendDailyReview = async () => {
    setSending('review');
    try {
      const response = await fetch('/api/admin/daily-review');
      const result = await response.json();
      
      if (result.success) {
        alert(`📱 Daily review sent to your phone! Check Pushover app.`);
      } else {
        alert(`❌ Failed to send review: ${result.error}`);
      }
    } catch (error) {
      alert(`❌ Error sending review: ${error}`);
    } finally {
      setSending(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF9F7] text-[#3A3A3A]">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif mb-4">Admin Dashboard</h1>
          <p className="text-xl text-gray-600">
            Manage your automated digital wellness platform
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <a 
            href="/api/health"
            target="_blank"
            className="bg-green-50 border border-green-200 rounded-lg p-6 text-center hover:shadow-md transition-shadow"
          >
            <div className="text-3xl mb-3">🟢</div>
            <h3 className="font-semibold mb-2">System Health</h3>
            <p className="text-sm text-gray-600">Check all systems status</p>
          </a>

          <a 
            href="/admin/newsletters"
            className="bg-purple-50 border border-purple-200 rounded-lg p-6 text-center hover:shadow-md transition-shadow"
          >
            <div className="text-3xl mb-3">📧</div>
            <h3 className="font-semibold mb-2">Newsletter Queue</h3>
            <p className="text-sm text-gray-600">Preview next 7 days</p>
          </a>

          <a 
            href="/admin/packs"
            className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center hover:shadow-md transition-shadow"
          >
            <div className="text-3xl mb-3">🎨</div>
            <h3 className="font-semibold mb-2">Generate Packs</h3>
            <p className="text-sm text-gray-600">Create new products</p>
          </a>

          <a 
            href="/admin/email-analytics"
            className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center hover:shadow-md transition-shadow"
          >
            <div className="text-3xl mb-3">📊</div>
            <h3 className="font-semibold mb-2">Email Analytics</h3>
            <p className="text-sm text-gray-600">Delivery, opens, clicks & more</p>
          </a>
        </div>

        {/* Main Sections */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Content Management */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-serif mb-4">📝 Content Management</h2>
            <div className="space-y-3">
              <a href="/admin/newsletters" className="block p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                <div className="font-medium">Newsletter Previews</div>
                <div className="text-sm text-gray-600">See upcoming automated content</div>
              </a>
              <a href="/admin/letters" className="block p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                <div className="font-medium">Letter Management</div>
                <div className="text-sm text-gray-600">Manage paid weekly content</div>
              </a>
              <a href="/preview" className="block p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                <div className="font-medium">Quote Preview</div>
                <div className="text-sm text-gray-600">See generated quote samples</div>
              </a>
            </div>
          </div>

          {/* Business Operations */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-serif mb-4">💰 Business Operations</h2>
            <div className="space-y-3">
              <a href="/admin/packs" className="block p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                <div className="font-medium">Product Generation</div>
                <div className="text-sm text-gray-600">Create quote packs → Blob → Stripe</div>
              </a>
              <a href="/admin/distribution" className="block p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                <div className="font-medium">Multi-Platform Distribution</div>
                <div className="text-sm text-gray-600">Distribute to Etsy, Gumroad & more</div>
              </a>
              <a href="/admin/stripe" className="block p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                <div className="font-medium">Stripe Management</div>
                <div className="text-sm text-gray-600">Sync products, manage pricing</div>
              </a>
              <a href="/shop" className="block p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                <div className="font-medium">Live Shop</div>
                <div className="text-sm text-gray-600">Customer experience preview</div>
              </a>
              <a href="/admin/metrics" className="block p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                <div className="font-medium">Business Analytics</div>
                <div className="text-sm text-gray-600">Subscriber & email metrics</div>
              </a>
            </div>
          </div>

          {/* Testing & Development */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-serif mb-4">🧪 Testing & Debugging</h2>
            <div className="space-y-3">
              <a href="/test/succulent" className="block p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                <div className="font-medium">Social Media Test</div>
                <div className="text-sm text-gray-600">Test 4-platform posting</div>
              </a>
              <a href="/test/email" className="block p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                <div className="font-medium">Email Delivery Test</div>
                <div className="text-sm text-gray-600">Verify email system</div>
              </a>
              <button 
                onClick={() => sendTestEmail('welcome')}
                disabled={sending === 'welcome'}
                className="w-full text-left p-3 bg-green-50 rounded hover:bg-green-100 transition-colors border border-green-200 disabled:opacity-50"
              >
                <div className="font-medium text-green-800">
                  {sending === 'welcome' ? '⏳ Sending...' : '📧 Send Test Welcome Email'}
                </div>
                <div className="text-sm text-green-600">Send to your configured test email</div>
              </button>
              <button 
                onClick={() => sendTestEmail('newsletter')}
                disabled={sending === 'newsletter'}
                className="w-full text-left p-3 bg-blue-50 rounded hover:bg-blue-100 transition-colors border border-blue-200 disabled:opacity-50"
              >
                <div className="font-medium text-blue-800">
                  {sending === 'newsletter' ? '⏳ Sending...' : '📰 Send Test Newsletter'}
                </div>
                <div className="text-sm text-blue-600">Preview newsletter format</div>
              </button>
              <button 
                onClick={() => sendDailyReview()}
                disabled={sending === 'review'}
                className="w-full text-left p-3 bg-orange-50 rounded hover:bg-orange-100 transition-colors border border-orange-200 disabled:opacity-50"
              >
                <div className="font-medium text-orange-800">
                  {sending === 'review' ? '⏳ Sending...' : '📱 Send Daily Review'}
                </div>
                <div className="text-sm text-orange-600">Get business summary via Pushover</div>
              </button>
              <a href="/api/health" target="_blank" className="block p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                <div className="font-medium">System Status</div>
                <div className="text-sm text-gray-600">Real-time health check</div>
              </a>
              <a href="https://vercel.com/dashboard" target="_blank" className="block p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                <div className="font-medium">Vercel Dashboard</div>
                <div className="text-sm text-gray-600">Function logs & performance</div>
              </a>
            </div>
          </div>
        </div>

        {/* Automation Status */}
        <div className="mt-12 bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-serif mb-6">🤖 Automation Status</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-4 text-green-700">✅ Fully Automated</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Daily Newsletter</span>
                  <span className="text-gray-500">7:30 AM UTC</span>
                </div>
                <div className="flex justify-between">
                  <span>Morning Social Post</span>
                  <span className="text-gray-500">8:00 AM UTC</span>
                </div>
                <div className="flex justify-between">
                  <span>Afternoon Social Post</span>
                  <span className="text-gray-500">2:00 PM UTC</span>
                </div>
                <div className="flex justify-between">
                  <span>Evening Social Post</span>
                  <span className="text-gray-500">8:00 PM UTC</span>
                </div>
                <div className="flex justify-between">
                  <span>Weekly Letters</span>
                  <span className="text-gray-500">Sundays 9:00 AM UTC</span>
                </div>
                <div className="flex justify-between">
                  <span>Content Planning</span>
                  <span className="text-gray-500">Mondays</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-purple-700">🎛️ Manual Controls</h3>
              <div className="space-y-2 text-sm">
                <div>• Generate new product packs</div>
                <div>• Preview upcoming newsletters</div>
                <div>• Test social media posting</div>
                <div>• Sync products to Stripe</div>
                <div>• Send manual newsletters</div>
                <div>• Monitor system health</div>
              </div>
            </div>
          </div>
        </div>

        {/* System Overview */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold mb-4">🏗️ System Architecture</h3>
          <div className="grid md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-medium text-green-600">Database</div>
              <div className="text-gray-600">Neon PostgreSQL</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-blue-600">Storage</div>
              <div className="text-gray-600">Vercel Blob</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-purple-600">Payments</div>
              <div className="text-gray-600">Stripe</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-orange-600">Social</div>
              <div className="text-gray-600">Succulent API</div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 text-center">
          <div className="flex flex-wrap justify-center gap-4">
            <a href="/" className="text-purple-400 hover:underline">← Back to Site</a>
            <a href="/shop" className="text-purple-400 hover:underline">Live Shop</a>
            <a href="/inbox" className="text-purple-400 hover:underline">Newsletter Signup</a>
            <a href="/bio" className="text-purple-400 hover:underline">Link-in-Bio</a>
          </div>
        </div>
      </div>
    </main>
  );
}
