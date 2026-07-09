import type { CollectionConfig } from 'payload'

/**
 * FR-2: brand authorization is modelled, not implied.
 *
 * Being an *authorized* service partner is a legal claim, distinct from merely
 * servicing a brand. The legacy site is careful about this; the new one keeps
 * the distinction in the data so no template can blur it.
 */
export const Brands: CollectionConfig = {
  slug: 'brands',
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'authorized', 'updatedAt'] },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    {
      name: 'authorized',
      type: 'checkbox',
      defaultValue: false,
      label: 'Autoryzowany serwis i/lub dystrybucja',
      admin: {
        description:
          'Zaznacz wyłącznie wtedy, gdy IZI Serwis jest oficjalnym partnerem serwisowym producenta. To oświadczenie prawne, nie preferencja wyświetlania.',
      },
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      // Optional, deliberately. The legacy site carries no brand logo assets at
      // all — brands are rendered as text — and the design reference's logo wall
      // is invented along with four of its brands. A brand renders as a wordmark
      // until a real asset exists. Alt stays required on Media regardless.
      admin: {
        description:
          'Opcjonalne. Bez logo marka renderuje się jako tekst. Po wgraniu obrazu alt jest wymagany (kolekcja Media).',
      },
    },
    { name: 'description', type: 'textarea' },
    {
      name: 'landingPage',
      type: 'checkbox',
      defaultValue: false,
      label: 'Ma dedykowaną stronę marki',
      admin: {
        description: 'Cztery marki mają dziś własne strony: Unic, Stalgast, Firex, Convotherm.',
      },
    },
    {
      name: 'servicedCategories',
      type: 'relationship',
      relationTo: 'equipment-categories',
      hasMany: true,
    },
  ],
}
