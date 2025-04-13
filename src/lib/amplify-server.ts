/**
 * Amplify Server-Side Client
 * 
 * This file provides a server-side client for use with AWS Amplify Gen 2,
 * following best practices for Next.js server components integration.
 */

import { createServerRunner } from '@aws-amplify/adapter-nextjs';
import { generateServerClientUsingReqRes } from '@aws-amplify/adapter-nextjs/api';
import config from '@/amplifyconfiguration.json';
import type { Schema } from '@/amplify/data/resource';

// Create a server runner for Next.js
export const { runWithAmplifyServerContext } = createServerRunner({
  config
});

// Generate a server-side data client
export async function getServerDataClient(request: Request, response: Response) {
  return generateServerClientUsingReqRes<Schema>({
    request,
    response,
    config
  });
}

// Server action to fetch data
export async function fetchData(action: (client: ReturnType<typeof getServerDataClient>) => Promise<any>) {
  try {
    return await runWithAmplifyServerContext({
      nextServerContext: { request: Request },
      operation: async (contextSpec) => {
        const client = await getServerDataClient(
          contextSpec.request,
          contextSpec.response
        );
        return action(client);
      }
    });
  } catch (error) {
    console.error('Server data operation failed:', error);
    throw error;
  }
}
