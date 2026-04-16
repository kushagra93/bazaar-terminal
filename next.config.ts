import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow external images (stock logos)
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "financialmodelingprep.com" },
      { protocol: "https", hostname: "img.logo.dev" },
    ],
  },
  // Enable standalone output for Vercel
  output: "standalone",
  // Disable strict mode in production for fewer double-renders
  reactStrictMode: false,
};

export default nextConfig;
