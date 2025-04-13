'use client';

/**
 * Amplify Client Configuration
 *
 * This file configures the Amplify client for use with Next.js,
 * following best practices for AWS Amplify Gen 2 integration.
 */

import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import config from '@/amplifyconfiguration.json';
import type { Schema } from '@/amplify/data/resource';

// Configure Amplify on the client side
Amplify.configure(config, { ssr: true });

// Generate a strongly typed data client
export const client = generateClient<Schema>();

// Export the client for use in components
export default client;
