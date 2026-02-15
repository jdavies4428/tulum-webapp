import withBundleAnalyzer from '@next/bundle-analyzer';

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'maps.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'optics.marine.usf.edu',
      },
      {
        protocol: 'https',
        hostname: '**.ipcamlive.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
};

export default bundleAnalyzer(nextConfig);
