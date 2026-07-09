import Link from 'next/link'

import { COMPANY } from '@/domain/company'

const nav = [
  { href: '/uslugi', label: 'Usługi' },
  { href: '/urzadzenia', label: 'Urządzenia' },
  { href: '/o-firmie', label: 'O firmie' },
  { href: '/uslugi/gdzie-naprawiamy', label: 'Obszar działania' },
  { href: '/centrum-wiedzy', label: 'Centrum wiedzy' },
  { href: '/kontakt', label: 'Kontakt' },
]

/**
 * FR-15: the phone number is a `tel:` link inside the initial mobile viewport,
 * with a 44x44 touch target (WCAG 2.5.8). On a broken-oven search this is the
 * only thing on the page that matters.
 *
 * The nav keeps `Obszar działania` and `Centrum wiedzy`, which the design
 * reference silently dropped. See PRD OQ-7.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-green-900/10 bg-page/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="shrink-0 text-lg font-bold tracking-tight text-green-900">
          IZI <span className="text-brand-green">SERWIS</span>
        </Link>

        <nav aria-label="Główna" className="ml-auto hidden lg:block">
          <ul className="flex items-center gap-6">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm font-medium text-green-900 transition-colors duration-200 hover:text-link-green"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <a
          href={`tel:${COMPANY.phone}`}
          className="ml-auto flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-semibold text-link-green lg:ml-6"
        >
          <span aria-hidden="true">☎</span>
          <span className="hidden sm:inline">{COMPANY.phoneDisplay}</span>
          <span className="sr-only sm:hidden">Zadzwoń: {COMPANY.phoneDisplay}</span>
        </a>

        <Link
          href="/kontakt"
          className="hidden min-h-11 items-center rounded-full bg-action-green px-5 text-sm font-semibold text-text-on-dark transition-transform duration-200 hover:scale-[1.02] sm:flex"
        >
          Wyceń naprawę
        </Link>
      </div>
    </header>
  )
}
