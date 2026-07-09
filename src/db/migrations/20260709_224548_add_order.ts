import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "services" ADD COLUMN "order" numeric DEFAULT 0;
  ALTER TABLE "_services_v" ADD COLUMN "version_order" numeric DEFAULT 0;
  ALTER TABLE "equipment_categories" ADD COLUMN "order" numeric DEFAULT 0;
  ALTER TABLE "_equipment_categories_v" ADD COLUMN "version_order" numeric DEFAULT 0;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "services" DROP COLUMN "order";
  ALTER TABLE "_services_v" DROP COLUMN "version_order";
  ALTER TABLE "equipment_categories" DROP COLUMN "order";
  ALTER TABLE "_equipment_categories_v" DROP COLUMN "version_order";`)
}
