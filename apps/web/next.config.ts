import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@zelto/registry"],
  turbopack: {
    root: path.join(__dirname, "../.."),
  },
};

export default nextConfig;
