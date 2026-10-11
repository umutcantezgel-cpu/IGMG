CREATE TYPE "public"."kurs_verfuegbarkeit" AS ENUM('voranmeldung', 'ohne_anmeldung', 'geschlossen');--> statement-breakpoint
ALTER TABLE "kurs" ADD COLUMN "verfuegbarkeit" "kurs_verfuegbarkeit" DEFAULT 'voranmeldung' NOT NULL;--> statement-breakpoint
ALTER TABLE "kurs" ADD COLUMN "hinweis" jsonb;--> statement-breakpoint
ALTER TABLE "nachricht" ADD COLUMN "schlagwoerter" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
-- Datenübernahme (Tor A): bisheriges Ja/Nein-Feld → Verfügbarkeit
UPDATE "kurs" SET "verfuegbarkeit" = CASE WHEN "voranmeldung_moeglich" THEN 'voranmeldung'::"kurs_verfuegbarkeit" ELSE 'ohne_anmeldung'::"kurs_verfuegbarkeit" END;
