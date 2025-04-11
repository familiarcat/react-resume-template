'use client';

import { useState, useEffect } from 'react';
import { getSkills } from '../actions/resume-actions';

interface Skill {
  id: string;
  title: string;
  link?: string;
}

export default function SkillsList({ resumeId }: { resumeId: string }) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSkills() {
      try {
        setLoading(true);
        const skillsData = await getSkills(resumeId);
        setSkills(skillsData);
        setError(null);
      } catch (err) {
        setError('Failed to load skills');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadSkills();
  }, [resumeId]);

  if (loading) return <div>Loading skills...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (skills.length === 0) return <div>No skills found</div>;

  return (
    <div className="mt-4">
      <h3 className="text-lg font-medium mb-2">Skills</h3>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
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
  );
}
