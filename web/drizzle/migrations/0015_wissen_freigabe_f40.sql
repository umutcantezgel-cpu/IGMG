ALTER TABLE "wissen_thema" ADD COLUMN "freigabe" "freigabe_status" DEFAULT 'entwurf' NOT NULL;--> statement-breakpoint
ALTER TABLE "wissen_thema" ADD COLUMN "verfasst_von" text;--> statement-breakpoint
ALTER TABLE "wissen_thema" ADD COLUMN "geprueft_von" text;--> statement-breakpoint
ALTER TABLE "wissen_thema" ADD COLUMN "geprueft_am" timestamp with time zone;--> statement-breakpoint
-- F-40: Religiöse Freigabe für Wissensthemen (ADR 0030). Was bisher öffentlich war (veröffentlicht), bleibt öffentlich:
-- Der Bestand gilt als geprüft – ohne prüfende Person (geprueft_von leer) und mit Vermerk im Freigabe-Verlauf. Die
-- Verwaltung zeigt solche Themen als „Bestand, nicht einzeln geprüft“; jede Änderung geht wie üblich in die Prüfung.
UPDATE "wissen_thema" SET "freigabe" = 'geprueft' WHERE "status" = 'veroeffentlicht';--> statement-breakpoint
INSERT INTO "freigabe" ("inhalt_typ", "inhalt_id", "art", "status", "kommentar") SELECT 'wissen_thema', "id"::text, 'religioes', 'geprueft', 'Bestand vor der Freigabepflicht (F-40), ohne Einzelprüfung übernommen' FROM "wissen_thema" WHERE "status" = 'veroeffentlicht';
