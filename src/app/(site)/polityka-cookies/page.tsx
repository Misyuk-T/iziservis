import type { Metadata } from 'next'

import { PageHeader, Prose, Section } from '@/components/ui/Section'
import { COMPANY } from '@/domain/company'

/**
 * FR-10: the legacy page has neither an <h1> nor a meta description. Both are
 * written here rather than carried over, because there was nothing to carry.
 */
export const metadata: Metadata = {
  title: 'Polityka cookies - Izi Serwis',
  description:
    'Jak IZI Serwis wykorzystuje pliki cookies i przetwarza dane osobowe przesłane przez formularz kontaktowy.',
  alternates: { canonical: '/polityka-cookies' },
}

export default function CookiePolicyPage() {
  return (
    <>
      <PageHeader eyebrow="Dokumenty" title="Polityka cookies" />

      <Section>
        <Prose>
          <h2 className="text-xl font-bold text-green-900">Pliki cookies</h2>
          <p>
            Serwis wykorzystuje pliki cookies niezbędne do jego działania. Cookies analityczne i
            marketingowe uruchamiamy wyłącznie po wyrażeniu zgody — do tego czasu żaden skrypt
            śledzący się nie ładuje.
          </p>

          <h2 className="pt-4 text-xl font-bold text-green-900">Dane z formularza</h2>
          <p>
            Dane przesłane przez formularz kontaktowy przetwarzamy wyłącznie w celu obsługi
            zgłoszenia. Administratorem danych jest {COMPANY.legalName}, {COMPANY.street},{' '}
            {COMPANY.postalCode} {COMPANY.city}, NIP {COMPANY.nip}.
          </p>
          <p>
            Masz prawo dostępu do swoich danych, ich sprostowania, usunięcia oraz ograniczenia
            przetwarzania. W sprawach dotyczących danych osobowych napisz na{' '}
            <a href={`mailto:${COMPANY.email}`} className="font-medium text-link-green underline underline-offset-2">
              {COMPANY.email}
            </a>
            .
          </p>

          {/* PRD OQ-9: retention period unspecified by the client. Not asserted here. */}
        </Prose>
      </Section>
    </>
  )
}
