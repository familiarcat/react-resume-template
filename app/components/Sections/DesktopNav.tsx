import classNames from 'classnames';
import Link from 'next/link';
import {FC, memo} from 'react';
import {SectionId} from '../../data/data';
import {headerID} from './Header';

interface DesktopNavProps {
  navSections: SectionId[];
  currentSection: SectionId | null;
}

const DesktopNav: FC<DesktopNavProps> = memo(({navSections, currentSection}) => {
  const baseClass =
    '-m-1.5 p-1.5 rounded-md font-bold first-letter:uppercase hover:transition-colors hover:duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 sm:hover:text-orange-500 text-neutral-100';
  const activeClass = classNames(baseClass, 'text-orange-500');
  const inactiveClass = classNames(baseClass, 'text-neutral-100');

  return (
    <header className="fixed top-0 z-50 hidden w-full bg-neutral-900/50 p-4 backdrop-blur sm:block" id={headerID}>
      <nav className="flex justify-center gap-x-8">
        {navSections.map(section => (
          <Link
            key={section}
            className={section === currentSection ? activeClass : inactiveClass}
            href={`/#${section}`}
          >
            {section}
          </Link>
        ))}
      </nav>
    </header>
  );
});

DesktopNav.displayName = 'DesktopNav';
export default DesktopNav;