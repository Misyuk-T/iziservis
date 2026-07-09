import type { MetadataRoute } from 'next'

/** AD-10: the CMS route is invisible to crawlers. */
export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://iziserwis.pl'

  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api'] }],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
