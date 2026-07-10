import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { Reveal, RevealGroup, RevealItem } from '@/components/motion/Reveal'
import { Carousel } from '@/components/ui/Carousel'
import { ButtonAnchor, ButtonLink, Container, GhostLink, Section } from '@/components/ui/Section'
import { COMPANY } from '@/domain/company'
import { getBrands, getEquipmentCategories } from '@/domain/content'
import { buildLocalBusinessSchema } from '@/domain/schema/localBusiness'

// AD-5: carried over verbatim from the legacy site. These already rank.
export const metadata: Metadata = {
  title: 'Serwis urządzeń gastronomicznych Warszawa | iziserwis.pl',
  description: 'IZI Serwis – serwis urządzeń gastronomicznych, któremu możesz zaufać!',
  alternates: { canonical: '/' },
}

/**
 * "Jak działamy" — the quote-driven flow. Every claim is source-checked:
 *   1. mirrors the trust card (regional advisor, faq.json §Lokalizacje) plus the
 *      phone/form intake the /kontakt form provides;
 *   2–4. the diagnose → quote → repair sequence the whole site is built on:
 *      the "Wyceń naprawę" hero CTA, the dark CTA's "ile będzie kosztować", and
 *      faq.json "Zawsze informujemy o opłacalności naprawy".
 * No response times and no warranty promises — none are sourced.
 */
const PROCESS_STEPS = [
  { n: '1', title: 'Zgłoszenie', body: 'Telefon lub formularz — zgłoszenie trafia do doradcy Twojego regionu.' },
  { n: '2', title: 'Diagnoza', body: 'Technik ustala przyczynę usterki.' },
  { n: '3', title: 'Wycena i akceptacja', body: 'Otrzymujesz koszt naprawy przed rozpoczęciem prac.' },
  { n: '4', title: 'Naprawa', body: 'Przywracamy kuchnię do pracy.' },
] as const

/**
 * FR-20 client logos. Assets are the client's own, already published on
 * iziserwis.pl. Dimensions are the real files (no CLS). Alt text was written
 * after looking at each PNG, so it names the mark that is actually there.
 * OQ-12 (logo-reuse permission) is pending — shippable because the client
 * already publishes these same logos on the same domain.
 */
const CLIENT_LOGOS = [
  { src: '/zaufali/nbp.png', alt: 'Logo Narodowy Bank Polski', width: 360, height: 248 },
  { src: '/zaufali/hampton.png', alt: 'Logo Hampton by Hilton', width: 360, height: 232 },
  { src: '/zaufali/tchibo.png', alt: 'Logo Tchibo', width: 360, height: 360 },
  { src: '/zaufali/grycan.png', alt: 'Logo Grycan – lody od pokoleń', width: 480, height: 141 },
  { src: '/zaufali/nice-fit.png', alt: 'Logo Nice To Fit You', width: 360, height: 248 },
  { src: '/zaufali/cvi.png', alt: 'Logo CFI Hotels Group', width: 360, height: 248 },
  { src: '/zaufali/arche-lochow.png', alt: 'Logo Pałac i Folwark Arche Łochów', width: 224, height: 224 },
  { src: '/zaufali/hotel.png', alt: 'Logo Hotel Afrodyta Business & Spa', width: 360, height: 248 },
  { src: '/zaufali/arigator.png', alt: 'Logo Arigator Ramen Shop', width: 360, height: 248 },
  { src: '/zaufali/dziurka-od-klucza.png', alt: 'Logo restauracji Dziurka od Klucza', width: 360, height: 248 },
  { src: '/zaufali/santorini.png', alt: 'Logo restauracji Santorini', width: 360, height: 248 },
] as const

/**
 * Category icons (FR-13). Mapped by slug because Supabase Storage isn't wired
 * yet — the CMS `icon` field on equipment-categories exists for later, but until
 * a media pipeline backs it these are the client's own legacy line-art assets
 * shipped statically in /public/icons. Each is decorative (the card title next
 * to it carries the meaning), so it renders with alt="". Slugs that have no icon
 * (the service pages) simply render no image.
 */
