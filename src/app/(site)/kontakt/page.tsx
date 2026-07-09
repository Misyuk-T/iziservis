import type { Metadata } from 'next'

import { Reveal } from '@/components/motion/Reveal'
import { PageHeader, Section } from '@/components/ui/Section'
import { COMPANY } from '@/domain/company'
import { getVoivodeships } from '@/domain/content'

import { ContactForm } from './ContactForm'

// FR-10: the legacy page had no <h1>. It has one now. Metadata carried verbatim.
export const metadata: Metadata = {
  title: 'Kontakt - Izi Serwis',
  description: 'jesteśmy tu, żeby pomóc!',
  alternates: { canonical: '/kontakt' },
}

export default async function ContactPage() {
  const voivodeships = await getVoivodeships()

  return (
    <>
      <PageHeader
        eyebrow="Kontakt"
        title="Skontaktuj się z nami"
        lead="Zgłoś usterkę, zapytaj o termin lub poproś o wycenę. Jesteśmy tu, żeby pomóc."
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          <div>
            <h2 className="text-xl font-bold text-green-900 sm:text-2xl">Dane kontaktowe</h2>

            <dl className="mt-6 space-y-5 text-muted">
              <div>
                <dt className="text-sm font-semibold uppercase tracking-wide text-link-green">Telefon</dt>
                <dd className="mt-1">
                  <a href={`tel:${COMPANY.phone}`} className="inline-flex min-h-11 items-center text-lg font-medium text-green-900 underline-offset-4 hover:underline">
                    {COMPANY.phoneDisplay}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-semibold uppercase tracking-wide text-link-green">E-mail</dt>
                <dd className="mt-1">
                  <a href={`mailto:${COMPANY.email}`} className="inline-flex min-h-11 items-center underline-offset-4 hover:underline">
                    {COMPANY.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-semibold uppercase tracking-wide text-link-green">Adres</dt>
                <dd className="mt-1">
                  <address className="not-italic leading-relaxed">
                    {COMPANY.legalName}<br />
                    {COMPANY.street}<br />
                    {COMPANY.postalCode} {COMPANY.city}<br />
                    NIP: {COMPANY.nip} · REGON: {COMPANY.regon}
                  </address>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-semibold uppercase tracking-wide text-link-green">Godziny pracy</dt>
                <dd className="mt-1 leading-relaxed">
                  Poniedziałek – Piątek: {COMPANY.opensAt} – {COMPANY.closesAt}
                  <br />
                  <span className="text-muted">{COMPANY.afterHoursNote}</span>
                </dd>
              </div>
            </dl>
          </div>

          <Reveal>
            <div>
              <h2 className="text-xl font-bold text-green-900 sm:text-2xl">Zostaw wiadomość</h2>
              <p className="mt-2 text-muted">
                Wybierz województwo — zgłoszenie trafi prosto do doradcy z Twojego regionu.
              </p>
              <div className="mt-8">
                <ContactForm voivodeships={voivodeships} />
              </div>
            </div>
          </Reveal>
        </div>
      </Section>
    </>
  )
}
