/* eslint-env node */

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Experimental features
  experimental: {
    // Enable optimizations
    optimizePackageImports: ['react', 'react-dom'],
    // Improve server components
    serverComponentsExternalPackages: ['aws-amplify'],
  },
  webpack: config => {
    const oneOfRule = config.module.rules.find(rule => rule.oneOf);
    const tsRules = oneOfRule.oneOf.filter(rule => rule.test && rule.test.toString().includes('tsx|ts'));
    tsRules.forEach(rule => {
      rule.include = undefined;
    });

    // Fix module format issues
    config.module.rules.push({
      test: /\.m?js$/,
      type: 'javascript/auto',
      resolve: {
        fullySpecified: false,
      },
    });

    // Handle module resolution
    config.resolve.alias = {
      ...config.resolve.alias,
    };

    // Ensure we're using the correct module format
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'aws-crt': false,
    };

    // Optimize chunk size with simpler settings
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          name: 'vendors',
          test: /node_modules/,
          chunks: 'all',
        },
      },
    };

    return config;
  },
  compress: true,
  generateEtags: true,
  pageExtensions: ['tsx', 'mdx', 'ts'],
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  reactStrictMode: true,
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
    domains: ['your-image-domain.com'], // Add your image domains here
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

module.exports = nextConfig;
