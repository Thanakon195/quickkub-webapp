/** @type {import('next').NextConfig} */
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

const nextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',

  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Images configuration
  images: {
    domains: ['localhost', 'quickkub.com'],
    formats: ['image/webp', 'image/avif'],
  },

  // Experimental features
  experimental: {
    optimizeCss: false,
  },

  // Webpack configuration
  webpack(config, { isServer }) {
    if (!isServer) {
      config.optimization.minimizer.push(new CssMinimizerPlugin());
    }
    return config;
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: false,
      },
    ];
  },

  // Headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
