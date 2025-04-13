import amplifyconfig from '../../amplify_outputs.json';

// Configure Amplify
export function configureAmplify() {
  if (typeof window !== 'undefined') {
    try {
      // Dynamically import Amplify only on the client side
      import('aws-amplify').then(({ Amplify }) => {
        // Configure Amplify with the generated outputs
        Amplify.configure(amplifyconfig, {
          ssr: typeof window === 'undefined' // Enable SSR mode when running on the server
        });
        console.log('AWS Amplify configured successfully');
      }).catch(error => {
        console.error('Error importing Amplify:', error);
      });
    } catch (error) {
      console.error('Error configuring Amplify:', error);
    }
  }
  return true;
}
