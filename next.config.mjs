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
}

export default nextConfig
