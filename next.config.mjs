/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
      remotePatterns: [
          {
              protocol: 'https',
              hostname: 'msffrpocfmwlsynvcuut.supabase.co',
              pathname: '/storage/v1/object/public/profiles/**',
          },
      ],
  },
};

export default nextConfig;

