/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    allowDevOrigins: ["192.168.3.4"], // ← 自分のLAN IP
  },
};

export default nextConfig;
