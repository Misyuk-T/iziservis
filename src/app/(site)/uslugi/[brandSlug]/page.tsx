import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Reveal } from '@/components/motion/Reveal'
import { ButtonAnchor, GhostLink, PageHeader, Prose, Section } from '@/components/ui/Section'
import { COMPANY } from '@/domain/company'
import { getBrand, getBrands } from '@/domain/content'
import { buildBreadcrumbSchema, buildServiceSchema } from '@/domain/schema/localBusiness'

type Params = { params: Promise<{ brandSlug: string }> }

const PREFIX = 'serwis-'

/**
 * Only four brands have landing pages: Unic, Stalgast, Firex, Convotherm.
 * These are the commercial money pages, so the route is closed rather than
 * open — an unknown `/uslugi/<anything>` 404s instead of rendering an empty
 * brand page that Google would happily index.
 */
export async function generateStaticParams() {
  const brands = await getBrands()
  return brands.filter((b) => b.landingPage).map((b) => ({ brandSlug: `${PREFIX}${b.slug}` }))
}

async function resolveBrand(brandSlug: string) {
  if (!brandSlug.startsWith(PREFIX)) return null
  return getBrand(brandSlug.slice(PREFIX.length))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { brandSlug } = await params
  const brand = await resolveBrand(brandSlug)
  if (!brand?.landingPage) return {}

  // The legacy Convotherm title reads "Serwis Conovtherm Warszawa" — a
  // misspelling of the brand. Nobody searches for it, so carrying it verbatim
  // would preserve a typo and no traffic. Corrected; the old URL 301s.
  return {
    title: `Serwis ${brand.name} - Izi Serwis`,
    description: `Autoryzowany serwis i naprawy urządzeń ${brand.name}. Przeglądy, części oryginalne, dojazd w całej Polsce.`,
    alternates: { canonical: `/uslugi/${brandSlug}` },
  }
}

export default async function BrandLandingPage({ params }: Params) {
  const { brandSlug } = await params
  const brand = await resolveBrand(brandSlug)
  if (!brand?.landingPage) notFound()

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://iziserwis.pl'
  const url = `${siteUrl}/uslugi/${brandSlug}`

  const schema = [
    buildServiceSchema({
      siteUrl,
      name: `Serwis ${brand.name}`,
      description: `Naprawy i przeglądy urządzeń ${brand.name}.`,
      url,
    }),
    buildBreadcrumbSchema([
      { name: 'Start', url: siteUrl },
      { name: 'Usługi', url: `${siteUrl}/uslugi` },
      { name: `Serwis ${brand.name}`, url },
    ]),
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <PageHeader
        eyebrow={brand.authorized ? 'Autoryzowany serwis' : 'Serwis'}
        title={`Serwis ${brand.name}`}
        lead={
          brand.authorized
            ? `Jesteśmy autoryzowanym serwisem ${brand.name}. Oryginalne części, procedury producenta, zachowana gwarancja.`
            : `Serwisujemy urządzenia ${brand.name} — naprawy, przeglądy i doradztwo techniczne.`
        }
      />

      <Section>
        <Reveal>
          <Prose>
            <p>
              Znamy konstrukcję urządzeń {brand.name} i typowe usterki, które się w nich pojawiają.
              Diagnozujemy problem, wyceniamy naprawę i realizujemy ją tak, by przestój był możliwie
              najkrótszy.
            </p>
            {brand.authorized ? (
              <p>
                Jako autoryzowany partner mamy dostęp do oryginalnych części i procedur naprawczych
                producenta — naprawa nie powoduje utraty uprawnień gwarancyjnych.
              </p>
            ) : (
              <p>
                Nie jesteśmy autoryzowanym serwisem tej marki, ale mamy doświadczenie w jej
                urządzeniach. Jeśli sprzęt jest na gwarancji producenta, powiedz nam o tym — doradzimy,
                co się bardziej opłaca.
              </p>
            )}
          </Prose>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <ButtonAnchor href={`tel:${COMPANY.phone}`}>Zadzwoń: {COMPANY.phoneDisplay}</ButtonAnchor>
            <GhostLink href="/kontakt" className="text-green-900">Wyceń naprawę</GhostLink>
          </div>
        </Reveal>
      </Section>
    </>
  )
}
