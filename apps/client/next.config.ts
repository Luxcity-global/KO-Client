import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@ko/types', '@ko/utils'],
};

export default nextConfig;
