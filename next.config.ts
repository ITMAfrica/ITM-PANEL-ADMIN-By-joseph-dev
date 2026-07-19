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

const DEFAULT_API_URL =
  process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

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
  // Proxy all /api requests to the Express backend. This keeps cookies
  // first-party (same origin as the Next.js page), which eliminates the
  // cross-hostname cookie issues that caused the connect/disconnect loop.
  // In production behind Caddy this rewrite is bypassed because Caddy routes
  // /api/* to the backend directly, so it remains harmless.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${DEFAULT_API_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
