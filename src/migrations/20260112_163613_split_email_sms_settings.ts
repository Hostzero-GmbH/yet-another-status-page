import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_settings_smtp_secure" RENAME TO "enum_email_settings_smtp_secure";
  CREATE TABLE "email_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT false,
  	"smtp_host" varchar,
  	"smtp_port" numeric DEFAULT 587,
  	"smtp_secure" "enum_email_settings_smtp_secure" DEFAULT 'tls',
  	"smtp_username" varchar,
  	"smtp_password" varchar,
  	"smtp_from_address" varchar,
  	"smtp_from_name" varchar,
  	"smtp_reply_to" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "sms_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT false,
  	"twilio_account_sid" varchar,
  	"twilio_auth_token" varchar,
  	"twilio_from_number" varchar,
  	"twilio_messaging_service_sid" varchar,
  	"template_title_max_length" numeric DEFAULT 50,
  	"template_message_max_length" numeric DEFAULT 100,
  	"template_incident_new" varchar DEFAULT '[{{siteName}}] 🚨 INCIDENT: {{title}} | {{status}} | {{message}} | {{url}}',
  	"template_incident_update" varchar DEFAULT '[{{siteName}}] 📢 {{title}} | {{status}} | {{message}} | {{url}}',
  	"template_maintenance_new" varchar DEFAULT '[{{siteName}}] 🔧 MAINTENANCE: {{title}} | {{schedule}} | {{url}}',
  	"template_maintenance_update" varchar DEFAULT '[{{siteName}}] 🔧 {{title}} | {{status}} | {{schedule}} | {{message}} | {{url}}',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  DROP TABLE "users_sessions" CASCADE;
  ALTER TABLE "settings" DROP COLUMN "smtp_host";
  ALTER TABLE "settings" DROP COLUMN "smtp_port";
  ALTER TABLE "settings" DROP COLUMN "smtp_secure";
  ALTER TABLE "settings" DROP COLUMN "smtp_username";
  ALTER TABLE "settings" DROP COLUMN "smtp_password";
  ALTER TABLE "settings" DROP COLUMN "smtp_from_address";
  ALTER TABLE "settings" DROP COLUMN "smtp_from_name";
  ALTER TABLE "settings" DROP COLUMN "smtp_reply_to";
  ALTER TABLE "settings" DROP COLUMN "twilio_account_sid";
  ALTER TABLE "settings" DROP COLUMN "twilio_auth_token";
  ALTER TABLE "settings" DROP COLUMN "twilio_from_number";
  ALTER TABLE "settings" DROP COLUMN "twilio_messaging_service_sid";
  ALTER TABLE "settings" DROP COLUMN "email_notifications_enabled";
  ALTER TABLE "settings" DROP COLUMN "sms_notifications_enabled";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_email_settings_smtp_secure" RENAME TO "enum_settings_smtp_secure";
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  DROP TABLE "email_settings" CASCADE;
  DROP TABLE "sms_settings" CASCADE;
  ALTER TABLE "settings" ADD COLUMN "smtp_host" varchar;
  ALTER TABLE "settings" ADD COLUMN "smtp_port" numeric DEFAULT 587;
  ALTER TABLE "settings" ADD COLUMN "smtp_secure" "enum_settings_smtp_secure" DEFAULT 'tls';
  ALTER TABLE "settings" ADD COLUMN "smtp_username" varchar;
  ALTER TABLE "settings" ADD COLUMN "smtp_password" varchar;
  ALTER TABLE "settings" ADD COLUMN "smtp_from_address" varchar;
  ALTER TABLE "settings" ADD COLUMN "smtp_from_name" varchar;
  ALTER TABLE "settings" ADD COLUMN "smtp_reply_to" varchar;
  ALTER TABLE "settings" ADD COLUMN "twilio_account_sid" varchar;
  ALTER TABLE "settings" ADD COLUMN "twilio_auth_token" varchar;
  ALTER TABLE "settings" ADD COLUMN "twilio_from_number" varchar;
  ALTER TABLE "settings" ADD COLUMN "twilio_messaging_service_sid" varchar;
  ALTER TABLE "settings" ADD COLUMN "email_notifications_enabled" boolean DEFAULT false;
  ALTER TABLE "settings" ADD COLUMN "sms_notifications_enabled" boolean DEFAULT false;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");`)
}
