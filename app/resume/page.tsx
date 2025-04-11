/**
 * Resume Page
 * 
 * This is a server component that fetches resume data using the data service.
 */

import { getCompleteResume } from '../actions/resume-actions';
import { Suspense } from 'react';

// Loading component
function ResumeLoading() {
  return <div className="p-4">Loading resume data...</div>;
}

// Resume component
async function ResumeContent() {
  // Fetch the complete resume data
  const resumeData = await getCompleteResume();
  
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold mb-6">{resumeData.resume.title}</h1>
      
      {/* Contact Information */}
      {resumeData.contactInfo && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Contact Information</h2>
          <p>{resumeData.contactInfo.name}</p>
          <p>{resumeData.contactInfo.email}</p>
          <p>{resumeData.contactInfo.phone}</p>
        </div>
      )}
      
      {/* Summary */}
      {resumeData.summary && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Summary</h2>
          <p className="mb-2">{resumeData.summary.persona}</p>
          <p>{resumeData.summary.goals}</p>
        </div>
      )}
      
      {/* Experience */}
      {resumeData.experience && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Experience</h2>
          {resumeData.experience.positions.map((position) => (
            <div key={position.id} className="mb-4">
              <h3 className="text-lg font-medium">{position.title}</h3>
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
          <h2 className="text-xl font-semibold mb-2">Education</h2>
          <p className="mb-2">{resumeData.education.summary}</p>
          
          {resumeData.education.schools.map((school) => (
            <div key={school.id} className="mb-4">
              <h3 className="text-lg font-medium">{school.name}</h3>
              
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
          <h2 className="text-xl font-semibold mb-2">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {resumeData.skills.map((skill) => (
              <span 
                key={skill.id}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full"
              >
                {skill.title}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* References */}
      {resumeData.references.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">References</h2>
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

// Main page component
export default function ResumePage() {
  return (
    <main>
      <Suspense fallback={<ResumeLoading />}>
        <ResumeContent />
      </Suspense>
    </main>
  );
}
