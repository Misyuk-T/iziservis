import type { Metadata } from 'next'
import Link from 'next/link'

import { RevealGroup, RevealItem } from '@/components/motion/Reveal'
import { PageHeader, Section } from '@/components/ui/Section'
import { getEquipmentCategories, getServices } from '@/domain/content'

export const metadata: Metadata = {
  title: 'Usługi - Izi Serwis',
  description: 'W służbie sztuki kulinarnej',
  alternates: { canonical: '/uslugi' },
}

export default async function ServicesIndexPage() {
  const [services, categories] = await Promise.all([getServices(), getEquipmentCategories()])

  return (
    <>
      <PageHeader
        eyebrow="Usługi"
        title="Kompleksowe wsparcie techniczne dla profesjonalnych kuchni"
        lead="Przeglądy, naprawy awaryjne, instalacje i doradztwo — w całej Polsce."
      />

      <Section>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Jakie usługi świadczymy</h2>
        <RevealGroup className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <RevealItem key={service.slug}>
              <Link
                href={`/uslugi/jakie-uslugi-swiadczymy/${service.slug}`}
                className="group flex h-full flex-col rounded-2xl border border-green-900/10 p-6 transition-all duration-300 motion-safe:hover:-translate-y-1 hover:border-brand-green/40 hover:shadow-lg sm:p-8"
              >
                <h3 className="text-xl font-semibold text-green-900">{service.title}</h3>
                <p className="mt-3 grow text-sm leading-relaxed text-muted sm:text-base">
                  {service.summary}
                </p>
                <span className="mt-6 text-sm font-semibold text-link-green">
                  Dowiedz się więcej
                  <span
                    className="ml-1 inline-block transition-transform duration-300 motion-safe:group-hover:translate-x-1"
                    aria-hidden="true"
                  >
                    →
                  </span>
                </span>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      <Section className="!pt-0">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Co naprawiamy</h2>
        <RevealGroup className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <RevealItem key={category.slug}>
              <Link
                href={`/urzadzenia/${category.slug}`}
                className="flex min-h-20 items-center rounded-xl border border-green-900/10 px-5 py-4 font-medium text-green-900 transition-colors duration-200 hover:border-brand-green/40"
              >
                {category.title}
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>
    </>
  )
}
