import type { Metadata } from 'next'
import Link from 'next/link'

import { Reveal, RevealGroup, RevealItem } from '@/components/motion/Reveal'
import { COMPANY } from '@/domain/company'
import { buildLocalBusinessSchema } from '@/domain/schema/localBusiness'

// AD-5: carried over verbatim from the legacy site. These already rank.
export const metadata: Metadata = {
  title: 'Serwis urządzeń gastronomicznych Warszawa | iziserwis.pl',
  description: 'IZI Serwis – serwis urządzeń gastronomicznych, któremu możesz zaufać!',
  alternates: { canonical: '/' },
}

const equipment = [
  { slug: 'piece-konwekcyjno-parowe', title: 'Piece konwekcyjno-parowe' },
  { slug: 'zmywarki-gastronomiczne', title: 'Zmywarki gastronomiczne' },
  { slug: 'ekspresy-i-urzadzenia-barowe', title: 'Ekspresy i urządzenia barowe' },
  { slug: 'urzadzenia-chlodnicze', title: 'Urządzenia chłodnicze' },
  { slug: 'urzadzenia-grzewcze', title: 'Urządzenia grzewcze' },
]

export default function HomePage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://iziserwis.pl'
  const schema = buildLocalBusinessSchema({ siteUrl })

  return (
    <>
      {/* AD-4: derived from content, never hand-authored. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <section className="on-dark relative isolate overflow-hidden bg-green-900 text-text-on-dark">
        {/*
          FR-6: the reference lays white text straight onto a busy kitchen
          photograph. Once a photo lands here it sits behind this scrim, which
          is what buys the 4.5:1 the `<h1>` owes.
        */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-green-900 via-green-900/95 to-green-900/70" />

        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <Reveal>
            <p className="inline-flex items-center gap-2 rounded-full border border-brand-green/40 px-4 py-1.5 text-sm font-medium">
              <span className="size-2 rounded-full bg-brand-green" aria-hidden="true" />
              Serwis w całej Polsce
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Serwis urządzeń <span className="text-brand-green">gastronomicznych</span>
            </h1>
          </Reveal>

          <Reveal delay={0.16}>
            <p className="mt-6 max-w-xl text-lg text-text-on-dark/85">
              Profesjonalne naprawy, przeglądy oraz doradztwo w doborze niezawodnego sprzętu do
              każdej kuchni.
            </p>
          </Reveal>

          <Reveal delay={0.24}>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              {/* FR-15: one tap, above the fold, 44px target. */}
              <a
                href={`tel:${COMPANY.phone}`}
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-action-green px-7 font-semibold text-text-on-dark transition-transform duration-200 hover:scale-[1.02]"
              >
                Zadzwoń: {COMPANY.phoneDisplay}
              </a>
              <Link
                href="/kontakt"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-text-on-dark/30 px-7 font-semibold transition-colors duration-200 hover:bg-text-on-dark/10"
              >
                Wyceń naprawę
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/*
        The reference's trust bar reads "Serwis 24/7" and "Serwis 7 dni w
        tygodniu". Both contradict the contact page, so neither ships. What is
        here is what the live site actually claims. See PRD OQ-5.
      */}
      <section className="on-dark bg-green-700 text-text-on-dark">
        <RevealGroup className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
          <RevealItem>
            <p className="font-semibold">Serwis w całej Polsce</p>
            <p className="text-sm text-text-on-dark/75">Doradca przypisany do Twojego województwa</p>
          </RevealItem>
          <RevealItem>
            <p className="font-semibold">Autoryzowany serwis</p>
            <p className="text-sm text-text-on-dark/75">Bartscher, Convotherm, Electrolux, Hobart, Astoria, Unic</p>
          </RevealItem>
          <RevealItem>
            <p className="font-semibold">
              {COMPANY.opensAt} – {COMPANY.closesAt}, pn – pt
            </p>
            <p className="text-sm text-text-on-dark/75">{COMPANY.afterHoursNote}</p>
          </RevealItem>
        </RevealGroup>
      </section>

      {/* FR-13: the five money pages, one click from the homepage. */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <Reveal>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Co naprawiamy</h2>
        </Reveal>

        <RevealGroup className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {equipment.map((item) => (
            <RevealItem key={item.slug}>
              <Link
                href={`/urzadzenia/${item.slug}`}
                className="group flex min-h-32 flex-col justify-end rounded-2xl border border-green-900/10 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-green/40 hover:shadow-lg"
              >
                <span className="text-lg font-semibold text-green-900">{item.title}</span>
                <span className="mt-1 text-sm font-medium text-link-green">
                  Zobacz serwis
                  <span className="ml-1 inline-block transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">
                    →
                  </span>
                </span>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/*
        The stats row from the reference is deliberately absent. FR-3: every
        figure needs a source, and `5000+ napraw` / `15+ lat` / `24h` / `100%`
        have none — the live site says `10+ lat`. It renders once Settings.stats
        is filled in with sources. See PRD OQ-4.
      */}
    </>
  )
}
