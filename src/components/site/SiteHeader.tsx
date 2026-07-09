import Link from 'next/link'

import { COMPANY } from '@/domain/company'

import { MobileMenu } from './MobileMenu'

/**
 * The nav keeps `Obszar działania` and `Centrum wiedzy`, which the design
 * reference silently dropped. See PRD OQ-7.
 *
 * `Urządzenia` is promoted to top level (FR-13): those five pages already rank
 * for the local commercial queries and used to sit two clicks deep.
 */
const NAV = [
  { href: '/uslugi', label: 'Usługi' },
  { href: '/urzadzenia', label: 'Urządzenia' },
  { href: '/o-firmie', label: 'O firmie' },
  { href: '/uslugi/gdzie-naprawiamy', label: 'Obszar działania' },
  { href: '/centrum-wiedzy', label: 'Centrum wiedzy' },
  { href: '/kontakt', label: 'Kontakt' },
]

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 shrink-0" fill="currentColor">
      <path d="M6.6 10.8a15.1 15.1 0 006.6 6.6l2.2-2.2a1 1 0 011-.24 11.4 11.4 0 003.6.58 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.6a1 1 0 01-.25 1l-2.2 2.2z" />
    </svg>
  )
}

export function SiteHeader() {
  return (
    // h-16 must equal --header-h in globals.css; the mobile panel offsets
    // against it, so the two can never disagree about where the header ends.
    <header className="sticky top-0 z-50 h-16 border-b border-green-900/10 bg-page/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        {/*
          `text-xl` is load-bearing, not taste. brand-green measures 3.39:1 on
          white, which clears WCAG's 3:1 bar for *large* text but not the 4.5:1
          for normal text. Large means >=18.66px bold; text-lg is 18px and fails,
          text-xl is 20px and passes. (WCAG exempts logotypes outright, but axe
          cannot know that, and AD-11 forbids a suppression file.)
        */}
        <Link href="/" className="shrink-0 text-xl font-bold tracking-tight text-green-900">
          IZI <span className="text-brand-green">SERWIS</span>
        </Link>

        <nav aria-label="Główna" className="mx-auto hidden lg:block">
          <ul className="flex items-center gap-6">
            {NAV.map((item) => (
              <li key={item.href}>
                {/* inline-flex + min-h-11 gives the link a real hit area; the
                    bare text node was 17px tall and failed WCAG 2.2 §2.5.8. */}
                <Link
                  href={item.href}
                  className="inline-flex min-h-11 items-center text-sm font-medium text-green-900 transition-colors duration-200 hover:text-link-green"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* FR-15: reachable in one tap, inside the initial viewport, 44px target. */}
        <a
          href={`tel:${COMPANY.phone}`}
          className="ml-auto flex min-h-11 items-center gap-2 rounded-full px-2 text-sm font-semibold text-link-green sm:px-3 lg:ml-0"
        >
          <PhoneIcon />
          <span className="hidden sm:inline">{COMPANY.phoneDisplay}</span>
          <span className="sr-only sm:hidden">Zadzwoń: {COMPANY.phoneDisplay}</span>
        </a>

        <Link
          href="/kontakt"
          className="hidden min-h-11 items-center rounded-full bg-action-green px-5 text-sm font-semibold text-text-on-dark transition-transform duration-200 motion-safe:hover:scale-[1.02] lg:ml-4 lg:flex"
        >
          Wyceń naprawę
        </Link>

        <MobileMenu items={NAV} />
      </div>
    </header>
  )
}
