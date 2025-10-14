/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Needed only in dev; safe to leave here
  experimental: {
    // Allows dev from LAN/IP without the CORS warning you saw
    allowedDevOrigins: [
      'http://localhost:3000',
      'http://192.168.100.3',
      'http://192.168.100.3:9002', // if you serve from :9002 in dev
    ],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
    ]
  },
  // Production headers for basic security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
