/** @type {import('next').NextConfig} */

// Common security headers applied to every response. Keeping these as a
// dedicated constant makes it easy to audit or extend the policy without
// hunting through the Next.js config object.
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
];

const buildHeaderRules = () => [
  {
    source: '/:path*',
    headers: securityHeaders,
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  headers: async () => buildHeaderRules(),
};

module.exports = nextConfig;
