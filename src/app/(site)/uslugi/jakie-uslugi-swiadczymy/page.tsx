import type { Metadata } from 'next'
import Link from 'next/link'

import { RevealGroup, RevealItem } from '@/components/motion/Reveal'
import { PageHeader, Section } from '@/components/ui/Section'
import { getServices } from '@/domain/content'

export const metadata: Metadata = {
  title: 'Jakie usługi świadczymy? - Izi Serwis',
  description: 'Nasze usługi – precyzyjne, niezawodne i dopasowane do Twoich potrzeb',
  alternates: { canonical: '/uslugi/jakie-uslugi-swiadczymy' },
}

export default async function ServiceListPage() {
  const services = await getServices()

  return (
    <>
      <PageHeader
        eyebrow="Usługi"
        title="Jakie usługi świadczymy?"
        lead="Nasze usługi – precyzyjne, niezawodne i dopasowane do Twoich potrzeb."
      />

      <Section>
        <RevealGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <RevealItem key={service.slug}>
              <Link
                href={`/uslugi/jakie-uslugi-swiadczymy/${service.slug}`}
                className="group flex h-full flex-col rounded-2xl border border-green-900/10 p-6 transition-all duration-300 motion-safe:hover:-translate-y-1 hover:border-brand-green/40 hover:shadow-lg sm:p-8"
              >
                <h2 className="text-xl font-semibold text-green-900">{service.title}</h2>
                <p className="mt-3 grow text-sm leading-relaxed text-muted sm:text-base">
                  {service.summary}
                </p>
                <span className="mt-6 text-sm font-semibold text-link-green">
                  Dowiedz się więcej
                  <span className="ml-1 inline-block transition-transform duration-300 motion-safe:group-hover:translate-x-1" aria-hidden="true">→</span>
                </span>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>
    </>
  )
}
