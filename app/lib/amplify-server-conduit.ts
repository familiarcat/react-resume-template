/**
 * Amplify Server Conduit
 *
 * This module provides a server-side conduit for interacting with Amplify Gen 2.
 * It centralizes all Amplify operations and provides caching and error handling.
 */

import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';
import type { Schema } from '../../amplify/data/resource';
import { cache } from 'react';

// Define the configuration type
interface AmplifyConfig {
  api?: {
    GraphQL?: {
      endpoint?: string;
      region?: string;
      defaultAuthMode?: string;
      apiKey?: string;
    };
  };
  auth?: {
    Cognito?: {
      userPoolId?: string;
      userPoolClientId?: string;
      identityPoolId?: string;
      region?: string;
    };
  };
}

// Configuration
let config: AmplifyConfig;

// Try to import the Amplify outputs
try {
  // First try to load from environment variables
  if (process.env.AMPLIFY_CONFIG) {
    try {
      config = JSON.parse(process.env.AMPLIFY_CONFIG);
      console.log('Loaded Amplify configuration from environment variable');
    } catch (parseError) {
      // Safely log error message
      const errorMessage = parseError instanceof Error ?
        parseError.message.replace(/[\n\r]/g, ' ').substring(0, 200) :
        'Unknown error';

      console.error('Failed to parse AMPLIFY_CONFIG environment variable:', errorMessage);
      throw parseError;
    }
  } else {
    // Try to load from file
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
    config = require('../../amplify_outputs.json');
    console.log('Loaded Amplify configuration from amplify_outputs.json');
  }
} catch (error) {
  // Safely log error message
  const errorMessage = error instanceof Error ?
    error.message.replace(/[\n\r]/g, ' ').substring(0, 200) :
    'Unknown error';

  console.warn('Failed to load Amplify configuration, using mock configuration. Error:', errorMessage);

  // Create a mock configuration for static builds
  config = {
    api: {
      GraphQL: {
        endpoint: process.env.GRAPHQL_ENDPOINT || 'http://localhost:20002/graphql',
        region: process.env.AWS_REGION || 'us-east-2',
        defaultAuthMode: 'apiKey',
        apiKey: process.env.API_KEY || 'mock-api-key'
      }
    },
    auth: {
      Cognito: {
        userPoolId: process.env.USER_POOL_ID || 'mock-user-pool-id',
        userPoolClientId: process.env.USER_POOL_CLIENT_ID || 'mock-user-pool-client-id',
        identityPoolId: process.env.IDENTITY_POOL_ID || 'mock-identity-pool-id',
        region: process.env.AWS_REGION || 'us-east-2'
      }
    }
  };
}

// Configure Amplify
try {
  Amplify.configure(config);
  console.log('Amplify configured successfully on the server');
} catch (error) {
  // Safely log error message
  const errorMessage = error instanceof Error ?
    error.message.replace(/[\n\r]/g, ' ').substring(0, 200) :
    'Unknown error';

  console.error('Error configuring Amplify:', errorMessage);
}

// Define types for the Amplify client
interface ResumeData {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

interface ApiResponse<T> {
  data: T | null;
  errors: Error[] | null;
}

// Define the client type
interface AmplifyClient {
  models: {
    // Define a common interface for all models
    [key: string]: {
      get: (params: Record<string, unknown>) => Promise<ApiResponse<unknown>>,
      list: (params?: Record<string, unknown>) => Promise<ApiResponse<unknown[]>>,
      create: (params: Record<string, unknown>) => Promise<ApiResponse<unknown>>,
      update: (params: Record<string, unknown>) => Promise<ApiResponse<unknown>>,
      delete: (params: Record<string, unknown>) => Promise<ApiResponse<unknown>>
    }
  }
}

// Generate the client
let client: AmplifyClient;

try {
  client = generateClient<Schema>();
  console.log('Amplify client generated successfully');
} catch (error) {
  // Safely log error message
  const errorMessage = error instanceof Error ?
    error.message.replace(/[\n\r]/g, ' ').substring(0, 200) :
    'Unknown error';

  console.error('Error generating Amplify client:', errorMessage);

  // Create a mock client for static builds
  client = {
    models: {
      // Mock implementations for all models
      Resume: {
        get: async () => ({ data: null, errors: null }),
        list: async () => ({ data: [], errors: null }),
        create: async () => ({ data: null, errors: null }),
        update: async () => ({ data: null, errors: null }),
        delete: async () => ({ data: null, errors: null })
      }
    }
  };
}

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

// Cache storage
interface CacheEntry<TData> {
  data: TData;
  timestamp: number;
}

const dataCache: Record<string, CacheEntry<unknown>> = {};

/**
 * Check if cache entry is valid
 * @param cacheKey - The key to check in the cache
 * @returns boolean indicating if the cache entry is valid
 */
function isCacheValid(cacheKey: string): boolean {
  // Validate input to prevent injection
  if (typeof cacheKey !== 'string' || cacheKey.length > 1000) {
    return false;
  }

  const entry = dataCache[cacheKey];
  if (!entry) return false;

  const now = Date.now();
  return now - entry.timestamp < CACHE_DURATION;
}

/**
 * Get cached data or fetch from Amplify
 */
async function getCachedData<T>(
  cacheKey: string,
  fetchFn: () => Promise<T>
): Promise<T> {
  // Sanitize and truncate cache key for logging to prevent log injection
  // Only use alphanumeric characters, dashes, and underscores
  const sanitizedKey = cacheKey.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50);

