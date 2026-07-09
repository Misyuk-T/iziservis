import type { Metadata } from 'next'

import { Reveal, RevealGroup, RevealItem } from '@/components/motion/Reveal'
import { PageHeader, Prose, Section } from '@/components/ui/Section'
import { getVoivodeships } from '@/domain/content'

export const metadata: Metadata = {
  title: 'Gdzie naprawiamy? - Izi Serwis',
  description: 'W całej Polsce',
  alternates: { canonical: '/uslugi/gdzie-naprawiamy' },
}

export default async function CoveragePage() {
  const voivodeships = await getVoivodeships()

  return (
    <>
      <PageHeader
        eyebrow="Obszar działania"
        title="Gdzie naprawiamy?"
        lead="Dostarczamy wsparcie techniczne tam, gdzie kuchnia musi działać bez przerwy — w całej Polsce."
      />

      <Section>
        <Reveal>
          <Prose>
            <p>
              Obsługujemy wszystkie 16 województw. Każdy region ma przypisanego doradcę — wybierz
              swoje województwo w formularzu kontaktowym, a zgłoszenie trafi bezpośrednio do niego.
            </p>
          </Prose>
        </Reveal>

        <RevealGroup className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {voivodeships.map((v) => (
            <RevealItem key={v.slug}>
              <div className="flex min-h-16 items-center rounded-xl border border-green-900/10 px-4 font-medium text-green-900">
                {v.name}
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>
    </>
  )
}
