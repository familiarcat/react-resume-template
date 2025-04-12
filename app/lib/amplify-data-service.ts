/**
 * Amplify Data Service
 *
 * This server component acts as a conduit between client components and Amplify Gen 2.
 * It provides a centralized interface for data operations and implements caching.
 *
 * @todo Replace any types with proper types when Schema is fully defined
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';
import type { Schema } from '../../amplify/data/resource';
import config from '../../amplify_outputs.json';
import { cache } from 'react';

// Configure Amplify once
Amplify.configure(config);

// Generate the client once
const client = generateClient<Schema>();

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

// Cache storage
type CacheEntry<TData> = {
  data: TData;
  timestamp: number;
};

const dataCache: Record<string, CacheEntry<unknown>> = {};

/**
 * Check if cache entry is valid
 */
function isCacheValid(cacheKey: string): boolean {
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
        const result = await (client.models as any).Resume.get({ id });
        const { data, errors } = result;
        if (errors) throw new Error(errors.map((e: any) => e.message).join(', '));
        return data;
      } else {
        // Use any to bypass type checking
        const result = await (client.models as any).Resume.list();
        const { data, errors } = result;
        if (errors) throw new Error(errors.map((e: any) => e.message).join(', '));
        // Return the most recent resume
        return data.sort((a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];
      }
    } catch (error) {
      console.error('Error fetching resume:', error);
      return null;
    }
  });
});

export const getSummary = cache(async (id: string) => {
  const cacheKey = `summary_${id}`;

  return getCachedData(cacheKey, async () => {
    try {
      // Use any to bypass type checking
      const result = await (client.models as any).Summary.get({ id });
      const { data, errors } = result;
      if (errors) throw new Error(errors.map((e: any) => e.message).join(', '));
      return data;
    } catch (error) {
      console.error('Error fetching summary:', error);
      return null;
    }
  });
});

export const getContactInformation = cache(async (id: string) => {
  const cacheKey = `contact_${id}`;

  return getCachedData(cacheKey, async () => {
    try {
      // Use any to bypass type checking
      const result = await (client.models as any).ContactInformation.get({ id });
      const { data, errors } = result;
      if (errors) throw new Error(errors.map((e: any) => e.message).join(', '));
      return data;
    } catch (error) {
      console.error('Error fetching contact information:', error);
      return null;
    }
  });
});

export const getEducation = cache(async (id: string) => {
  const cacheKey = `education_${id}`;

  return getCachedData(cacheKey, async () => {
    try {
      // Use any to bypass type checking
      const result = await (client.models as any).Education.get({ id });
      const { data, errors } = result;
      if (errors) throw new Error(errors.map((e: any) => e.message).join(', '));
      return data;
    } catch (error) {
      console.error('Error fetching education:', error);
      return null;
    }
  });
});

export const getSchools = cache(async (educationId: string) => {
  const cacheKey = `schools_${educationId}`;

  return getCachedData(cacheKey, async () => {
    try {
      // Use any to bypass type checking
      const result = await (client.models as any).School.list({
        filter: { educationId: { eq: educationId } }
      });
      const { data, errors } = result;
      if (errors) throw new Error(errors.map((e: any) => e.message).join(', '));
      return data;
    } catch (error) {
      console.error('Error fetching schools:', error);
      return [];
    }
  });
});

export const getDegrees = cache(async (schoolId: string) => {
  const cacheKey = `degrees_${schoolId}`;

  return getCachedData(cacheKey, async () => {
    try {
      // Use any to bypass type checking
      const result = await (client.models as any).Degree.list({
        filter: { schoolId: { eq: schoolId } }
      });
      const { data, errors } = result;
      if (errors) throw new Error(errors.map((e: any) => e.message).join(', '));
      return data;
    } catch (error) {
      console.error('Error fetching degrees:', error);
      return [];
    }
  });
});

