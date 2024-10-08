/** @type {import('next').NextConfig} */
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
};

module.exports = nextConfig;
