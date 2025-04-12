import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ResumeContent from '../../app/components/ResumeContent';
import * as resumeActions from '../../app/actions/resume-actions';

// Mock the resume actions
jest.mock('../../app/actions/resume-actions', () => ({
  getCompleteResume: jest.fn(),
}));

describe('ResumeContent', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should show loading state initially', () => {
    // Mock the getCompleteResume function to return a promise that never resolves
    (resumeActions.getCompleteResume as jest.Mock).mockImplementation(() => new Promise(() => {}));

    // Render the component
    render(<ResumeContent />);

    // Check that the loading state is shown
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should render resume data when loaded', async () => {
    // Mock the getCompleteResume function to return mock data
    const mockResumeData = {
      resume: {
        id: 'mock-resume-id',
        title: 'Mock Resume Title',
      },
      contactInfo: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '(555) 123-4567',
      },
      summary: {
        persona: 'Mock Persona',
        goals: 'Mock Goals',
      },
      experience: {
        positions: [
          {
            id: 'mock-position-id',
            title: 'Mock Position',
            company: 'Mock Company',
            startDate: '2020-01',
            endDate: '2021-01',
          },
        ],
      },
      education: {
        summary: 'Mock Education Summary',
        schools: [
          {
            id: 'mock-school-id',
            name: 'Mock School',
            degrees: [
              {
                id: 'mock-degree-id',
                major: 'Mock Major',
                startYear: '2016',
                endYear: '2020',
              },
            ],
          },
        ],
      },
      skills: [
        {
          id: 'mock-skill-id',
          title: 'Mock Skill',
          link: 'https://example.com',
        },
      ],
      references: [
        {
          id: 'mock-reference-id',
          name: 'Mock Reference',
          email: 'mock.reference@example.com',
          phone: '(555) 987-6543',
        },
      ],
    };
    (resumeActions.getCompleteResume as jest.Mock).mockResolvedValue(mockResumeData);

    // Render the component
    render(<ResumeContent />);

    // Wait for the data to load
    await waitFor(() => {
      expect(screen.getByText('Mock Resume Title')).toBeInTheDocument();
    });

    // Check that the resume data is rendered
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    expect(screen.getByText('(555) 123-4567')).toBeInTheDocument();
    expect(screen.getByText('Mock Persona')).toBeInTheDocument();
    expect(screen.getByText('Mock Goals')).toBeInTheDocument();
    expect(screen.getByText('Mock Position')).toBeInTheDocument();
    expect(screen.getByText('Mock Company')).toBeInTheDocument();
    expect(screen.getByText('2020-01 - 2021-01')).toBeInTheDocument();
    expect(screen.getByText('Mock Education Summary')).toBeInTheDocument();
    expect(screen.getByText('Mock School')).toBeInTheDocument();
    expect(screen.getByText('Mock Major')).toBeInTheDocument();
    expect(screen.getByText('2016 - 2020')).toBeInTheDocument();
    expect(screen.getByText('Mock Skill')).toBeInTheDocument();
    expect(screen.getByText('Mock Reference')).toBeInTheDocument();
    expect(screen.getByText('mock.reference@example.com')).toBeInTheDocument();
    expect(screen.getByText('(555) 987-6543')).toBeInTheDocument();
  });

  it('should show error state when loading fails', async () => {
    // Mock the getCompleteResume function to throw an error
    (resumeActions.getCompleteResume as jest.Mock).mockRejectedValue(new Error('Mock error'));

    // Render the component
    render(<ResumeContent />);

    // Wait for the error to be shown
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });

    // Check that the retry button is shown
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('should show no data state when no resume is found', async () => {
    // Mock the getCompleteResume function to return null
    (resumeActions.getCompleteResume as jest.Mock).mockResolvedValue(null);

    // Render the component
    render(<ResumeContent />);

    // Wait for the no data state to be shown
    await waitFor(() => {
      expect(screen.getByText(/no data/i)).toBeInTheDocument();
    });

    // Check that the no resume data message is shown
    expect(screen.getByText(/no resume data is available/i)).toBeInTheDocument();
  });
});
