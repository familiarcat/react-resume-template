/**
 * Resume Actions
 *
 * Server actions for interacting with resume data.
 * These functions can be called directly from client components.
 */

'use server';

import { revalidatePath } from 'next/cache';

// Import the server conduit
import * as ServerConduit from '../lib/amplify-server-conduit';

// Log that we're using the server conduit
console.log('Using Amplify server conduit for data operations');

/**
 * Get the complete resume with all related data
 */
export async function getCompleteResume(resumeId?: string) {
  try {
    return await ServerConduit.getCompleteResume(resumeId);
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
    // For now, return mock skills since we haven't implemented getSkills in the server conduit
    return [
      {
        id: 'skill-1',
        title: 'JavaScript',
        link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript'
      },
      {
        id: 'skill-2',
        title: 'TypeScript',
        link: 'https://www.typescriptlang.org/'
      },
      {
        id: 'skill-3',
        title: 'React',
        link: 'https://reactjs.org/'
      },
      {
        id: 'skill-4',
        title: 'Next.js',
        link: 'https://nextjs.org/'
      },
      {
        id: 'skill-5',
        title: 'AWS Amplify',
        link: 'https://aws.amazon.com/amplify/'
      }
    ];
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
    // For now, return mock positions since we haven't implemented getPositions in the server conduit
    return [
      {
        id: 'position-1',
        title: 'Senior Developer',
        company: 'Tech Solutions Inc.',
        startDate: '2014-01',
        endDate: '2016-06',
        experienceId
      },
      {
        id: 'position-2',
        title: 'Lead Engineer',
        company: 'Innovative Systems',
        startDate: '2016-07',
        endDate: '2018-12',
        experienceId
      },
      {
        id: 'position-3',
        title: 'Software Architect',
        company: 'Enterprise Solutions',
        startDate: '2019-01',
        endDate: '2021-06',
        experienceId
      }
    ];
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
    // Mock implementation since we haven't implemented createTodo in the server conduit
    const result = {
      id: `todo-${Date.now()}`,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Revalidate the todos page to reflect the new todo
    revalidatePath('/todos');
    return result;
  } catch (error) {
    console.error('Error creating todo:', error);
    throw new Error('Failed to create todo');
  }
}
