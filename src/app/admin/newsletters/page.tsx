'use client';

import { useState, useEffect } from 'react';

interface NewsletterPreview {
  quote: {
    lines: string[];
    theme: string;
    tone: string;
    structure: string;
    tags: string[];
  };
  subject: string;
  html: string;
  seed: number;
}

export default function NewslettersPage() {
  const [previews, setPreviews] = useState<NewsletterPreview[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState<NewsletterPreview | null>(null);

  const generatePreviews = async (count = 7) => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/newsletter-previews', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'your-admin-token'}`
        },
        body: JSON.stringify({ count })
      });
      
      const data = await response.json();
      if (data.success) {
        setPreviews(data.previews);
      }
    } catch (error) {
      console.error('Failed to generate previews:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendTestNewsletter = async (preview: NewsletterPreview) => {
    const email = prompt('Send test to email:');
    if (!email) return;

    try {
      await fetch('/api/admin/send-test-newsletter', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'your-admin-token'}`
        },
        body: JSON.stringify({ 
          email, 
          html: preview.html, 
          subject: preview.subject 
        })
      });
      alert('Test newsletter sent!');
    } catch (error) {
      alert('Failed to send test newsletter');
    }
  };

  useEffect(() => {
    generatePreviews();
  }, []);

  return (
    <main className="max-w-7xl mx-auto px-6 py-16">
      <div className="mb-8">
        <h1 className="text-3xl font-serif mb-4">Newsletter Previews</h1>
        <p className="text-gray-600 mb-6">
          Preview upcoming automated newsletters generated from your quote system.
        </p>
        <button
          onClick={() => generatePreviews()}
          disabled={loading}
          className="bg-purple-400 text-white px-6 py-3 rounded-lg hover:bg-purple-500 disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate New Previews'}
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Preview List */}
        <div className="space-y-4">
          <h2 className="text-xl font-serif">Upcoming Newsletters</h2>
          {previews.map((preview, index) => (
            <div 
              key={index}
              className={`bg-white p-4 rounded-lg border cursor-pointer transition-colors ${
                selectedPreview === preview ? 'border-purple-400 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedPreview(preview)}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-sm">Day {index + 1}</h3>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {preview.quote.theme.replace('_', ' ')} • {preview.quote.tone}
                </span>
              </div>
              
              <p className="text-sm font-serif italic text-gray-700 mb-2">
                "{preview.quote.lines[0]}..."
              </p>
              
              <p className="text-xs text-gray-500 mb-3">
                Subject: {preview.subject}
              </p>
              
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    sendTestNewsletter(preview);
                  }}
                  className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200"
                >
                  Send Test
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPreview(preview);
                  }}
                  className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded hover:bg-purple-200"
                >
                  Preview
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Preview Display */}
        <div className="lg:sticky lg:top-8">
          <h2 className="text-xl font-serif mb-4">Newsletter Preview</h2>
          {selectedPreview ? (
            <div className="bg-white rounded-lg border overflow-hidden">
              <div className="p-4 border-b bg-gray-50">
                <div className="text-sm">
                  <strong>Subject:</strong> {selectedPreview.subject}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Theme: {selectedPreview.quote.theme.replace('_', ' ')} • 
                  Tone: {selectedPreview.quote.tone} • 
                  Structure: {selectedPreview.quote.structure}
                </div>
              </div>
              <div 
                className="p-4 overflow-auto max-h-96"
                dangerouslySetInnerHTML={{ __html: selectedPreview.html }}
              />
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
              <p className="text-gray-500">Select a newsletter to preview</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-12 bg-blue-50 rounded-lg p-6">
        <h3 className="font-semibold mb-3">🤖 Automated Newsletter System</h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p>• <strong>Daily Generation:</strong> Runs at 8 AM UTC via cron job</p>
          <p>• <strong>Quality Control:</strong> Only sends quotes that pass content guards</p>
          <p>• <strong>Theme Variety:</strong> Automatic rotation through different themes</p>
          <p>• <strong>Beautiful Design:</strong> Branded template with your lavender colors</p>
          <p>• <strong>Growth Optimized:</strong> Includes shop CTA with UTM tracking</p>
        </div>
      </div>
    </main>
  );
}
