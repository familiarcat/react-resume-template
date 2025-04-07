'use client';

import { useEffect, useState } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [isChunkError, setIsChunkError] = useState(false);

  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Unhandled error:', error);

    // Check if it's a chunk loading error
    if (error.message?.includes('Loading chunk') || error.message?.includes('ChunkLoadError')) {
      setIsChunkError(true);
    }
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <h2 className="text-2xl font-bold mb-4">
        {isChunkError ? 'Error Loading Page' : 'Something went wrong!'}
      </h2>
      <p className="mb-4">
        {isChunkError
          ? 'This could be due to a network issue or a timeout.'
          : error.message || 'An unexpected error occurred'}
      </p>
      <div className="flex gap-4">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          onClick={() => reset()}
        >
          Try again
        </button>
        {isChunkError && (
          <button
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        )}
      </div>
    </div>
  );
}