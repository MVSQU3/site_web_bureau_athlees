import type { NextConfig } from "next";

const config: NextConfig = {
  poweredByHeader: false,
  outputFileTracingRoot: process.cwd(),
  turbopack: { root: process.cwd() },
  serverExternalPackages: ["pg"],
  experimental: { serverActions: { bodySizeLimit: "4mb" } },
};
export default config;
