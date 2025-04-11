/* eslint-env node */

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize loading and performance
  optimizeFonts: true,
  swcMinify: true,
  
  // Configure images
  images: {
    unoptimized: true, // Required for static export
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
  },
  
  // Use export output for static site generation
  output: 'export',
  
  // Disable server components for static export
  experimental: {
    // These are safe optimizations that work with static export
    optimizePackageImports: ['react', 'react-dom'],
  },
  
  // Other optimizations
  compress: true,
  generateEtags: true,
  pageExtensions: ['tsx', 'mdx', 'ts'],
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  reactStrictMode: false, // Disabled to avoid double-rendering issues
  trailingSlash: false,
  
  // Specify the build directory
  distDir: '.next',
  
  // Webpack configuration for static export
  webpack: (config, { isServer }) => {
    // Fix TypeScript rules
    const oneOfRule = config.module.rules.find(rule => rule.oneOf);
    if (oneOfRule) {
      const tsRules = oneOfRule.oneOf.filter(rule => rule.test && rule.test.toString().includes('tsx|ts'));
      tsRules.forEach(rule => {
        rule.include = undefined;
      });
    }
    
    // Externalize aws-amplify for server builds
    if (isServer) {
      config.externals = [...(config.externals || []), 'aws-amplify'];
    }
    
    return config;
  },
};

module.exports = nextConfig;
