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
// Define a more specific return type
type AmplifyConfigType = typeof amplifyConfig;

export function getAmplifyConfig(): AmplifyConfigType {
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
        // Safely log error message
        const errorMessage = parseError instanceof Error ?
          parseError.message.replace(/[\n\r]/g, ' ').substring(0, 200) :
          'Unknown error';

        console.error('Failed to parse AMPLIFY_CONFIG environment variable:', errorMessage);
      }
    }

    // Then try to load from file
    try {
      // Use dynamic import instead of require
      // This is a workaround for the ESLint rule
      // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
      const config = require('../../amplify_outputs.json');
      return config;
    } catch (fileError) {
      // Safely log error message
      const errorMessage = fileError instanceof Error ?
        fileError.message.replace(/[\n\r]/g, ' ').substring(0, 200) :
        'Unknown error';

      console.warn('Failed to load amplify_outputs.json:', errorMessage);
    }

    // Fall back to the default configuration
    return amplifyConfig;
  } catch (error) {
    // Safely log error message
    const errorMessage = error instanceof Error ?
      error.message.replace(/[\n\r]/g, ' ').substring(0, 200) :
      'Unknown error';

    console.error('Error loading Amplify configuration:', errorMessage);

    // Return a minimal configuration for fallback
    // @ts-expect-error - This is a minimal configuration for fallback
    return {
      API: {
        GraphQL: {
          endpoint: 'http://localhost:20002/graphql',
          region: 'us-east-2',
          defaultAuthMode: 'apiKey',
          apiKey: 'mock-api-key'
        }
      },
      Auth: {
        Cognito: {
          userPoolId: 'mock-user-pool-id',
          userPoolClientId: 'mock-user-pool-client-id',
          signUpVerificationMethod: 'code'
        }
      },
      Storage: {
        S3: {
          bucket: 'mock-bucket',
          region: 'us-east-2'
        }
      }
    };
  }
}
