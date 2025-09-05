'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function NotFound() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [redirectCountdown, setRedirectCountdown] = useState(0);
  
  const isTokenExpired = searchParams.get('expired') === 'true';

  useEffect(() => {
    // Handle token expiration redirect
    if (isTokenExpired) {
      // Clear storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        sessionStorage.clear();
      }
      
      // Set up countdown
      setRedirectCountdown(5);
      const countdownInterval = setInterval(() => {
        setRedirectCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            router.push('/');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdownInterval);
    }
  }, [isTokenExpired, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Animated 404 display */}
        <div className="mb-8">
          <div className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-4">
            404
          </div>
          <h1 className="text-2xl font-semibold text-slate-200 mb-2">
            {isTokenExpired ? 'Session Expired' : 'Page Not Found'}
          </h1>
          <p className="text-slate-400 mb-6">
            {isTokenExpired
              ? 'Your session has expired. Please log in again.'
              : 'The page you are looking for does not exist.'}
          </p>
        </div>

        {/* Redirect countdown for expired sessions */}
        {isTokenExpired && redirectCountdown > 0 && (
          <div className="mb-6 p-3 bg-slate-800/50 rounded-lg">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-400 border-t-transparent"></div>
              <span className="text-slate-300 text-sm">
                Redirecting in {redirectCountdown} seconds...
              </span>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col space-y-3 mb-8">
          <Link
            href="/"
            className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}