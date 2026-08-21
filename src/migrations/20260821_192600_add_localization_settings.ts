import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_settings_week_starts_on" AS ENUM('sunday', 'monday');
  ALTER TABLE "settings" ADD COLUMN "timezone" varchar DEFAULT 'UTC';
  ALTER TABLE "settings" ADD COLUMN "locale" varchar DEFAULT 'en-US';
  ALTER TABLE "settings" ADD COLUMN "week_starts_on" "enum_settings_week_starts_on" DEFAULT 'monday';`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "settings" DROP COLUMN "timezone";
  ALTER TABLE "settings" DROP COLUMN "locale";
  ALTER TABLE "settings" DROP COLUMN "week_starts_on";
  DROP TYPE "public"."enum_settings_week_starts_on";`)
}
