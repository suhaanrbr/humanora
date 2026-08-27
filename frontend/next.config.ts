import type { NextConfig } from "next";

// Security headers that carry no compatibility risk with Razorpay
// Checkout or Google OAuth (both are simple top-level redirects/popups,
// neither embeds HUMANORA in a frame or needs a relaxed CSP from us).
// A full Content-Security-Policy is deliberately NOT added here yet —
// Razorpay's checkout script needs specific script-src/frame-src/connect-src
// allowances that are easy to get subtly wrong, and a broken CSP could
// silently break checkout right when it matters most. Flagged as a
// post-launch improvement to add and test carefully against a real
// Razorpay Test Mode payment, not rushed in during a safety audit.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self)" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
