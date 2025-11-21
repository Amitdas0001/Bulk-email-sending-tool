/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Disable type checking during build (TypeScript errors handled separately)
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  },
  
  // Image optimization
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
  
  // Output configuration
  output: 'standalone',
};

module.exports = nextConfig;