  // Check cache first
  if (isCacheValid(cacheKey)) {
    console.log('Cache hit for key:', sanitizedKey);
    return dataCache[cacheKey].data as T;
  }

  // Fetch fresh data
  console.log('Cache miss for key:', sanitizedKey, 'fetching fresh data');

  try {
    const data = await fetchFn();

    // Update cache
    dataCache[cacheKey] = {
      data,
      timestamp: Date.now(),
    };

    return data;
  } catch (error) {
    // Safely log error message
    const errorMessage = error instanceof Error ?
      error.message.replace(/[\n\r]/g, ' ').substring(0, 200) :
      'Unknown error';

    console.error('Error fetching data for key:', sanitizedKey, errorMessage);
    throw error;
  }
}

/**
 * Clear cache for a specific key or all cache if no key provided
 * @param cacheKey - Optional key to clear from cache
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function clearCache(cacheKey?: string): void {
  if (cacheKey && cacheKey in dataCache) {
    // Use delete only if the key exists
    delete dataCache[cacheKey];
  } else if (!cacheKey) {
    // For clearing all cache, create a new empty object instead of deleting keys
    // This avoids potential issues with deleting array elements
    Object.keys(dataCache).forEach(key => {
      delete dataCache[key];
    });
  }
}

// Create cached versions of data fetching functions
export const getResume = cache(async (id?: string) => {
  const cacheKey = `resume_${id || 'latest'}`;

  return getCachedData(cacheKey, async () => {
    try {
      if (id) {
        // Use any to bypass type checking
        const result = await client.models.Resume.get({ id });
        return result.data;
      } else {
        // Use any to bypass type checking
        const result = await client.models.Resume.list();
        const data = result.data;

        // Return the most recent resume
        return data && data.length > 0
          ? data.sort((a, b) => {
              // Cast to any to bypass type checking
              const aDate = new Date((a as any).createdAt).getTime();
              const bDate = new Date((b as any).createdAt).getTime();
              return bDate - aDate;
            })[0]
          : null;
      }
    } catch (error) {
      console.error('Error fetching resume:', error);
      return null;
    }
  });
});

// Function to get complete resume data with all related entities
export const getCompleteResume = cache(async (resumeId?: string) => {
  const cacheKey = `complete_resume_${resumeId || 'latest'}`;

  return getCachedData(cacheKey, async () => {
    try {
      // Get the resume
      const resume = await getResume(resumeId);
      if (!resume) {
        console.log('No resume found, returning mock data');

        // Return mock data for static builds
        return {
          resume: {
            id: 'mock-resume-id',
            title: 'Full Stack Developer Resume',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          summary: {
            id: 'mock-summary-id',
            goals: 'To drive innovation by blending cutting-edge technology with creative design.',
            persona: 'Experienced full-stack developer with a passion for creating elegant solutions.',
          },
          contactInfo: {
            id: 'mock-contact-id',
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '(555) 123-4567',
          },
          education: {
            id: 'mock-education-id',
            summary: 'Bachelor\'s and Master\'s degrees in Computer Science.',
            schools: [
              {
                id: 'mock-school-1',
                name: 'University of Technology',
                degrees: [
                  {
                    id: 'mock-degree-1',
                    major: 'Computer Science',
                    startYear: '2010',
                    endYear: '2014',
                  }
                ]
              }
            ]
          },
          experience: {
            id: 'mock-experience-id',
            positions: [
              {
                id: 'mock-position-1',
                title: 'Senior Developer',
                company: 'Tech Solutions Inc.',
                startDate: '2014-01',
                endDate: '2016-06',
              }
            ]
          },
          skills: [
            {
              id: 'mock-skill-1',
              title: 'JavaScript',
              link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
            },
            {
              id: 'mock-skill-2',
              title: 'TypeScript',
              link: 'https://www.typescriptlang.org/',
            }
          ],
          references: []
        };
      }

      // Get related data from the client
      // This is where we would fetch all related entities
      // For now, we'll return a simplified structure

      return {
        resume,
        // Add other related data here
      };
    } catch (error) {
      console.error('Error fetching complete resume:', error);

      // Return null on error
      return null;
    }
  });
});

// Export the client for direct access if needed
export { client };
