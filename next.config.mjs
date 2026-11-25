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
  async rewrites() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'intelligentqa-assets';
    if (process.env.USE_SUPABASE_STORAGE === 'true' && supabaseUrl) {
      return [
        {
          source: '/uploads/:path*',
          destination: `${supabaseUrl}/storage/v1/object/public/${bucket}/:path*`,
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
