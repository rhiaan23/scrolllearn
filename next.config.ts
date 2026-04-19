import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Twemoji SVGs served from jsDelivr — see src/components/GameIcon.tsx
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.jsdelivr.net",
        pathname: "/gh/twitter/twemoji@**",
      },
    ],
  },
};

export default nextConfig;
