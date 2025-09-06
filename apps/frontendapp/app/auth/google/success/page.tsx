'use client'

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function GoogleAuthSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refreshToken');
    const userId = searchParams.get('userId');

    if (token && userId) {
      // Store authentication data
      localStorage.setItem('token', token);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }

      // Decode user info from JWT token
      try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        const user = {
          id: userId,
          name: tokenPayload.email.split('@')[0], // Use email prefix as name
          email: tokenPayload.email,
          userType: 'patient' // Google users default to patient
        };

        localStorage.setItem('user', JSON.stringify(user));
        
        // Redirect to patient dashboard
        router.push('/dashboard');
      } catch (error) {
        console.error('Error processing Google auth:', error);
        router.push('/login?error=Authentication failed');
      }
    } else {
      router.push('/login?error=Authentication failed');
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Completing Google sign in...</p>
      </div>
    </div>
  );
}