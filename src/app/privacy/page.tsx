export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#FAF9F7] text-[#3A3A3A]">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-serif mb-8">Privacy Policy</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-xl text-gray-600 mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-serif mb-4">Information We Collect</h2>
            <p>When you subscribe to our newsletter or purchase digital products, we collect:</p>
            <ul>
              <li>Email address (required for delivery)</li>
              <li>Name (optional, for personalization)</li>
              <li>Payment information (processed securely by Stripe)</li>
              <li>Usage data (email opens, clicks for improvement)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif mb-4">How We Use Your Information</h2>
            <ul>
              <li>Deliver your daily newsletter and purchased products</li>
              <li>Improve our content and user experience</li>
              <li>Process payments and manage subscriptions</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif mb-4">Data Sharing</h2>
            <p>We only share your data with:</p>
            <ul>
              <li><strong>Stripe</strong> (payment processing)</li>
              <li><strong>Resend</strong> (email delivery)</li>
              <li><strong>Vercel</strong> (hosting and analytics)</li>
            </ul>
            <p>We never sell your personal information to third parties.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif mb-4">Your Rights</h2>
            <ul>
              <li>Unsubscribe from emails at any time</li>
              <li>Request a copy of your data</li>
              <li>Request deletion of your data</li>
              <li>Update your preferences</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif mb-4">Contact</h2>
            <p>
              For privacy questions: <a href="mailto:hello@softrebuild.com" className="text-purple-400 hover:underline">hello@softrebuild.com</a>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
