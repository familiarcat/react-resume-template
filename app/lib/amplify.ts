import { amplifyConfig } from '../../config';

// Configure Amplify
export async function configureAmplify() {
  if (typeof window !== 'undefined') {
    try {
      // Check if all required config values are present
      const requiredConfigKeys = [
        'aws_project_region',
        'aws_appsync_graphqlEndpoint',
        'aws_appsync_region',
        'aws_appsync_authenticationType'
      ];

      const missingKeys = requiredConfigKeys.filter(key => !amplifyConfig[key as keyof typeof amplifyConfig]);

      if (missingKeys.length > 0) {
        console.warn(`Amplify configuration missing required keys: ${missingKeys.join(', ')}`);
        console.warn('Amplify may not function correctly. Check your environment variables.');
      }

      // Dynamically import Amplify only on the client side
      const { Amplify } = await import('aws-amplify');
      Amplify.configure(amplifyConfig);
      return true;
    } catch (error) {
      console.error('Error configuring Amplify:', error);
      // Don't throw the error, just log it to prevent app from crashing
      return false;
    }
  }
  return false;
}
