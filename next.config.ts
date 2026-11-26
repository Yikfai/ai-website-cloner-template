import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Next 16 blocks dev HMR from 127.0.0.1 unless it is listed here.
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
