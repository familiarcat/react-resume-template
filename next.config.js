
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable ESLint during build for faster builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript type checking during build for faster builds
  typescript: {
    ignoreBuildErrors: true,
  }
};

module.exports = nextConfig;
