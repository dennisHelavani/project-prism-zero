/**
 * Returns the site origin for building absolute redirect URLs.
 * Safe for production (DigitalOcean) and local dev.
 *
 * Priority:
 *  1. NEXT_PUBLIC_SITE_URL env var (should be set on DO)
 *  2. Fallback to hardcoded production domain
 *
 * Always strips trailing slash so callers can do `${origin}/path`.
 */
export function getSiteOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL;
  if (raw) return raw.replace(/\/+$/, '');
  // Production fallback — keeps redirects working even if env var is missing
  return 'https://hardhatai.co';
}
