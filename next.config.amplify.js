/** @type {import('next').NextConfig} */
const nextConfig = {
  // Experimental features
  experimental: {
    // Enable optimizations
    optimizePackageImports: ['react', 'react-dom'],
  },
  // Optimize loading and performance
  optimizeFonts: true,
  swcMinify: true,
  images: {
    unoptimized: true, // Disable image optimization for Amplify
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Don't use standalone output for Amplify
  // output: 'standalone',
};

module.exports = nextConfig;
