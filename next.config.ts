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
    // Next 16 only serves quality 75 unless the values it may be asked for
    // are explicitly allow-listed here. Product photos opt into 90 (see the
    // `quality` prop on their <Image> tags) for sharper detail than the
    // default; everything else keeps 75.
    qualities: [75, 90],
  },
  experimental: {
    serverActions: {
      // Next.js's own default here is 1MB, well under the 5MB-per-photo
      // limit the product form already validates and advertises to
      // admins — any real photo over ~1MB was hitting this framework-level
      // cap and crashing with a raw 500 before the product action (and its
      // own validation/error handling) ever ran. Sized for a handful of
      // full-size photos in one save, matching nginx's client_max_body_size
      // for /admin/.
      bodySizeLimit: "20mb",
    },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
