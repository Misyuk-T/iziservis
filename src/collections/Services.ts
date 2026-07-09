import type { CollectionConfig } from 'payload'

import { seoFields, slugField } from './fields/seo'

/** FR-12: each service page emits Service structured data, derived from here. */
export const Services: CollectionConfig = {
  slug: 'services',
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'slug', '_status'] },
  versions: { drafts: true },
  access: {
    read: ({ req }) => (req.user ? true : { _status: { equals: 'published' } }),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField,
    { name: 'summary', type: 'textarea', required: true },
    { name: 'body', type: 'richText' },
    { name: 'heroImage', type: 'upload', relationTo: 'media' },
    {
      name: 'appliesTo',
      type: 'relationship',
      relationTo: 'equipment-categories',
      hasMany: true,
    },
    seoFields,
  ],
}
