import type { CollectionConfig } from 'payload'

/**
 * AD-1: media cannot exist without alt text.
 *
 * The legacy site ships 244 images and zero alt attributes. That is its single
 * largest accessibility failure (WCAG 1.1.1, Level A) and a wholly unclaimed
 * SEO signal. Validation lives here, in the collection, rather than in the
 * admin UI — so the REST and GraphQL surfaces reject an empty alt too.
 *
 * A decorative image is expressed by `decorative: true`, which renders alt="".
 * It is never expressed by leaving alt blank.
 */
export const Media: CollectionConfig = {
  slug: 'media',
  admin: { useAsTitle: 'alt', defaultColumns: ['alt', 'decorative', 'updatedAt'] },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  upload: {
    imageSizes: [
      { name: 'thumbnail', width: 400 },
      { name: 'card', width: 768 },
      { name: 'hero', width: 1920 },
    ],
    mimeTypes: ['image/*'],
  },
  fields: [
    {
      name: 'decorative',
      type: 'checkbox',
      defaultValue: false,
      label: 'Dekoracyjny (obraz nie niesie treści)',
      admin: {
        description:
          'Zaznacz tylko wtedy, gdy obraz jest czysto ozdobny. Zostanie wyrenderowany z alt="", a czytniki ekranu go pominą.',
      },
    },
    {
      name: 'alt',
      type: 'text',
      label: 'Tekst alternatywny',
      admin: {
        condition: (data) => !data?.decorative,
        description: 'Opisz, co widać na obrazie. Wymagane — WCAG 1.1.1.',
      },
      // The condition above only hides the field in the admin UI. The real
      // enforcement is below, and it runs on every write from every surface.
      validate: (value: string | null | undefined, { data }: { data?: { decorative?: boolean } }) => {
        if (data?.decorative) return true
        if (typeof value === 'string' && value.trim().length > 0) return true
        return 'Tekst alternatywny jest wymagany. Jeśli obraz jest czysto ozdobny, zaznacz „Dekoracyjny”.'
      },
    },
  ],
}
