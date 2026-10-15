CREATE TABLE "rollen_antrag" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"benutzer_id" text NOT NULL,
	"rolle" "rolle" NOT NULL,
	"beantragt_von" text,
	"beantragt_am" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "rollen_antrag_eindeutig" UNIQUE("benutzer_id","rolle"),
	CONSTRAINT "rollen_antrag_schutzrolle" CHECK ("rollen_antrag"."rolle" in ('leitung', 'kinderschutz'))
);
--> statement-breakpoint
ALTER TABLE "chat_kanal" ADD COLUMN "kinderschutz_pause" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "chat_meldung" ADD COLUMN "gemeldete_person" text;--> statement-breakpoint
ALTER TABLE "chat_meldung" ADD COLUMN "gegen_leitung" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "rollen_antrag" ADD CONSTRAINT "rollen_antrag_benutzer_id_user_id_fk" FOREIGN KEY ("benutzer_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_meldung" ADD CONSTRAINT "chat_meldung_gemeldete_person_user_id_fk" FOREIGN KEY ("gemeldete_person") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
-- S2/S3 (D-02): Absender der gemeldeten Nachricht festhalten, solange er noch bekannt ist; Meldungen gegen die Leitung
UPDATE "chat_meldung" AS m SET "gemeldete_person" = n."absender_id" FROM "chat_nachricht" AS n WHERE n."id" = m."nachricht_id";--> statement-breakpoint
UPDATE "chat_meldung" AS m SET "gegen_leitung" = true WHERE EXISTS (SELECT 1 FROM "chat_kanal" AS k JOIN "gruppen_leitung" AS l ON l."gruppe_id" = k."gruppe_id" WHERE k."id" = m."kanal_id" AND l."benutzer_id" = m."gemeldete_person");--> statement-breakpoint
-- S2/S3: Pausen, die nicht nachweislich die Gruppenleitung gesetzt hat, gelten als Pause durch kinderschutz
UPDATE "chat_kanal" AS k SET "kinderschutz_pause" = true WHERE k."status" = 'pausiert' AND NOT EXISTS (SELECT 1 FROM "gruppen_leitung" AS l WHERE l."gruppe_id" = k."gruppe_id" AND l."benutzer_id" = (SELECT p."akteur_id" FROM "moderationsprotokoll" AS p WHERE p."kanal_id" = k."id" AND p."aktion" = 'pausiert' ORDER BY p."id" DESC LIMIT 1));--> statement-breakpoint
-- S2/S3: Archivierte Gruppen – Kanäle archiviert, laufende Mitgliedschaften beendet
UPDATE "chat_kanal" AS k SET "status" = 'archiviert' FROM "gruppe" AS g WHERE g."id" = k."gruppe_id" AND g."status" = 'archiviert';--> statement-breakpoint
UPDATE "gruppen_mitglied" AS m SET "bis" = (now() AT TIME ZONE 'Europe/Berlin')::date FROM "gruppe" AS g WHERE g."id" = m."gruppe_id" AND g."status" = 'archiviert' AND m."bis" IS NULL;
