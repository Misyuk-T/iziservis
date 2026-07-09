import { describe, expect, it } from 'vitest'

import { COMPANY } from '@/domain/company'
import {
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildLocalBusinessSchema,
  buildServiceSchema,
} from '@/domain/schema/localBusiness'

const siteUrl = 'https://iziserwis.pl'

describe('AD-4 / FR-11: the site declares itself a local business', () => {
  const schema = buildLocalBusinessSchema({ siteUrl })

  it('is a LocalBusiness, not an Article', () => {
    expect(schema['@type']).toBe('LocalBusiness')
  })

  it('carries the real address, phone and NIP', () => {
    expect(schema.telephone).toBe('+48786631714')
    expect(schema.address.streetAddress).toBe('ul. Urocza 26')
    expect(schema.address.postalCode).toBe('04-651')
    expect(schema.taxID).toBe('5272796292')
  })

  it('does not carry the design reference’s invented phone number', () => {
    expect(schema.telephone).not.toBe('+48572278600')
  })

  it('openingHours reflects Mon–Fri 08:00–17:00, not the mockup’s 24/7', () => {
    const [spec] = schema.openingHoursSpecification
    expect(spec!.opens).toBe('08:00')
    expect(spec!.closes).toBe('17:00')
    expect(spec!.dayOfWeek).toHaveLength(5)
    expect(spec!.dayOfWeek).not.toContain('Saturday')
    expect(spec!.dayOfWeek).not.toContain('Sunday')
  })

  it('reads openingHours from content when supplied', () => {
    const custom = buildLocalBusinessSchema({
      siteUrl,
      hours: { opens: '07:00', closes: '19:00', days: ['Monday'] },
    })
    expect(custom.openingHoursSpecification[0]!.opens).toBe('07:00')
  })
})

describe('FR-12: services reference the business rather than restating it', () => {
  const service = buildServiceSchema({
    siteUrl,
    name: 'Naprawy awaryjne',
    description: 'Serwis awaryjny urządzeń gastronomicznych.',
    url: `${siteUrl}/uslugi/jakie-uslugi-swiadczymy/naprawy-awaryjne`,
  })

  it('points provider at the single LocalBusiness node', () => {
    expect(service.provider['@id']).toBe(`${siteUrl}/#business`)
  })

  it('derives areaServed from content, not a constant in the template', () => {
    expect(service.areaServed.name).toBe(COMPANY.areaServed)
    expect(buildServiceSchema({ siteUrl, name: 'x', description: 'y', url: 'z', areaServed: 'Mazowieckie' }).areaServed.name).toBe('Mazowieckie')
  })
})

describe('no page emits the schema the legacy site got wrong', () => {
  const all = [
    buildLocalBusinessSchema({ siteUrl }),
    buildServiceSchema({ siteUrl, name: 'a', description: 'b', url: 'c' }),
    buildFaqSchema([{ question: 'q', answer: 'a' }]),
    buildBreadcrumbSchema([{ name: 'Start', url: siteUrl }]),
  ]

  it.each(all.map((s) => [s['@type'], s] as const))('%s contains no Article or Person', (_t, schema) => {
    const json = JSON.stringify(schema)
    expect(json).not.toContain('"Article"')
    expect(json).not.toContain('"Person"')
  })
})

describe('FAQ and breadcrumbs', () => {
  it('maps FAQ entries to Question/Answer pairs', () => {
    const faq = buildFaqSchema([{ question: 'Czy naprawiacie piece?', answer: 'Tak.' }])
    expect(faq['@type']).toBe('FAQPage')
    expect(faq.mainEntity[0]!.acceptedAnswer.text).toBe('Tak.')
  })

  it('numbers breadcrumb positions from one', () => {
    const crumbs = buildBreadcrumbSchema([
      { name: 'Start', url: siteUrl },
      { name: 'Usługi', url: `${siteUrl}/uslugi` },
    ])
    expect(crumbs.itemListElement.map((i) => i.position)).toEqual([1, 2])
  })
})
