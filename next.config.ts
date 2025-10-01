import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,

  // NEW: allow other local origins in dev (adjust to your LAN/IP)
  allowedDevOrigins: [
    'http://localhost:9002',
    'http://127.0.0.1:9002',
    'http://192.168.100.3:9002',
  ],

  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: false,
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co', pathname: '/**' },
      { protocol: 'https', hostname: 'picsum.photos', pathname: '/**' },
    ],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'node-fetch': 'isomorphic-fetch',
    };
    return config;
  },
};

export default nextConfig;
