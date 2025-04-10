/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: '.next',
  experimental: {
    optimizePackageImports: ['react', 'react-dom'],
  },
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
