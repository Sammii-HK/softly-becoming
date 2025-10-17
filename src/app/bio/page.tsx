'use client';

import { useState } from 'react';

export default function BioPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('source', 'bio_link');

      const response = await fetch('/api/subscribe', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        const data = await response.json();
        setError(data.error || 'Something went wrong');
      }
    } catch (error) {
      setError('Failed to join newsletter');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#FAF9F7] flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="text-4xl mb-4">🌸</div>
            <h1 className="text-2xl font-serif mb-4">Welcome to the community!</h1>
            <p className="text-gray-600 mb-6">
              Check your email for a gentle hello from me.
            </p>
            <a 
              href="/shop"
              className="block w-full bg-purple-400 text-white py-3 px-4 rounded-lg hover:bg-purple-500 transition-colors"
            >
              Explore Quote Collections
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF9F7] flex items-center justify-center px-6">
      <div className="max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif mb-4">
            Softly <span className="text-purple-400">Becoming</span>
          </h1>
          <p className="text-xl text-gray-700 mb-2">
            Gentle reflections for women rebuilding with intention
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <div className="mb-6">
            <h2 className="text-xl font-serif mb-3">Daily Gentle Notes</h2>
            <p className="text-gray-600 leading-relaxed">
              One thoughtful reflection each morning. Join women around the world 
              who choose to rebuild softly.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
            />

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
              {loading ? 'Joining...' : 'Join Free Newsletter'}
            </button>
          </form>

          <p className="text-xs text-gray-500 mt-4 text-center">
            Free forever • Unsubscribe anytime • No spam
          </p>
        </div>

        <div className="mt-8 text-center">
          <a 
            href="/shop" 
            className="text-purple-400 hover:underline text-sm"
          >
            Browse beautiful quote collections →
          </a>
        </div>

        {/* UTM tracking for analytics */}
        <div className="mt-6 text-center text-xs text-gray-400">
          <p>Coming from social media? Thank you for following along! 💜</p>
        </div>
      </div>
    </main>
  );
}
