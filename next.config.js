/** @type {import('next').NextConfig} */
const API_BASE = process.env.NEXT_PUBLIC_URL ? process.env.NEXT_PUBLIC_URL.replace(/\/+$/, '') : undefined;

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_HOSTNAME,
        port: '',
        pathname: '/**',
      },
    ],
    domains: [process.env.NEXT_PUBLIC_HOSTNAME],
  },
  async rewrites() {
    // 개발/운영 공통 프록시: /v1/* → ${API_BASE}/v1/* (환경변수 기준)
    if (!API_BASE) return [];
    return [
      {
        source: '/v1/:path*',
        destination: `${API_BASE}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
