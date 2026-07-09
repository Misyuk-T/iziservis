import type { CollectionConfig } from 'payload'

/**
 * AD-8: a lead is persisted before it is mailed.
 *
 * The contact form is the site's only revenue event. An SMTP failure must never
 * destroy one, so the write happens first and mail dispatch is a side effect
 * that can fail and be retried without the visitor ever knowing.
 *
 * Leads are personal data under GDPR. They are never logged (AD: Consistency
 * Conventions — "a lead's contents are never logged; its id is"), and they are
 * not publicly readable.
 */
export const Leads: CollectionConfig = {
  slug: 'leads',
  labels: { singular: 'Zgłoszenie', plural: 'Zgłoszenia' },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'company', 'voivodeship', 'deliveredAt', 'createdAt'],
  },
  access: {
    // The public may create a lead. Only staff may read one.
    create: () => true,
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'company', type: 'text', required: true },
    { name: 'phone', type: 'text', required: true },
    {
      name: 'voivodeship',
      type: 'relationship',
      relationTo: 'voivodeships',
      required: true,
    },
    { name: 'message', type: 'textarea' },
    {
      name: 'deliveredAt',
      type: 'date',
      admin: {
        readOnly: true,
        description:
          'Ustawiane po pomyślnym wysłaniu e-maila. Puste = zgłoszenie zapisane, ale powiadomienie jeszcze nie doszło.',
      },
    },
    {
      name: 'deliveryError',
      type: 'text',
      admin: { readOnly: true, description: 'Ostatni błąd wysyłki, jeśli wystąpił.' },
    },
  ],
}
