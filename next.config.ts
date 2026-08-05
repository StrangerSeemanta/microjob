import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["delay-uncorrupt-sank.ngrok-free.dev"],
  images:{
    remotePatterns:[
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
        port: '',
        pathname: '/**',
      },
    ],
  }
};

export default nextConfig;