const CATEGORY_ICONS: Record<string, string> = {
  'piece-konwekcyjno-parowe': '/icons/piece.png',
  'zmywarki-gastronomiczne': '/icons/zmywarki.png',
  'ekspresy-i-urzadzenia-barowe': '/icons/ekspresy.png',
  'urzadzenia-chlodnicze': '/icons/chlodnicze.png',
  'urzadzenia-grzewcze': '/icons/grzewcze.png',
}

/**
 * The bento feature card. The piece-konwekcyjno-parowe page is the highest-value
 * money page, so on lg it spans two columns and carries one extra descriptive
 * sentence. The sentence is scope, not an unsourced promise (no times, no
 * warranty claims — see the PROCESS_STEPS source-check note).
 */
const FEATURED_SLUG = 'piece-konwekcyjno-parowe'
const FEATURED_EXTRA =
  'Serce każdej profesjonalnej kuchni — od diagnostyki elektroniki po wymianę uszczelek i kalibrację komory.'

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

        ROOT CAUSE of the clipped trust-card shadow (client feedback): this
        section used to carry `overflow-hidden`. The trust card overlaps the
        hero's bottom edge with a negative margin, so its box-shadow extended
        past the section box — and `overflow-hidden` sheared it off at the
        section boundary (a hard edge on the sides that cross it, shadow intact
        elsewhere). The clip was never needed here: the only thing that must be
        clipped is the arch photo, which already clips itself via its own
        `overflow-hidden` wrapper below. So the section-level clip is removed,
        and the card now lives in the mist band below (its own un-clipped
        stacking context), lifted with `relative z-10` + `shadow-xl`.
      */}
      <section className="relative isolate">
        <Container className="grid items-center gap-10 pb-20 pt-12 sm:pb-24 sm:pt-16 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:pb-32 lg:pt-20">
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
      </section>

      {/*
        ONE mist band: the floating trust card + "Co naprawiamy". The band is
        the section separation the client asked for — the white card lands on
        mist (not on white-on-white), and the equipment cards below get bg-page
        so they pop off the tint. `!pt-0` lets the trust card's negative margin
        lift it up over the hero seam without the band's top padding fighting it.
      */}
      <Section tone="mist" className="!pt-0">
        {/*
          Trust bar → floating white card overlapping the hero's bottom edge.
          The reference's four items include "24h" and "7 dni w tygodniu", both
          false (OQ-5); these three are the verified claims. This card sits at the
          fold boundary, not above the primary content, so it may animate.
          `relative z-10` lifts it over the hero; `shadow-xl` reads on the mist.
          Icons are inline outline SVGs, stroke in brand-green — 3:1 non-text on
          the card's bg-page (NOT on mist, where brand-green is a banned 2.98:1),
          aria-hidden, no icon library.
        */}
        {/*
          Straddle the seam with a TRANSFORM, not a negative margin. The band
          runs `!pt-0` so nothing fights the lift — but that also removes the top
          padding that would stop a negative `margin-top` from collapsing THROUGH
          the section and dragging the mist background up with the card (which is
          exactly what left it flush at the seam before). `translate-y` moves only
          the paint, not the box, so the mist band stays put and the card floats
          half over the hero's white, half over the mist. No overflow-hidden
          ancestor clips the shadow, which now reads on both backgrounds.
        */}
        <div className="relative z-10 -translate-y-12 sm:-translate-y-16 lg:-translate-y-20">
          <RevealGroup className="grid gap-6 rounded-2xl border border-green-900/10 bg-page p-6 shadow-xl sm:grid-cols-3 sm:gap-8 sm:p-8">
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
        </div>

        {/*
          FR-13: the five money pages, one click from the homepage. The pt here
          is deliberately modest — the trust card's `translate-y` already leaves
          its lifted-off height as breathing room above this block, so pt + that
          lift together give the generous seam-to-content gap without a chasm.
        */}
        <div className="pt-6 sm:pt-8 lg:pt-10">
          <Reveal>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Co naprawiamy</h2>
            {/* Heading (green-900, 14.9:1) and lead (muted, 5.99:1) sit directly on mist — both clear AA. */}
            <p className="mt-3 max-w-xl text-pretty text-muted">
              Od pieca po kostkarkę — znamy każdy centymetr Twojego zaplecza.
            </p>
          </Reveal>

          {/*
            Bento, not a parade: the featured money page (piece-konwekcyjno-
            parowe) spans two columns on lg with a larger icon and one extra
            sentence; the other four are regular cards in the 3-col grid, so the
            top row reads 2+1 and the bottom row 3 — no empty cell. Every card
            carries its category icon (client's own legacy line-art, decorative
            alt=""), which is what stops the block from being text-only.
          */}
          <RevealGroup className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => {
              const isFeatured = category.slug === FEATURED_SLUG
              const icon = CATEGORY_ICONS[category.slug]
              return (
                <RevealItem key={category.slug} className={isFeatured ? 'lg:col-span-2' : undefined}>
                  {/* bg-page so the card pops off the mist band (and keeps the link-green CTA on white). */}
                  <Link
                    href={`/urzadzenia/${category.slug}`}
                    className="group flex h-full flex-col rounded-2xl border border-green-900/10 bg-page p-6 transition-all duration-300 motion-safe:hover:-translate-y-1 hover:border-brand-green/40 hover:shadow-lg sm:p-8"
                  >
                    {icon ? (
                      <Image
                        src={icon}
                        alt=""
                        width={isFeatured ? 80 : 64}
                        height={isFeatured ? 80 : 64}
                        loading="lazy"
                        className={isFeatured ? 'mb-5 size-20' : 'mb-4 size-16'}
                      />
                    ) : null}
                    <h3 className={`font-semibold text-green-900 ${isFeatured ? 'text-2xl' : 'text-xl'}`}>
                      {category.title}
                    </h3>
                    <p className="mt-3 text-pretty text-sm leading-relaxed text-muted">
                      {category.summary}
                    </p>
                    {isFeatured ? (
                      <p className="mt-2 max-w-md text-pretty text-sm leading-relaxed text-muted">
                        {FEATURED_EXTRA}
                      </p>
                    ) : null}
                    <span className="mt-auto pt-6 text-sm font-semibold text-link-green">
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
              )
            })}
          </RevealGroup>
        </div>
      </Section>

      {/*
        "Jak działamy" — the four-step, quote-driven flow (PROCESS_STEPS above
        carries the source-check for each claim). Below the fold, so Reveal is
        allowed. No card boxes: a connected timeline reads as a process, not a
        grid of four identical rectangles (the "empty boxes" complaint). The
        section stays on the page canvas so the numbered chips can be bg-mist
        circles — and the numeral is LINK-green, the sanctioned 6.27:1 pairing
        on mist (brand-green on mist is a banned 2.98:1; see tokens.ts and
        tests/contrast/tokens.test.ts). The connector hairline is a non-text
        border tint (green-900/10), horizontal across the chips on lg and a
        vertical left-aligned rail below it.
      */}
      <Section>
        <Reveal>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Jak działamy</h2>
          <p className="mt-3 max-w-xl text-pretty text-muted">
            Od zgłoszenia po powrót kuchni do pracy — w czterech krokach, bez niespodzianek.
          </p>
        </Reveal>

        <RevealGroup className="relative mt-14 grid gap-y-8 lg:grid-cols-4 lg:gap-x-8">
          {/* lg: one horizontal hairline linking the chip centres (chips sit on top). */}
          <div
            aria-hidden="true"
            className="absolute inset-x-[12.5%] top-7 hidden h-px bg-green-900/10 lg:block"
          />
          {PROCESS_STEPS.map((step, i) => (
            <RevealItem
              key={step.n}
              className="relative flex items-start gap-4 lg:flex-col lg:items-center lg:gap-0 lg:text-center"
            >
              {/* below lg: a vertical rail from this chip down to the next. */}
              {i < PROCESS_STEPS.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="absolute left-7 top-7 h-[calc(100%+2rem)] w-px -translate-x-1/2 bg-green-900/10 lg:hidden"
                />
              ) : null}
              <span className="relative z-10 flex size-14 shrink-0 items-center justify-center rounded-full bg-mist text-2xl font-bold text-link-green">
                {step.n}
              </span>
              <div className="lg:mt-5">
                <h3 className="text-xl font-semibold text-green-900">{step.title}</h3>
                <p className="mt-2 max-w-xs text-pretty text-sm leading-relaxed text-muted">
                  {step.body}
                </p>
              </div>
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
      <Section tone="mist">
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
            // bg-page so the card (and its link-green "Autoryzowany serwis" label) reads on the mist band.
            <div
              key={brand.slug}
              className="flex h-full min-h-[88px] flex-col items-center justify-center rounded-2xl border border-green-900/10 bg-page p-4 text-center"
            >
              <span className="text-lg font-semibold text-green-900">{brand.name}</span>
              {brand.authorized ? (
                <span className="mt-1 text-xs font-semibold text-link-green">Autoryzowany serwis</span>
              ) : (
                <span className="mt-1 text-xs text-muted">Marka partnerska</span>
              )}
            </div>
          ))}
        </Carousel>
      </Section>

      {/*
        FR-19 / PRD §4.6: the sales-and-distribution path, surfaced on the
        homepage. Copy is source-checked — the advisory claim is faq.json
        ("doradzamy przy wyborze nowych urządzeń … ergonomia, parametry
        techniczne i budżet"); "dystrybutor wiodących marek" is the legacy
        homepage wording, also carried by src/seed/index.ts's
        dobor-i-sprzedaz-sprzetu service. Quote-driven, no catalog or prices
        (OQ-10). Secondary text on this dark band uses text-muted-on-dark.
      */}
      <Section dark>
        <Reveal>
          {/*
            The dark band was text-only. It now carries the client's own kitchen-
            crew photo as a rounded image column on lg (text left, image right);
            on mobile the image drops below the text at a capped 16/9. Copy and
            CTAs are unchanged. The photo is decorative-adjacent but meaningful
            here (it shows the professional-kitchen context the copy sells), so
            it gets a real alt and lazy-loads well below the fold.
          */}
          <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-14">
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">
                Nie tylko serwis — dobór i sprzedaż sprzętu
              </h2>
              <p className="mt-3 max-w-2xl text-pretty text-muted-on-dark">
                Doradzamy przy wyborze nowych urządzeń — ergonomia, parametry techniczne i budżet —
                i jesteśmy dystrybutorem wiodących marek.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="/uslugi/jakie-uslugi-swiadczymy/dobor-i-sprzedaz-sprzetu">
                  Dobór i sprzedaż sprzętu
                </ButtonLink>
                <GhostLink href="/kontakt">Zapytaj o urządzenie</GhostLink>
              </div>
            </div>
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl lg:aspect-[4/3]">
              <Image
                src="/hero/kuchnia-zespol.jpg"
                alt="Zespół kucharzy w profesjonalnej kuchni gastronomicznej"
                fill
                loading="lazy"
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </Reveal>
      </Section>

      {/*
        FR-20: "Zaufali nam" restored from the legacy homepage. The claim
        sentence is the legacy site's own, not invented; the logos are the
        client's own assets (CLIENT_LOGOS above). Bordered cards echo the brand
        carousel; each logo is next/image with real width/height (no CLS) and
        lazy-loaded (below the fold).
      */}
      <Section>
        <Reveal>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Zaufali nam</h2>
          <p className="mt-3 max-w-2xl text-pretty text-muted">
            Od początku istnienia IZI Serwis zaufały nam zarówno znane restauracje i hotele, jak i
            duże instytucje publiczne.
          </p>
        </Reveal>

        <RevealGroup className="mt-12 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {CLIENT_LOGOS.map((logo) => (
            <RevealItem
              key={logo.src}
              className="flex min-h-28 items-center justify-center rounded-2xl border border-green-900/10 p-6"
            >
              <Image
                src={logo.src}
                alt={logo.alt}
                width={logo.width}
                height={logo.height}
                loading="lazy"
                sizes="(min-width: 1024px) 22vw, (min-width: 768px) 30vw, 45vw"
                className="max-h-16 w-full max-w-44 object-contain"
              />
            </RevealItem>
          ))}
        </RevealGroup>
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
