/**
 * Resume Page
 *
 * This is a static page that uses client components for data fetching.
 */

// Suspense is not used directly but may be needed in the future
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Loading component
function ResumeLoading() {
  return <div className="p-4">Loading resume data...</div>;
}

// Import the client component with no SSR
const ResumeClientContent = dynamic(
  () => import('../components/ResumeContent'),
  {
    ssr: false,
    loading: () => <ResumeLoading />
  }
);

// Main page component
export default function ResumePage() {
  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Resume</h1>
      <ResumeClientContent />
    </main>
  );
}
