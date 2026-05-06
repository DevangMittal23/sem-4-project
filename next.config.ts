import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output — required for Render deployment
  output: "standalone",

  // Next.js 15: allow dev server from any origin (dev only, harmless in prod)
  allowedDevOrigins: ["localhost", "127.0.0.1", "0.0.0.0"],
};

export default nextConfig;
