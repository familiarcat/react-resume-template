/**
 * Amplify Data Service
 *
 * This server component acts as a conduit between client components and Amplify Gen 2.
 * It provides a centralized interface for data operations and implements caching.
 */

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
  // Check cache first
  if (isCacheValid(cacheKey)) {
    console.log(`Cache hit for ${cacheKey}`);
    return dataCache[cacheKey].data as T;
  }

  // Fetch fresh data
  console.log(`Cache miss for ${cacheKey}, fetching fresh data`);
  const data = await fetchFn();

  // Update cache
  dataCache[cacheKey] = {
    data,
    timestamp: Date.now(),
  };

  return data;
}

/**
 * Clear cache for a specific key or all cache if no key provided
 */
function clearCache(cacheKey?: string): void {
  if (cacheKey) {
    delete dataCache[cacheKey];
  } else {
    Object.keys(dataCache).forEach(key => delete dataCache[key]);
  }
}

// Create cached versions of data fetching functions
export const getResume = cache(async (id?: string) => {
  const cacheKey = `resume_${id || 'latest'}`;

  return getCachedData(cacheKey, async () => {
    if (id) {
      const { data, errors } = await client.models.Resume.get({ id });
      if (errors) throw new Error(errors.map(e => e.message).join(', '));
      return data;
    } else {
      const { data, errors } = await client.models.Resume.list();
      if (errors) throw new Error(errors.map(e => e.message).join(', '));
      // Return the most recent resume
      return data.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];
    }
  });
});

export const getSummary = cache(async (id: string) => {
  const cacheKey = `summary_${id}`;

  return getCachedData(cacheKey, async () => {
    const { data, errors } = await client.models.Summary.get({ id });
    if (errors) throw new Error(errors.map(e => e.message).join(', '));
    return data;
  });
});

export const getContactInformation = cache(async (id: string) => {
  const cacheKey = `contact_${id}`;

  return getCachedData(cacheKey, async () => {
    const { data, errors } = await client.models.ContactInformation.get({ id });
    if (errors) throw new Error(errors.map(e => e.message).join(', '));
    return data;
  });
});

export const getEducation = cache(async (id: string) => {
  const cacheKey = `education_${id}`;

  return getCachedData(cacheKey, async () => {
    const { data, errors } = await client.models.Education.get({ id });
    if (errors) throw new Error(errors.map(e => e.message).join(', '));
    return data;
  });
});

export const getSchools = cache(async (educationId: string) => {
  const cacheKey = `schools_${educationId}`;

  return getCachedData(cacheKey, async () => {
    const { data, errors } = await client.models.School.list({
      filter: { educationId: { eq: educationId } }
    });
    if (errors) throw new Error(errors.map(e => e.message).join(', '));
    return data;
  });
});

export const getDegrees = cache(async (schoolId: string) => {
  const cacheKey = `degrees_${schoolId}`;

  return getCachedData(cacheKey, async () => {
    const { data, errors } = await client.models.Degree.list({
      filter: { schoolId: { eq: schoolId } }
    });
    if (errors) throw new Error(errors.map(e => e.message).join(', '));
    return data;
  });
});

export const getExperience = cache(async (id: string) => {
  const cacheKey = `experience_${id}`;

  return getCachedData(cacheKey, async () => {
    const { data, errors } = await client.models.Experience.get({ id });
    if (errors) throw new Error(errors.map(e => e.message).join(', '));
    return data;
  });
});

export const getPositions = cache(async (experienceId: string) => {
  const cacheKey = `positions_${experienceId}`;

  return getCachedData(cacheKey, async () => {
    const { data, errors } = await client.models.Position.list({
      filter: { experienceId: { eq: experienceId } }
    });
    if (errors) throw new Error(errors.map(e => e.message).join(', '));
    return data;
  });
});

export const getSkills = cache(async (resumeId: string) => {
  const cacheKey = `skills_${resumeId}`;

  return getCachedData(cacheKey, async () => {
    const { data, errors } = await client.models.Skill.list({
      filter: { resumeId: { eq: resumeId } }
    });
    if (errors) throw new Error(errors.map(e => e.message).join(', '));
    return data;
  });
});

export const getReferences = cache(async (contactInformationId: string) => {
  const cacheKey = `references_${contactInformationId}`;

  return getCachedData(cacheKey, async () => {
    const { data, errors } = await client.models.Reference.list({
      filter: { contactInformationId: { eq: contactInformationId } }
    });
    if (errors) throw new Error(errors.map(e => e.message).join(', '));
    return data;
  });
});

// Function to get complete resume data with all related entities
export const getCompleteResume = cache(async (resumeId?: string) => {
  const cacheKey = `complete_resume_${resumeId || 'latest'}`;

  return getCachedData(cacheKey, async () => {
    // Get the resume
    const resume = await getResume(resumeId);
    if (!resume) throw new Error('Resume not found');

    // Get related data
    const [summary, contactInfo, education, experience] = await Promise.all([
      resume.summaryId ? getSummary(resume.summaryId) : null,
      resume.contactInformationId ? getContactInformation(resume.contactInformationId) : null,
      resume.educationId ? getEducation(resume.educationId) : null,
      resume.experienceId ? getExperience(resume.experienceId) : null
    ]);

    // Get schools and degrees
    let schools = [];
    let degrees = [];
    if (education) {
      schools = await getSchools(education.id);

      // Get degrees for each school
      const degreesPromises = schools.map(school => getDegrees(school.id));
      const degreesResults = await Promise.all(degreesPromises);
      degrees = degreesResults.flat();
    }

    // Get positions
    let positions = [];
    if (experience) {
      positions = await getPositions(experience.id);
    }

    // Get skills
    const skills = await getSkills(resume.id);

    // Get references
    let references = [];
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
  });
});

// Mutation functions
export async function createTodo(content: string) {
  const { data, errors } = await client.models.Todo.create({
    content
  });

  // Clear relevant caches
  clearCache('todos');

  if (errors) throw new Error(errors.map(e => e.message).join(', '));
  return data;
}

// Export the client for direct access if needed
export { client };
