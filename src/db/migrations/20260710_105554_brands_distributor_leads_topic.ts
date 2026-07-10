import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_leads_topic" ADD VALUE 'Zakup / dobór sprzętu' BEFORE 'Zapytanie ogólne';
  ALTER TABLE "brands" ADD COLUMN "distributor" boolean DEFAULT false;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "leads" ALTER COLUMN "topic" SET DATA TYPE text;
  DROP TYPE "public"."enum_leads_topic";
  CREATE TYPE "public"."enum_leads_topic" AS ENUM('Serwis', 'Przegląd', 'Wycena', 'Zapytanie ogólne');
  ALTER TABLE "leads" ALTER COLUMN "topic" SET DATA TYPE "public"."enum_leads_topic" USING "topic"::"public"."enum_leads_topic";
  ALTER TABLE "brands" DROP COLUMN "distributor";`)
}
