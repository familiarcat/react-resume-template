
/** @type {import('next').NextConfig} */
const nextConfig = {
  // For Amplify Gen 2 deployment, we need to use server-side rendering
  // output: 'export', // Uncomment for static export
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
