import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_incident_templates_updates_status" AS ENUM('investigating', 'identified', 'monitoring', 'resolved');
  CREATE TYPE "public"."enum_maintenance_templates_status" AS ENUM('upcoming', 'in_progress', 'completed', 'cancelled');
  CREATE TYPE "public"."enum_settings_timezone" AS ENUM('UTC', 'Pacific/Midway', 'Pacific/Niue', 'Pacific/Honolulu', 'Pacific/Rarotonga', 'America/Anchorage', 'Pacific/Gambier', 'America/Los_Angeles', 'America/Tijuana', 'America/Denver', 'America/Phoenix', 'America/Chicago', 'America/Guatemala', 'America/New_York', 'America/Bogota', 'America/Caracas', 'America/Santiago', 'America/Buenos_Aires', 'America/Sao_Paulo', 'Atlantic/South_Georgia', 'Atlantic/Azores', 'Atlantic/Cape_Verde', 'Europe/London', 'Europe/Berlin', 'Africa/Lagos', 'Europe/Athens', 'Africa/Cairo', 'Europe/Moscow', 'Asia/Riyadh', 'Asia/Dubai', 'Asia/Baku', 'Asia/Karachi', 'Asia/Tashkent', 'Asia/Calcutta', 'Asia/Dhaka', 'Asia/Almaty', 'Asia/Jakarta', 'Asia/Bangkok', 'Asia/Shanghai', 'Asia/Singapore', 'Asia/Tokyo', 'Asia/Seoul', 'Australia/Brisbane', 'Australia/Sydney', 'Pacific/Guam', 'Pacific/Noumea', 'Pacific/Auckland', 'Pacific/Fiji');
  CREATE TYPE "public"."enum_settings_week_starts_on" AS ENUM('monday', 'sunday');
  CREATE TABLE "incident_templates_updates" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"status" "enum_incident_templates_updates_status" NOT NULL,
  	"message" varchar NOT NULL,
  	"created_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "incident_templates" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"title" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "incident_templates_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"services_id" integer
  );
  
  CREATE TABLE "maintenance_templates" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"title" varchar NOT NULL,
  	"description" jsonb,
  	"duration" varchar,
  	"auto_start_on_schedule" boolean DEFAULT true,
  	"auto_complete_on_schedule" boolean DEFAULT true,
  	"status" "enum_maintenance_templates_status" DEFAULT 'upcoming' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "maintenance_templates_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"services_id" integer
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "incident_templates_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "maintenance_templates_id" integer;
  ALTER TABLE "settings" ADD COLUMN "timezone" "enum_settings_timezone" DEFAULT 'UTC';
  ALTER TABLE "settings" ADD COLUMN "locale" varchar DEFAULT 'en-US';
  ALTER TABLE "settings" ADD COLUMN "week_starts_on" "enum_settings_week_starts_on" DEFAULT 'monday';
  ALTER TABLE "incident_templates_updates" ADD CONSTRAINT "incident_templates_updates_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."incident_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "incident_templates_rels" ADD CONSTRAINT "incident_templates_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."incident_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "incident_templates_rels" ADD CONSTRAINT "incident_templates_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "maintenance_templates_rels" ADD CONSTRAINT "maintenance_templates_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."maintenance_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "maintenance_templates_rels" ADD CONSTRAINT "maintenance_templates_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "incident_templates_updates_order_idx" ON "incident_templates_updates" USING btree ("_order");
  CREATE INDEX "incident_templates_updates_parent_id_idx" ON "incident_templates_updates" USING btree ("_parent_id");
  CREATE INDEX "incident_templates_updated_at_idx" ON "incident_templates" USING btree ("updated_at");
  CREATE INDEX "incident_templates_created_at_idx" ON "incident_templates" USING btree ("created_at");
  CREATE INDEX "incident_templates_rels_order_idx" ON "incident_templates_rels" USING btree ("order");
  CREATE INDEX "incident_templates_rels_parent_idx" ON "incident_templates_rels" USING btree ("parent_id");
  CREATE INDEX "incident_templates_rels_path_idx" ON "incident_templates_rels" USING btree ("path");
  CREATE INDEX "incident_templates_rels_services_id_idx" ON "incident_templates_rels" USING btree ("services_id");
  CREATE INDEX "maintenance_templates_status_idx" ON "maintenance_templates" USING btree ("status");
  CREATE INDEX "maintenance_templates_updated_at_idx" ON "maintenance_templates" USING btree ("updated_at");
  CREATE INDEX "maintenance_templates_created_at_idx" ON "maintenance_templates" USING btree ("created_at");
  CREATE INDEX "maintenance_templates_rels_order_idx" ON "maintenance_templates_rels" USING btree ("order");
  CREATE INDEX "maintenance_templates_rels_parent_idx" ON "maintenance_templates_rels" USING btree ("parent_id");
  CREATE INDEX "maintenance_templates_rels_path_idx" ON "maintenance_templates_rels" USING btree ("path");
  CREATE INDEX "maintenance_templates_rels_services_id_idx" ON "maintenance_templates_rels" USING btree ("services_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_incident_templates_fk" FOREIGN KEY ("incident_templates_id") REFERENCES "public"."incident_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_maintenance_templates_fk" FOREIGN KEY ("maintenance_templates_id") REFERENCES "public"."maintenance_templates"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_incident_templates_id_idx" ON "payload_locked_documents_rels" USING btree ("incident_templates_id");
  CREATE INDEX "payload_locked_documents_rels_maintenance_templates_id_idx" ON "payload_locked_documents_rels" USING btree ("maintenance_templates_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "incident_templates_updates" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "incident_templates" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "incident_templates_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "maintenance_templates" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "maintenance_templates_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "incident_templates_updates" CASCADE;
  DROP TABLE "incident_templates" CASCADE;
  DROP TABLE "incident_templates_rels" CASCADE;
  DROP TABLE "maintenance_templates" CASCADE;
  DROP TABLE "maintenance_templates_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_incident_templates_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_maintenance_templates_fk";
  
  DROP INDEX "payload_locked_documents_rels_incident_templates_id_idx";
  DROP INDEX "payload_locked_documents_rels_maintenance_templates_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "incident_templates_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "maintenance_templates_id";
  ALTER TABLE "settings" DROP COLUMN "timezone";
  ALTER TABLE "settings" DROP COLUMN "locale";
  ALTER TABLE "settings" DROP COLUMN "week_starts_on";
  DROP TYPE "public"."enum_incident_templates_updates_status";
  DROP TYPE "public"."enum_maintenance_templates_status";
  DROP TYPE "public"."enum_settings_timezone";
  DROP TYPE "public"."enum_settings_week_starts_on";`)
}
