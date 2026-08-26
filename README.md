This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Pointing the site at a domain

No domain is written into the source. Every absolute URL — canonical tags,
Open Graph images, `robots.txt`, `sitemap.xml`, `llms.txt`, `/api/info` —
comes from one value resolved in `lib/site.ts`, in this order:

1. **`NEXT_PUBLIC_SITE_URL`** — an explicit override. Use it when the canonical
   host is not the platform's own: a custom apex sitting behind a redirect, a
   reverse proxy, or a host other than Vercel. A trailing slash is trimmed for
   you.
2. **`VERCEL_PROJECT_PRODUCTION_URL`** — injected by Vercel automatically and
   updated when a custom domain is attached, so on Vercel attaching the domain
   in the dashboard is normally all that is needed.
3. **`http://localhost:3000`** — the development fallback.

`robots.txt`, `sitemap.xml` and the page metadata are prerendered, so the host
is fixed at build time. **After attaching or changing a domain, redeploy** —
otherwise those files keep advertising the previous host.

The archived previous site is served at `/old`. It is marked `noindex` and
excluded from the sitemap on purpose, so it does not compete with the live
pages for the same content.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
