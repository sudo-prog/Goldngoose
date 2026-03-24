/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["ui"],
  experimental: {
    esmExternals: false,
  },
  // SSR compatibility fixes
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't bundle these modules on the server side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
