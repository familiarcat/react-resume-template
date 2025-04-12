/**
 * Amplify Configuration
 * 
 * This file provides a centralized configuration for AWS Amplify.
 * It loads configuration from environment variables or defaults.
 */

export const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID,
      userPoolClientId: process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID,
      signUpVerificationMethod: 'code'
    }
  },
  API: {
    GraphQL: {
      endpoint: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT,
      region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-2',
      defaultAuthMode: 'apiKey',
      apiKey: process.env.NEXT_PUBLIC_API_KEY
    }
  },
  Storage: {
    S3: {
      bucket: process.env.NEXT_PUBLIC_S3_BUCKET,
      region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-2'
    }
  }
};

/**
 * Get Amplify configuration
 * 
 * This function returns the Amplify configuration with fallbacks for local development.
 */
export function getAmplifyConfig() {
  // Check if we're in a browser environment
  const isBrowser = typeof window !== 'undefined';
  
  // In browser, use the public environment variables
  if (isBrowser) {
    return amplifyConfig;
  }
  
  // In server, try to load from environment variables or amplify_outputs.json
  try {
    // First try to load from environment variables
    if (process.env.AMPLIFY_CONFIG) {
      try {
        return JSON.parse(process.env.AMPLIFY_CONFIG);
      } catch (parseError) {
        console.error('Failed to parse AMPLIFY_CONFIG environment variable:', parseError);
      }
    }
    
    // Then try to load from file
    try {
      const config = require('../../amplify_outputs.json');
      return config;
    } catch (fileError) {
      console.warn('Failed to load amplify_outputs.json');
    }
    
    // Fall back to the default configuration
    return amplifyConfig;
  } catch (error) {
    console.error('Error loading Amplify configuration:', error);
    
    // Return a minimal configuration for fallback
    return {
      API: {
        GraphQL: {
          endpoint: 'http://localhost:20002/graphql',
          region: 'us-east-2',
          defaultAuthMode: 'apiKey',
          apiKey: 'mock-api-key'
        }
      }
    };
  }
}
