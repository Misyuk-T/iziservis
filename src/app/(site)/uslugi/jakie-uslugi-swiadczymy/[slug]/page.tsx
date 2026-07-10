import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Reveal } from '@/components/motion/Reveal'
import { ButtonAnchor, GhostLink, PageHeader, Prose, Section } from '@/components/ui/Section'
import { COMPANY } from '@/domain/company'
import { getService, getServices } from '@/domain/content'
import { buildBreadcrumbSchema, buildServiceSchema } from '@/domain/schema/localBusiness'

type Params = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const services = await getServices()
  return services.map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const service = await getService(slug)
  if (!service) return {}
  return {
    title: service.seo.title,
    description: service.seo.description,
    alternates: { canonical: `/uslugi/jakie-uslugi-swiadczymy/${service.slug}` },
  }
}

export default async function ServicePage({ params }: Params) {
  const { slug } = await params
  const service = await getService(slug)
  if (!service) notFound()

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://iziserwis.pl'
  const url = `${siteUrl}/uslugi/jakie-uslugi-swiadczymy/${service.slug}`

  const schema = [
    buildServiceSchema({ siteUrl, name: service.title, description: service.summary, url }),
    buildBreadcrumbSchema([
      { name: 'Start', url: siteUrl },
      { name: 'Usługi', url: `${siteUrl}/uslugi` },
      { name: service.title, url },
    ]),
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <PageHeader eyebrow="Usługa" title={service.title} lead={service.summary} />

      <Section>
        <Reveal>
          <Prose>
            {/*
              FR-19: this template renders all FOUR services, including the sales
              service "Dobór i sprzedaż sprzętu". The prose is therefore kept
              service-agnostic — the service-specific message is carried by the
              summary, already rendered prominently as the PageHeader lead above.
              No repair-only wording ("oryginalne części"), no invented facts:
              no 24/7, no response-time promise, no statistics.
            */}
            <p>
              Współpracujemy z restauracjami, hotelami, stołówkami i sieciami gastronomicznymi na
              terenie całej Polski. Zakres i termin ustalamy indywidualnie — opisz, czego
              potrzebujesz, a wrócimy z konkretną propozycją.
            </p>
            <p>
              Działamy zgodnie z procedurami producentów. Skontaktuj się z nami telefonicznie lub
              przez formularz, a doradzimy najlepsze rozwiązanie i przygotujemy wycenę.
            </p>
          </Prose>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <ButtonAnchor href={`tel:${COMPANY.phone}`}>Zadzwoń: {COMPANY.phoneDisplay}</ButtonAnchor>
            <GhostLink href="/kontakt" className="text-green-900">Napisz do nas</GhostLink>
          </div>
        </Reveal>
      </Section>
    </>
  )
}
