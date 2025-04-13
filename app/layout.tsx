import './globalStyles.scss';
import './global.js';

import {Metadata} from 'next';
import {Inter} from 'next/font/google';
import React from 'react';
import AmplifyProvider from '@/components/AmplifyProvider';

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
      <body className={inter.className}>
        {/* Wrap the content in AmplifyProvider for client-side Amplify initialization */}
        <AmplifyProvider>{children}</AmplifyProvider>
      </body>
    </html>
  );
}