export const getExperience = cache(async (id: string) => {
  const cacheKey = `experience_${id}`;

  return getCachedData(cacheKey, async () => {
    try {
      // Use any to bypass type checking
      const result = await (client.models as any).Experience.get({ id });
      const { data, errors } = result;
      if (errors) throw new Error(errors.map((e: any) => e.message).join(', '));
      return data;
    } catch (error) {
      console.error('Error fetching experience:', error);
      return null;
    }
  });
});

export const getPositions = cache(async (experienceId: string) => {
  const cacheKey = `positions_${experienceId}`;

  return getCachedData(cacheKey, async () => {
    try {
      // Use any to bypass type checking
      const result = await (client.models as any).Position.list({
        filter: { experienceId: { eq: experienceId } }
      });
      const { data, errors } = result;
      if (errors) throw new Error(errors.map((e: any) => e.message).join(', '));
      return data;
    } catch (error) {
      console.error('Error fetching positions:', error);
      return [];
    }
  });
});

export const getSkills = cache(async (resumeId: string) => {
  const cacheKey = `skills_${resumeId}`;

  return getCachedData(cacheKey, async () => {
    try {
      // Use any to bypass type checking
      const result = await (client.models as any).Skill.list({
        filter: { resumeId: { eq: resumeId } }
      });
      const { data, errors } = result;
      if (errors) throw new Error(errors.map((e: any) => e.message).join(', '));
      return data;
    } catch (error) {
      console.error('Error fetching skills:', error);
      return [];
    }
  });
});

export const getReferences = cache(async (contactInformationId: string) => {
  const cacheKey = `references_${contactInformationId}`;

  return getCachedData(cacheKey, async () => {
    try {
      // Use any to bypass type checking
      const result = await (client.models as any).Reference.list({
        filter: { contactInformationId: { eq: contactInformationId } }
      });
      const { data, errors } = result;
      if (errors) throw new Error(errors.map((e: any) => e.message).join(', '));
      return data;
    } catch (error) {
      console.error('Error fetching references:', error);
      return [];
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
        console.error('Resume not found');
        return null;
      }

      // Get related data
      const [summary, contactInfo, education, experience] = await Promise.all([
        resume.summaryId ? getSummary(resume.summaryId) : null,
        resume.contactInformationId ? getContactInformation(resume.contactInformationId) : null,
        resume.educationId ? getEducation(resume.educationId) : null,
        resume.experienceId ? getExperience(resume.experienceId) : null
      ]);

      // Get schools and degrees
      let schools: any[] = [];
      let degrees: any[] = [];
      if (education) {
        schools = await getSchools(education.id);

        // Get degrees for each school
        const degreesPromises = schools.map(school => getDegrees(school.id));
        const degreesResults = await Promise.all(degreesPromises);
        degrees = degreesResults.flat();
      }

      // Get positions
      let positions: any[] = [];
      if (experience) {
        positions = await getPositions(experience.id);
      }

      // Get skills
      const skills = await getSkills(resume.id);

      // Get references
      let references: any[] = [];
      if (contactInfo) {
        references = await getReferences(contactInfo.id);
      }

      // Construct complete resume object
      return {
        resume,
        summary,
        contactInfo,
        education: education ? {
          ...education,
          schools: schools.map(school => ({
            ...school,
            degrees: degrees.filter(degree => degree.schoolId === school.id)
          }))
        } : null,
        experience: experience ? {
          ...experience,
          positions
        } : null,
        skills,
        references
      };
    } catch (error) {
      console.error('Error fetching complete resume:', error);
      return null;
    }
  });
});

// Mutation functions
export async function createTodo(content: string) {
  try {
    // Use any to bypass type checking
    const result = await (client.models as any).Todo.create({
      content
    });

    const { data, errors } = result;

    // Clear relevant caches
    clearCache('todos');

    if (errors) throw new Error(errors.map((e: any) => e.message).join(', '));
    return data;
  } catch (error) {
    console.error('Error creating todo:', error);
    throw error;
  }
}

// Export the client for direct access if needed
export { client };
