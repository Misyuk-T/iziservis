import type { CollectionConfig } from 'payload'

import { seoFields, slugField } from './fields/seo'

/**
 * The five pages that already rank for `serwis pieców/zmywarek/ekspresów/
 * lodówek/urządzeń grzewczych Warszawa`. FR-13 promotes them to /urzadzenia/*
 * so they sit one click from the homepage. They are the site's money pages.
 */
export const EquipmentCategories: CollectionConfig = {
  slug: 'equipment-categories',
  labels: { singular: 'Kategoria urządzeń', plural: 'Kategorie urządzeń' },
  admin: { useAsTitle: 'title', defaultColumns: ['order', 'title', 'slug', '_status'] },
  defaultSort: 'order',
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
    {
      name: 'order',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: { description: 'Kolejność wyświetlania. Niższa liczba = wyżej.' },
    },
    { name: 'summary', type: 'textarea', required: true },
    { name: 'body', type: 'richText' },
    { name: 'heroImage', type: 'upload', relationTo: 'media' },
    { name: 'icon', type: 'upload', relationTo: 'media' },
    seoFields,
  ],
}
