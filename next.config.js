
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Disable TypeScript type checking during build
  typescript: {
    ignoreBuildErrors: true,
  },

  // Use static export for faster builds
  output: 'export',

  // Unoptimized images for faster build
  images: {
    unoptimized: true,
  },

  // Minimal transpilation
  transpilePackages: [
    'aws-amplify',
  ],

  // Disable powered by header
  poweredByHeader: false,

  // Disable React strict mode for faster builds
  reactStrictMode: false,
};

module.exports = nextConfig;
