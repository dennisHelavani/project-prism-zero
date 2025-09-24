import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  swcMinify: true,
  reactStrictMode: true,
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  images: {
    // TEMP: bypass sharp; set to false later if you install `sharp`
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co', pathname: '/**' },
      { protocol: 'https', hostname: 'picsum.photos', pathname: '/**' }
    ]
  }
  // Note: removed the webpack alias for 'node-fetch'
};

export default nextConfig;
