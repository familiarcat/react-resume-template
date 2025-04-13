/**
 * Data Utilities for AWS Amplify
 *
 * This file provides utility functions for working with AWS Amplify Data.
 * It ensures proper integration between Next.js and AWS Amplify Gen 2.
 */

import { configureAmplify } from './amplify';

// Ensure Amplify is configured
configureAmplify();

/**
 * Generate a client for data operations
 * This function should be called on the client side
 */
export async function getDataClient() {
  if (typeof window === 'undefined') {
    throw new Error('getDataClient should only be called on the client side');
  }

  // Dynamically import the generateClient function
  const { generateClient } = await import('aws-amplify/api');

  // Generate a client for data operations
  // Use 'any' type temporarily to avoid import issues
  return generateClient<any>();
}

/**
 * Fetch all resumes
 * @returns Promise with array of resumes
 */
export async function fetchResumes() {
  try {
    const client = await getDataClient();
    const { data: resumes, errors } = await client.models.Resume.list();

    if (errors) {
      console.error('Errors fetching resumes:', errors);
      return [];
    }

    return resumes;
  } catch (error) {
    console.error('Error fetching resumes:', error);
    return [];
  }
}

/**
 * Fetch a resume by ID
 * @param id Resume ID
 * @returns Promise with resume data
 */
export async function fetchResumeById(id: string) {
  try {
    const client = await getDataClient();
    const { data: resume, errors } = await client.models.Resume.get({ id });

    if (errors) {
      console.error(`Errors fetching resume ${id}:`, errors);
      return null;
    }

    return resume;
  } catch (error) {
    console.error(`Error fetching resume ${id}:`, error);
    return null;
  }
}
