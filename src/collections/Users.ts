import type { CollectionConfig } from 'payload'

/**
 * AD-10: the CMS is authenticated server-side on every request.
 * There are no end-user accounts; these are IZI staff only.
 */
export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: { useAsTitle: 'email', defaultColumns: ['email', 'role'] },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => req.user?.role === 'admin',
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Editor', value: 'editor' },
        { label: 'Admin', value: 'admin' },
      ],
      admin: {
        description:
          'FR-4: an editor publishes content. Only an admin touches users and roles.',
      },
    },
  ],
}
