/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize loading and performance
  optimizeFonts: true,
  swcMinify: true,

  // Configure images
  images: {
    unoptimized: true, // Disable image optimization for Amplify
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Use export output for static site generation
  // This is the recommended approach for Amplify Gen 2
  output: 'export',

  // Disable server components for static export
  experimental: {
    // These are safe optimizations that work with static export
    optimizePackageImports: ['react', 'react-dom'],
  },

  // Specify the build directory
  distDir: '.next',
};

module.exports = nextConfig;
