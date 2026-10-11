ALTER TABLE "veranstaltung" ADD COLUMN "programm" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "veranstaltung" ADD COLUMN "hinweise" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "veranstaltung" ADD COLUMN "schlagwoerter" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "veranstaltung" ADD COLUMN "veranstalter" jsonb;--> statement-breakpoint
ALTER TABLE "veranstaltung" ADD COLUMN "kontakt" jsonb;