/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    images: {
      domains: ['example.com', 'th.bing.com', 'www.bing.com', 'www.gbdarchitects.com'],
      remotePatterns: [
        {
          protocol: 'http',
          hostname: 'localhost',
          port: '3000',
          pathname: '/uploads/**',
        },
      ],
    },
  };
  
  export default nextConfig;