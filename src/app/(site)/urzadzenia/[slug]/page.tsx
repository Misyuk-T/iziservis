import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Reveal } from '@/components/motion/Reveal'
import { ButtonAnchor, GhostLink, PageHeader, Prose, Section } from '@/components/ui/Section'
import { COMPANY } from '@/domain/company'
import { getEquipmentCategories, getEquipmentCategory } from '@/domain/content'
import { buildBreadcrumbSchema, buildServiceSchema } from '@/domain/schema/localBusiness'

type Params = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const categories = await getEquipmentCategories()
  return categories.map((c) => ({ slug: c.slug }))
}

/** AD-5: read verbatim from the CMS entry. Never generated. */
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const category = await getEquipmentCategory(slug)
  if (!category) return {}

  return {
    title: category.seo.title,
    description: category.seo.description,
    alternates: { canonical: `/urzadzenia/${category.slug}` },
  }
}

export default async function EquipmentPage({ params }: Params) {
  const { slug } = await params
  const category = await getEquipmentCategory(slug)
  if (!category) notFound()

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://iziserwis.pl'
  const url = `${siteUrl}/urzadzenia/${category.slug}`

  // AD-4: both nodes derived from the entry, never hand-written.
  const schema = [
    buildServiceSchema({
      siteUrl,
      name: category.title,
      description: category.summary,
      url,
      areaServed: COMPANY.areaServed,
    }),
    buildBreadcrumbSchema([
      { name: 'Start', url: siteUrl },
      { name: 'Urządzenia', url: `${siteUrl}/urzadzenia` },
      { name: category.title, url },
    ]),
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <PageHeader eyebrow="Urządzenia" title={category.title} lead={category.summary} />

      <Section>
        <Reveal>
          <Prose>
            <p>
              Serwisujemy {category.title.toLowerCase()} wszystkich wiodących producentów — z dojazdem
              do klienta i dostępem do oryginalnych części. Diagnozujemy usterkę, wyceniamy naprawę i
              realizujemy ją tak, by kuchnia wróciła do pracy możliwie najszybciej.
            </p>
            <p>
              Obsługujemy zarówno pojedyncze lokale, jak i sieci gastronomiczne w całej Polsce.
              Prowadzimy również przeglądy okresowe, które ograniczają ryzyko awarii w szczycie
              sezonu.
            </p>
          </Prose>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <ButtonAnchor href={`tel:${COMPANY.phone}`}>
              Zadzwoń: {COMPANY.phoneDisplay}
            </ButtonAnchor>
            <GhostLink href="/kontakt" className="text-green-900">
              Wyceń naprawę
            </GhostLink>
          </div>
        </Reveal>
      </Section>
    </>
  )
}
