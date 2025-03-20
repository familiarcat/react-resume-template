import {useEffect} from 'react';
import {SectionId} from '../data/data';
import {headerID} from '../components/Sections/Header';

export const useNavObserver = (selectors: string, handler: (section: SectionId | null) => void) => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Get all sections
    const headings = document.querySelectorAll(selectors);
    const headingsArray = Array.from(headings);
    const headerWrapper = document.getElementById(headerID);

    if (!headerWrapper) return;

    // Create the IntersectionObserver API
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const currentY = entry.boundingClientRect.y;
          const id = entry.target.getAttribute('id');
          
          // Create a decision object
          const decision = {
            id,
            currentIndex: headingsArray.findIndex(heading => heading.getAttribute('id') === id),
            isIntersecting: entry.isIntersecting,
            currentRatio: entry.intersectionRatio,
            aboveToc: currentY < headerWrapper.getBoundingClientRect().y,
            belowToc: !(currentY < headerWrapper.getBoundingClientRect().y),
          };
          
          if (decision.isIntersecting) {
            handler(decision.id as SectionId);
          } else if (
            !decision.isIntersecting &&
            decision.currentRatio < 1 &&
            decision.currentRatio > 0 &&
            decision.belowToc
          ) {
            const currentVisible = headingsArray[decision.currentIndex - 1]?.getAttribute('id');
            handler(currentVisible as SectionId);
          }
        });
      },
      {
        root: null,
        threshold: 0.1,
        rootMargin: '0px 0px -70% 0px',
      },
    );

    // Observe all the Sections
    headings.forEach(section => {
      observer.observe(section);
    });

    // Cleanup
    return () => {
      observer.disconnect();
    };
  }, [selectors, handler]);
};
