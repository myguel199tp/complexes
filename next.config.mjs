// /** @type {import('next').NextConfig} */
// const nextConfig = {
//     reactStrictMode: false,
//     images: {
//       domains: ['example.com', 'th.bing.com', 'www.bing.com', 'www.gbdarchitects.com'],
//       remotePatterns: [
//         {
//           protocol: 'http',
//           hostname: 'localhost',
//           port: '3000',
//           pathname: '/uploads/**',
//         },
//       ],
//     },
//   };
  
//   export default nextConfig;

  /** @type {import('next').NextConfig} */

const securityHeaders = [
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
  },
];

const nextConfig = {
  reactStrictMode: false,

  // @react-pdf/renderer v4 es ESM puro, pero Next lo externaliza por defecto
  // en el servidor (require() -> error). Forzamos que se transpile.
  transpilePackages: ['@react-pdf/renderer'],

  images: {
    domains: [
      'example.com',
      'th.bing.com',
      'www.bing.com',
      'www.gbdarchitects.com',
    ],

    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
    ],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;