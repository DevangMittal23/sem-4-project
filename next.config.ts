import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // standalone output only for production
  ...(process.env.NODE_ENV === "production" ? { output: "standalone" } : {}),

  // Next.js 15: allow dev server to be accessed from any origin (fixes HTTPS/HTTP mismatch warning)
  allowedDevOrigins: ["localhost", "127.0.0.1", "0.0.0.0"],
};

export default nextConfig;
