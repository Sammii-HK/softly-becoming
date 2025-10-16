export default function Home() {
  return (
    <main className="min-h-screen bg-[#FAF9F7] text-[#3A3A3A]">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className="space-y-8">
              <div>
                <h1 className="text-6xl font-serif mb-6 leading-tight">
                  Softly<br />
                  <span className="text-purple-600">Becoming</span>
                </h1>
                <p className="text-2xl opacity-80 mb-6">
                  Gentle reflections for women rebuilding with intention
                </p>
                <p className="text-lg opacity-70 leading-relaxed">
                  Daily inspiration on social media. Weekly letters for deeper reflection. 
                  Beautiful digital quote collections for your own journey.
                </p>
              </div>

              {/* Primary CTA */}
              <div className="space-y-4">
                <a 
                  href="/inbox" 
                  className="inline-block bg-[#3A3A3A] text-[#FAF9F7] px-8 py-4 rounded-lg text-lg font-medium hover:opacity-90 transition-opacity"
                >
                  Join the Daily Newsletter
                </a>
                <p className="text-sm opacity-60">
                  Free gentle notes each morning • Join women rebuilding with intention
                </p>
              </div>
            </div>

            {/* Right Column - Featured Quote */}
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 flex items-center justify-center shadow-lg">
                <div className="text-center">
                  <blockquote className="text-2xl font-serif italic text-[#3A3A3A] leading-relaxed">
                    "you are becoming<br />
                    the person you needed.<br />
                    <span className="text-purple-600">trust the slow becoming.</span>"
                  </blockquote>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif mb-4">Gentle Growth, Every Day</h2>
            <p className="text-xl opacity-70 max-w-2xl mx-auto">
              Supporting your journey with daily inspiration and beautiful resources
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Daily Notes */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-serif mb-3">Daily Gentle Notes</h3>
              <p className="opacity-70 mb-4">
                One thoughtful reflection each morning, delivered to your inbox with care.
              </p>
              <a href="/inbox" className="text-purple-600 font-medium hover:underline">
                Join free →
              </a>
            </div>

            {/* Social Media */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-serif mb-3">Social Inspiration</h3>
              <p className="opacity-70 mb-4">
                Follow along on Instagram, Pinterest, and X for daily gentle wisdom.
              </p>
              <a href="https://www.instagram.com/softly.becoming.studio/" className="text-blue-600 font-medium hover:underline">
                Follow along →
              </a>
            </div>

            {/* Digital Products */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-serif mb-3">Beautiful Quote Graphics</h3>
              <p className="opacity-70 mb-4">
                Ready-to-use quote collections for your social media, website, or personal inspiration.
              </p>
              <a href="/shop" className="text-green-600 font-medium hover:underline">
                Browse shop →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Signup Section */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-serif mb-6">Start Your Gentle Morning Ritual</h2>
          <p className="text-xl opacity-80 mb-8 max-w-2xl mx-auto">
            Join thousands of women who start their day with intention, kindness, and gentle wisdom.
          </p>
          
          <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md mx-auto">
            <div className="mb-6">
              <div className="text-3xl mb-2">🌸</div>
              <h3 className="text-xl font-serif mb-2">Free Daily Notes</h3>
              <p className="text-gray-600 text-sm">
                One gentle reflection each morning. No spam, just kindness.
              </p>
            </div>
            
            <a 
              href="/inbox"
              className="block w-full bg-[#3A3A3A] text-[#FAF9F7] py-4 px-6 rounded-lg text-lg font-medium hover:opacity-90 transition-opacity"
            >
              Join Free Newsletter
            </a>
            
            <p className="text-xs text-gray-500 mt-4">
              Unsubscribe anytime • We respect your inbox
            </p>
          </div>
        </div>
      </section>

      {/* Digital Products Showcase */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif mb-4">Beautiful Quote Collections</h2>
            <p className="text-xl opacity-70 max-w-2xl mx-auto">
              Professional quote graphics ready for your social media, website, or personal use
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {/* Featured Products Preview */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 text-center">
              <div className="text-2xl mb-3">💪</div>
              <h3 className="font-serif text-lg mb-2">Soft Strength</h3>
              <p className="text-sm opacity-70 mb-2">Finding power in gentleness</p>
              <div className="text-xs text-gray-500 mb-3">50 images • Both formats</div>
              <div className="space-y-1">
                <div className="text-2xl font-serif text-purple-600">$19</div>
                <div className="text-xs opacity-60">Personal • <span className="text-purple-600">$34 Commercial</span></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 text-center">
              <div className="text-2xl mb-3">🌱</div>
              <h3 className="font-serif text-lg mb-2">Rebuilding Journey</h3>
              <p className="text-sm opacity-70 mb-2">Starting over with intention</p>
              <div className="text-xs text-gray-500 mb-3">20 images • Square format</div>
              <div className="space-y-1">
                <div className="text-2xl font-serif text-blue-600">$16</div>
                <div className="text-xs opacity-60">Personal • <span className="text-blue-600">$29 Commercial</span></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 text-center">
              <div className="text-2xl mb-3">✨</div>
              <h3 className="font-serif text-lg mb-2">Self Trust</h3>
              <p className="text-sm opacity-70 mb-2">Trusting your inner wisdom</p>
              <div className="text-xs text-gray-500 mb-3">30 images • Portrait format</div>
              <div className="space-y-1">
                <div className="text-2xl font-serif text-green-600">$22</div>
                <div className="text-xs opacity-60">Personal • <span className="text-green-600">$39 Commercial</span></div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <a 
              href="/shop"
              className="inline-block bg-purple-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-purple-700 transition-colors"
            >
              Browse All Collections
            </a>
            <p className="text-sm opacity-60 mt-3">
              Instant download • Commercial use included • 20 beautiful color variations
            </p>
          </div>
        </div>
      </section>

      {/* Social Connection */}
      <section className="py-16 bg-[#FAF9F7]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-serif mb-8">Connect & Follow Along</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <a 
              href="https://www.instagram.com/softly.becoming.studio/" 
              target="_blank"
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="text-3xl mb-3">📸</div>
              <div className="font-medium mb-1">Instagram</div>
              <div className="text-sm text-gray-600">Daily gentle wisdom</div>
            </a>
            
            <a 
              href="https://uk.pinterest.com/softlybecomingstudio/" 
              target="_blank"
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="text-3xl mb-3">📌</div>
              <div className="font-medium mb-1">Pinterest</div>
              <div className="text-sm text-gray-600">Quote collections</div>
            </a>
            
            <a 
              href="https://x.com/softly_becoming" 
              target="_blank"
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="text-3xl mb-3">🐦</div>
              <div className="font-medium mb-1">X (Twitter)</div>
              <div className="text-sm text-gray-600">Gentle thoughts</div>
            </a>
            
            <a 
              href="https://bsky.app/profile/softlybecoming.bsky.social" 
              target="_blank"
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="text-3xl mb-3">🦋</div>
              <div className="font-medium mb-1">Bluesky</div>
              <div className="text-sm text-gray-600">Authentic connection</div>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-[#3A3A3A] text-[#FAF9F7]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <h3 className="text-2xl font-serif mb-4">Softly Becoming</h3>
              <p className="opacity-80 mb-4">
                Supporting women in gentle transformation through daily inspiration and beautiful resources.
        </p>
        <div className="flex gap-4">
                <a href="https://www.instagram.com/softly.becoming.studio/" target="_blank" className="opacity-60 hover:opacity-100 transition-opacity">Instagram</a>
                <a href="https://uk.pinterest.com/softlybecomingstudio/" target="_blank" className="opacity-60 hover:opacity-100 transition-opacity">Pinterest</a>
                <a href="https://x.com/softly_becoming" target="_blank" className="opacity-60 hover:opacity-100 transition-opacity">X</a>
                <a href="https://bsky.app/profile/softlybecoming.bsky.social" target="_blank" className="opacity-60 hover:opacity-100 transition-opacity">Bluesky</a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Resources</h4>
              <div className="space-y-2 text-sm">
                <a href="/inbox" className="block opacity-80 hover:opacity-100">Newsletter</a>
                <a href="/shop" className="block opacity-80 hover:opacity-100">Digital Products</a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Support</h4>
              <div className="space-y-2 text-sm">
                <a href="mailto:hello@softrebuild.com" className="block opacity-80 hover:opacity-100">Contact</a>
                <a href="/shop" className="block opacity-80 hover:opacity-100">Commercial Licenses</a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-600 mt-8 pt-8 text-center text-sm opacity-60">
            <p>&copy; 2025 Softly Becoming. All rights reserved.</p>
        </div>
      </div>
      </footer>
    </main>
  );
}