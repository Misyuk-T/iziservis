import type { Metadata } from 'next'

import { Reveal } from '@/components/motion/Reveal'
import { PageHeader, Section } from '@/components/ui/Section'
import { getFaqEntries, groupFaqByTopic } from '@/domain/content'
import { buildFaqSchema } from '@/domain/schema/localBusiness'

export const metadata: Metadata = {
  title: 'Centrum wiedzy - Izi Serwis',
  description: 'Masz pytanie? Zobacz, czy już na nie odpowiedzieliśmy.',
  alternates: { canonical: '/centrum-wiedzy' },
}

export default async function KnowledgeCentrePage() {
  const entries = await getFaqEntries()
  const groups = groupFaqByTopic(entries)

  // FR-12: generated from the entries, so the schema cannot drift from the page.
  const schema = buildFaqSchema(entries.map((e) => ({ question: e.question, answer: e.answer })))

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <PageHeader
        eyebrow="Centrum wiedzy"
        title="Masz pytanie? Zobacz, czy już na nie odpowiedzieliśmy."
        lead={`${entries.length} odpowiedzi na najczęstsze pytania o serwis urządzeń gastronomicznych.`}
      />

      <Section>
        <div className="space-y-14">
          {groups.map((group) => (
            <Reveal key={group.topic}>
              <section aria-labelledby={`topic-${slugId(group.topic)}`}>
                <h2
                  id={`topic-${slugId(group.topic)}`}
                  className="text-xl font-bold tracking-tight text-green-900 sm:text-2xl"
                >
                  {group.topic}
                </h2>

                {/*
                  Native <details>/<summary>. A hand-rolled accordion would owe
                  aria-expanded, aria-controls, Enter/Space handling and Escape;
                  the element gives all of it, keeps find-in-page working, and
                  degrades to open when JavaScript never arrives.
                */}
                <div className="mt-5 divide-y divide-green-900/10 border-y border-green-900/10">
                  {group.entries.map((entry) => (
                    <details key={entry.id} className="group py-1">
                      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 text-left font-medium text-green-900 [&::-webkit-details-marker]:hidden">
                        <span className="text-pretty">{entry.question}</span>
                        <span
                          aria-hidden="true"
                          className="shrink-0 text-xl leading-none text-brand-green transition-transform duration-300 group-open:rotate-45"
                        >
                          +
                        </span>
                      </summary>
                      <p className="pb-4 pr-8 text-pretty leading-relaxed text-muted">
                        {entry.answer}
                      </p>
                    </details>
                  ))}
                </div>
              </section>
            </Reveal>
          ))}
        </div>
      </Section>
    </>
  )
}

const slugId = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
