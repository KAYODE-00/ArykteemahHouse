import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    // Admin-added products can point at any image host, so we allow any
    // https domain here rather than an allowlist. Data URLs (uploaded
    // files encoded client-side) are handled separately in ProductImage.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
