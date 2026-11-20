/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  async redirects() {
    return [
      {
        source: '/sandbox/web',
        destination: '/sandbox/code',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
