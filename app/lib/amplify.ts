import { amplifyConfig } from '../../config';

// Configure Amplify
export function configureAmplify() {
  if (typeof window !== 'undefined') {
    try {
      // Dynamically import Amplify only on the client side
      import('aws-amplify').then(({ Amplify }) => {
        // Configure Amplify with the config
        Amplify.configure(amplifyConfig);
        console.log('Amplify configured successfully');
      }).catch(error => {
        console.error('Error importing Amplify:', error);
      });
    } catch (error) {
      console.error('Error configuring Amplify:', error);
    }
  }
}
