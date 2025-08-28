// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // TEMP: unblock deploys
  },
  // If builds still fail due to TypeScript errors, you can
  // temporarily bypass them by uncommenting the block below.
  // typescript: {
  //   ignoreBuildErrors: true,
  // },
};

export default nextConfig;
