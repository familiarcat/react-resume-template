/* eslint-env node */

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Experimental features
  experimental: {
    // Enable optimizations
    optimizePackageImports: ['react', 'react-dom'],
  },
  webpack: (config, { isServer }) => {
    const oneOfRule = config.module.rules.find(rule => rule.oneOf);
    const tsRules = oneOfRule.oneOf.filter(rule => rule.test && rule.test.toString().includes('tsx|ts'));
    tsRules.forEach(rule => {
      rule.include = undefined;
    });

    // For server-side code that imports client-side libraries
    if (isServer) {
      config.externals = [...(config.externals || []), 'aws-amplify'];
    }

    return config;
  },
  compress: true,
  generateEtags: true,
  pageExtensions: ['tsx', 'mdx', 'ts'],
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  reactStrictMode: false, // Disabled to avoid double-rendering issues
  trailingSlash: false,
  // Optimize loading and performance
  optimizeFonts: true,
  swcMinify: true,
  onDemandEntries: {
    // Keep the build page in memory for longer
    maxInactiveAge: 60 * 60 * 1000, // 1 hour
    // Number of pages to keep in memory
    pagesBufferLength: 5,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cloudflare-ipfs.com',
        pathname: '/ipfs/**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: process.env.NODE_ENV === 'development',
  },
};

module.exports = nextConfig;
