import type { MetadataRoute } from 'next'

import { getBrands, getEquipmentCategories, getServices } from '@/domain/content'

/** AD-10: the CMS route never appears here. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://iziserwis.pl'
  const [categories, services, brands] = await Promise.all([
    getEquipmentCategories(),
    getServices(),
    getBrands(),
  ])

  const staticPaths = [
    '',
    '/uslugi',
    '/urzadzenia',
    '/uslugi/jakie-uslugi-swiadczymy',
    '/uslugi/jakie-uslugi-swiadczymy/marki-naprawianego-sprzetu',
    '/uslugi/gdzie-naprawiamy',
    '/o-firmie',
    '/centrum-wiedzy',
    '/kontakt',
    '/polityka-cookies',
  ]

  return [
    ...staticPaths.map((p) => ({ url: `${base}${p}`, lastModified: new Date() })),
    ...categories.map((c) => ({ url: `${base}/urzadzenia/${c.slug}`, lastModified: new Date() })),
    ...services.map((s) => ({
      url: `${base}/uslugi/jakie-uslugi-swiadczymy/${s.slug}`,
      lastModified: new Date(),
    })),
    ...brands
      .filter((b) => b.landingPage)
      .map((b) => ({ url: `${base}/uslugi/serwis-${b.slug}`, lastModified: new Date() })),
  ]
}
