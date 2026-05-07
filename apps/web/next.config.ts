import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@dgcom/ui', '@dgcom/contracts', '@dgcom/auth'],
  experimental: {
    typedRoutes: true,
  },
};

export default config;
