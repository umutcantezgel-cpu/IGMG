ALTER TABLE "rollen_antrag" DROP CONSTRAINT "rollen_antrag_schutzrolle";--> statement-breakpoint
ALTER TABLE "einladung" ADD COLUMN "freigabe_noetig" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "einladung" ADD COLUMN "freigegeben_von" text;--> statement-breakpoint
ALTER TABLE "einladung" ADD COLUMN "freigegeben_am" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "einladung" ADD COLUMN "sprache" text;--> statement-breakpoint
ALTER TABLE "rollen_antrag" ADD COLUMN "art" text DEFAULT 'vergabe' NOT NULL;--> statement-breakpoint
ALTER TABLE "eltern_kind" ADD COLUMN "beenden_beantragt_von" text;--> statement-breakpoint
ALTER TABLE "eltern_kind" ADD COLUMN "beenden_beantragt_am" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "rollen_antrag" ADD CONSTRAINT "rollen_antrag_art" CHECK ("rollen_antrag"."art" in ('vergabe', 'entzug'));--> statement-breakpoint
ALTER TABLE "rollen_antrag" ADD CONSTRAINT "rollen_antrag_schutzrolle" CHECK ("rollen_antrag"."rolle" in ('leitung', 'kinderschutz') or ("rollen_antrag"."art" = 'entzug' and "rollen_antrag"."rolle" = 'religioese_pruefung'));--> statement-breakpoint
-- Nacharbeit N4 (M-2/S2b-3): dauerhafter Merker „Schutzrollen gestartet“ – die Start-Ausnahme (erste Leitung sofort
-- wirksam) gilt nur, solange noch nie eine Leitung wirksam war. Bestehende Installationen mit Leitung gelten als gestartet.
INSERT INTO "einstellung" ("schluessel", "wert") SELECT 'schutzrollen_start', jsonb_build_object('quelle', 'migration', 'am', now()) WHERE EXISTS (SELECT 1 FROM "rolle_zuweisung" WHERE "rolle" = 'leitung') ON CONFLICT ("schluessel") DO NOTHING;
