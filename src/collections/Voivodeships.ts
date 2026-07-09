import type { CollectionConfig } from 'payload'

/**
 * FR-14: contact submissions route by voivodeship.
 *
 * The mapping is content, editable without a deploy. A voivodeship with no
 * advisor falls back to biuro@iziserwis.pl — an unmapped region degrades to
 * delivered, never to dropped.
 */
export const Voivodeships: CollectionConfig = {
  slug: 'voivodeships',
  labels: { singular: 'Województwo', plural: 'Województwa' },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'advisorEmail'] },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    { name: 'name', type: 'text', required: true, unique: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    {
      name: 'advisorEmail',
      type: 'email',
      admin: {
        description:
          'Zostaw puste, jeśli region nie ma przypisanego doradcy — zgłoszenia trafią wtedy na biuro@iziserwis.pl.',
      },
    },
    { name: 'advisorName', type: 'text' },
  ],
}
