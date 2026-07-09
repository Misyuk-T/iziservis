import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPayload } from 'payload'

import config from '@payload-config'

import type { FaqEntry as FaqEntryDoc } from '@/payload-types'

type FaqSeed = {
  question: string
  answer: string
  topic: NonNullable<FaqEntryDoc['topic']>
  order: number
}

const here = path.dirname(fileURLToPath(import.meta.url))
const faq: FaqSeed[] = JSON.parse(readFileSync(path.join(here, 'faq.json'), 'utf8'))

/**
 * Idempotent seed. Run with: pnpm payload run src/seed/index.ts
 *
 * SEO titles and descriptions are copied verbatim from the legacy site
 * (docs/source/content-inventory.md) per AD-5. They are not rewritten, not
 * "improved", and not regenerated — they rank as they are.
 *
 * One deliberate exception, flagged rather than smuggled: the legacy title for
 * the Convotherm landing page reads "Serwis Conovtherm Warszawa". That is a
 * misspelling of the brand. Nobody searches for "Conovtherm", so verbatim here
 * preserves a typo and no traffic. Seeded corrected; the old URL 301s.
 */

const VOIVODESHIPS = [
  'Dolnośląskie',
  'Kujawsko-pomorskie',
  'Lubelskie',
  'Lubuskie',
  'Łódzkie',
  'Małopolskie',
  'Mazowieckie',
  'Opolskie',
  'Podkarpackie',
  'Podlaskie',
  'Pomorskie',
  'Śląskie',
  'Świętokrzyskie',
  'Warmińsko-mazurskie',
  'Wielkopolskie',
  'Zachodniopomorskie',
]

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replaceAll('ą', 'a')
    .replaceAll('ć', 'c')
    .replaceAll('ę', 'e')
    .replaceAll('ł', 'l')
    .replaceAll('ń', 'n')
    .replaceAll('ó', 'o')
    .replaceAll('ś', 's')
    .replaceAll('ź', 'z')
    .replaceAll('ż', 'z')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const EQUIPMENT = [
  {
    slug: 'piece-konwekcyjno-parowe',
    order: 0,
    title: 'Piece konwekcyjno-parowe',
    summary: 'Serce Twojej kuchni. Serwis, przeglądy i naprawy pieców konwekcyjno-parowych.',
    seo: { title: 'Serwis pieców Warszawa | iziserwis.pl', description: 'Serce Twojej kuchni' },
  },
  {
    slug: 'zmywarki-gastronomiczne',
    order: 1,
    title: 'Zmywarki gastronomiczne',
    summary: 'Czystość to podstawa. Serwis zmywarek kapturowych, podblatowych i tunelowych.',
    seo: { title: 'Serwis zmywarek Warszawa | iziserwis.pl', description: 'Czystość to podstawa' },
  },
  {
    slug: 'ekspresy-i-urzadzenia-barowe',
    order: 2,
    title: 'Ekspresy i urządzenia barowe',
    summary: 'Wszystko zaczyna się od gorącej kawy. Serwis ekspresów kolbowych i sprzętu barowego.',
    seo: {
      title: 'Serwis ekspresów Warszawa | iziserwis.pl',
      description: 'Wszystko zaczyna się od gorącej kawy',
    },
  },
  {
    slug: 'urzadzenia-chlodnicze',
    order: 3,
    title: 'Urządzenia chłodnicze',
    summary: 'Chłodzenie bez przerwy — gwarancja bezpieczeństwa i świeżości.',
    seo: {
      title: 'Serwis lodówek Warszawa | iziserwis.pl',
      description: 'Chłodzenie bez przerwy – gwarancja bezpieczeństwa i świeżości',
    },
  },
  {
    slug: 'urzadzenia-grzewcze',
    order: 4,
    title: 'Urządzenia grzewcze',
    summary: 'Bez ciepła nie ma kuchni. Kuchnie, patelnie, frytownice, bemary.',
    seo: { title: 'Urządzenia grzewcze - Izi Serwis', description: 'Bez ciepła nie ma kuchni' },
  },
]

