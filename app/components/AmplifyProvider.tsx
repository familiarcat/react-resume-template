'use client';

import { useEffect } from 'react';
import { configureAmplify } from '../lib/amplify';

export default function AmplifyProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Configure Amplify on the client side
    configureAmplify();
  }, []);

  return <>{children}</>;
}
