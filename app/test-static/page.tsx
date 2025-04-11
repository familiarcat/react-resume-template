'use client';

import React from 'react';
import Link from 'next/link';

export default function TestStaticPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Static Export Test Page</h1>
      <p className="mb-4">
        This page is part of a static export for AWS Amplify deployment.
      </p>
      <Link href="/" className="text-blue-500 hover:underline">
        Back to Home
      </Link>
    </div>
  );
}
