'use client';

import React from 'react';

export default function NoAmplifyFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h2 className="text-2xl font-bold mb-4">Resume Template</h2>
      <p className="mb-4">
        This application requires AWS Amplify to function properly.
        There was an issue loading the Amplify configuration.
      </p>
      <p className="mb-4">
        Please check your environment variables and configuration.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        Reload Page
      </button>
    </div>
  );
}
