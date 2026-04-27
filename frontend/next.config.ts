import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async redirects() {
    return [
      { source: "/apoyar", destination: "/support", permanent: true },
      { source: "/apoyar/cancelado", destination: "/support/cancelled", permanent: true },
      { source: "/apoyar/exito", destination: "/support/success", permanent: true },
      { source: "/actividad", destination: "/activity", permanent: true },
      { source: "/jugar/online", destination: "/play/online", permanent: true },
      { source: "/torneo", destination: "/tournament", permanent: true },
      { source: "/acerca", destination: "/about", permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dragonball-api.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
        pathname: "/wikipedia/**",
      },
    ],
  },
};

export default nextConfig;
