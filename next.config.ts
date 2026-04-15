import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Desabilita otimização de imagens (não precisamos)
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
