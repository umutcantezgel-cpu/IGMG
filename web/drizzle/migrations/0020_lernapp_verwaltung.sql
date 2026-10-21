-- Lauf Lern-App, Verwaltung v1 (L3-06; ADR 0039 Nr. 8, ADR 0045 Fortschreibung S3/S8 Nr. 4): Audio-Studio – Rohaufnahmen
-- menschlicher Sprecherinnen und Sprecher (privat, unter Inhalts-Hash), Wahl Sprachausgabe/Mensch je Clip, Modul B2 der
-- Sprecher-Vereinbarung als eigenes Feld. Nur additiv; nutzt keinen Enum-Wert aus 0017.
CREATE TYPE "public"."lernapp_aufnahme_status" AS ENUM('neu', 'gebuendelt', 'verworfen');--> statement-breakpoint
CREATE TYPE "public"."lernapp_stimmen_wahl" AS ENUM('sprachausgabe', 'mensch');--> statement-breakpoint
CREATE TABLE "lernapp_audio_wahl" (
	"sprache" "lernapp_sprache" NOT NULL,
	"text_hash" text NOT NULL,
	"wahl" "lernapp_stimmen_wahl" NOT NULL,
	"geaendert_von" text,
	"geaendert_am" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lernapp_audio_wahl_sprache_text_hash_pk" PRIMARY KEY("sprache","text_hash")
);
--> statement-breakpoint
CREATE TABLE "lernapp_aufnahme" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sprache" "lernapp_sprache" NOT NULL,
	"text_hash" text NOT NULL,
	"schluessel" text NOT NULL,
	"sprecher_id" uuid NOT NULL,
	"pfad" text NOT NULL,
	"mime" text NOT NULL,
	"bytes" integer NOT NULL,
	"sha256" text NOT NULL,
	"dauer_ms" integer,
	"status" "lernapp_aufnahme_status" DEFAULT 'neu' NOT NULL,
	"erstellt_von" text,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lernapp_aufnahme_eindeutig" UNIQUE("sprache","text_hash","sprecher_id")
);
--> statement-breakpoint
ALTER TABLE "lernapp_sprecher" ADD COLUMN "klonen_erlaubt" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "lernapp_audio_wahl" ADD CONSTRAINT "lernapp_audio_wahl_geaendert_von_user_id_fk" FOREIGN KEY ("geaendert_von") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lernapp_aufnahme" ADD CONSTRAINT "lernapp_aufnahme_sprecher_id_lernapp_sprecher_id_fk" FOREIGN KEY ("sprecher_id") REFERENCES "public"."lernapp_sprecher"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lernapp_aufnahme" ADD CONSTRAINT "lernapp_aufnahme_erstellt_von_user_id_fk" FOREIGN KEY ("erstellt_von") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "lernapp_aufnahme_status_idx" ON "lernapp_aufnahme" USING btree ("status","sprache");