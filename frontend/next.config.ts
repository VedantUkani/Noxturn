import type { NextConfig } from "next";

/**
 * Dev uses Turbopack (`npm run dev`) — no webpack hook here, so Next won’t warn
 * “Webpack is configured while Turbopack is not.”
 *
 * If you use `npm run dev:webpack` and see stale chunk errors, run `npm run dev:clean`.
 */
const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/evidence", destination: "/today", permanent: false },
    ];
  },
};

export default nextConfig;
