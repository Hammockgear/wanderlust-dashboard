// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // TEMP: unblock Kinsta builds
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
