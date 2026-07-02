import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*',
        pathname: '/**',
      },
    ],
  },
  // sql.js WASM 需要服务端文件系统访问
  serverExternalPackages: ['sql.js'],
};

export default nextConfig;
