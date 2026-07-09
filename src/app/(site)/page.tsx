import type { Metadata } from 'next'
import Link from 'next/link'

import { Reveal, RevealGroup, RevealItem } from '@/components/motion/Reveal'
import { Carousel } from '@/components/ui/Carousel'
import { ButtonAnchor, Container, GhostLink, Section } from '@/components/ui/Section'
import { COMPANY } from '@/domain/company'
import { getBrands, getEquipmentCategories } from '@/domain/content'
import { buildLocalBusinessSchema } from '@/domain/schema/localBusiness'

// AD-5: carried over verbatim from the legacy site. These already rank.
export const metadata: Metadata = {
  title: 'Serwis urządzeń gastronomicznych Warszawa | iziserwis.pl',
  description: 'IZI Serwis – serwis urządzeń gastronomicznych, któremu możesz zaufać!',
  alternates: { canonical: '/' },
}

export default async function HomePage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://iziserwis.pl'
  const schema = buildLocalBusinessSchema({ siteUrl })

  const [categories, brands] = await Promise.all([getEquipmentCategories(), getBrands()])
  const authorized = brands.filter((b) => b.authorized)

  return (
    <>
      {/* AD-4: derived from content, never hand-authored. */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      {/*
        Nothing in this hero animates on mount.
        The <h1> is the LCP element, and Chrome does not count an element with
        opacity:0 as painted — wrapping it in <Reveal> would defer LCP by the
        length of the animation and quietly fail the Core Web Vitals target that
        the PRD sets. Motion starts below the fold, where it costs nothing.
      */}
      <section className="on-dark relative isolate overflow-hidden bg-green-900 text-text-on-dark">
        <DecorativeGrid />

        <Container className="grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-[1.15fr_1fr] lg:gap-16 lg:py-28">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-brand-green/40 px-4 py-1.5 text-sm font-medium">
              <span className="size-2 rounded-full bg-brand-green" aria-hidden="true" />
              Serwis w całej Polsce
            </p>

            <h1 className="mt-6 text-balance text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
              Serwis urządzeń <span className="text-brand-green">gastronomicznych</span>
            </h1>

            <p className="mt-6 max-w-xl text-pretty text-lg text-muted-on-dark">
              Profesjonalne naprawy, przeglądy oraz doradztwo w doborze niezawodnego sprzętu do
              każdej kuchni.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              {/* FR-15: one tap, above the fold. */}
              <ButtonAnchor href={`tel:${COMPANY.phone}`}>
                Zadzwoń: {COMPANY.phoneDisplay}
              </ButtonAnchor>
              <GhostLink href="/kontakt">Wyceń naprawę</GhostLink>
            </div>
          </div>

          {/*
            The reference fills this column with a stock photograph. There is no
            photography in the project, and a placeholder would be worse than
            nothing — so it carries the one thing a panicking kitchen manager
            actually wants to see: who we are authorized by, and when we answer.
          */}
          <aside className="rounded-3xl border border-text-on-dark/15 bg-green-800/60 p-6 backdrop-blur-sm sm:p-8">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-green">
              Autoryzowany serwis
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {authorized.map((brand) => (
                <li
                  key={brand.slug}
                  className="rounded-full border border-text-on-dark/20 px-3 py-1.5 text-sm font-medium"
                >
                  {brand.name}
                </li>
              ))}
            </ul>

            <hr className="my-6 border-text-on-dark/15" />

            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-on-dark">Godziny pracy</dt>
                <dd className="text-right font-medium">
                  pn – pt, {COMPANY.opensAt}–{COMPANY.closesAt}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-on-dark">Obszar</dt>
                <dd className="text-right font-medium">Cała {COMPANY.areaServed}</dd>
              </div>
            </dl>

            <p className="mt-5 text-sm text-muted-on-dark">{COMPANY.afterHoursNote}</p>
          </aside>
        </Container>
      </section>

      {/*
        The reference's trust bar reads "Serwis 24/7" and "Serwis 7 dni w
        tygodniu". Both contradict the contact page, so neither ships. See OQ-5.
      */}
      <section className="on-dark bg-green-700 text-text-on-dark">
        <Container>
          <RevealGroup className="grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-3 lg:py-12">
            <RevealItem>
              <p className="font-semibold">Doradca dla Twojego regionu</p>
              <p className="mt-1 text-sm text-muted-on-dark">
                Zgłoszenie trafia prosto do właściwego województwa
              </p>
            </RevealItem>
            <RevealItem>
              <p className="font-semibold">Oryginalne części</p>
              <p className="mt-1 text-sm text-muted-on-dark">
                Procedury producenta, zachowana gwarancja
              </p>
            </RevealItem>
            <RevealItem>
              <p className="font-semibold">Naprawy awaryjne i przeglądy</p>
              <p className="mt-1 text-sm text-muted-on-dark">
                Od diagnozy po powrót kuchni do pracy
              </p>
            </RevealItem>
          </RevealGroup>
        </Container>
      </section>

      {/* FR-13: the five money pages, one click from the homepage. */}
      <Section>
        <Reveal>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Co naprawiamy</h2>
          <p className="mt-3 max-w-xl text-pretty text-muted">
            Od pieca po kostkarkę — znamy każdy centymetr Twojego zaplecza.
          </p>
        </Reveal>

        <RevealGroup className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <RevealItem key={category.slug}>
              <Link
                href={`/urzadzenia/${category.slug}`}
                className="group flex h-full flex-col rounded-2xl border border-green-900/10 p-6 transition-all duration-300 motion-safe:hover:-translate-y-1 hover:border-brand-green/40 hover:shadow-lg sm:p-8"
              >
                <h3 className="text-xl font-semibold text-green-900">{category.title}</h3>
                <p className="mt-3 grow text-pretty text-sm leading-relaxed text-muted">
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

      {/*
        A carousel, not a wrapping grid, because on a phone nine wordmarks
        stacked two-wide push the call to action a screen and a half down. It
        has no autoplay: WCAG 2.2.2 would then owe a pause control, and a logo
        row that moves by itself earns nothing.
      */}
      <Section className="!pt-0">
        <Reveal>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Serwisujemy urządzenia wiodących marek
          </h2>
          <p className="mt-3 max-w-xl text-pretty text-muted">
            Sześć z nich to autoryzowany serwis — z oryginalnymi częściami i zachowaną gwarancją.
          </p>
        </Reveal>

        <Carousel label="Marki, które serwisujemy" className="mt-10">
          {brands.map((brand) => (
            <div
              key={brand.slug}
              className="flex h-full min-h-32 flex-col justify-center rounded-2xl border border-green-900/10 p-5"
            >
              <span className="text-base font-semibold text-green-900">{brand.name}</span>
              {brand.authorized ? (
                <span className="mt-2 text-xs font-semibold text-link-green">
                  Autoryzowany serwis
                </span>
              ) : (
                <span className="mt-2 text-xs text-muted">Marka partnerska</span>
              )}
            </div>
          ))}
        </Carousel>
      </Section>

      <Section dark className="!py-16 lg:!py-20">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">Coś się zepsuło?</h2>
              <p className="mt-3 max-w-xl text-pretty text-muted-on-dark">
                Zadzwoń albo opisz usterkę — odpowiemy, ile potrwa naprawa i ile będzie kosztować.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
              <ButtonAnchor href={`tel:${COMPANY.phone}`}>{COMPANY.phoneDisplay}</ButtonAnchor>
              <GhostLink href="/kontakt">Wyceń naprawę</GhostLink>
            </div>
          </div>
        </Reveal>
      </Section>

      {/*
        The reference's stats row is deliberately absent. FR-3: every figure
        needs a source, and `5000+ napraw` / `15+ lat` / `24h` / `100%` have
        none — the live site says `10+ lat`. It renders once Settings.stats is
        filled in with sources. See OQ-4.
      */}
    </>
  )
}

/** Purely decorative, so it is hidden from assistive technology. */
function DecorativeGrid() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_30%,rgba(65,157,69,0.18),transparent_55%)]" />
      <svg className="absolute inset-0 size-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M48 0H0v48" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  )
}
