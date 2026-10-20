-- Lauf Lern-App (ADR 0038 Nr. 10, KERN 4.0 §5/§6, PLAN §3.8/§3.9): Nutzung mit Konto – Profil, Ereignisprotokoll
-- (eindeutig über Konto, Gerät, Folgenummer; fortlaufende id als Zeiger), Kartenstand, Lerntage, verschlüsselte
-- Schreibabgaben, Statistik ohne Personenbezug. Konto löschen kaskadiert alles. Nutzt keinen Enum-Wert aus 0017.
CREATE TYPE "public"."lernapp_ereignis_art" AS ENUM('bewertung', 'lektion', 'xp', 'pause', 'einstellung', 'einstufung', 'tagesziel');--> statement-breakpoint
CREATE TABLE "lernapp_ereignis" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"benutzer_id" text NOT NULL,
	"geraet" uuid NOT NULL,
	"seq" integer NOT NULL,
	"am" timestamp with time zone NOT NULL,
	"tag" date NOT NULL,
	"art" "lernapp_ereignis_art" NOT NULL,
	"daten" jsonb NOT NULL,
	"empfangen_am" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lernapp_ereignis_eindeutig" UNIQUE("benutzer_id","geraet","seq")
);
--> statement-breakpoint
CREATE TABLE "lernapp_karte" (
	"benutzer_id" text NOT NULL,
	"karte" text NOT NULL,
	"zustand" jsonb NOT NULL,
	"faellig" timestamp with time zone,
	"basis" jsonb,
	"basis_bis" timestamp with time zone,
	"bis_ereignis" bigint,
	"aktualisiert_am" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lernapp_karte_benutzer_id_karte_pk" PRIMARY KEY("benutzer_id","karte")
);
--> statement-breakpoint
CREATE TABLE "lernapp_profil" (
	"benutzer_id" text PRIMARY KEY NOT NULL,
	"oberflaeche" "lernapp_sprache" DEFAULT 'de' NOT NULL,
	"ausgangssprache" "lernapp_sprache" DEFAULT 'de' NOT NULL,
	"ableitungs_version" smallint DEFAULT 1 NOT NULL,
	"angelegt_am" timestamp with time zone DEFAULT now() NOT NULL,
	"zuletzt_aktiv_am" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lernapp_schreibabgabe" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"benutzer_id" text NOT NULL,
	"gruppe_id" uuid,
	"aufgabe_schluessel" text NOT NULL,
	"text_verschluesselt" "bytea" NOT NULL,
	"schluessel_id" smallint NOT NULL,
	"rubrik" jsonb DEFAULT '{"pruefliste":{}}'::jsonb NOT NULL,
	"kommentar_verschluesselt" "bytea",
	"kommentar_schluessel_id" smallint,
	"korrigiert_von" text,
	"korrigiert_am" timestamp with time zone,
	"eingereicht_am" timestamp with time zone DEFAULT now() NOT NULL,
	"loeschen_ab" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lernapp_statistik_tag" (
	"tag" date NOT NULL,
	"kurs_id" text NOT NULL,
	"bereich" text DEFAULT '' NOT NULL,
	"kennzahl" text NOT NULL,
	"wert" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "lernapp_statistik_tag_tag_kurs_id_bereich_kennzahl_pk" PRIMARY KEY("tag","kurs_id","bereich","kennzahl")
);
--> statement-breakpoint
CREATE TABLE "lernapp_tag" (
	"benutzer_id" text NOT NULL,
	"tag" date NOT NULL,
	"xp" integer DEFAULT 0 NOT NULL,
	"lektionen" smallint DEFAULT 0 NOT NULL,
	"pause" boolean DEFAULT false NOT NULL,
	"ziel_erreicht" boolean DEFAULT false NOT NULL,
	CONSTRAINT "lernapp_tag_benutzer_id_tag_pk" PRIMARY KEY("benutzer_id","tag")
);
--> statement-breakpoint
ALTER TABLE "lernapp_ereignis" ADD CONSTRAINT "lernapp_ereignis_benutzer_id_lernapp_profil_benutzer_id_fk" FOREIGN KEY ("benutzer_id") REFERENCES "public"."lernapp_profil"("benutzer_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lernapp_karte" ADD CONSTRAINT "lernapp_karte_benutzer_id_lernapp_profil_benutzer_id_fk" FOREIGN KEY ("benutzer_id") REFERENCES "public"."lernapp_profil"("benutzer_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lernapp_profil" ADD CONSTRAINT "lernapp_profil_benutzer_id_user_id_fk" FOREIGN KEY ("benutzer_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lernapp_schreibabgabe" ADD CONSTRAINT "lernapp_schreibabgabe_benutzer_id_user_id_fk" FOREIGN KEY ("benutzer_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lernapp_schreibabgabe" ADD CONSTRAINT "lernapp_schreibabgabe_gruppe_id_gruppe_id_fk" FOREIGN KEY ("gruppe_id") REFERENCES "public"."gruppe"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lernapp_schreibabgabe" ADD CONSTRAINT "lernapp_schreibabgabe_korrigiert_von_user_id_fk" FOREIGN KEY ("korrigiert_von") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lernapp_tag" ADD CONSTRAINT "lernapp_tag_benutzer_id_lernapp_profil_benutzer_id_fk" FOREIGN KEY ("benutzer_id") REFERENCES "public"."lernapp_profil"("benutzer_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "lernapp_ereignis_zeiger_idx" ON "lernapp_ereignis" USING btree ("benutzer_id","id");--> statement-breakpoint
CREATE INDEX "lernapp_ereignis_am_idx" ON "lernapp_ereignis" USING btree ("am");--> statement-breakpoint
CREATE INDEX "lernapp_karte_faellig_idx" ON "lernapp_karte" USING btree ("benutzer_id","faellig");--> statement-breakpoint
CREATE INDEX "lernapp_profil_aktiv_idx" ON "lernapp_profil" USING btree ("zuletzt_aktiv_am");--> statement-breakpoint
CREATE INDEX "lernapp_schreibabgabe_benutzer_idx" ON "lernapp_schreibabgabe" USING btree ("benutzer_id");--> statement-breakpoint
CREATE INDEX "lernapp_schreibabgabe_gruppe_idx" ON "lernapp_schreibabgabe" USING btree ("gruppe_id");--> statement-breakpoint
CREATE INDEX "lernapp_schreibabgabe_loeschen_idx" ON "lernapp_schreibabgabe" USING btree ("loeschen_ab");
