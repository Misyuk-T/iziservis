import type { CollectionConfig } from 'payload'

import { seoFields, slugField } from './fields/seo'

/**
 * Deliberately generic. PRD OQ-3 has not been answered — if the knowledge
 * centre becomes a blog, a `posts` collection is added beside this one without
 * touching the rendering layer.
 */
export const Pages: CollectionConfig = {
  slug: 'pages',
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
    { name: 'heroImage', type: 'upload', relationTo: 'media' },
    { name: 'body', type: 'richText' },
    seoFields,
  ],
}
