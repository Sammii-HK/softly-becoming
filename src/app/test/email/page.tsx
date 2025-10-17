"use client";

import { useState } from "react";

export default function EmailTestPage() {
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [email, setEmail] = useState(process.env.NEXT_PUBLIC_TEST_EMAIL || "");

  const sendTestEmail = async () => {
    setSending(true);
    setResult(null);
    
    try {
      const response = await fetch(`/api/test/email${email ? `?email=${encodeURIComponent(email)}` : ''}`);
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            📧 Email System Test
          </h1>
          <p className="text-gray-600">
            Test your Resend email integration and verify email delivery.
          </p>
        </div>

        {/* Test Form */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Send Test Email</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty to use your configured test email
              </p>
            </div>
            
            <button
              onClick={sendTestEmail}
              disabled={sending}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? "Sending..." : "Send Test Email"}
            </button>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className={`rounded-lg shadow-sm border p-6 ${
            result.success 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <h3 className="font-semibold mb-3">
              {result.success ? "✅ Email Sent Successfully" : "❌ Email Failed"}
            </h3>
            
            {result.success ? (
              <div className="space-y-2 text-green-800">
                <p><strong>Message:</strong> {result.message}</p>
                <p><strong>Sent to:</strong> {result.sentTo}</p>
                <p><strong>Sent from:</strong> {result.sentFrom}</p>
                {result.emailId && <p><strong>Email ID:</strong> {result.emailId}</p>}
                
                {result.config && (
                  <div className="mt-4 p-3 bg-green-100 rounded">
                    <h4 className="font-medium mb-2">Configuration Status:</h4>
                    <ul className="text-sm space-y-1">
                      <li>✅ API Key: {result.config.hasApiKey ? 'Configured' : 'Missing'}</li>
                      <li>✅ Email From: {result.config.hasEmailFrom ? result.config.emailFrom : 'Missing'}</li>
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2 text-red-800">
                <p><strong>Error:</strong> {result.error}</p>
                
                {result.config && (
                  <div className="mt-4 p-3 bg-red-100 rounded">
                    <h4 className="font-medium mb-2">Configuration Issues:</h4>
                    <ul className="text-sm space-y-1">
                      <li>{result.config.hasApiKey ? '✅' : '❌'} API Key: {result.config.hasApiKey ? 'Configured' : 'Missing RESEND_API_KEY'}</li>
                      <li>{result.config.hasEmailFrom ? '✅' : '❌'} Email From: {result.config.hasEmailFrom ? result.config.emailFrom : 'Missing EMAIL_FROM'}</li>
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Help Section */}
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6 mt-6">
          <h3 className="font-semibold mb-3">📋 Email Test Checklist</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p>• <strong>Environment Variables:</strong> Check RESEND_API_KEY and EMAIL_FROM are set</p>
            <p>• <strong>Domain Verification:</strong> Verify your sending domain in Resend dashboard</p>
            <p>• <strong>Test Addresses:</strong> Try delivered@resend.dev for guaranteed delivery</p>
            <p>• <strong>Spam Folder:</strong> Check spam/junk folder if email not received</p>
            <p>• <strong>Rate Limits:</strong> Resend free tier allows 3,000 emails/month</p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-6 text-center">
          <a 
            href="/admin" 
            className="inline-block bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 mr-4"
          >
            ← Back to Admin
          </a>
          <a 
            href="https://resend.com/dashboard" 
            target="_blank"
            className="inline-block border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50"
          >
            Resend Dashboard ↗
          </a>
        </div>
      </div>
    </div>
  );
}
