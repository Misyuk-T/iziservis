import { COMPANY } from '@/domain/company'

/**
 * AD-4: structured data is derived, never authored.
 *
 * The legacy site emits `Article` with a `Person` author on every page — a Rank
 * Math default that tells Google a Warsaw repair company publishes blog posts.
 * FR-11 replaces that with one `LocalBusiness` node whose openingHours come
 * from content, so the schema cannot drift from the contact page.
 */

export type OpeningHours = {
  opens: string
  closes: string
  days: readonly string[]
}

export type LocalBusinessInput = {
  siteUrl: string
  hours?: OpeningHours
}

export function buildLocalBusinessSchema({ siteUrl, hours }: LocalBusinessInput) {
  const { opens, closes, days } = hours ?? {
    opens: COMPANY.opensAt,
    closes: COMPANY.closesAt,
    days: COMPANY.openDays,
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${siteUrl}/#business`,
    name: COMPANY.legalName,
    url: siteUrl,
    telephone: COMPANY.phone,
    email: COMPANY.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: COMPANY.street,
      postalCode: COMPANY.postalCode,
      addressLocality: COMPANY.city,
      addressCountry: COMPANY.country,
    },
    areaServed: { '@type': 'Country', name: COMPANY.areaServed },
    taxID: COMPANY.nip,
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [...days],
        opens,
        closes,
      },
    ],
  }
}

export type ServiceInput = {
  siteUrl: string
  name: string
  description: string
  url: string
  areaServed?: string
}

/** FR-12: each service and equipment page emits this, generated from its entry. */
export function buildServiceSchema({ siteUrl, name, description, url, areaServed }: ServiceInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    url,
    provider: { '@id': `${siteUrl}/#business` },
    areaServed: { '@type': 'Country', name: areaServed ?? COMPANY.areaServed },
  }
}

export type FaqInput = { question: string; answer: string }

/** FR-12: the knowledge centre emits FAQPage, generated from its FAQ entries. */
export function buildFaqSchema(entries: FaqInput[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: entries.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  }
}

export type Crumb = { name: string; url: string }

export function buildBreadcrumbSchema(crumbs: Crumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: c.url,
    })),
  }
}