const SERVICES = [
  {
    slug: 'przeglady-okresowe',
    order: 0,
    title: 'Przeglądy okresowe',
    summary: 'Regularna konserwacja to oszczędność, nie koszt.',
    seo: {
      title: 'Przeglądy okresowe - Izi Serwis',
      description: 'Regularna konserwacja to oszczędność, nie koszt!',
    },
  },
  {
    slug: 'naprawy-awaryjne',
    order: 1,
    title: 'Naprawy awaryjne',
    summary: 'Szybka naprawa to szybki powrót do pracy.',
    seo: {
      title: 'Naprawy awaryjne - Izi Serwis',
      description: 'Szybka naprawa to szybki powrót do pracy',
    },
  },
  {
    slug: 'instalacje-i-deinstalacje',
    order: 2,
    title: 'Instalacje i deinstalacje',
    summary: 'Szybko i bez stresu.',
    // Legacy title reads "Instalacji i deinstalacje" — ungrammatical. Corrected
    // here; the old URL 301s. See src/domain/redirects.ts.
    seo: { title: 'Instalacje i deinstalacje - Izi Serwis', description: 'Szybko i bez stresu' },
  },
]

/**
 * Authorized vs partner is a legal distinction (FR-2), taken from the live
 * site's own wording. The design reference adds Winterhalter, Fagor, Redfox and
 * RM Gastro — none of which the current site lists. They are not seeded.
 */
const BRANDS = [
  { name: 'Bartscher', authorized: true, landingPage: false },
  { name: 'Convotherm', authorized: true, landingPage: true },
  { name: 'Electrolux Professional', authorized: true, landingPage: false },
  { name: 'Hobart', authorized: true, landingPage: false },
  { name: 'Astoria', authorized: true, landingPage: false },
  { name: 'Unic', authorized: true, landingPage: true },
  { name: 'Rational', authorized: false, landingPage: false },
  { name: 'Stalgast', authorized: false, landingPage: true },
  { name: 'Firex', authorized: false, landingPage: true },
]

const payload = await getPayload({ config })

type SeedCollection = 'voivodeships' | 'equipment-categories' | 'services' | 'brands'

async function upsert(collection: SeedCollection, slug: string, data: object) {
  const existing = await payload.find({
    collection,
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  })

  if (existing.docs.length > 0) {
    await payload.update({
      collection,
      id: existing.docs[0]!.id,
      // Payload's generated types narrow per collection; the seed is uniform.
      data: data as never,
    })
    return 'updated'
  }

  await payload.create({ collection, data: data as never })
  return 'created'
}

let counts = { created: 0, updated: 0 }
const track = (r: string) => (r === 'created' ? counts.created++ : counts.updated++)

for (const name of VOIVODESHIPS) {
  track(await upsert('voivodeships', slugify(name), { name, slug: slugify(name) }))
}

for (const e of EQUIPMENT) {
  track(await upsert('equipment-categories', e.slug, { ...e, _status: 'published' }))
}

for (const s of SERVICES) {
  track(await upsert('services', s.slug, { ...s, _status: 'published' }))
}

for (const b of BRANDS) {
  track(await upsert('brands', slugify(b.name), { ...b, slug: slugify(b.name) }))
}

// FAQ: 50 real question/answer pairs lifted from the legacy knowledge centre.
const existingFaq = await payload.count({ collection: 'faq-entries' })
if (existingFaq.totalDocs === 0) {
  for (const entry of faq) {
    await payload.create({ collection: 'faq-entries', data: entry })
    counts.created++
  }
} else {
  console.log(`  faq-entries: ${existingFaq.totalDocs} already present, skipped`)
}

console.log(`Seed complete: ${counts.created} created, ${counts.updated} updated.`)
process.exit(0)
