export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#FAF9F7] text-[#3A3A3A]">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-serif mb-8">Terms of Service</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-xl text-gray-600 mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-serif mb-4">Digital Product Licenses</h2>
            
            <div className="bg-white p-6 rounded-lg mb-6">
              <h3 className="text-lg font-semibold mb-3">Personal License</h3>
              <p className="mb-2"><strong>Permitted:</strong></p>
              <ul>
                <li>Personal social media use</li>
                <li>Personal website and blog</li>
                <li>Personal inspiration and motivation</li>
              </ul>
              <p className="mt-2"><strong>Not Permitted:</strong> Commercial use, client work, resale</p>
            </div>

            <div className="bg-white p-6 rounded-lg mb-6">
              <h3 className="text-lg font-semibold mb-3">Commercial License</h3>
              <p className="mb-2"><strong>Permitted:</strong></p>
              <ul>
                <li>Everything in Personal License</li>
                <li>Business social media and marketing</li>
                <li>Client work and projects</li>
                <li>Website monetization</li>
                <li>Limited print products (up to 5,000 units)</li>
              </ul>
              <p className="mt-2"><strong>Not Permitted:</strong> Resale as standalone digital products</p>
            </div>

            <div className="bg-white p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Extended License</h3>
              <p className="mb-2"><strong>Permitted:</strong></p>
              <ul>
                <li>Everything in Commercial License</li>
                <li>Unlimited print products</li>
                <li>Merchandise and physical products</li>
                <li>Apps and software integration</li>
                <li>Digital courses and educational materials</li>
              </ul>
              <p className="mt-2"><strong>Not Permitted:</strong> Resale as competing quote pack products</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif mb-4">Newsletter Terms</h2>
            <ul>
              <li>Free newsletter delivered daily via email</li>
              <li>Optional paid tier with weekly deeper content</li>
              <li>Unsubscribe anytime with one click</li>
              <li>No spam policy - only gentle, thoughtful content</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif mb-4">Refund Policy</h2>
            <p>
              30-day money-back guarantee on all digital products. 
              Contact us at <a href="mailto:hello@softrebuild.com" className="text-purple-400 hover:underline">hello@softrebuild.com</a> for refunds.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif mb-4">Contact</h2>
            <p>
              Questions about these terms: <a href="mailto:hello@softrebuild.com" className="text-purple-400 hover:underline">hello@softrebuild.com</a>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
