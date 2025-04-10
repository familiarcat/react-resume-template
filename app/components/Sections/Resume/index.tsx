import { FC, memo } from 'react';

import { education, experience, SectionId, skills } from '../../../data/data';
import Section from '../../Layout/Section';
import ResumeSection from './ResumeSection';
import { SkillGroup } from './Skills';
import TimelineItem from './TimelineItem';
import BentoGrid from '../../bento/BentoGrid';
import BentoMotion from '../../bento/BentoMotion';

const Resume: FC = memo(() => {
  return (
    <Section className="bg-neutral-100" sectionId={SectionId.Resume}>
        <BentoMotion>
      <BentoGrid className="gap-8">
        <div className="col-span-full md:col-span-1">
          <ResumeSection title="Education">
            {education.map((item, index) => (
              <TimelineItem item={item} key={`${item.title}-${index}`} />
            ))}
          </ResumeSection>
        </div>
        <div className="col-span-full md:col-span-1">
          <ResumeSection title="Work">
            {experience.map((item, index) => (
              <TimelineItem item={item} key={`${item.title}-${index}`} />
            ))}
          </ResumeSection>
        </div>
        <div className="col-span-full md:col-span-1">
          <ResumeSection title="Skills">
            <p className="pb-8">
              Here you can show a snapshot of your skills to show off to employers
            </p>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {skills.map((skillgroup, index) => (
                <SkillGroup key={`${skillgroup.name}-${index}`} skillGroup={skillgroup} />
              ))}
            </div>
          </ResumeSection>
        </div>
      </BentoGrid>
        </BentoMotion>
    </Section>
  );
});

Resume.displayName = 'Resume';
export default Resume;
