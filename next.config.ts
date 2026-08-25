import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=15552000" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      // blob: is needed for the admin product form's local image previews
      // (URL.createObjectURL), not just remote product photos.
      "img-src 'self' data: blob: https://*.arvanstorage.ir",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  images: {
    // Product photos live in ArvanCloud object storage (not the local
    // filesystem) — see src/lib/storage.ts. Covers both virtual-hosted
    // style (bucket.s3.<region>.arvanstorage.ir) and any custom domain
    // pointed at the bucket.
    remotePatterns: [{ protocol: "https", hostname: "*.arvanstorage.ir" }],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
