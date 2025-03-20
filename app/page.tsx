'use client';

import {NextPage} from 'next';
import dynamic from 'next/dynamic';
import About from './components/Sections/About';
import Contact from './components/Sections/Contact';
import Footer from './components/Sections/Footer';
import Hero from './components/Sections/Hero';
import Portfolio from './components/Sections/Portfolio';
import Resume from './components/Sections/Resume';
import Testimonials from './components/Sections/Testimonials';

const Header = dynamic(() => import('./components/Sections/Header'), {
  ssr: false
});

const Page: NextPage = () => {
  return (
    <main>
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
};

export default Page;
