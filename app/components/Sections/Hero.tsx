'use client';

import Image from 'next/image';
import {FC, memo} from 'react';

import {heroData} from '../../data/data';

const Hero: FC = memo(() => {
  return (
    <section className="relative h-screen">
      <Image
        alt="Background"
        className="object-cover"
        fill
        priority
        src={heroData.imageSrc}
      />
      <div className="absolute inset-0 bg-black bg-opacity-50">
        <div className="container mx-auto h-full px-4">
          <div className="flex h-full items-center">
            <div className="text-white">
              <h1 className="mb-4 text-5xl font-bold">{heroData.name}</h1>
              {heroData.description}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

Hero.displayName = 'Hero';
export default Hero;
