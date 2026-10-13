CREATE TABLE "quran_vers_auswahl" (
	"liste" text NOT NULL,
	"sure" smallint NOT NULL,
	"vers" smallint NOT NULL,
	"reihenfolge" integer DEFAULT 0 NOT NULL,
	"erstellt_von" text,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "quran_vers_auswahl_liste_sure_vers_pk" PRIMARY KEY("liste","sure","vers")
);
--> statement-breakpoint
ALTER TABLE "konto_einwilligung" DROP CONSTRAINT "konto_einwilligung_lernende_id_lernende_id_fk";
--> statement-breakpoint
ALTER TABLE "konto_einwilligung" ADD COLUMN "aufbewahren_bis" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "konto_profil" ADD COLUMN "letzte_anmeldung" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "konto_profil" ADD COLUMN "inaktiv_gewarnt_am" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "anzeige_folie" ADD COLUMN "freigabe" "freigabe_status" DEFAULT 'entwurf' NOT NULL;--> statement-breakpoint
ALTER TABLE "anzeige_folie" ADD COLUMN "verfasst_von" text;--> statement-breakpoint
ALTER TABLE "anzeige_folie" ADD COLUMN "geprueft_von" text;--> statement-breakpoint
ALTER TABLE "anzeige_folie" ADD COLUMN "geprueft_am" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "anzeige_folie" ADD COLUMN "aktualisiert_am" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "konto_einwilligung" ADD CONSTRAINT "konto_einwilligung_lernende_id_lernende_id_fk" FOREIGN KEY ("lernende_id") REFERENCES "public"."lernende"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
-- D-16: Letzte Anmeldung aus vorhandenen Sitzungen übernehmen (ohne Sitzung zählt das Anlegedatum des Kontos)
UPDATE "konto_profil" SET "letzte_anmeldung" = s."letzte" FROM (SELECT "user_id", max("created_at") AS "letzte" FROM "session" GROUP BY "user_id") AS s WHERE s."user_id" = "konto_profil"."benutzer_id";
