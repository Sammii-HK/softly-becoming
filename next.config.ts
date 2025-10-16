import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Disable ESLint during builds to avoid configuration issues
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Allow production builds to complete even if there are type errors
    ignoreBuildErrors: false,
  },
  images: {
    // Allow query strings in image URLs for OG images
    localPatterns: [
      {
        pathname: '/api/og/**',
        search: '**',
      },
      {
        pathname: '/api/og-portrait/**',
        search: '**',
      },
      {
        pathname: '/api/logo/**',
        search: '**',
      },
    ],
  },
};

export default nextConfig;