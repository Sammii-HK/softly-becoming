'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface UserData {
  email: string;
  subscriberId: string;
  tier: string;
  stripeId?: string;
}

export default function AccountPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      router.push('/login');
      return;
    }

    // Verify token and get user data
    fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setUser(data.user);
      } else {
        localStorage.removeItem('auth_token');
        router.push('/login');
      }
    })
    .catch(() => {
      localStorage.removeItem('auth_token');
      router.push('/login');
    })
    .finally(() => {
      setLoading(false);
    });
  }, [router]);

  const openStripePortal = async () => {
    if (!user?.stripeId) return;
    
    setPortalLoading(true);
    
    try {
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ customerId: user.stripeId })
      });
      
      const data = await response.json();
      
      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Failed to open portal:', error);
    } finally {
      setPortalLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    router.push('/');
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FAF9F7] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-purple-600 rounded-full animate-spin"></div>
      </main>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <main className="min-h-screen bg-[#FAF9F7]">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif mb-2">Your Account</h1>
            <p className="text-gray-600">Manage your Softly Becoming subscription and downloads</p>
          </div>
          <button 
            onClick={logout}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Logout
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Account Info */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h2 className="text-xl font-serif mb-4">Account Information</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-lg">{user.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Subscription</label>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    user.tier === 'PAID' 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {user.tier === 'PAID' ? '✨ Premium Newsletter' : '🌸 Free Newsletter'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Management */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h2 className="text-xl font-serif mb-4">Subscription Management</h2>
            
            {user.tier === 'PAID' && user.stripeId ? (
              <div className="space-y-4">
                <p className="text-gray-600 text-sm">
                  Manage your premium newsletter subscription, update payment methods, or view billing history.
                </p>
                <button
                  onClick={openStripePortal}
                  disabled={portalLoading}
                  className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                >
                  {portalLoading ? 'Opening...' : 'Manage Subscription'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-600 text-sm">
                  Upgrade to our premium newsletter for deeper weekly reflections and exclusive content.
                </p>
                <a
                  href="/inbox"
                  className="block w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors text-center"
                >
                  Upgrade to Premium
                </a>
              </div>
            )}
          </div>

          {/* Digital Products */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h2 className="text-xl font-serif mb-4">Digital Products</h2>
            <p className="text-gray-600 text-sm mb-4">
              Browse our beautiful quote collections for your social media and personal inspiration.
            </p>
            <a
              href="/shop"
              className="block w-full border border-[#3A3A3A] py-3 px-4 rounded-lg hover:bg-[#3A3A3A] hover:text-[#FAF9F7] transition-colors text-center"
            >
              Browse Collections
            </a>
          </div>

          {/* Support */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h2 className="text-xl font-serif mb-4">Need Help?</h2>
            <p className="text-gray-600 text-sm mb-4">
              Questions about your subscription or digital products? We're here to help.
            </p>
            <a
              href="mailto:hello@softrebuild.com"
              className="block w-full border border-gray-300 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
