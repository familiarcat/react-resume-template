/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // Changed from 'standalone' to 'export'
  experimental: {
    optimizePackageImports: ['react', 'react-dom'],
  },
  // Remove serverComponentsExternalPackages as it's not needed for static export
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },
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
