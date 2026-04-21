import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  void payload
  void req
  await db.execute(sql`
   DROP TABLE IF EXISTS "users_permissions" CASCADE;
  DROP TYPE IF EXISTS "public"."enum_users_permissions";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  void payload
  void req
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_permissions" AS ENUM('admin:access', 'audit-logs:read', 'media:access', 'media:create', 'media:update', 'media:update-own', 'media:delete', 'media:delete-own', 'pages:access', 'pages:create', 'pages:update', 'pages:update-own', 'pages:delete', 'pages:delete-own', 'posts:access', 'posts:create', 'posts:update', 'posts:update-own', 'posts:delete', 'posts:delete-own', 'redirects:access', 'redirects:create', 'redirects:update', 'redirects:delete', 'settings:update', 'users:create', 'users:read', 'users:update', 'users:delete');
  CREATE TABLE IF NOT EXISTS "users_permissions" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_users_permissions",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  ALTER TABLE "users_permissions" ADD CONSTRAINT "users_permissions_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX IF NOT EXISTS "users_permissions_order_idx" ON "users_permissions" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "users_permissions_parent_idx" ON "users_permissions" USING btree ("parent_id");`)
}
