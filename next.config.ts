import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    async headers() {
    return [
        {
          source: '/:slug*',
          headers: [
            { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
            { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
          ],
        },
      ]
    },
    output: 'standalone'
};

export default nextConfig;
