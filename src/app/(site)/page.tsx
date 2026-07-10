import type { Metadata } from 'next'
import Image from 'next/image'
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
        AD-15: nothing in this hero animates on mount. No Reveal wrappers here.
        The <h1> (or the priority hero photo) is the LCP element, and Chrome does
        not count an element with opacity:0 as painted — wrapping the fold in
        <Reveal> would defer LCP by the length of the animation and quietly fail
        the Core Web Vitals target. Motion starts at the trust card and below.

        The hero now sits on the page canvas (--color-page), not a dark surface:
        no `on-dark`, no DecorativeGrid.
      */}
      <section className="relative isolate overflow-hidden">
        <Container className="grid items-center gap-10 pb-16 pt-12 sm:pb-20 sm:pt-16 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:pb-28 lg:pt-20">
          <div>
            {/* Green-outlined pill; label in link-green (AAA on the canvas), dot decorative. */}
            <p className="inline-flex items-center gap-2 rounded-full border border-brand-green px-4 py-1.5 text-sm font-semibold text-link-green">
              <span className="size-2 rounded-full bg-brand-green" aria-hidden="true" />
              Profesjonalny serwis · cała Polska
            </p>

            {/*
              "gastronomicznych" stays in text-brand-green (#419D45) ON PURPOSE —
              do not "fix" it to a darker token.

              brand-green measures 3.39:1 on the page canvas (#FEFEFE), which
              FAILS the 4.5:1 bar for normal text but PASSES the 3:1 bar WCAG 2.2
              §1.4.3 grants "large text" (bold ≥ 18.66px / 14pt, or ≥ 24px). This
              word is bold display text at text-4xl (36px) at the SMALLEST
              breakpoint and only grows from there, so the large-text exemption
              applies at every viewport. See tokens.ts (brand-green: nontext-only
              incl. large display accents) and reference-v2-analysis.md.
            */}
            <h1 className="mt-6 text-balance text-4xl font-bold leading-[1.05] tracking-tight text-green-900 sm:text-5xl lg:text-6xl xl:text-7xl">
              Serwis urządzeń <span className="text-brand-green">gastronomicznych</span>
            </h1>

            <p className="mt-6 max-w-xl text-pretty text-lg text-muted">
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

            {/*
              The dark hero's aside (authorized brands + hours) is gone with the
              dark surface. This one quiet line preserves the gist; the full
              hours/brands live in the footer, /kontakt and the carousel below.
            */}
            <p className="mt-6 text-sm text-muted">
              pn – pt {COMPANY.opensAt}–{COMPANY.closesAt} · Autoryzowany serwis{' '}
              {authorized.length} marek
            </p>
          </div>

          {/*
            The client's real photo — the service being sold. Arch/dome mask per
            the reference. `fill` inside a fixed-aspect box means the box reserves
            its height from CSS before the image loads, so there is no layout
            shift (CLS budget) and nothing can overflow the grid cell. `priority`
            keeps it out of the lazy-load path since it may be the LCP element.
            On mobile it stacks BELOW the text (DOM order + single column).
          */}
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-t-[999px] rounded-b-3xl border border-green-900/10 sm:aspect-[3/4]">
            <Image
              src="/hero/serwis-ekspresu.jpg"
              alt="Technik IZI Serwis podczas naprawy ekspresu do kawy"
              fill
              priority
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
          </div>
        </Container>

        {/*
          Trust bar → floating white card overlapping the hero's bottom edge.
          The reference's four items include "24h" and "7 dni w tygodniu", both
          false (OQ-5); these three are the verified claims. This card sits at the
          fold boundary, not above the primary content, so it may animate.
          Icons are inline outline SVGs, stroke in brand-green (nontext, 3:1 ok),
          aria-hidden — no icon library.
        */}
        <Container className="relative z-10 -mt-10 sm:-mt-14">
          <RevealGroup className="grid gap-6 rounded-2xl border border-green-900/10 bg-page p-6 shadow-lg sm:grid-cols-3 sm:gap-8 sm:p-8">
            <RevealItem className="flex items-start gap-4">
              <MapPinIcon />
              <div>
                <p className="font-semibold text-green-900">Doradca dla Twojego regionu</p>
                <p className="mt-1 text-sm text-muted">
                  Zgłoszenie trafia prosto do właściwego województwa
                </p>
              </div>
            </RevealItem>
            <RevealItem className="flex items-start gap-4">
              <ShieldCheckIcon />
              <div>
                <p className="font-semibold text-green-900">Oryginalne części</p>
                <p className="mt-1 text-sm text-muted">Procedury producenta, zachowana gwarancja</p>
              </div>
            </RevealItem>
            <RevealItem className="flex items-start gap-4">
              <WrenchIcon />
              <div>
                <p className="font-semibold text-green-900">Naprawy awaryjne i przeglądy</p>
                <p className="mt-1 text-sm text-muted">Od diagnozy po powrót kuchni do pracy</p>
              </div>
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

/*
 * Trust-card icons. Inline outline SVGs, no icon library. Each is decorative
 * (the adjacent heading carries the meaning) so it is aria-hidden; the stroke
 * is brand-green, which owes only the 3:1 non-text bar and clears it.
 */

const iconProps = {
  className: 'size-6 shrink-0 text-brand-green',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

function MapPinIcon() {
  return (
    <svg {...iconProps}>
      <path d="M12 21c4-4.5 7-8 7-11a7 7 0 1 0-14 0c0 3 3 6.5 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  )
}

function ShieldCheckIcon() {
  return (
    <svg {...iconProps}>
      <path d="M12 3 5 6v5c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

function WrenchIcon() {
  return (
    <svg {...iconProps}>
      <path d="M15 6.5a4 4 0 0 0-5.2 5.2l-5.3 5.3a1.8 1.8 0 0 0 2.5 2.5l5.3-5.3A4 4 0 0 0 17.5 9l-2.4 2.4-2-2L15.5 7Z" />
    </svg>
  )
}
