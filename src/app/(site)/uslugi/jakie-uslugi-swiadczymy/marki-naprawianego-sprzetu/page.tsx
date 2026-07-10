import type { Metadata } from 'next'
import Link from 'next/link'

import { Reveal, RevealGroup, RevealItem } from '@/components/motion/Reveal'
import { PageHeader, Prose, Section } from '@/components/ui/Section'
import { getBrands } from '@/domain/content'

export const metadata: Metadata = {
  title: 'Marki naprawianego sprzętu - Izi Serwis',
  description: 'Znamy się dobrze, ze wszystkimi',
  alternates: { canonical: '/uslugi/jakie-uslugi-swiadczymy/marki-naprawianego-sprzetu' },
}

export default async function BrandsPage() {
  const brands = await getBrands()
  const authorized = brands.filter((b) => b.authorized)
  const partners = brands.filter((b) => !b.authorized)

  return (
    <>
      <PageHeader
        eyebrow="Marki"
        title="Marki naprawianego sprzętu"
        lead="Znamy się dobrze, ze wszystkimi."
      />

      {/*
        FR-2: authorized and partner brands render in separately labelled groups.
        Being an authorized service partner is a legal claim; the UI must not
        blur it by mixing the two into one logo wall, as the design reference
        does.
      */}
      <Section>
        <Reveal>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Marki, których jesteśmy autoryzowanym serwisem
          </h2>
          <Prose>
            <p className="mt-4">
              Jesteśmy oficjalnym partnerem serwisowym i/lub dystrybutorem tych marek. Nasi technicy
              przechodzą szkolenia u producentów, mamy dostęp do oryginalnych części i działamy
              zgodnie z procedurami naprawczymi — bez utraty uprawnień gwarancyjnych.
            </p>
          </Prose>
        </Reveal>

        <RevealGroup className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {authorized.map((brand) => (
            <RevealItem key={brand.slug}>
              <BrandCard
                name={brand.name}
                authorized
                distributor={brand.distributor}
                href={brand.landingPage ? `/uslugi/serwis-${brand.slug}` : undefined}
              />
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      <Section className="!pt-0">
        <Reveal>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Marki, z którymi współpracujemy
          </h2>
          <Prose>
            <p className="mt-4">
              Serwisujemy te urządzenia, choć nie jesteśmy ich autoryzowanym serwisem.
            </p>
          </Prose>
        </Reveal>

        <RevealGroup className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {partners.map((brand) => (
            <RevealItem key={brand.slug}>
              <BrandCard
                name={brand.name}
                distributor={brand.distributor}
                href={brand.landingPage ? `/uslugi/serwis-${brand.slug}` : undefined}
              />
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>
    </>
  )
}

/**
 * Brands render as wordmarks. The legacy site carries no logo assets, and the
 * design reference's logo wall includes four brands IZI does not list.
 */
function BrandCard({
  name,
  authorized = false,
  distributor = false,
  href,
}: {
  name: string
  authorized?: boolean
  // AD-17 (FR-19): independent from `authorized`. Renders a badge only when
  // true. With every brand seeded false (until OQ-11) no distribution badge
  // renders anywhere — the UI degrades gracefully.
  distributor?: boolean
  href?: string
}) {
  const inner = (
    <>
      <span className="text-lg font-semibold text-green-900">{name}</span>
      {authorized || distributor ? (
        <span className="mt-2 flex flex-wrap gap-2">
          {authorized ? (
            <span className="inline-flex w-fit items-center rounded-full bg-brand-green/10 px-3 py-1 text-xs font-semibold text-link-green">
              Autoryzowany serwis
            </span>
          ) : null}
          {distributor ? (
            <span className="inline-flex w-fit items-center rounded-full bg-brand-green/10 px-3 py-1 text-xs font-semibold text-link-green">
              Dystrybucja
            </span>
          ) : null}
        </span>
      ) : null}
    </>
  )

  const className =
    'flex min-h-28 flex-col justify-center rounded-2xl border border-green-900/10 p-6 transition-colors duration-200 hover:border-brand-green/40'

  return href ? (
    <Link href={href} className={className}>
      {inner}
    </Link>
  ) : (
    <div className={className}>{inner}</div>
  )
}
