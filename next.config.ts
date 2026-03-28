import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable standalone output for better Cloudflare Pages compatibility
  output: 'standalone',
  // Disable image optimization (not needed for this app)
  images: {
    unoptimized: true,
  },
};

export default nextConfig;