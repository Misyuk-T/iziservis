import Link from 'next/link'

import { COMPANY } from '@/domain/company'

export function SiteFooter() {
  return (
    <footer className="on-dark mt-24 bg-green-900 text-text-on-dark">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-3">
        <div>
          <p className="text-lg font-bold">
            IZI <span className="text-brand-green">SERWIS</span>
          </p>
          <address className="mt-4 not-italic leading-relaxed text-text-on-dark/80">
            {COMPANY.legalName}
            <br />
            {COMPANY.street}
            <br />
            {COMPANY.postalCode} {COMPANY.city}
            <br />
            NIP: {COMPANY.nip} · REGON: {COMPANY.regon}
          </address>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-green">Kontakt</h2>
          <ul className="mt-4 space-y-2">
            <li>
              <a href={`tel:${COMPANY.phone}`} className="inline-flex min-h-11 items-center underline-offset-4 hover:underline">
                {COMPANY.phoneDisplay}
              </a>
            </li>
            <li>
              <a href={`mailto:${COMPANY.email}`} className="inline-flex min-h-11 items-center underline-offset-4 hover:underline">
                {COMPANY.email}
              </a>
            </li>
          </ul>
          <p className="mt-4 text-sm text-text-on-dark/70">
            Poniedziałek – Piątek: {COMPANY.opensAt} – {COMPANY.closesAt}
            <br />
            {COMPANY.afterHoursNote}
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-green">Serwis</h2>
          <ul className="mt-4 space-y-2">
            <li><Link href="/urzadzenia" className="inline-flex min-h-11 items-center underline-offset-4 hover:underline">Urządzenia</Link></li>
            <li><Link href="/uslugi" className="inline-flex min-h-11 items-center underline-offset-4 hover:underline">Usługi</Link></li>
            <li><Link href="/centrum-wiedzy" className="inline-flex min-h-11 items-center underline-offset-4 hover:underline">Centrum wiedzy</Link></li>
            <li><Link href="/polityka-cookies" className="inline-flex min-h-11 items-center underline-offset-4 hover:underline">Polityka cookies</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
