'use client';

import { ReactNode, useEffect, useState } from 'react';
import { configureAmplify } from '@/lib/amplify-config';

interface AmplifyProviderProps {
  children: ReactNode;
}

/**
 * AmplifyProvider Component
 * 
 * This component configures AWS Amplify for the client-side application.
 * It ensures that Amplify is properly configured before rendering children.
 */
export default function AmplifyProvider({ children }: AmplifyProviderProps) {
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    // Configure Amplify on the client side
    const configured = configureAmplify();
    setIsConfigured(configured);
  }, []);

  // If running on the server, render children immediately
  if (typeof window === 'undefined') {
    return <>{children}</>;
  }

  // On the client, wait for Amplify to be configured
  if (!isConfigured) {
    // You could show a loading indicator here
    return <div>Loading AWS Amplify configuration...</div>;
  }

  return <>{children}</>;
}
