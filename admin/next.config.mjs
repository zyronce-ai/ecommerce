/** @type {import('next').NextConfig} */
const nextConfig = { images: { remotePatterns: [{ protocol: 'https', hostname: 'images.unsplash.com' }], formats: ['image/webp'] } };
export default nextConfig;
