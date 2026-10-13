ALTER TYPE "public"."konto_einwilligung_art" ADD VALUE 'konto';--> statement-breakpoint
ALTER TABLE "einladung" ADD COLUMN "gemeinde_rollen" jsonb DEFAULT '[]'::jsonb NOT NULL;