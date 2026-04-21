import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Desabilita otimização de imagens (não precisamos)
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ['@react-pdf/renderer'],
  // Configuração para evitar problemas de CORS e cache
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
