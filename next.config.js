/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // ── Image optimisation ────────────────────────────────────────────
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400,
    // Allow Supabase storage URLs for next/image optimisation
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.in',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },

  // ── Compiler options ──────────────────────────────────────────────
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
      ? { exclude: ['error'] }
      : false,
  },

  // ── Experimental ─────────────────────────────────────────────────
  experimental: {
    optimizeCss: false,
  },

  webpack(config) {
    config.resolve.alias = { ...config.resolve.alias }
    return config
  },

  eslint: {
    ignoreDuringBuilds: true,
  }
}

module.exports = nextConfig