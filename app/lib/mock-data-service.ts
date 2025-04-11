/**
 * Mock Data Service
 *
 * This service provides mock data for static export builds.
 * It simulates the Amplify Gen 2 data service without requiring actual API calls.
 */

import { cache } from 'react';

// Mock resume data
const mockResume = {
  id: 'mock-resume-id',
  title: 'Full Stack Developer Resume',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Mock summary data
const mockSummary = {
  id: 'mock-summary-id',
  goals: 'To drive innovation by blending cutting-edge technology with creative design.',
  persona: 'Experienced full-stack developer with a passion for creating elegant solutions.',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Mock contact information
const mockContactInfo = {
  id: 'mock-contact-id',
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '(555) 123-4567',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Mock education
const mockEducation = {
  id: 'mock-education-id',
  summary: 'Bachelor\'s and Master\'s degrees in Computer Science.',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Mock schools
const mockSchools = [
  {
    id: 'mock-school-1',
    name: 'University of Technology',
    educationId: 'mock-education-id',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mock-school-2',
    name: 'State College',
    educationId: 'mock-education-id',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Mock degrees
const mockDegrees = [
  {
    id: 'mock-degree-1',
    major: 'Computer Science',
    startYear: '2010',
    endYear: '2014',
    schoolId: 'mock-school-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mock-degree-2',
    major: 'Software Engineering',
    startYear: '2014',
    endYear: '2016',
    schoolId: 'mock-school-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mock-degree-3',
    major: 'Artificial Intelligence',
    startYear: '2016',
    endYear: '2018',
    schoolId: 'mock-school-2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Mock experience
const mockExperience = {
  id: 'mock-experience-id',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Mock positions
const mockPositions = [
  {
    id: 'mock-position-1',
    title: 'Senior Developer',
    company: 'Tech Solutions Inc.',
    startDate: '2014-01',
    endDate: '2016-06',
    experienceId: 'mock-experience-id',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mock-position-2',
    title: 'Lead Engineer',
    company: 'Innovative Systems',
    startDate: '2016-07',
    endDate: '2018-12',
    experienceId: 'mock-experience-id',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mock-position-3',
    title: 'Software Architect',
    company: 'Enterprise Solutions',
    startDate: '2019-01',
    endDate: '2021-06',
    experienceId: 'mock-experience-id',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mock-position-4',
    title: 'CTO',
    company: 'Startup Ventures',
    startDate: '2021-07',
    endDate: 'Present',
    experienceId: 'mock-experience-id',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Mock skills
const mockSkills = [
  {
    id: 'mock-skill-1',
    title: 'JavaScript',
    link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
    resumeId: 'mock-resume-id',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mock-skill-2',
    title: 'TypeScript',
    link: 'https://www.typescriptlang.org/',
    resumeId: 'mock-resume-id',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mock-skill-3',
    title: 'React',
    link: 'https://reactjs.org/',
    resumeId: 'mock-resume-id',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mock-skill-4',
    title: 'Node.js',
    link: 'https://nodejs.org/',
    resumeId: 'mock-resume-id',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mock-skill-5',
    title: 'AWS',
    link: 'https://aws.amazon.com/',
    resumeId: 'mock-resume-id',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Mock references
const mockReferences = [
  {
    id: 'mock-reference-1',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '(555) 234-5678',
    contactInformationId: 'mock-contact-id',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mock-reference-2',
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    phone: '(555) 345-6789',
    contactInformationId: 'mock-contact-id',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mock-reference-3',
    name: 'Alice Williams',
    email: 'alice.williams@example.com',
    phone: '(555) 456-7890',
    contactInformationId: 'mock-contact-id',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Create cached versions of data fetching functions
export const getResume = cache(async (_id?: string) => {
  console.log('Using mock data service for getResume');
  return mockResume;
});

export const getSummary = cache(async (_id: string) => {
  console.log('Using mock data service for getSummary');
  return mockSummary;
});

export const getContactInformation = cache(async (_id: string) => {
  console.log('Using mock data service for getContactInformation');
  return mockContactInfo;
});

export const getEducation = cache(async (_id: string) => {
  console.log('Using mock data service for getEducation');
  return mockEducation;
});

export const getSchools = cache(async (_educationId: string) => {
  console.log('Using mock data service for getSchools');
  return mockSchools;
});

export const getDegrees = cache(async (schoolId: string) => {
  console.log('Using mock data service for getDegrees');
  return mockDegrees.filter(degree => degree.schoolId === schoolId);
});

export const getExperience = cache(async (_id: string) => {
  console.log('Using mock data service for getExperience');
  return mockExperience;
});

export const getPositions = cache(async (_experienceId: string) => {
  console.log('Using mock data service for getPositions');
  return mockPositions;
});

export const getSkills = cache(async (_resumeId: string) => {
  console.log('Using mock data service for getSkills');
  return mockSkills;
});

export const getReferences = cache(async (_contactInformationId: string) => {
  console.log('Using mock data service for getReferences');
  return mockReferences;
});

// Function to get complete resume data with all related entities
export const getCompleteResume = cache(async (_resumeId?: string) => {
  console.log('Using mock data service for getCompleteResume');

  // Construct complete resume object
  return {
    resume: mockResume,
    summary: mockSummary,
    contactInfo: mockContactInfo,
    education: {
      ...mockEducation,
      schools: mockSchools.map(school => ({
        ...school,
        degrees: mockDegrees.filter(degree => degree.schoolId === school.id)
      }))
    },
    experience: {
      ...mockExperience,
      positions: mockPositions
    },
    skills: mockSkills,
    references: mockReferences
  };
});

// Mutation functions
export async function createTodo(content: string) {
  console.log('Using mock data service for createTodo');
  return {
    id: `mock-todo-${Date.now()}`,
    content,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
