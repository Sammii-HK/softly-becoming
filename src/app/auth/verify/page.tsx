'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      return;
    }

    // Verify the token
    fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setUserData(data.user);
        setStatus('success');
        
        // Store auth token in localStorage for subsequent requests
        localStorage.setItem('auth_token', data.authToken);
        
        // Redirect to account page after 2 seconds
        setTimeout(() => {
          router.push('/account');
        }, 2000);
      } else {
        setStatus('error');
      }
    })
    .catch(() => {
      setStatus('error');
    });
  }, [searchParams, router]);

  if (status === 'verifying') {
    return (
      <main className="min-h-screen bg-[#FAF9F7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <h1 className="text-2xl font-serif mb-2">Verifying your access...</h1>
          <p className="text-gray-600">Please wait while we confirm your identity</p>
        </div>
      </main>
    );
  }

  if (status === 'error') {
    return (
      <main className="min-h-screen bg-[#FAF9F7] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-serif mb-4">Access Link Invalid</h1>
          <p className="text-gray-600 mb-6">
            This link has expired or is invalid. Please request a new one.
          </p>
          <a 
            href="/login" 
            className="bg-[#3A3A3A] text-[#FAF9F7] px-6 py-3 rounded hover:opacity-90"
          >
            Request New Link
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF9F7] flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-serif mb-4">Welcome back!</h1>
        <p className="text-gray-600 mb-6">
          Successfully logged in as <strong>{userData?.email}</strong>
        </p>
        <p className="text-sm text-gray-500">
          Redirecting to your account page...
        </p>
      </div>
    </main>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#FAF9F7] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-purple-600 rounded-full animate-spin"></div>
      </main>
    }>
      <VerifyContent />
    </Suspense>
  );
}
