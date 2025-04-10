import { clsx } from 'clsx';

interface SectionProps {
  className?: string;
  children: React.ReactNode;
  sectionId?: string;
  noPadding?: boolean;
}

export const Section: React.FC<SectionProps> = ({ className = '', children, sectionId, noPadding = false }) => {
  return (
    <section
      className={clsx(
        {
          'py-8 md:py-12 lg:py-16': !noPadding
        },
        className
      )}
      id={sectionId}
    >
      {children}
    </section>
  );
};

export default Section;
