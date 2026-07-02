import type { NextConfig } from "next";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";

const turbopackRoot = path.dirname(fileURLToPath(import.meta.url));

function getLanDevOrigins(): string[] {
  const origins = new Set<string>();
  for (const interfaces of Object.values(os.networkInterfaces())) {
    for (const iface of interfaces ?? []) {
      if (iface.family === "IPv4" && !iface.internal) {
        origins.add(iface.address);
      }
    }
  }
  return [...origins];
}

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: getLanDevOrigins(),
  turbopack: {
    root: turbopackRoot,
  },
  /* config options here */
  typescript: {
    ignoreBuildErrors: false,
  },
  reactStrictMode: true,
};

export default nextConfig;
