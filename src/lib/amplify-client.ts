/**
 * Amplify Client Configuration
 * 
 * This file configures the Amplify client for use with Next.js,
 * following best practices for AWS Amplify Gen 2 integration.
 */

import { Amplify } from 'aws-amplify';
import amplifyconfig from '@/amplifyconfiguration.json';

// Configure Amplify
export function configureAmplify() {
  // Only configure Amplify once
  if (typeof window !== 'undefined' && !Amplify.getConfig()) {
    Amplify.configure(amplifyconfig);
  }
}

// Initialize Amplify on the client side
if (typeof window !== 'undefined') {
  configureAmplify();
}

// Export configured Amplify instance
export { Amplify };
