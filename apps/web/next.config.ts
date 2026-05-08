import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.marktplaats.nl' },
      { protocol: 'https', hostname: '**.ebayimg.com' },
      { protocol: 'https', hostname: '**.vinted.nl' },
      { protocol: 'https', hostname: '**.vinted.com' },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001',
  },
};

export default nextConfig;
