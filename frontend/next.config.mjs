/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const rawBackendUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.NEXT_PUBLIC_API_BASE ||
      process.env.BACKEND_API_URL;
    if (!rawBackendUrl) {
      return [];
    }
    // Clean trailing slashes and remove existing /api/v1 suffix if present to prevent double prefixing
    const backendUrl = rawBackendUrl
      .replace(/\/+$/, '')
      .replace(/\/api\/v1$/, '');
    return [
      {
        source: '/api/v1/:path*',
        destination: `${backendUrl}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
