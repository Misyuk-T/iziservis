import type { Metadata } from 'next'
import Link from 'next/link'

import { Reveal, RevealGroup, RevealItem } from '@/components/motion/Reveal'
import { PageHeader, Section } from '@/components/ui/Section'
import { getEquipmentCategories } from '@/domain/content'

// AD-5: verbatim from the legacy /uslugi/co-naprawiamy/ page.
export const metadata: Metadata = {
  title: 'Co naprawiamy? - Izi Serwis',
  description: 'Naprawiamy to, na czym opiera się Twoja kuchnia',
  alternates: { canonical: '/urzadzenia' },
}

export default async function EquipmentIndexPage() {
  const categories = await getEquipmentCategories()

  return (
    <>
      <PageHeader
        eyebrow="Co naprawiamy"
        title="Naprawiamy to, na czym opiera się Twoja kuchnia"
        lead="Od pieca po kostkarkę — znamy każdy centymetr Twojego zaplecza."
      />

      <Section>
        <RevealGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <RevealItem key={category.slug}>
              <Link
                href={`/urzadzenia/${category.slug}`}
                className="group flex h-full flex-col rounded-2xl border border-green-900/10 p-6 transition-all duration-300 motion-safe:hover:-translate-y-1 hover:border-brand-green/40 hover:shadow-lg sm:p-8"
              >
                <h2 className="text-xl font-semibold text-green-900 sm:text-2xl">{category.title}</h2>
                <p className="mt-3 grow text-pretty text-sm leading-relaxed text-muted sm:text-base">
                  {category.summary}
                </p>
                <span className="mt-6 text-sm font-semibold text-link-green">
                  Zobacz serwis
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

      <Section dark className="!py-16">
        <Reveal>
          <h2 className="text-2xl font-bold sm:text-3xl">Nie widzisz swojego urządzenia?</h2>
          <p className="mt-3 max-w-xl text-muted-on-dark">
            Serwisujemy znacznie więcej niż pięć kategorii. Napisz, co się zepsuło — odpowiemy, czy
            możemy pomóc.
          </p>
        </Reveal>
      </Section>
    </>
  )
}
