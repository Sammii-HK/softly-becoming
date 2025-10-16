'use client';

import { useState, Suspense } from 'react';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (data.success) {
        setSent(true);
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (error) {
      setError('Failed to send login link');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <main className="min-h-screen bg-[#FAF9F7] flex items-center justify-center">
        <div className="max-w-md mx-auto px-6 text-center">
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <div className="text-4xl mb-4">📧</div>
            <h1 className="text-2xl font-serif mb-4">Check Your Email</h1>
            <p className="text-gray-600 mb-6">
              We've sent a secure login link to <strong>{email}</strong>
            </p>
            <p className="text-sm text-gray-500 mb-6">
              The link expires in 15 minutes for security.
            </p>
            <button 
              onClick={() => setSent(false)}
              className="text-purple-600 hover:underline text-sm"
            >
              Need to use a different email?
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF9F7] flex items-center justify-center">
      <div className="max-w-md mx-auto px-6">
        <div className="bg-white rounded-lg p-8 shadow-sm">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-serif mb-2">Account Access</h1>
            <p className="text-gray-600">
              Enter your email to access your Softly Becoming account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="your@email.com"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-[#3A3A3A] text-[#FAF9F7] py-3 px-4 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loading ? 'Sending...' : 'Send Magic Link'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 mb-4">
              Don't have an account yet?
            </p>
            <a 
              href="/inbox" 
              className="text-purple-600 hover:underline text-sm font-medium"
            >
              Join our newsletter →
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function LoginPageWrapper() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#FAF9F7] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-purple-400 rounded-full animate-spin"></div>
      </main>
    }>
      <LoginPage />
    </Suspense>
  );
}

