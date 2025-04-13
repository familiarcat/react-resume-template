/**
 * Amplify Data Client
 * 
 * This file provides a data client for use with AWS Amplify Gen 2,
 * following best practices for Next.js integration.
 */

import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { configureAmplify } from './amplify-client';

// Ensure Amplify is configured
configureAmplify();

// Generate a strongly typed data client
export const dataClient = generateClient<Schema>();

// Helper function to handle errors
export async function handleDataOperation<T>(operation: () => Promise<T>): Promise<{ data: T | null; error: Error | null }> {
  try {
    const result = await operation();
    return { data: result, error: null };
  } catch (err) {
    console.error('Data operation failed:', err);
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
  }
}

// Typed data operations
export const DataOperations = {
  // Resume operations
  Resume: {
    list: async () => handleDataOperation(() => dataClient.models.Resume.list()),
    get: async (id: string) => handleDataOperation(() => dataClient.models.Resume.get(id)),
    create: async (input: Partial<Schema['models']['Resume']>) => 
      handleDataOperation(() => dataClient.models.Resume.create(input)),
    update: async (input: Partial<Schema['models']['Resume']> & { id: string }) => 
      handleDataOperation(() => dataClient.models.Resume.update(input)),
    delete: async (id: string) => 
      handleDataOperation(() => dataClient.models.Resume.delete(id)),
  },
  
  // Summary operations
  Summary: {
    list: async () => handleDataOperation(() => dataClient.models.Summary.list()),
    get: async (id: string) => handleDataOperation(() => dataClient.models.Summary.get(id)),
    create: async (input: Partial<Schema['models']['Summary']>) => 
      handleDataOperation(() => dataClient.models.Summary.create(input)),
    update: async (input: Partial<Schema['models']['Summary']> & { id: string }) => 
      handleDataOperation(() => dataClient.models.Summary.update(input)),
    delete: async (id: string) => 
      handleDataOperation(() => dataClient.models.Summary.delete(id)),
  },
  
  // Add other model operations as needed
};
