/**
 * Data Utilities for AWS Amplify
 * 
 * This file provides utility functions for working with AWS Amplify Data.
 * It ensures proper integration between Next.js and AWS Amplify Gen 2.
 */

import { generateClient } from 'aws-amplify/api';
import type { Schema } from '@/amplify/data/resource';
import { configureAmplify } from './amplify-config';

// Ensure Amplify is configured
configureAmplify();

// Generate a client for data operations
export const dataClient = generateClient<Schema>();

/**
 * Fetch all resumes
 * @returns Promise with array of resumes
 */
export async function fetchResumes() {
  try {
    const { data: resumes, errors } = await dataClient.models.Resume.list();
    
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
    const { data: resume, errors } = await dataClient.models.Resume.get({ id });
    
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
export async function createResume(resumeData: Partial<Schema['models']['Resume']>) {
  try {
    const { data: resume, errors } = await dataClient.models.Resume.create(resumeData);
    
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
export async function updateResume(resumeData: Partial<Schema['models']['Resume']> & { id: string }) {
  try {
    const { data: resume, errors } = await dataClient.models.Resume.update(resumeData);
    
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
    const { data: resume, errors } = await dataClient.models.Resume.delete({ id });
    
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
