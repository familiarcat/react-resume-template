'use client';

import { useEffect, useState } from 'react';
import { configureAmplify } from '../lib/amplify';

export default function AmplifyProvider({ children }: { children: React.ReactNode }) {
  const [error, setError] = useState<Error | null>(null);
  const [hasChunkError, setHasChunkError] = useState(false);

  // Handle chunk loading errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.error?.message?.includes('Loading chunk') ||
          event.error?.message?.includes('ChunkLoadError') ||
          event.message?.includes('Loading chunk') ||
          event.message?.includes('ChunkLoadError')) {
        setHasChunkError(true);
        console.error('Chunk loading error detected:', event);
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // Configure Amplify
  useEffect(() => {
    async function initAmplify() {
      try {
        // Configure Amplify on the client side
        await configureAmplify();
      } catch (err) {
        console.error('Error configuring Amplify:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    }

    initAmplify();
  }, []);

  // Show error UI for chunk loading errors
  if (hasChunkError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Something went wrong loading the page</h2>
        <p className="mb-4">This could be due to a network issue or a timeout.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Reload Page
        </button>
      </div>
    );
  }

  if (error) {
    // Log Amplify configuration errors but don't block rendering
    console.warn('Amplify configuration error:', error.message);
  }

  return <>{children}</>;
}
