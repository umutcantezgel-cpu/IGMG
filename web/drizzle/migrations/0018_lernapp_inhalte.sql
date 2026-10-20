-- Lauf Lern-App (ADR 0039–0041, PLAN §3.9): Inhalte der Lern-App – Kurse, Richtungen, Abschnitte, Einheiten, Lektionen,
-- Aufgaben, Lemmata, Sätze, Übersetzungen, Tipps, Texte, Aussagen mit Belegen und Quellenregister, Audio und Sprecher,
-- Prüfungen, Stichproben, Sprachen der Prüfenden, Meldungen. Nutzt keinen Enum-Wert aus 0017.
CREATE TYPE "public"."lernapp_beleg_art" AS ENUM('sinngemaess', 'woertlich');--> statement-breakpoint
CREATE TYPE "public"."lernapp_ebene" AS ENUM('muttersprache', 'sehr_gut');--> statement-breakpoint
CREATE TYPE "public"."lernapp_entscheidung" AS ENUM('offen', 'bestanden', 'nachbessern');--> statement-breakpoint
CREATE TYPE "public"."lernapp_fehler" AS ENUM('bedeutung', 'grammatik', 'anstoessig', 'aussprache', 'natuerlichkeit', 'zeichensetzung');--> statement-breakpoint
CREATE TYPE "public"."lernapp_inhalt_typ" AS ENUM('einheit', 'lektion', 'aufgabe', 'lemma', 'satz', 'uebersetzung', 'tipp', 'text', 'aussage', 'beleg', 'audio', 'formelliste', 'koran_bedeutung', 'wurzel');--> statement-breakpoint
CREATE TYPE "public"."lernapp_kurs_art" AS ENUM('sprache', 'wissen', 'koran');--> statement-breakpoint
CREATE TYPE "public"."lernapp_lektion_art" AS ENUM('lektion', 'geschichte', 'wiederholung', 'pruefstein', 'schrift', 'schreiben', 'sprechen');--> statement-breakpoint
CREATE TYPE "public"."lernapp_meldung_kategorie" AS ENUM('antwort_richtig', 'fehler_zieltext', 'fehler_uebersetzung', 'fehler_audio', 'anstoessig', 'sonstiges');--> statement-breakpoint
CREATE TYPE "public"."lernapp_meldung_status" AS ENUM('offen', 'erledigt');--> statement-breakpoint
CREATE TYPE "public"."lernapp_pruef_art" AS ENUM('sprache_ziel', 'sprache_uebersetzung', 'religioes');--> statement-breakpoint
CREATE TYPE "public"."lernapp_quelle_art" AS ENUM('fiqh', 'aqida', 'ilmihal', 'offene_daten');--> statement-breakpoint
CREATE TYPE "public"."lernapp_sprache" AS ENUM('de', 'tr', 'ar');--> statement-breakpoint
CREATE TYPE "public"."lernapp_status" AS ENUM('entwurf', 'automatisch_geprueft', 'veroeffentlicht', 'gesperrt');--> statement-breakpoint
CREATE TYPE "public"."lernapp_stichprobe_art" AS ENUM('zieltext', 'uebersetzung', 'audio');--> statement-breakpoint
CREATE TYPE "public"."lernapp_stufe" AS ENUM('a1', 'a2', 'b1', 'b2', 'c1', 'grund', 'aufbau', 'vertiefung');--> statement-breakpoint
CREATE TYPE "public"."lernapp_text_art" AS ENUM('dialog', 'geschichte', 'lesetext');--> statement-breakpoint
CREATE TYPE "public"."lernapp_urteil" AS ENUM('ok', 'korrektur', 'aenderungsvorschlag', 'abgelehnt');--> statement-breakpoint
CREATE TABLE "lernapp_abschnitt" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kurs_id" text NOT NULL,
	"stufe" "lernapp_stufe" NOT NULL,
	"reihenfolge" smallint NOT NULL,
	"titel" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"kann_beschreibungen" jsonb DEFAULT '[]'::jsonb NOT NULL,
	CONSTRAINT "lernapp_abschnitt_eindeutig" UNIQUE("kurs_id","stufe")
);
--> statement-breakpoint
CREATE TABLE "lernapp_audio" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sprache" "lernapp_sprache" NOT NULL,
	"text_hash" text NOT NULL,
	"stimme" text NOT NULL,
	"sprecher_id" uuid,
	"buendel" text NOT NULL,
	"versatz" integer NOT NULL,
	"laenge" integer NOT NULL,
	"dauer_ms" integer NOT NULL,
	"sha256" text NOT NULL,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lernapp_audio_eindeutig" UNIQUE("sprache","text_hash","stimme")
);
--> statement-breakpoint
CREATE TABLE "lernapp_aufgabe" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lektion_id" uuid NOT NULL,
	"schluessel" text NOT NULL,
	"typ" text NOT NULL,
	"daten" jsonb NOT NULL,
	"reihenfolge" smallint NOT NULL,
	"aussage_id" uuid,
	"religionsbezug" boolean DEFAULT false NOT NULL,
	"quelle" text,
	"inhalt_hash" text NOT NULL,
	"status" "lernapp_status" DEFAULT 'entwurf' NOT NULL,
	"verfasst_von" text,
	"menschlich_geprueft" boolean DEFAULT false NOT NULL,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL,
	"aktualisiert_am" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lernapp_aufgabe_schluessel_unique" UNIQUE("schluessel")
);
--> statement-breakpoint
CREATE TABLE "lernapp_aussage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lektion_id" uuid NOT NULL,
	"schluessel" text NOT NULL,
	"text" text NOT NULL,
	"reihenfolge" smallint NOT NULL,
	"meinung" text,
	"strittig" boolean DEFAULT false NOT NULL,
	"kinder_geeignet" boolean DEFAULT true NOT NULL,
	"quelle" text,
	"inhalt_hash" text NOT NULL,
	"status" "lernapp_status" DEFAULT 'entwurf' NOT NULL,
	"verfasst_von" text,
	"menschlich_geprueft" boolean DEFAULT false NOT NULL,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL,
	"aktualisiert_am" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lernapp_aussage_schluessel_unique" UNIQUE("schluessel")
);
--> statement-breakpoint
CREATE TABLE "lernapp_beleg" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"aussage_id" uuid,
	"tipp_id" uuid,
	"quelle_id" uuid NOT NULL,
	"passage" text NOT NULL,
	"stelle" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"zitat_von" integer,
	"zitat_bis" integer,
	"art" "lernapp_beleg_art" DEFAULT 'sinngemaess' NOT NULL,
	"inhalt_hash" text NOT NULL,
	"status" "lernapp_status" DEFAULT 'entwurf' NOT NULL,
	"verfasst_von" text,
	"menschlich_geprueft" boolean DEFAULT false NOT NULL,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL,
	"aktualisiert_am" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lernapp_beleg_ein_bezug" CHECK (num_nonnulls("lernapp_beleg"."aussage_id", "lernapp_beleg"."tipp_id") = 1)
);
--> statement-breakpoint
CREATE TABLE "lernapp_einheit" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"abschnitt_id" uuid NOT NULL,
	"schluessel" text NOT NULL,
	"reihenfolge" smallint NOT NULL,
	"thema" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"kann_beschreibungen" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"symbol" text,
	"nur_fuer_ausgang" "lernapp_sprache",
	"inhalt_hash" text NOT NULL,
	"status" "lernapp_status" DEFAULT 'entwurf' NOT NULL,
	"verfasst_von" text,
	"menschlich_geprueft" boolean DEFAULT false NOT NULL,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL,
	"aktualisiert_am" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lernapp_einheit_schluessel_unique" UNIQUE("schluessel")
);
--> statement-breakpoint
CREATE TABLE "lernapp_kurs" (
	"id" text PRIMARY KEY NOT NULL,
	"art" "lernapp_kurs_art" NOT NULL,
	"zielsprache" "lernapp_sprache" NOT NULL,
	"titel" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"aktiv" boolean DEFAULT false NOT NULL,
	"aktualisiert_am" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lernapp_lektion" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"einheit_id" uuid NOT NULL,
	"schluessel" text NOT NULL,
	"art" "lernapp_lektion_art" DEFAULT 'lektion' NOT NULL,
	"reihenfolge" smallint NOT NULL,
	"ziel" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"kinder_geeignet" boolean DEFAULT true NOT NULL,
	"inhalt_hash" text NOT NULL,
	"status" "lernapp_status" DEFAULT 'entwurf' NOT NULL,
	"verfasst_von" text,
	"menschlich_geprueft" boolean DEFAULT false NOT NULL,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL,
	"aktualisiert_am" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lernapp_lektion_schluessel_unique" UNIQUE("schluessel")
);
--> statement-breakpoint
CREATE TABLE "lernapp_lemma" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kurs_id" text NOT NULL,
	"schluessel" text NOT NULL,
	"lemma" text NOT NULL,
	"wortart" text,
	"merkmale" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"formen" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"stufe" "lernapp_stufe" NOT NULL,
	"frequenz_rang" integer,
	"symbol" text,
	"religionsbezug" boolean DEFAULT false NOT NULL,
	"quelle" text NOT NULL,
	"lizenz" text NOT NULL,
	"namensnennung" text,
	"inhalt_hash" text NOT NULL,
	"status" "lernapp_status" DEFAULT 'entwurf' NOT NULL,
	"verfasst_von" text,
	"menschlich_geprueft" boolean DEFAULT false NOT NULL,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL,
	"aktualisiert_am" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lernapp_lemma_schluessel_unique" UNIQUE("schluessel")
);
--> statement-breakpoint
CREATE TABLE "lernapp_meldung" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"aufgabe_schluessel" text NOT NULL,
	"kategorie" "lernapp_meldung_kategorie" NOT NULL,
	"antwort" text,
	"status" "lernapp_meldung_status" DEFAULT 'offen' NOT NULL,
	"am" timestamp with time zone DEFAULT now() NOT NULL,
	"erledigt_am" timestamp with time zone,
	"erledigt_von" text
);
--> statement-breakpoint
CREATE TABLE "lernapp_pruefer_sprache" (
	"benutzer_id" text NOT NULL,
	"sprache" "lernapp_sprache" NOT NULL,
	"ebene" "lernapp_ebene" NOT NULL,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lernapp_pruefer_sprache_benutzer_id_sprache_pk" PRIMARY KEY("benutzer_id","sprache")
);
--> statement-breakpoint
CREATE TABLE "lernapp_pruefung" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"inhalt_typ" "lernapp_inhalt_typ" NOT NULL,
	"inhalt_id" text NOT NULL,
	"inhalt_hash" text NOT NULL,
	"art" "lernapp_pruef_art" NOT NULL,
	"pruefende_id" text,
	"urteil" "lernapp_urteil" NOT NULL,
	"kategorie" "lernapp_fehler",
	"belege_geprueft" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"korrektur" text,
	"kommentar" text,
	"stichprobe_id" uuid,
	"am" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lernapp_quelle" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kurz" text NOT NULL,
	"werk" text NOT NULL,
	"autor" text,
	"todesjahr" smallint,
	"ausgabe" text,
	"art" "lernapp_quelle_art" NOT NULL,
	"openiti_uri" text,
	"sha256" text,
	"lizenz" text,
	"nur_verweis" boolean DEFAULT false NOT NULL,
	"aktualisiert_am" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lernapp_quelle_kurz_unique" UNIQUE("kurz")
);
--> statement-breakpoint
CREATE TABLE "lernapp_richtung" (
	"id" text PRIMARY KEY NOT NULL,
	"kurs_id" text NOT NULL,
	"ausgangssprache" "lernapp_sprache" NOT NULL,
	"titel" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"aktiv" boolean DEFAULT false NOT NULL,
	CONSTRAINT "lernapp_richtung_eindeutig" UNIQUE("kurs_id","ausgangssprache")
);
--> statement-breakpoint
CREATE TABLE "lernapp_satz" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kurs_id" text NOT NULL,
	"einheit_id" uuid,
	"schluessel" text NOT NULL,
	"text" text NOT NULL,
	"tokens" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"stufe" "lernapp_stufe" NOT NULL,
	"religionsbezug" boolean DEFAULT false NOT NULL,
	"quelle" text NOT NULL,
	"lizenz" text NOT NULL,
	"namensnennung" text,
	"inhalt_hash" text NOT NULL,
	"status" "lernapp_status" DEFAULT 'entwurf' NOT NULL,
	"verfasst_von" text,
	"menschlich_geprueft" boolean DEFAULT false NOT NULL,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL,
	"aktualisiert_am" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lernapp_satz_schluessel_unique" UNIQUE("schluessel")
);
--> statement-breakpoint
CREATE TABLE "lernapp_sprecher" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"vereinbarung_medium_id" uuid NOT NULL,
	"ki_synthese_erlaubt" boolean DEFAULT false NOT NULL,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lernapp_stichprobe" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"einheit_id" uuid NOT NULL,
	"sprache" "lernapp_sprache" NOT NULL,
	"richtung_id" text,
	"art" "lernapp_stichprobe_art" NOT NULL,
	"einlauf" boolean DEFAULT false NOT NULL,
	"seed" text NOT NULL,
	"groesse" integer NOT NULL,
	"auswahl" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"ergebnis" jsonb,
	"entscheidung" "lernapp_entscheidung" DEFAULT 'offen' NOT NULL,
	"einheit_hash" text,
	"gezogen_am" timestamp with time zone DEFAULT now() NOT NULL,
	"entschieden_am" timestamp with time zone,
	"entschieden_von" text
);
--> statement-breakpoint
CREATE TABLE "lernapp_text" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"einheit_id" uuid NOT NULL,
	"lektion_id" uuid,
	"schluessel" text NOT NULL,
	"art" "lernapp_text_art" NOT NULL,
	"titel" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"zeilen" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"fragen" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"religionsbezug" boolean DEFAULT false NOT NULL,
	"quelle" text,
	"inhalt_hash" text NOT NULL,
	"status" "lernapp_status" DEFAULT 'entwurf' NOT NULL,
	"verfasst_von" text,
	"menschlich_geprueft" boolean DEFAULT false NOT NULL,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL,
	"aktualisiert_am" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lernapp_text_schluessel_unique" UNIQUE("schluessel")
);
--> statement-breakpoint
CREATE TABLE "lernapp_tipp" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"einheit_id" uuid NOT NULL,
	"schluessel" text NOT NULL,
	"ausgangssprache" "lernapp_sprache" NOT NULL,
	"reihenfolge" smallint DEFAULT 0 NOT NULL,
	"titel" text,
	"inhalt" jsonb NOT NULL,
	"religionsbezug" boolean DEFAULT false NOT NULL,
	"quelle" text,
	"inhalt_hash" text NOT NULL,
	"status" "lernapp_status" DEFAULT 'entwurf' NOT NULL,
	"verfasst_von" text,
	"menschlich_geprueft" boolean DEFAULT false NOT NULL,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL,
	"aktualisiert_am" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lernapp_tipp_schluessel_unique" UNIQUE("schluessel")
);
--> statement-breakpoint
CREATE TABLE "lernapp_uebersetzung" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lemma_id" uuid,
	"satz_id" uuid,
	"sprache" "lernapp_sprache" NOT NULL,
	"text" text NOT NULL,
	"alternativen" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"religionsbezug" boolean DEFAULT false NOT NULL,
	"quelle" text NOT NULL,
	"lizenz" text NOT NULL,
	"namensnennung" text,
	"inhalt_hash" text NOT NULL,
	"status" "lernapp_status" DEFAULT 'entwurf' NOT NULL,
	"verfasst_von" text,
	"menschlich_geprueft" boolean DEFAULT false NOT NULL,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL,
	"aktualisiert_am" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lernapp_uebersetzung_eindeutig" UNIQUE NULLS NOT DISTINCT("lemma_id","satz_id","sprache"),
	CONSTRAINT "lernapp_uebersetzung_ein_bezug" CHECK (num_nonnulls("lernapp_uebersetzung"."lemma_id", "lernapp_uebersetzung"."satz_id") = 1)
);
--> statement-breakpoint
ALTER TABLE "lernapp_abschnitt" ADD CONSTRAINT "lernapp_abschnitt_kurs_id_lernapp_kurs_id_fk" FOREIGN KEY ("kurs_id") REFERENCES "public"."lernapp_kurs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lernapp_audio" ADD CONSTRAINT "lernapp_audio_sprecher_id_lernapp_sprecher_id_fk" FOREIGN KEY ("sprecher_id") REFERENCES "public"."lernapp_sprecher"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lernapp_aufgabe" ADD CONSTRAINT "lernapp_aufgabe_lektion_id_lernapp_lektion_id_fk" FOREIGN KEY ("lektion_id") REFERENCES "public"."lernapp_lektion"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lernapp_aufgabe" ADD CONSTRAINT "lernapp_aufgabe_aussage_id_lernapp_aussage_id_fk" FOREIGN KEY ("aussage_id") REFERENCES "public"."lernapp_aussage"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lernapp_aussage" ADD CONSTRAINT "lernapp_aussage_lektion_id_lernapp_lektion_id_fk" FOREIGN KEY ("lektion_id") REFERENCES "public"."lernapp_lektion"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lernapp_beleg" ADD CONSTRAINT "lernapp_beleg_aussage_id_lernapp_aussage_id_fk" FOREIGN KEY ("aussage_id") REFERENCES "public"."lernapp_aussage"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lernapp_beleg" ADD CONSTRAINT "lernapp_beleg_tipp_id_lernapp_tipp_id_fk" FOREIGN KEY ("tipp_id") REFERENCES "public"."lernapp_tipp"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lernapp_beleg" ADD CONSTRAINT "lernapp_beleg_quelle_id_lernapp_quelle_id_fk" FOREIGN KEY ("quelle_id") REFERENCES "public"."lernapp_quelle"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lernapp_einheit" ADD CONSTRAINT "lernapp_einheit_abschnitt_id_lernapp_abschnitt_id_fk" FOREIGN KEY ("abschnitt_id") REFERENCES "public"."lernapp_abschnitt"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lernapp_lektion" ADD CONSTRAINT "lernapp_lektion_einheit_id_lernapp_einheit_id_fk" FOREIGN KEY ("einheit_id") REFERENCES "public"."lernapp_einheit"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lernapp_lemma" ADD CONSTRAINT "lernapp_lemma_kurs_id_lernapp_kurs_id_fk" FOREIGN KEY ("kurs_id") REFERENCES "public"."lernapp_kurs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lernapp_meldung" ADD CONSTRAINT "lernapp_meldung_erledigt_von_user_id_fk" FOREIGN KEY ("erledigt_von") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lernapp_pruefer_sprache" ADD CONSTRAINT "lernapp_pruefer_sprache_benutzer_id_user_id_fk" FOREIGN KEY ("benutzer_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lernapp_pruefung" ADD CONSTRAINT "lernapp_pruefung_pruefende_id_user_id_fk" FOREIGN KEY ("pruefende_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lernapp_pruefung" ADD CONSTRAINT "lernapp_pruefung_stichprobe_id_lernapp_stichprobe_id_fk" FOREIGN KEY ("stichprobe_id") REFERENCES "public"."lernapp_stichprobe"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lernapp_richtung" ADD CONSTRAINT "lernapp_richtung_kurs_id_lernapp_kurs_id_fk" FOREIGN KEY ("kurs_id") REFERENCES "public"."lernapp_kurs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lernapp_satz" ADD CONSTRAINT "lernapp_satz_kurs_id_lernapp_kurs_id_fk" FOREIGN KEY ("kurs_id") REFERENCES "public"."lernapp_kurs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lernapp_satz" ADD CONSTRAINT "lernapp_satz_einheit_id_lernapp_einheit_id_fk" FOREIGN KEY ("einheit_id") REFERENCES "public"."lernapp_einheit"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lernapp_sprecher" ADD CONSTRAINT "lernapp_sprecher_vereinbarung_medium_id_medium_id_fk" FOREIGN KEY ("vereinbarung_medium_id") REFERENCES "public"."medium"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lernapp_stichprobe" ADD CONSTRAINT "lernapp_stichprobe_einheit_id_lernapp_einheit_id_fk" FOREIGN KEY ("einheit_id") REFERENCES "public"."lernapp_einheit"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lernapp_stichprobe" ADD CONSTRAINT "lernapp_stichprobe_richtung_id_lernapp_richtung_id_fk" FOREIGN KEY ("richtung_id") REFERENCES "public"."lernapp_richtung"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lernapp_stichprobe" ADD CONSTRAINT "lernapp_stichprobe_entschieden_von_user_id_fk" FOREIGN KEY ("entschieden_von") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lernapp_text" ADD CONSTRAINT "lernapp_text_einheit_id_lernapp_einheit_id_fk" FOREIGN KEY ("einheit_id") REFERENCES "public"."lernapp_einheit"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lernapp_text" ADD CONSTRAINT "lernapp_text_lektion_id_lernapp_lektion_id_fk" FOREIGN KEY ("lektion_id") REFERENCES "public"."lernapp_lektion"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lernapp_tipp" ADD CONSTRAINT "lernapp_tipp_einheit_id_lernapp_einheit_id_fk" FOREIGN KEY ("einheit_id") REFERENCES "public"."lernapp_einheit"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lernapp_uebersetzung" ADD CONSTRAINT "lernapp_uebersetzung_lemma_id_lernapp_lemma_id_fk" FOREIGN KEY ("lemma_id") REFERENCES "public"."lernapp_lemma"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lernapp_uebersetzung" ADD CONSTRAINT "lernapp_uebersetzung_satz_id_lernapp_satz_id_fk" FOREIGN KEY ("satz_id") REFERENCES "public"."lernapp_satz"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "lernapp_audio_buendel_idx" ON "lernapp_audio" USING btree ("buendel");--> statement-breakpoint
CREATE INDEX "lernapp_aufgabe_lektion_idx" ON "lernapp_aufgabe" USING btree ("lektion_id","reihenfolge");--> statement-breakpoint
CREATE INDEX "lernapp_aufgabe_aussage_idx" ON "lernapp_aufgabe" USING btree ("aussage_id");--> statement-breakpoint
CREATE INDEX "lernapp_aussage_lektion_idx" ON "lernapp_aussage" USING btree ("lektion_id","reihenfolge");--> statement-breakpoint
CREATE INDEX "lernapp_beleg_aussage_idx" ON "lernapp_beleg" USING btree ("aussage_id");--> statement-breakpoint
CREATE INDEX "lernapp_beleg_tipp_idx" ON "lernapp_beleg" USING btree ("tipp_id");--> statement-breakpoint
CREATE INDEX "lernapp_einheit_abschnitt_idx" ON "lernapp_einheit" USING btree ("abschnitt_id","reihenfolge");--> statement-breakpoint
CREATE INDEX "lernapp_lektion_einheit_idx" ON "lernapp_lektion" USING btree ("einheit_id","reihenfolge");--> statement-breakpoint
CREATE INDEX "lernapp_lemma_kurs_stufe_idx" ON "lernapp_lemma" USING btree ("kurs_id","stufe");--> statement-breakpoint
CREATE INDEX "lernapp_lemma_kurs_lemma_idx" ON "lernapp_lemma" USING btree ("kurs_id","lemma");--> statement-breakpoint
CREATE INDEX "lernapp_meldung_aufgabe_idx" ON "lernapp_meldung" USING btree ("aufgabe_schluessel");--> statement-breakpoint
CREATE INDEX "lernapp_meldung_status_idx" ON "lernapp_meldung" USING btree ("status","am");--> statement-breakpoint
CREATE INDEX "lernapp_pruefung_inhalt_idx" ON "lernapp_pruefung" USING btree ("inhalt_typ","inhalt_id","inhalt_hash");--> statement-breakpoint
CREATE INDEX "lernapp_pruefung_pruefende_idx" ON "lernapp_pruefung" USING btree ("pruefende_id");--> statement-breakpoint
CREATE INDEX "lernapp_pruefung_stichprobe_idx" ON "lernapp_pruefung" USING btree ("stichprobe_id");--> statement-breakpoint
CREATE INDEX "lernapp_satz_kurs_stufe_idx" ON "lernapp_satz" USING btree ("kurs_id","stufe");--> statement-breakpoint
CREATE INDEX "lernapp_satz_einheit_idx" ON "lernapp_satz" USING btree ("einheit_id");--> statement-breakpoint
CREATE INDEX "lernapp_stichprobe_einheit_idx" ON "lernapp_stichprobe" USING btree ("einheit_id","art");--> statement-breakpoint
CREATE INDEX "lernapp_text_einheit_idx" ON "lernapp_text" USING btree ("einheit_id");--> statement-breakpoint
CREATE INDEX "lernapp_tipp_einheit_idx" ON "lernapp_tipp" USING btree ("einheit_id","ausgangssprache");--> statement-breakpoint
CREATE INDEX "lernapp_uebersetzung_satz_idx" ON "lernapp_uebersetzung" USING btree ("satz_id");
