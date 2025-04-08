'use client';

import { useEffect } from 'react';
import { configureAmplify } from '../lib/amplify';

export default function AmplifyProvider({ children }: { children: React.ReactNode }) {
  // Configure Amplify on the client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        configureAmplify();
      } catch (error) {
        console.error('Error configuring Amplify:', error);
      }
    }
  }, []);

  return <>{children}</>;
}
