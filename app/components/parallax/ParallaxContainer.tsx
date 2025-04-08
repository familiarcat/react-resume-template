'use client';
import { ReactNode } from 'react';

interface ParallaxLayerProps {
  children: ReactNode;
  speed?: number;
  className?: string;
  zIndex?: number;
}

// Simplified version without framer-motion
export function ParallaxLayer({ children, className = '', zIndex = 0 }: ParallaxLayerProps) {
  return (
    <div
      style={{ zIndex }}
      className={`relative w-full ${className}`}
    >
      {children}
    </div>
  );
}

interface ParallaxContainerProps {
  children: ReactNode;
  className?: string;
}

export function ParallaxContainer({ children, className = '' }: ParallaxContainerProps) {
  return (
    <div className={`relative w-full overflow-x-hidden ${className}`}>
      {children}
    </div>
  );
}
