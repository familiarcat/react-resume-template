/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    optimizePackageImports: ['react', 'react-dom'],
    serverComponentsExternalPackages: ['sharp'],
  },
  // Add this to ensure proper standalone build
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },
  // Ensure proper file generation
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  optimizeFonts: true,
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

module.exports = nextConfig;
