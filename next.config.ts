import type { NextConfig } from "next";

const isMobile = process.env.IS_MOBILE === 'true';

const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: process.env.NODE_ENV === "development", // Disable PWA in dev mode
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig: NextConfig = {
  output: isMobile ? 'export' : undefined,
  images: {
    unoptimized: isMobile ? true : undefined,
  },
};

export default withPWA(nextConfig);