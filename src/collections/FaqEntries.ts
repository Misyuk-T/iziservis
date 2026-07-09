import type { CollectionConfig } from 'payload'

/** FR-12: the knowledge centre emits FAQPage schema generated from these. */
export const FaqEntries: CollectionConfig = {
  slug: 'faq-entries',
  admin: { useAsTitle: 'question', defaultColumns: ['question', 'topic', 'order'] },
  defaultSort: 'order',
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: 'question', type: 'text', required: true },
    { name: 'answer', type: 'textarea', required: true },
    {
      name: 'topic',
      type: 'select',
      required: true,
      options: [
        'Świadczone usługi',
        'Dostępność usług',
        'Sprzęt, który naprawiamy',
        'Piece konwekcyjno-parowe',
        'Zmywarki gastronomiczne',
        'Urządzenia grzewcze',
        'Ekspresy do kawy',
        'Marki naprawianego sprzętu',
        'Lokalizacje świadczonych usług',
        'Obsługiwani klienci',
        'O Firmie',
        'Regulaminy',
        'Kontakt',
      ].map((t) => ({ label: t, value: t })),
    },
    { name: 'order', type: 'number', defaultValue: 0 },
  ],
}
