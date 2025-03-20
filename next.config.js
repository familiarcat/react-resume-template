/* eslint-env node */

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: config => {
    const oneOfRule = config.module.rules.find(rule => rule.oneOf);
    const tsRules = oneOfRule.oneOf.filter(rule => rule.test && rule.test.toString().includes('tsx|ts'));
    tsRules.forEach(rule => {
      rule.include = undefined;
    });
    return config;
  },
  compress: true,
  generateEtags: true,
  pageExtensions: ['tsx', 'mdx', 'ts'],
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  reactStrictMode: true,
  trailingSlash: false,
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
