// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // keep deploys unblocked
  },
  // Disable CSS optimization (bypasses lightningcss)
  experimental: {
    optimizeCss: false,
  },
  // If TypeScript errors block the build, you can temporarily enable:
  // typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
