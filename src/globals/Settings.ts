import type { GlobalConfig } from 'payload'

/**
 * The single source of truth for everything the LocalBusiness node needs
 * (AD-4: structured data is derived, never authored) and for the stats row.
 *
 * FR-3: a stat without a source cannot be published. The design reference
 * asserts `5000+ napraw`, `15+ lat`, `24h czas reakcji`, `100% oryginalne
 * części` — all AI-generated, none sourced, and the live site says `10+ lat`.
 * The `source` field is not rendered; it exists so an unsourced number cannot
 * reach production.
 */
export const Settings: GlobalConfig = {
  slug: 'settings',
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'company',
      type: 'group',
      fields: [
        { name: 'legalName', type: 'text', required: true, defaultValue: 'IZI Serwis' },
        { name: 'street', type: 'text', required: true, defaultValue: 'ul. Urocza 26' },
        { name: 'postalCode', type: 'text', required: true, defaultValue: '04-651' },
        { name: 'city', type: 'text', required: true, defaultValue: 'Warszawa' },
        { name: 'nip', type: 'text', required: true, defaultValue: '5272796292' },
        { name: 'regon', type: 'text', defaultValue: '523058150' },
        { name: 'phone', type: 'text', required: true, defaultValue: '+48786631714' },
        { name: 'email', type: 'email', required: true, defaultValue: 'biuro@iziserwis.pl' },
      ],
    },
    {
      name: 'openingHours',
      type: 'group',
      admin: {
        description:
          'Zasila openingHours w danych strukturalnych (FR-11). Musi odpowiadać rzeczywistości — obecnie pn-pt 08:00-17:00. Zobacz OQ-5.',
      },
      fields: [
        { name: 'opens', type: 'text', required: true, defaultValue: '08:00' },
        { name: 'closes', type: 'text', required: true, defaultValue: '17:00' },
        {
          name: 'days',
          type: 'select',
          hasMany: true,
          required: true,
          defaultValue: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          options: [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday',
          ].map((d) => ({ label: d, value: d })),
        },
        {
          name: 'afterHoursNote',
          type: 'text',
          defaultValue: 'Wybrane awarie obsługujemy również poza godzinami pracy — zapytaj.',
        },
      ],
    },
    {
      name: 'areaServed',
      type: 'text',
      required: true,
      defaultValue: 'Polska',
      admin: {
        description:
          'Zasila areaServed w Service schema (FR-12). Zobacz OQ-1: „Warszawa i okolice” czy cała Polska?',
      },
    },
    {
      name: 'stats',
      type: 'array',
      maxRows: 4,
      admin: { description: 'Wiersz statystyk. Każda liczba wymaga źródła (FR-3).' },
      fields: [
        { name: 'value', type: 'text', required: true },
        { name: 'label', type: 'text', required: true },
        {
          name: 'source',
          type: 'text',
          required: true,
          admin: {
            description:
              'Skąd pochodzi ta liczba? Nie jest renderowane publicznie. Bez źródła nie publikujemy — FR-3.',
          },
          validate: (value: string | null | undefined) =>
            typeof value === 'string' && value.trim().length > 0
              ? true
              : 'Każda statystyka wymaga źródła. Liczby z makiety nie są źródłem.',
        },
      ],
    },
    {
      name: 'trustBar',
      type: 'array',
      maxRows: 4,
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'subtitle', type: 'text' },
        { name: 'icon', type: 'upload', relationTo: 'media' },
      ],
    },
  ],
}
