'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';
interface ParallaxLayerProps { children: ReactNode; speed?: number; className?: string; zIndex?: number; }
export function ParallaxLayer({ children, speed = 1, className = '', zIndex = 0 }: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const yTransform = useTransform(scrollY, [0, 1000], [0, -200 * speed]);
  return <motion.div ref={ref} style={{ y: yTransform, zIndex }} className={cn('absolute w-screen h-full', className)}>{children}</motion.div>;
}
interface ParallaxContainerProps { children: ReactNode; className?: string; }
export function ParallaxContainer({ children, className = '' }: ParallaxContainerProps) {
  return <div className={cn('relative w-screen h-screen overflow-x-hidden overflow-y-auto scrollbar-hide', className)}>{children}</div>;
}
