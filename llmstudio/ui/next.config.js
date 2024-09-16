/** @type {import('next').NextConfig} */

// Common security headers applied to every response. Keeping these as a
// dedicated constant makes it easy to audit or extend the policy without
// hunting through the Next.js config object.
//
// References:
//   - https://owasp.org/www-project-secure-headers/
//   - https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers
const securityHeaders = [
  // Prevent the browser from MIME-sniffing a response away from the declared content-type.
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Disallow embedding the app in cross-origin frames to mitigate clickjacking.
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // Only send the origin on cross-origin requests; full URL stays same-origin.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Deny access to powerful browser features the UI does not use.
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  // Force HTTPS for two years, including subdomains, and allow HSTS preload.
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
];

// Apply the security header set to every path served by the app.
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
