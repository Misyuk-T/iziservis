import type { Field } from 'payload'

/**
 * AD-5: legacy metadata is data, not generated output.
 *
 * The 22 hand-written, non-duplicated titles and descriptions on the legacy
 * site already rank. They are seeded from docs/source/content-inventory.md and
 * read verbatim by `generateMetadata`. `@payloadcms/plugin-seo` is deliberately
 * absent: its generation affordances invite exactly the regeneration this
 * forbids.
 */
export const seoFields: Field = {
  name: 'seo',
  type: 'group',
  label: 'SEO',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      maxLength: 70,
      admin: {
        description:
          'Przeniesione dosłownie ze starej strony. Nie generuj ponownie — te tytuły już rankują.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      maxLength: 165,
      admin: { description: 'Przeniesiony dosłownie ze starej strony.' },
    },
  ],
}

/** Every content type that renders as a page carries these. */
export const slugField: Field = {
  name: 'slug',
  type: 'text',
  required: true,
  unique: true,
  index: true,
  admin: {
    description: 'Zmiana slug-a wymaga przekierowania 301 w src/domain/redirects.ts. Zobacz AD-6.',
  },
}
