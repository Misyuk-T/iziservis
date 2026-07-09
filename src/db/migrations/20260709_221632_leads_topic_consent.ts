import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_leads_topic" AS ENUM('Serwis', 'Przegląd', 'Wycena', 'Zapytanie ogólne');
  ALTER TABLE "brands" ALTER COLUMN "logo_id" DROP NOT NULL;
  ALTER TABLE "leads" ALTER COLUMN "message" SET NOT NULL;
  ALTER TABLE "leads" ADD COLUMN "topic" "enum_leads_topic" NOT NULL;
  ALTER TABLE "leads" ADD COLUMN "consent" boolean DEFAULT false NOT NULL;
  ALTER TABLE "leads" ADD COLUMN "consent_at" timestamp(3) with time zone;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "brands" ALTER COLUMN "logo_id" SET NOT NULL;
  ALTER TABLE "leads" ALTER COLUMN "message" DROP NOT NULL;
  ALTER TABLE "leads" DROP COLUMN "topic";
  ALTER TABLE "leads" DROP COLUMN "consent";
  ALTER TABLE "leads" DROP COLUMN "consent_at";
  DROP TYPE "public"."enum_leads_topic";`)
}
