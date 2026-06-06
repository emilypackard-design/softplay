import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Force clean build - bust cache
  webpack: (config) => {
    config.cache = false;
    return config;
  },
};

export default nextConfig;
