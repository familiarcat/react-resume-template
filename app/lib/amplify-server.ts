/**
 * Server-side Amplify configuration
 */

import { generateClient } from '@aws-amplify/api';
import { type Schema } from '../../amplify/data/resource';

// Create a type for the Amplify Data API
export type DataAPI = ReturnType<typeof generateClient<Schema>>;

// Export a function to create a client
export function createDataClient(): DataAPI {
  return generateClient<Schema>();
}
