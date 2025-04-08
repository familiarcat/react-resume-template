'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function NotFound() {
  // Log the error to help with debugging
  useEffect(() => {
    console.error('404 page not found');
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
      <p className="mb-8">Sorry, the page you are looking for does not exist.</p>
      <Link 
        href="/" 
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        Return Home
      </Link>
    </div>
  );
}
