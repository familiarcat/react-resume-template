import { motion } from 'framer-motion';
import { FC, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

interface BentoMotionProps {
  className?: string;
  children: ReactNode;
  delay?: number;
}

export const BentoMotion: FC<BentoMotionProps> = ({ className = '', children, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={twMerge('bg-neutral-100 rounded-lg p-6 shadow-lg', className)}
    >
      {children}
    </motion.div>
  );
};

export default BentoMotion;
