
/** @type {import('next').NextConfig} */
const nextConfig = {
  // For Amplify Gen 2 deployment, we need to use server-side rendering
  // output: 'export', // Uncomment for static export
  images: {
    unoptimized: true,
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ];
  },

  // Disable powered by header
  poweredByHeader: false,

  // Enable React strict mode
  reactStrictMode: true,
};

module.exports = nextConfig;
