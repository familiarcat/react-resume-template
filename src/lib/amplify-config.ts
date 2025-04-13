/**
 * AWS Amplify Configuration
 * 
 * This file configures AWS Amplify for use with Next.js and AWS Amplify Gen 2.
 * It ensures proper integration between the two platforms.
 */

import { Amplify } from 'aws-amplify';
import amplifyconfig from '@/amplify_outputs.json';

// Configure AWS Amplify
export function configureAmplify() {
  try {
    // Configure Amplify with the generated outputs
    Amplify.configure(amplifyconfig, {
      ssr: typeof window === 'undefined', // Enable SSR mode when running on the server
    });
    
    console.log('AWS Amplify configured successfully');
    return true;
  } catch (error) {
    console.error('Error configuring AWS Amplify:', error);
    return false;
  }
}

// Export the Amplify configuration
export { amplifyconfig };
