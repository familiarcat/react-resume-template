'use client';

import { useState, useEffect } from 'react';
import { getCompleteResume } from '../actions/resume-actions';

// Types for resume data
interface Degree {
  id: string;
  major: string;
  startYear: string;
  endYear: string;
  schoolId: string;
}

interface School {
  id: string;
  name: string;
  degrees: Degree[];
}

interface Education {
  id: string;
  summary: string;
  schools: School[];
}

interface Position {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate: string;
}

interface Experience {
  id: string;
  positions: Position[];
}

interface Skill {
  id: string;
  title: string;
  link?: string;
}

interface Reference {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface ContactInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface Summary {
  id: string;
  persona: string;
  goals: string;
}

interface Resume {
  id: string;
  title: string;
}

interface ResumeData {
  resume: Resume;
  summary: Summary | null;
  contactInfo: ContactInfo | null;
  education: Education | null;
  experience: Experience | null;
  skills: Skill[];
  references: Reference[];
}

export default function ResumeContent() {
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadResumeData() {
      try {
        setLoading(true);
        const data = await getCompleteResume();
        // @ts-expect-error - The data structure from the server might not match exactly
        setResumeData(data);
        setError(null);
      } catch (err) {
        console.error('Error loading resume data:', err);
        setError('Failed to load resume data. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    loadResumeData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-pulse text-center">
          <div className="h-8 w-64 bg-gray-200 rounded mb-4 mx-auto"></div>
          <div className="h-4 w-48 bg-gray-200 rounded mb-2 mx-auto"></div>
          <div className="h-4 w-56 bg-gray-200 rounded mb-6 mx-auto"></div>
          <div className="h-24 w-full bg-gray-200 rounded mb-6"></div>
          <div className="h-24 w-full bg-gray-200 rounded mb-6"></div>
          <div className="h-24 w-full bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 my-4">
        <h3 className="text-lg font-medium mb-2">Error</h3>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 bg-red-100 hover:bg-red-200 text-red-800 font-medium py-1 px-3 rounded transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!resumeData) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4 my-4">
        <h3 className="text-lg font-medium mb-2">No Data</h3>
        <p>No resume data is available.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">{resumeData.resume.title}</h2>

      {/* Contact Information */}
      {resumeData.contactInfo && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Contact Information</h3>
          <p>{resumeData.contactInfo.name}</p>
          <p>{resumeData.contactInfo.email}</p>
          <p>{resumeData.contactInfo.phone}</p>
        </div>
      )}

      {/* Summary */}
      {resumeData.summary && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Summary</h3>
          <p className="mb-2">{resumeData.summary.persona}</p>
          <p>{resumeData.summary.goals}</p>
        </div>
      )}

      {/* Experience */}
      {resumeData.experience && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Experience</h3>
          {resumeData.experience.positions.map((position) => (
            <div key={position.id} className="mb-4">
              <h4 className="text-lg font-medium">{position.title}</h4>
              <p className="text-gray-700">{position.company}</p>
              <p className="text-sm text-gray-500">
                {position.startDate} - {position.endDate}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {resumeData.education && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Education</h3>
          <p className="mb-2">{resumeData.education.summary}</p>

          {resumeData.education.schools.map((school) => (
            <div key={school.id} className="mb-4">
              <h4 className="text-lg font-medium">{school.name}</h4>

              {school.degrees.map((degree) => (
                <div key={degree.id} className="ml-4">
                  <p>{degree.major}</p>
                  <p className="text-sm text-gray-500">
                    {degree.startYear} - {degree.endYear}
                  </p>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {resumeData.skills.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {resumeData.skills.map((skill) => (
              <a
                key={skill.id}
                href={skill.link || '#'}
                target={skill.link ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
              >
                {skill.title}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* References */}
      {resumeData.references.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-2">References</h3>
          {resumeData.references.map((reference) => (
            <div key={reference.id} className="mb-2">
              <p className="font-medium">{reference.name}</p>
              <p>{reference.email}</p>
              <p>{reference.phone}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
