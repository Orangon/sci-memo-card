/** @type {import('next').NextConfig} */
const nextConfig = {
  // reactStrictMode is enabled by default in Next.js 15+
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'localhost',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api',
  },
}

export default nextConfig
