import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow connections from local network IP for testing
  allowedDevOrigins: ['192.168.29.133'],
};

export default nextConfig;
