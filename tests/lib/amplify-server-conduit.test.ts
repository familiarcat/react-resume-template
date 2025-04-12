import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';
import * as ServerConduit from '../../app/lib/amplify-server-conduit';

// Mock the imports
jest.mock('aws-amplify', () => ({
  Amplify: {
    configure: jest.fn(),
  },
}));

jest.mock('aws-amplify/api', () => ({
  generateClient: jest.fn(() => ({
    models: {
      Resume: {
        get: jest.fn(() => Promise.resolve({ 
          data: { 
            id: 'mock-resume-id',
            title: 'Mock Resume',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }, 
          errors: null 
        })),
        list: jest.fn(() => Promise.resolve({ 
          data: [
            { 
              id: 'mock-resume-id',
              title: 'Mock Resume',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          ], 
          errors: null 
        })),
      },
    },
  })),
}));

describe('Amplify Server Conduit', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should configure Amplify', () => {
    // The module should configure Amplify when imported
    expect(Amplify.configure).toHaveBeenCalled();
  });

  it('should generate a client', () => {
    // The module should generate a client when imported
    expect(generateClient).toHaveBeenCalled();
  });

  describe('getResume', () => {
    it('should fetch a resume by ID', async () => {
      const resume = await ServerConduit.getResume('mock-resume-id');
      
      expect(resume).toEqual({
        id: 'mock-resume-id',
        title: 'Mock Resume',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it('should fetch the latest resume when no ID is provided', async () => {
      const resume = await ServerConduit.getResume();
      
      expect(resume).toEqual({
        id: 'mock-resume-id',
        title: 'Mock Resume',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });
  });

  describe('getCompleteResume', () => {
    it('should fetch a complete resume with all related data', async () => {
      const completeResume = await ServerConduit.getCompleteResume('mock-resume-id');
      
      // The complete resume should include the resume and related data
      expect(completeResume).toHaveProperty('resume');
      expect(completeResume.resume).toEqual({
        id: 'mock-resume-id',
        title: 'Mock Resume',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it('should return mock data when no resume is found', async () => {
      // Mock the getResume function to return null
      jest.spyOn(ServerConduit, 'getResume').mockResolvedValueOnce(null);
      
      const completeResume = await ServerConduit.getCompleteResume('non-existent-id');
      
      // Should return mock data
      expect(completeResume).toHaveProperty('resume');
      expect(completeResume.resume).toHaveProperty('id', 'mock-resume-id');
      expect(completeResume).toHaveProperty('summary');
      expect(completeResume).toHaveProperty('contactInfo');
      expect(completeResume).toHaveProperty('education');
      expect(completeResume).toHaveProperty('experience');
      expect(completeResume).toHaveProperty('skills');
      expect(completeResume).toHaveProperty('references');
    });
  });
});
