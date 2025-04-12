import { getCompleteResume, getSkills, getPositions, createTodo } from '../../app/actions/resume-actions';
import * as ServerConduit from '../../app/lib/amplify-server-conduit';
import { revalidatePath } from 'next/cache';

// Mock the server conduit
jest.mock('../../app/lib/amplify-server-conduit', () => ({
  getCompleteResume: jest.fn(),
  getSkills: jest.fn(),
  getPositions: jest.fn(),
}));

// Mock next/cache
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

describe('Resume Actions', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('getCompleteResume', () => {
    it('should call the server conduit and return the result', async () => {
      // Mock the server conduit response
      const mockResume = {
        resume: { id: 'mock-id', title: 'Mock Resume' },
        summary: { id: 'mock-summary-id', persona: 'Mock Persona', goals: 'Mock Goals' },
      };
      (ServerConduit.getCompleteResume as jest.Mock).mockResolvedValue(mockResume);

      // Call the action
      const result = await getCompleteResume('mock-id');

      // Verify the server conduit was called
      expect(ServerConduit.getCompleteResume).toHaveBeenCalledWith('mock-id');

      // Verify the result
      expect(result).toEqual(mockResume);
    });

    it('should handle errors', async () => {
      // Mock the server conduit to throw an error
      (ServerConduit.getCompleteResume as jest.Mock).mockRejectedValue(new Error('Mock error'));

      // Call the action and expect it to throw
      await expect(getCompleteResume('mock-id')).rejects.toThrow('Failed to fetch resume data');

      // Verify the server conduit was called
      expect(ServerConduit.getCompleteResume).toHaveBeenCalledWith('mock-id');
    });
  });

  describe('getSkills', () => {
    it('should return skills for a resume', async () => {
      // Call the action
      const skills = await getSkills('mock-resume-id');

      // Verify the result
      expect(skills).toBeInstanceOf(Array);
      expect(skills.length).toBeGreaterThan(0);
      expect(skills[0]).toHaveProperty('id');
      expect(skills[0]).toHaveProperty('title');
      expect(skills[0]).toHaveProperty('link');
    });

    it('should handle errors', async () => {
      // Mock implementation to throw an error
      jest.spyOn(global, 'Promise').mockImplementationOnce(() => {
        throw new Error('Mock error');
      });

      // Call the action and expect it to throw
      await expect(getSkills('mock-resume-id')).rejects.toThrow('Failed to fetch skills');
    });
  });

  describe('getPositions', () => {
    it('should return positions for an experience', async () => {
      // Call the action
      const positions = await getPositions('mock-experience-id');

      // Verify the result
      expect(positions).toBeInstanceOf(Array);
      expect(positions.length).toBeGreaterThan(0);
      expect(positions[0]).toHaveProperty('id');
      expect(positions[0]).toHaveProperty('title');
      expect(positions[0]).toHaveProperty('company');
      expect(positions[0]).toHaveProperty('startDate');
      expect(positions[0]).toHaveProperty('endDate');
      expect(positions[0]).toHaveProperty('experienceId', 'mock-experience-id');
    });

    it('should handle errors', async () => {
      // Mock implementation to throw an error
      jest.spyOn(global, 'Promise').mockImplementationOnce(() => {
        throw new Error('Mock error');
      });

      // Call the action and expect it to throw
      await expect(getPositions('mock-experience-id')).rejects.toThrow('Failed to fetch positions');
    });
  });

  describe('createTodo', () => {
    it('should create a todo and revalidate the path', async () => {
      // Call the action
      const todo = await createTodo('Mock todo content');

      // Verify the result
      expect(todo).toHaveProperty('id');
      expect(todo).toHaveProperty('content', 'Mock todo content');
      expect(todo).toHaveProperty('createdAt');
      expect(todo).toHaveProperty('updatedAt');

      // Verify revalidatePath was called
      expect(revalidatePath).toHaveBeenCalledWith('/todos');
    });

    it('should handle errors', async () => {
      // Mock implementation to throw an error
      jest.spyOn(global, 'Promise').mockImplementationOnce(() => {
        throw new Error('Mock error');
      });

      // Call the action and expect it to throw
      await expect(createTodo('Mock todo content')).rejects.toThrow('Failed to create todo');
    });
  });
});
