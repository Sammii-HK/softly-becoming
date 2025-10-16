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
};

export default nextConfig;