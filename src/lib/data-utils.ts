/**
 * Data Utilities for AWS Amplify
 *
 * This file provides utility functions for working with AWS Amplify Data.
 * It ensures proper integration between Next.js and AWS Amplify Gen 2.
 */

import { configureAmplify } from './amplify-config';

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return generateClient<any>();
}

/**
 * Fetch all resumes
 * @returns Promise with array of resumes
 */
export async function fetchResumes() {
  try {
    const client = await getDataClient();
    const { data: resumes, errors } = await client.models.Resume.list({});

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
    const { data: resume, errors } = await client.models.Resume.get({ id: id });

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

/**
 * Create a new resume
 * @param resumeData Resume data
 * @returns Promise with created resume
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createResume(resumeData: any) {
  try {
    const client = await getDataClient();
    const { data: resume, errors } = await client.models.Resume.create(resumeData);

    if (errors) {
      console.error('Errors creating resume:', errors);
      return null;
    }

    return resume;
  } catch (error) {
    console.error('Error creating resume:', error);
    return null;
  }
}

/**
 * Update an existing resume
 * @param resumeData Resume data with ID
 * @returns Promise with updated resume
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateResume(resumeData: any & { id: string }) {
  try {
    const client = await getDataClient();
    const { data: resume, errors } = await client.models.Resume.update(resumeData);

    if (errors) {
      console.error(`Errors updating resume ${resumeData.id}:`, errors);
      return null;
    }

    return resume;
  } catch (error) {
    console.error(`Error updating resume ${resumeData.id}:`, error);
    return null;
  }
}

/**
 * Delete a resume by ID
 * @param id Resume ID
 * @returns Promise with deleted resume
 */
export async function deleteResume(id: string) {
  try {
    const client = await getDataClient();
    const { data: resume, errors } = await client.models.Resume.delete({ id });

    if (errors) {
      console.error(`Errors deleting resume ${id}:`, errors);
      return null;
    }

    return resume;
  } catch (error) {
    console.error(`Error deleting resume ${id}:`, error);
    return null;
  }
}
