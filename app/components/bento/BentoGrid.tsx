import { FC, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

interface BentoGridProps {
  className?: string;
  children: ReactNode;
}

export const BentoGrid: FC<BentoGridProps> = ({ className = '', children }) => {
  return (
    <div className={twMerge('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4', className)}>
      {children}
    </div>
  );
};

export default BentoGrid;
