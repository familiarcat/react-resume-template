
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use static export for Amplify Gen 2
  output: 'export',

  // Disable all checks for faster builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Unoptimized images for faster build
  images: {
    unoptimized: true,
  },

  // Disable React strict mode for faster builds
  reactStrictMode: false,

  // Disable powered by header
  poweredByHeader: false,
};

module.exports = nextConfig;
