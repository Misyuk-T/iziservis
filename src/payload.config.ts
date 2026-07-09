import { postgresAdapter } from '@payloadcms/db-postgres'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { Brands } from './collections/Brands'
import { EquipmentCategories } from './collections/EquipmentCategories'
import { FaqEntries } from './collections/FaqEntries'
import { Leads } from './collections/Leads'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Services } from './collections/Services'
import { Users } from './collections/Users'
import { Voivodeships } from './collections/Voivodeships'
import { env, hasEmail } from './env'
import { Settings } from './globals/Settings'

const dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * AD-2: two connection strings, never one.
 *
 * Supabase's transaction pooler (:6543) does not support prepared statements,
 * so DDL must not run over it. `pnpm migrate` sets DATABASE_USE_DIRECT=1, which
 * swaps in the session pooler (:5432). Runtime keeps the transaction pooler.
 *
 * Importing `./env` here is what makes AD-9's validation actually run: this
 * module is loaded by the Next server, the Payload CLI and every migration.
 */
const useDirect = process.env.DATABASE_USE_DIRECT === '1'
const connectionString = useDirect ? env.DATABASE_DIRECT_URL : env.DATABASE_URL

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: {
      titleSuffix: '— IZI Serwis',
      // AD-10: the CMS route is invisible to crawlers.
      robots: 'noindex, nofollow',
    },
  },

  collections: [
    Pages,
    Services,
    EquipmentCategories,
    Brands,
    FaqEntries,
    Voivodeships,
    Leads,
    Media,
    Users,
  ],

  globals: [Settings],

  editor: lexicalEditor(),
  secret: env.PAYLOAD_SECRET,

  db: postgresAdapter({
    pool: { connectionString },

    // AD-3: push mode never touches production. Payload's own docs warn that
    // mixing push with `migrate` corrupts state.
    push: process.env.NODE_ENV === 'development' && !useDirect,

    migrationDir: path.resolve(dirname, 'db/migrations'),
  }),

  /**
   * AD-8: without an adapter, `sendEmail` logs to the console and resolves —
   * so the contact form would mark every lead delivered while nobody was told.
   * When SMTP is unconfigured we leave `email` unset and the action records the
   * truth against the lead instead.
   */
  email: hasEmail
    ? nodemailerAdapter({
        defaultFromAddress: env.SMTP_FROM!,
        defaultFromName: 'IZI Serwis',
        transportOptions: {
          host: env.SMTP_HOST!,
          port: env.SMTP_PORT ?? 587,
          secure: (env.SMTP_PORT ?? 587) === 465,
          auth: { user: env.SMTP_USER!, pass: env.SMTP_PASS! },
        },
      })
    : undefined,

  sharp,

  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

  localization: {
    // FR: Polish only in v1, but the model must not preclude a second locale.
    // Declaring it now means adding one later is config, not a data migration.
    locales: ['pl'],
    defaultLocale: 'pl',
    fallback: false,
  },
})
