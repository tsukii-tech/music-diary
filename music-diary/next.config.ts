// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 簡単に許可：この1行だけでもOK
    domains: ["i.scdn.co"],

    // より厳密に許可したい場合は remotePatterns も併用可（どちらか片方でもOK）
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.scdn.co",
        pathname: "/image/**",
      },
    ],
  },

  
};

export default nextConfig;
