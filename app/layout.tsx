import './globalStyles.scss';

import {Metadata} from 'next';
import {Inter} from 'next/font/google';
import React from 'react';

const inter = Inter({subsets: ['latin']})

export const metadata: Metadata = {
  title: 'React Resume Template',
  description: 'A modern resume template built with Next.js',
  metadataBase: new URL('https://reactresume.com'),
  openGraph: {
    title: 'React Resume Template',
    description: 'A modern resume template built with Next.js',
    url: 'https://reactresume.com',
    siteName: 'React Resume Template',
    locale: 'en_US',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
