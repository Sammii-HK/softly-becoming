'use client';

import CachedQuoteImage from './components/CachedQuoteImage';

export default function Home() {
  // Featured quotes - only 3 to limit server usage
  const featuredQuotes = [
    "you are becoming\nthe person you needed.\ntrust the slow becoming.",
    "sometimes i think i should be further along,\nbut then i remember i am becoming.",
    "you are learning to trust yourself.\nyou don't need anyone's permission."
  ];

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
                  <span className="text-purple-400">Becoming</span>
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

            {/* Right Column - Cached Quote Image */}
            <div className="relative">
              <CachedQuoteImage quotes={featuredQuotes} />
              <p className="text-center text-sm text-gray-500 mt-3">
                Live quote showcase
              </p>
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
              <a href="/inbox" className="text-purple-400 font-medium hover:underline">
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
              <a href="/shop" className="text-purple-400 font-medium hover:underline">
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
          
          <div className="bg-white rounded-2xl p-8 shadow-lg max-w-lg mx-auto">
            <div className="mb-6 text-center">
              <h3 className="text-2xl font-serif mb-3">Start Your Gentle Morning Ritual</h3>
              <p className="text-gray-600 leading-relaxed">
                One thoughtful reflection delivered to your inbox each morning. 
                Join women around the world who choose to rebuild with intention.
              </p>
            </div>
            
            {/* Value proposition */}
            <div className="mb-6 space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                <span>Daily gentle wisdom in your inbox</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                <span>Thoughtfully curated, never overwhelming</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                <span>Unsubscribe anytime with one click</span>
              </div>
            </div>
            
            <a 
              href="/inbox"
              className="block w-full bg-[#3A3A3A] text-[#FAF9F7] py-4 px-6 rounded-lg text-lg font-medium hover:opacity-90 transition-opacity text-center"
            >
              Join Free Newsletter
            </a>
            
            <p className="text-xs text-gray-500 mt-4 text-center">
              Free forever • No spam • Respectful unsubscribe
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

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Featured Collections Preview */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-8 text-center">
              <h3 className="font-serif text-xl mb-3">Soft Strength</h3>
              <p className="text-gray-600 mb-4">Finding power in gentleness</p>
              <div className="text-sm text-gray-500">50 beautiful quote graphics</div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8 text-center">
              <h3 className="font-serif text-xl mb-3">Rebuilding Journey</h3>
              <p className="text-gray-600 mb-4">Starting over with intention</p>
              <div className="text-sm text-gray-500">20 beautiful quote graphics</div>
            </div>

            <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-8 text-center">
              <h3 className="font-serif text-xl mb-3">Self Trust</h3>
              <p className="text-gray-600 mb-4">Trusting your inner wisdom</p>
              <div className="text-sm text-gray-500">30 beautiful quote graphics</div>
            </div>
          </div>

          <div className="text-center">
            <a 
              href="/shop"
              className="inline-block bg-purple-400 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-purple-500 transition-colors"
            >
              Explore Quote Collections
            </a>
            <p className="text-sm opacity-60 mt-3">
              Instant download • Personal & commercial licenses • 30+ beautiful color variations
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
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </div>
              <div className="font-medium mb-1">Instagram</div>
              <div className="text-sm text-gray-600">Daily gentle wisdom</div>
            </a>
            
            <a 
              href="https://uk.pinterest.com/softlybecomingstudio/" 
              target="_blank"
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24c6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001 12.017.001z"/>
                </svg>
              </div>
              <div className="font-medium mb-1">Pinterest</div>
              <div className="text-sm text-gray-600">Quote collections</div>
            </a>
            
            <a 
              href="https://x.com/softly_becoming" 
              target="_blank"
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </div>
              <div className="font-medium mb-1">X (Twitter)</div>
              <div className="text-sm text-gray-600">Gentle thoughts</div>
            </a>
            
            <a 
              href="https://bsky.app/profile/softlybecoming.bsky.social" 
              target="_blank"
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                  <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-2.67.297-5.568-.628-6.383-3.364C.378 9.419 0 4.458 0 3.768c0-.688.139-1.86.902-2.203C1.561 1.266 2.566.944 4.202 2.805c1.752 1.942 4.711 5.881 5.798 7.995z"/>
                </svg>
              </div>
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
                <a href="https://www.instagram.com/softly.becoming.studio/" target="_blank" className="w-8 h-8 bg-gray-600 hover:bg-gray-500 rounded-full flex items-center justify-center transition-colors" aria-label="Instagram">
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a href="https://uk.pinterest.com/softlybecomingstudio/" target="_blank" className="w-8 h-8 bg-gray-600 hover:bg-gray-500 rounded-full flex items-center justify-center transition-colors" aria-label="Pinterest">
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24c6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001 12.017.001z"/>
                  </svg>
                </a>
                <a href="https://x.com/softly_becoming" target="_blank" className="w-8 h-8 bg-gray-600 hover:bg-gray-500 rounded-full flex items-center justify-center transition-colors" aria-label="X (Twitter)">
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a href="https://bsky.app/profile/softlybecoming.bsky.social" target="_blank" className="w-8 h-8 bg-gray-600 hover:bg-gray-500 rounded-full flex items-center justify-center transition-colors" aria-label="Bluesky">
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                    <path d="M12 2.5c-1.5 3-5.5 7.5-8 9.5 2.5-2 6.5-6.5 8-9.5zm0 0c1.5 3 5.5 7.5 8 9.5-2.5-2-6.5-6.5-8-9.5zm-8 9.5c0 2 1 4 3 5 1 .5 2 .5 3 0-1 .5-2 .5-3 0-2-1-3-3-3-5zm16 0c0 2-1 4-3 5-1 .5-2 .5-3 0 1 .5 2 .5 3 0 2-1 3-3 3-5zm-8 5c-1.5 3-5.5 7.5-8 9.5 2.5-2 6.5-6.5 8-9.5zm0 0c1.5 3 5.5 7.5 8 9.5-2.5-2-6.5-6.5-8-9.5z"/>
                  </svg>
                </a>
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