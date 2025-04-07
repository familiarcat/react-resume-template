'use client';
import React from 'react';
import { motion } from 'framer-motion';
interface BentoMotionProps { children: React.ReactNode; className?: string; }
export function BentoMotion({ children, className }: BentoMotionProps) {
  return <motion.div whileHover={{ scale: 1.02 }} className={className}>{children}</motion.div>;
}
