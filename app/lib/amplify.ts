import { Amplify } from 'aws-amplify';
import { amplifyConfig } from '../../config';

// Configure Amplify
export function configureAmplify() {
  if (typeof window !== 'undefined') {
    Amplify.configure(amplifyConfig);
  }
}
