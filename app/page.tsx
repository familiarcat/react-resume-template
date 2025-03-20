'use client';

import dynamic from 'next/dynamic';
import About from './components/Sections/About';
import Contact from './components/Sections/Contact';
import Footer from './components/Sections/Footer';
import Hero from './components/Sections/Hero';
import Portfolio from './components/Sections/Portfolio';
import Resume from './components/Sections/Resume';
import Testimonials from './components/Sections/Testimonials';

// Dynamically import Header with no SSR
const Header = dynamic(
  () => import('./components/Sections/Header'),
  { ssr: false }
);

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col">
      <Header />
      <Hero />
      <About />
      <Resume />
      <Portfolio />
      <Testimonials />
      <Contact />
      <Footer />
    </main>
  );
}
