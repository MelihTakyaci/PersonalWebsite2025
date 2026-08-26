// lib/site.ts
// The one place the deployment's own address is decided. Nothing else in the
// project may hardcode a domain, so the site can be pointed at any host by
// changing configuration rather than code.

function resolveSiteUrl(): string {
  // 1. An explicit override always wins. Set NEXT_PUBLIC_SITE_URL when the
  //    canonical host differs from the platform's own (a custom apex behind a
  //    redirect, a reverse proxy, a non-Vercel host).
  const explicit = process.env.NEXT_PUBLIC_SITE_URL
  if (explicit) return explicit.replace(/\/+$/, '')

  // 2. Vercel injects the project's production host automatically, and updates
  //    it when a custom domain is attached — so attaching a domain in the
  //    dashboard is enough, with no code change and no redeploy of config.
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL
  if (vercel) return `https://${vercel.replace(/\/+$/, '')}`

  // 3. Local development.
  return 'http://localhost:3000'
}

export const siteUrl = resolveSiteUrl()

/** Absolute URL for `path`, which should start with a slash. */
export function absoluteUrl(path = '/'): string {
  return `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`
}
