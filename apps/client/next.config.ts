import type { NextConfig } from 'next';

const apiUrl = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001').replace(/\/$/, '');

const nextConfig: NextConfig = {
  transpilePackages: ['@ko/types', '@ko/utils'],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
