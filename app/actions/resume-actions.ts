/**
 * Resume Actions
 *
 * Server actions for interacting with resume data.
 * These functions can be called directly from client components.
 */

'use server';

import { revalidatePath } from 'next/cache';
// Import the mock data service for static export
import * as DataService from '../lib/mock-data-service';
console.log('Using mock data service for static export');

/**
 * Get the complete resume with all related data
 */
export async function getCompleteResume(resumeId?: string) {
  try {
    return await DataService.getCompleteResume(resumeId);
  } catch (error) {
    console.error('Error fetching complete resume:', error);
    throw new Error('Failed to fetch resume data');
  }
}

/**
 * Get all skills
 */
export async function getSkills(resumeId: string) {
  try {
    return await DataService.getSkills(resumeId);
  } catch (error) {
    console.error('Error fetching skills:', error);
    throw new Error('Failed to fetch skills');
  }
}

/**
 * Get all positions
 */
export async function getPositions(experienceId: string) {
  try {
    return await DataService.getPositions(experienceId);
  } catch (error) {
    console.error('Error fetching positions:', error);
    throw new Error('Failed to fetch positions');
  }
}

/**
 * Create a new todo item
 */
export async function createTodo(content: string) {
  try {
    const result = await DataService.createTodo(content);
    // Revalidate the todos page to reflect the new todo
    revalidatePath('/todos');
    return result;
  } catch (error) {
    console.error('Error creating todo:', error);
    throw new Error('Failed to create todo');
  }
}
