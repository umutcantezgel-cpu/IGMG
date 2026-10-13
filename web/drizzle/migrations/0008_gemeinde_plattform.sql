CREATE TYPE "public"."freigabe_status" AS ENUM('entwurf', 'zur_pruefung', 'geprueft');--> statement-breakpoint
CREATE TYPE "public"."gemeinde_rolle_art" AS ENUM('gemeinde', 'eltern', 'lehrkraft', 'schueler');--> statement-breakpoint
CREATE TYPE "public"."quran_einteilung_art" AS ENUM('cuz', 'hizb_viertel', 'seite', 'manzil', 'ruku', 'secde');--> statement-breakpoint
CREATE TYPE "public"."quran_offenbarungsort" AS ENUM('mekki', 'medeni');--> statement-breakpoint
CREATE TYPE "public"."quran_rezitation_art" AS ENUM('eigen', 'lizenziert');--> statement-breakpoint
CREATE TYPE "public"."quran_wortzeit_quelle" AS ENUM('mitklopfen', 'aligner', 'quran_align');--> statement-breakpoint
CREATE TYPE "public"."konto_einwilligung_art" AS ENUM('lernplattform', 'kinderkonto', 'gruppenchat', 'push_kind', 'push', 'newsletter', 'personenfotos', 'chat_regeln');--> statement-breakpoint
CREATE TYPE "public"."anwesenheit_status" AS ENUM('anwesend', 'fehlt', 'entschuldigt', 'verspaetet');--> statement-breakpoint
CREATE TYPE "public"."gruppe_chat_modus" AS ENUM('aus', 'nur_lehrkraft', 'offen');--> statement-breakpoint
CREATE TYPE "public"."fehlmeldung_grund" AS ENUM('krank', 'familie', 'schule', 'sonstiges');--> statement-breakpoint
CREATE TYPE "public"."fortschritt_status" AS ENUM('begonnen', 'sicher', 'abgeschlossen');--> statement-breakpoint
CREATE TYPE "public"."gruppe_status" AS ENUM('aktiv', 'archiviert');--> statement-breakpoint
CREATE TYPE "public"."kursart" AS ENUM('elifbe', 'kuran', 'tecvid', 'ilmihal', 'hifz');--> statement-breakpoint
CREATE TYPE "public"."gruppen_leitung_rolle" AS ENUM('lehrkraft', 'aufsicht');--> statement-breakpoint
CREATE TYPE "public"."lernende_status" AS ENUM('aktiv', 'pausiert', 'beendet');--> statement-breakpoint
CREATE TYPE "public"."chat_kanal_art" AS ENUM('gruppe', 'eltern');--> statement-breakpoint
CREATE TYPE "public"."chat_kanal_status" AS ENUM('aktiv', 'pausiert', 'archiviert');--> statement-breakpoint
CREATE TYPE "public"."chat_meldung_grund" AS ENUM('beleidigung', 'bedrohung', 'unangemessen', 'spam', 'sonstiges');--> statement-breakpoint
CREATE TYPE "public"."chat_meldung_status" AS ENUM('offen', 'in_bearbeitung', 'erledigt');--> statement-breakpoint
CREATE TYPE "public"."moderation_aktion" AS ENUM('entfernt', 'stumm', 'stumm_aufgehoben', 'pausiert', 'fortgesetzt', 'mitglied_entfernt', 'meldung_bearbeitet', 'notfallpause', 'notfallpause_aufgehoben', 'kontext_eingesehen', 'loeschlauf');--> statement-breakpoint
CREATE TYPE "public"."elifbe_uebung_art" AS ENUM('erkennen', 'zuordnen', 'hoeren', 'lesen', 'nachspuren');--> statement-breakpoint
CREATE TYPE "public"."freigabe_art" AS ENUM('redaktion', 'religioes');--> statement-breakpoint
CREATE TYPE "public"."anzeige_folie_art" AS ENUM('text', 'bild', 'veranstaltung', 'vers', 'hadith', 'spende', 'hinweis');--> statement-breakpoint
CREATE TYPE "public"."besonderer_tag_art" AS ENUM('kandil', 'bayram', 'ramadan_beginn', 'ramadan_ende', 'asure', 'hicri_neujahr', 'sonstiges');--> statement-breakpoint
CREATE TYPE "public"."besonderer_tag_quelle" AS ENUM('berechnet', 'bestaetigt');--> statement-breakpoint
CREATE TYPE "public"."hatim_status" AS ENUM('offen', 'abgeschlossen', 'archiviert');--> statement-breakpoint
ALTER TYPE "public"."rolle" ADD VALUE 'leitung';--> statement-breakpoint
ALTER TYPE "public"."rolle" ADD VALUE 'religioese_pruefung';--> statement-breakpoint
ALTER TYPE "public"."rolle" ADD VALUE 'kinderschutz';--> statement-breakpoint
CREATE TABLE "quran_audio" (
	"rezitation_id" text NOT NULL,
	"sure" smallint NOT NULL,
	"vers" smallint DEFAULT 0 NOT NULL,
	"pfad" text NOT NULL,
	"mime" text NOT NULL,
	"bytes" integer NOT NULL,
	"sha256" text NOT NULL,
	"dauer_ms" integer,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "quran_audio_rezitation_id_sure_vers_pk" PRIMARY KEY("rezitation_id","sure","vers")
);
--> statement-breakpoint
CREATE TABLE "quran_ausgabe" (
	"id" text PRIMARY KEY NOT NULL,
	"sprache" text NOT NULL,
	"titel" text NOT NULL,
	"uebersetzer" text NOT NULL,
	"quelle" text NOT NULL,
	"version" text NOT NULL,
	"lizenz" text NOT NULL,
	"url" text NOT NULL,
	"sha256" text NOT NULL,
	"abgerufen_am" timestamp with time zone NOT NULL,
	"aktiv" boolean DEFAULT false NOT NULL,
	"standard" boolean DEFAULT false NOT NULL,
	"freigegeben_von" text,
	"freigegeben_am" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "quran_einteilung" (
	"art" "quran_einteilung_art" NOT NULL,
	"nr" smallint NOT NULL,
	"sure" smallint NOT NULL,
	"vers" smallint NOT NULL,
	"zusatz" text,
	CONSTRAINT "quran_einteilung_art_nr_pk" PRIMARY KEY("art","nr")
);
--> statement-breakpoint
CREATE TABLE "quran_rezitation" (
	"id" text PRIMARY KEY NOT NULL,
	"name" jsonb NOT NULL,
	"rezitator" text NOT NULL,
	"art" "quran_rezitation_art" NOT NULL,
	"lizenz" text NOT NULL,
	"vereinbarung_medium_id" uuid,
	"aktiv" boolean DEFAULT false NOT NULL,
	"standard" boolean DEFAULT false NOT NULL,
	"erstellt_von" text,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "quran_rezitation_vereinbarung" CHECK (not "quran_rezitation"."aktiv" or "quran_rezitation"."vereinbarung_medium_id" is not null)
);
--> statement-breakpoint
CREATE TABLE "quran_uebersetzung" (
	"ausgabe_id" text NOT NULL,
	"sure" smallint NOT NULL,
	"vers" smallint NOT NULL,
	"text" text NOT NULL,
	CONSTRAINT "quran_uebersetzung_ausgabe_id_sure_vers_pk" PRIMARY KEY("ausgabe_id","sure","vers")
);
--> statement-breakpoint
CREATE TABLE "quran_verszeit" (
	"rezitation_id" text NOT NULL,
	"sure" smallint NOT NULL,
	"vers" smallint NOT NULL,
	"start_ms" integer NOT NULL,
	"ende_ms" integer NOT NULL,
	CONSTRAINT "quran_verszeit_rezitation_id_sure_vers_pk" PRIMARY KEY("rezitation_id","sure","vers")
);
--> statement-breakpoint
CREATE TABLE "quran_wort" (
	"sure" smallint NOT NULL,
	"vers" smallint NOT NULL,
	"pos" smallint NOT NULL,
	"text_ar" text NOT NULL,
	"form_id" integer NOT NULL,
	CONSTRAINT "quran_wort_sure_vers_pos_pk" PRIMARY KEY("sure","vers","pos")
);
--> statement-breakpoint
CREATE TABLE "quran_wortbedeutung" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" integer NOT NULL,
	"sprache" text NOT NULL,
	"bedeutung" text NOT NULL,
	"wurzel" text,
	"anmerkung" text,
	"freigabe" "freigabe_status" DEFAULT 'entwurf' NOT NULL,
	"verfasst_von" text,
	"geprueft_von" text,
	"geprueft_am" timestamp with time zone,
	"aktualisiert_am" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "quran_wortbedeutung_eindeutig" UNIQUE("form_id","sprache")
);
--> statement-breakpoint
CREATE TABLE "quran_wortbedeutung_ort" (
	"sure" smallint NOT NULL,
	"vers" smallint NOT NULL,
	"pos" smallint NOT NULL,
	"sprache" text NOT NULL,
	"bedeutung" text NOT NULL,
	"freigabe" "freigabe_status" DEFAULT 'entwurf' NOT NULL,
	"verfasst_von" text,
	"geprueft_von" text,
	"geprueft_am" timestamp with time zone,
	CONSTRAINT "quran_wortbedeutung_ort_sure_vers_pos_sprache_pk" PRIMARY KEY("sure","vers","pos","sprache")
);
--> statement-breakpoint
CREATE TABLE "quran_wortform" (
	"id" serial PRIMARY KEY NOT NULL,
	"text_ar" text NOT NULL,
	"vorkommen" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "quran_wortform_textAr_unique" UNIQUE("text_ar")
);
--> statement-breakpoint
CREATE TABLE "quran_wortzeit" (
	"rezitation_id" text NOT NULL,
	"sure" smallint NOT NULL,
	"vers" smallint NOT NULL,
	"pos" smallint NOT NULL,
	"start_ms" integer NOT NULL,
	"ende_ms" integer NOT NULL,
	"quelle" "quran_wortzeit_quelle" NOT NULL,
	"geprueft" boolean DEFAULT false NOT NULL,
	CONSTRAINT "quran_wortzeit_rezitation_id_sure_vers_pos_pk" PRIMARY KEY("rezitation_id","sure","vers","pos")
);
--> statement-breakpoint
CREATE TABLE "tajwid_regel" (
	"schluessel" text PRIMARY KEY NOT NULL,
	"familie" text NOT NULL,
	"name" jsonb NOT NULL,
	"kurz" jsonb,
	"erklaerung" jsonb,
	"hoerbeispiel_medium_id" uuid,
	"sortierung" smallint DEFAULT 0 NOT NULL,
	"freigabe" "freigabe_status" DEFAULT 'entwurf' NOT NULL,
	"verfasst_von" text,
	"geprueft_von" text,
	"geprueft_am" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "gemeinde_rolle" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"benutzer_id" text NOT NULL,
	"rolle" "gemeinde_rolle_art" NOT NULL,
	"erstellt_von" text,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "gemeinde_rolle_eindeutig" UNIQUE("benutzer_id","rolle")
);
--> statement-breakpoint
CREATE TABLE "konto_einwilligung" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"benutzer_id" text,
	"lernende_id" uuid,
	"art" "konto_einwilligung_art" NOT NULL,
	"text_version" text NOT NULL,
	"sprache" text DEFAULT 'de' NOT NULL,
	"einvernehmen_bestaetigt" boolean DEFAULT false NOT NULL,
	"erteilt_von" text,
	"erteilt_am" timestamp with time zone DEFAULT now() NOT NULL,
	"widerrufen_am" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "konto_profil" (
	"benutzer_id" text PRIMARY KEY NOT NULL,
	"sprache" text DEFAULT 'de' NOT NULL,
	"anzeigename" text NOT NULL,
	"ist_kind" boolean DEFAULT false NOT NULL,
	"loeschen_ab" timestamp with time zone,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "anwesenheit" (
	"termin_id" uuid NOT NULL,
	"lernende_id" uuid NOT NULL,
	"status" "anwesenheit_status" NOT NULL,
	"notiz_verschluesselt" "bytea",
	"schluessel_id" smallint,
	"erfasst_von" text,
	"erfasst_am" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "anwesenheit_termin_id_lernende_id_pk" PRIMARY KEY("termin_id","lernende_id")
);
--> statement-breakpoint
CREATE TABLE "aufgabe" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gruppe_id" uuid NOT NULL,
	"titel" text NOT NULL,
	"beschreibung" text,
	"faellig" date,
	"bezug" jsonb DEFAULT '{"art":"frei"}'::jsonb NOT NULL,
	"erstellt_von" text,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "aufgabe_erledigt" (
	"aufgabe_id" uuid NOT NULL,
	"lernende_id" uuid NOT NULL,
	"erledigt_am" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "aufgabe_erledigt_aufgabe_id_lernende_id_pk" PRIMARY KEY("aufgabe_id","lernende_id")
);
--> statement-breakpoint
CREATE TABLE "eltern_kind" (
	"eltern_id" text NOT NULL,
	"lernende_id" uuid NOT NULL,
	"sorgeberechtigt" boolean DEFAULT true NOT NULL,
	"bestaetigt_am" timestamp with time zone,
	CONSTRAINT "eltern_kind_eltern_id_lernende_id_pk" PRIMARY KEY("eltern_id","lernende_id")
);
--> statement-breakpoint
CREATE TABLE "fehlmeldung" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lernende_id" uuid NOT NULL,
	"datum" date NOT NULL,
	"grund" "fehlmeldung_grund" DEFAULT 'sonstiges' NOT NULL,
	"erstellt_von" text,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gruppe" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kurs_id" uuid,
	"name" jsonb NOT NULL,
	"schuljahr" text,
	"beginn" date,
	"ende" date,
	"ort" text,
	"wochentage" smallint[] DEFAULT '{}' NOT NULL,
	"uhrzeit_von" text,
	"uhrzeit_bis" text,
	"chat_modus" "gruppe_chat_modus" DEFAULT 'aus' NOT NULL,
	"chat_mindestalter" smallint DEFAULT 10 NOT NULL,
	"chat_von" text DEFAULT '08:00' NOT NULL,
	"chat_bis" text DEFAULT '20:00' NOT NULL,
	"status" "gruppe_status" DEFAULT 'aktiv' NOT NULL,
	"erstellt_von" text,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL,
	"aktualisiert_am" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gruppen_leitung" (
	"gruppe_id" uuid NOT NULL,
	"benutzer_id" text NOT NULL,
	"rolle" "gruppen_leitung_rolle" DEFAULT 'lehrkraft' NOT NULL,
	CONSTRAINT "gruppen_leitung_gruppe_id_benutzer_id_pk" PRIMARY KEY("gruppe_id","benutzer_id")
);
--> statement-breakpoint
CREATE TABLE "gruppen_mitglied" (
	"gruppe_id" uuid NOT NULL,
	"lernende_id" uuid NOT NULL,
	"seit" date DEFAULT now() NOT NULL,
	"bis" date,
	CONSTRAINT "gruppen_mitglied_gruppe_id_lernende_id_pk" PRIMARY KEY("gruppe_id","lernende_id")
);
--> statement-breakpoint
CREATE TABLE "hifz_eintrag" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lernende_id" uuid NOT NULL,
	"sure" smallint NOT NULL,
	"von_vers" smallint NOT NULL,
	"bis_vers" smallint NOT NULL,
	"bewertung" smallint,
	"datum" date DEFAULT now() NOT NULL,
	"lehrkraft_id" text
);
--> statement-breakpoint
CREATE TABLE "lehrplan_stufe" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kursart" "kursart" NOT NULL,
	"reihenfolge" smallint NOT NULL,
	"titel" jsonb NOT NULL,
	"beschreibung" jsonb,
	CONSTRAINT "lehrplan_stufe_eindeutig" UNIQUE("kursart","reihenfolge")
);
--> statement-breakpoint
CREATE TABLE "lernende" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"benutzer_id" text,
	"daten_verschluesselt" "bytea" NOT NULL,
	"schluessel_id" smallint NOT NULL,
	"anzeigename" text NOT NULL,
	"sechzehn_am" date,
	"eingang_id" uuid,
	"status" "lernende_status" DEFAULT 'aktiv' NOT NULL,
	"aufgenommen_am" timestamp with time zone DEFAULT now() NOT NULL,
	"aufgenommen_von" text,
	"loeschen_ab" timestamp with time zone,
	CONSTRAINT "lernende_benutzerId_unique" UNIQUE("benutzer_id")
);
--> statement-breakpoint
CREATE TABLE "lernfortschritt" (
	"lernende_id" uuid NOT NULL,
	"stufe_id" uuid NOT NULL,
	"status" "fortschritt_status" NOT NULL,
	"datum" date DEFAULT now() NOT NULL,
	"lehrkraft_id" text,
	CONSTRAINT "lernfortschritt_lernende_id_stufe_id_pk" PRIMARY KEY("lernende_id","stufe_id")
);
--> statement-breakpoint
CREATE TABLE "unterrichtstermin" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gruppe_id" uuid NOT NULL,
	"datum" date NOT NULL,
	"beginn" text,
	"ende" text,
	"ausgefallen" boolean DEFAULT false NOT NULL,
	"thema" text,
	CONSTRAINT "unterrichtstermin_eindeutig" UNIQUE NULLS NOT DISTINCT("gruppe_id","datum","beginn")
);
--> statement-breakpoint
CREATE TABLE "urkunde" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lernende_id" uuid NOT NULL,
	"art" text NOT NULL,
	"titel" jsonb NOT NULL,
	"pruefcode" text NOT NULL,
	"ausgestellt_am" timestamp with time zone DEFAULT now() NOT NULL,
	"ausgestellt_von" text,
	"anzahl" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "urkunde_pruefcode_unique" UNIQUE("pruefcode")
);
--> statement-breakpoint
CREATE TABLE "chat_gelesen" (
	"kanal_id" uuid NOT NULL,
	"benutzer_id" text NOT NULL,
	"bis_id" bigint DEFAULT 0 NOT NULL,
	CONSTRAINT "chat_gelesen_kanal_id_benutzer_id_pk" PRIMARY KEY("kanal_id","benutzer_id")
);
--> statement-breakpoint
CREATE TABLE "chat_kanal" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gruppe_id" uuid NOT NULL,
	"art" "chat_kanal_art" NOT NULL,
	"status" "chat_kanal_status" DEFAULT 'aktiv' NOT NULL,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chat_kanal_eindeutig" UNIQUE("gruppe_id","art")
);
--> statement-breakpoint
CREATE TABLE "chat_meldung" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kanal_id" uuid,
	"nachricht_id" bigint,
	"gemeldet_von" text,
	"grund" "chat_meldung_grund" NOT NULL,
	"freitext_verschluesselt" "bytea",
	"kontext_verschluesselt" "bytea" NOT NULL,
	"schluessel_id" smallint NOT NULL,
	"status" "chat_meldung_status" DEFAULT 'offen' NOT NULL,
	"bearbeitet_von" text,
	"bearbeitet_am" timestamp with time zone,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL,
	"loeschen_ab" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "chat_nachricht" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"kanal_id" uuid NOT NULL,
	"absender_id" text,
	"text_verschluesselt" "bytea" NOT NULL,
	"schluessel_id" smallint NOT NULL,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL,
	"entfernt_am" timestamp with time zone,
	"entfernt_von" text,
	"entfernt_grund" text
);
--> statement-breakpoint
CREATE TABLE "chat_regeln_bestaetigt" (
	"benutzer_id" text NOT NULL,
	"version" text NOT NULL,
	"bestaetigt_am" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chat_regeln_bestaetigt_benutzer_id_version_pk" PRIMARY KEY("benutzer_id","version")
);
--> statement-breakpoint
CREATE TABLE "chat_stumm" (
	"kanal_id" uuid NOT NULL,
	"benutzer_id" text NOT NULL,
	"bis" timestamp with time zone NOT NULL,
	"von" text,
	"grund" text NOT NULL,
	CONSTRAINT "chat_stumm_kanal_id_benutzer_id_pk" PRIMARY KEY("kanal_id","benutzer_id")
);
--> statement-breakpoint
CREATE TABLE "moderationsprotokoll" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"zeitpunkt" timestamp with time zone DEFAULT now() NOT NULL,
	"kanal_id" uuid,
	"nachricht_id" bigint,
	"akteur_id" text,
	"aktion" "moderation_aktion" NOT NULL,
	"grund" text NOT NULL,
	"vorgaenger_hash" text NOT NULL,
	"hash" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hadith" (
	"sammlung_id" text NOT NULL,
	"nummer" text NOT NULL,
	"sortierung" integer NOT NULL,
	"arabische_nummer" text,
	"buch_nr" smallint NOT NULL,
	"im_buch_nr" integer,
	"text_ar" text NOT NULL,
	"text_normalisiert" text NOT NULL,
	"bewertung" text,
	"bewertet_von" text,
	"suche" "tsvector",
	CONSTRAINT "hadith_sammlung_id_nummer_pk" PRIMARY KEY("sammlung_id","nummer")
);
--> statement-breakpoint
CREATE TABLE "hadith_auswahl" (
	"liste" text NOT NULL,
	"sammlung_id" text NOT NULL,
	"nummer" text NOT NULL,
	"reihenfolge" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "hadith_auswahl_liste_sammlung_id_nummer_pk" PRIMARY KEY("liste","sammlung_id","nummer")
);
--> statement-breakpoint
CREATE TABLE "hadith_buch" (
	"sammlung_id" text NOT NULL,
	"nr" smallint NOT NULL,
	"titel_ar" text,
	"titel" jsonb,
	"hadith_von" integer,
	"hadith_bis" integer,
	CONSTRAINT "hadith_buch_sammlung_id_nr_pk" PRIMARY KEY("sammlung_id","nr")
);
--> statement-breakpoint
CREATE TABLE "hadith_sammlung" (
	"id" text PRIMARY KEY NOT NULL,
	"name" jsonb NOT NULL,
	"name_ar" text,
	"quelle" text NOT NULL,
	"url" text NOT NULL,
	"version" text NOT NULL,
	"lizenz" text NOT NULL,
	"sha256" text NOT NULL,
	"importiert_am" timestamp with time zone DEFAULT now() NOT NULL,
	"freigegeben" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hadith_uebersetzung" (
	"sammlung_id" text NOT NULL,
	"nummer" text NOT NULL,
	"sprache" text NOT NULL,
	"text" text NOT NULL,
	"uebersetzer" text NOT NULL,
	"quelle" text NOT NULL,
	"lizenz" text NOT NULL,
	"freigabe" "freigabe_status" DEFAULT 'entwurf' NOT NULL,
	"verfasst_von" text,
	"geprueft_von" text,
	"geprueft_am" timestamp with time zone,
	CONSTRAINT "hadith_uebersetzung_sammlung_id_nummer_sprache_pk" PRIMARY KEY("sammlung_id","nummer","sprache")
);
--> statement-breakpoint
CREATE TABLE "elifbe_audio" (
	"schluessel" text PRIMARY KEY NOT NULL,
	"medium_id" uuid NOT NULL,
	"sprecher" text NOT NULL,
	"vereinbarung_medium_id" uuid,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "elifbe_beispielwort" (
	"buchstabe" text NOT NULL,
	"sure" smallint NOT NULL,
	"vers" smallint NOT NULL,
	"pos" smallint NOT NULL,
	CONSTRAINT "elifbe_beispielwort_buchstabe_sure_vers_pos_pk" PRIMARY KEY("buchstabe","sure","vers","pos")
);
--> statement-breakpoint
CREATE TABLE "elifbe_fortschritt" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lernende_id" uuid,
	"benutzer_id" text,
	"uebung_id" uuid NOT NULL,
	"ergebnis" integer NOT NULL,
	"am" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "elifbe_lektion" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nr" smallint NOT NULL,
	"slug" text NOT NULL,
	"titel" jsonb NOT NULL,
	"ziel" jsonb,
	"inhalt" jsonb,
	"buchstaben" text[] DEFAULT '{}' NOT NULL,
	"freigabe" "freigabe_status" DEFAULT 'entwurf' NOT NULL,
	"verfasst_von" text,
	"geprueft_von" text,
	"geprueft_am" timestamp with time zone,
	CONSTRAINT "elifbe_lektion_nr_unique" UNIQUE("nr"),
	CONSTRAINT "elifbe_lektion_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "elifbe_uebung" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lektion_id" uuid NOT NULL,
	"art" "elifbe_uebung_art" NOT NULL,
	"daten" jsonb NOT NULL,
	"reihenfolge" smallint DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "freigabe" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"inhalt_typ" text NOT NULL,
	"inhalt_id" text NOT NULL,
	"art" "freigabe_art" NOT NULL,
	"status" "freigabe_status" NOT NULL,
	"von" text,
	"am" timestamp with time zone DEFAULT now() NOT NULL,
	"kommentar" text
);
--> statement-breakpoint
CREATE TABLE "menue" (
	"schluessel" text PRIMARY KEY NOT NULL,
	"eintraege" jsonb NOT NULL,
	"aktualisiert_am" timestamp with time zone DEFAULT now() NOT NULL,
	"aktualisiert_von" text
);
--> statement-breakpoint
CREATE TABLE "revision" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"inhalt_typ" text NOT NULL,
	"inhalt_id" text NOT NULL,
	"inhalt" jsonb NOT NULL,
	"kommentar" text,
	"erstellt_von" text,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seite" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"status" "inhalt_status" DEFAULT 'entwurf' NOT NULL,
	"im_papierkorb_seit" timestamp with time zone,
	"ist_beispiel" boolean DEFAULT false NOT NULL,
	"quelle" text,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL,
	"aktualisiert_am" timestamp with time zone DEFAULT now() NOT NULL,
	"erstellt_von" text,
	"aktualisiert_von" text,
	"slug_de" text NOT NULL,
	"slug_tr" text,
	"slug_en" text,
	"titel" jsonb NOT NULL,
	"beschreibung" jsonb,
	"bloecke" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"organisation" "organisation",
	"veroeffentlichen_am" timestamp with time zone,
	CONSTRAINT "seite_slugDe_unique" UNIQUE("slug_de"),
	CONSTRAINT "seite_slugTr_unique" UNIQUE("slug_tr"),
	CONSTRAINT "seite_slugEn_unique" UNIQUE("slug_en")
);
--> statement-breakpoint
CREATE TABLE "vorschau_token" (
	"token_hash" text PRIMARY KEY NOT NULL,
	"inhalt_typ" text NOT NULL,
	"inhalt_id" text NOT NULL,
	"laeuft_ab" timestamp with time zone NOT NULL,
	"erstellt_von" text,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "weiterleitung" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"von" text NOT NULL,
	"nach" text NOT NULL,
	"code" smallint DEFAULT 308 NOT NULL,
	"erstellt_von" text,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "weiterleitung_von_unique" UNIQUE("von")
);
--> statement-breakpoint
CREATE TABLE "anzeige_folie" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"art" "anzeige_folie_art" NOT NULL,
	"inhalt" jsonb NOT NULL,
	"medium_id" uuid,
	"von" timestamp with time zone,
	"bis" timestamp with time zone,
	"wochentage" smallint[] DEFAULT '{}' NOT NULL,
	"reihenfolge" integer DEFAULT 0 NOT NULL,
	"status" "inhalt_status" DEFAULT 'entwurf' NOT NULL,
	"erstellt_von" text,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "besonderer_tag" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"art" "besonderer_tag_art" NOT NULL,
	"datum" date NOT NULL,
	"titel" jsonb NOT NULL,
	"beschreibung" jsonb,
	"quelle" "besonderer_tag_quelle" DEFAULT 'berechnet' NOT NULL,
	"freigabe" "freigabe_status" DEFAULT 'entwurf' NOT NULL,
	"verfasst_von" text,
	"geprueft_von" text,
	"geprueft_am" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "dienst" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"titel" jsonb NOT NULL,
	"beschreibung" jsonb,
	"beginn" timestamp with time zone NOT NULL,
	"ende" timestamp with time zone NOT NULL,
	"plaetze" integer DEFAULT 1 NOT NULL,
	"veranstaltung_id" uuid,
	"status" "inhalt_status" DEFAULT 'entwurf' NOT NULL,
	"erstellt_von" text,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dienst_eintrag" (
	"dienst_id" uuid NOT NULL,
	"benutzer_id" text NOT NULL,
	"eingetragen_am" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "dienst_eintrag_dienst_id_benutzer_id_pk" PRIMARY KEY("dienst_id","benutzer_id")
);
--> statement-breakpoint
CREATE TABLE "hatim" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"titel" jsonb NOT NULL,
	"anlass" jsonb,
	"beginn" date NOT NULL,
	"ziel" date,
	"oeffentlich" "inhalt_status" DEFAULT 'entwurf' NOT NULL,
	"status" "hatim_status" DEFAULT 'offen' NOT NULL,
	"erstellt_von" text,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hatim_teil" (
	"hatim_id" uuid NOT NULL,
	"cuz" smallint NOT NULL,
	"benutzer_id" text,
	"vergeben_am" timestamp with time zone,
	"gelesen_am" timestamp with time zone,
	CONSTRAINT "hatim_teil_hatim_id_cuz_pk" PRIMARY KEY("hatim_id","cuz")
);
--> statement-breakpoint
CREATE TABLE "newsletter_abo" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email_verschluesselt" "bytea" NOT NULL,
	"schluessel_id" smallint NOT NULL,
	"email_hmac" text NOT NULL,
	"sprache" text DEFAULT 'de' NOT NULL,
	"themen" text[] DEFAULT '{}' NOT NULL,
	"token_hash" text NOT NULL,
	"einwilligung_version" text NOT NULL,
	"bestaetigt_am" timestamp with time zone,
	"abgemeldet_am" timestamp with time zone,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "newsletter_abo_emailHmac_unique" UNIQUE("email_hmac")
);
--> statement-breakpoint
CREATE TABLE "newsletter_ausgabe" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"betreff" jsonb NOT NULL,
	"inhalt" jsonb NOT NULL,
	"themen" text[] DEFAULT '{}' NOT NULL,
	"geplant_am" timestamp with time zone,
	"versendet_am" timestamp with time zone,
	"empfaenger" integer DEFAULT 0 NOT NULL,
	"erstellt_von" text,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "push_abo" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"benutzer_id" text,
	"endpoint_verschluesselt" "bytea" NOT NULL,
	"schluessel_id" smallint NOT NULL,
	"endpoint_hmac" text NOT NULL,
	"p256dh" text NOT NULL,
	"auth" text NOT NULL,
	"sprache" text DEFAULT 'de' NOT NULL,
	"themen" text[] DEFAULT '{}' NOT NULL,
	"gebete" text[] DEFAULT '{}' NOT NULL,
	"minuten_vorher" smallint DEFAULT 10 NOT NULL,
	"einwilligung_version" text NOT NULL,
	"letzter_erfolg" timestamp with time zone,
	"fehler_zaehler" smallint DEFAULT 0 NOT NULL,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "push_abo_endpointHmac_unique" UNIQUE("endpoint_hmac")
);
--> statement-breakpoint
CREATE TABLE "push_versand" (
	"schluessel" text PRIMARY KEY NOT NULL,
	"gesendet_am" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "username" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "display_username" text;--> statement-breakpoint
ALTER TABLE "quran_sure" ADD COLUMN "name_umschrift" text;--> statement-breakpoint
ALTER TABLE "quran_sure" ADD COLUMN "ort" "quran_offenbarungsort";--> statement-breakpoint
ALTER TABLE "quran_sure" ADD COLUMN "offenbarungsfolge" smallint;--> statement-breakpoint
ALTER TABLE "quran_sure" ADD COLUMN "rukus" smallint;--> statement-breakpoint
ALTER TABLE "quran_sure" ADD COLUMN "basmala" text;--> statement-breakpoint
ALTER TABLE "quran_vers" ADD COLUMN "tajwid" jsonb;--> statement-breakpoint
ALTER TABLE "eingang" ADD COLUMN "checkin_hash" text;--> statement-breakpoint
ALTER TABLE "eingang" ADD COLUMN "eingecheckt_am" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "quran_audio" ADD CONSTRAINT "quran_audio_rezitation_id_quran_rezitation_id_fk" FOREIGN KEY ("rezitation_id") REFERENCES "public"."quran_rezitation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quran_rezitation" ADD CONSTRAINT "quran_rezitation_vereinbarung_medium_id_medium_id_fk" FOREIGN KEY ("vereinbarung_medium_id") REFERENCES "public"."medium"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quran_uebersetzung" ADD CONSTRAINT "quran_uebersetzung_ausgabe_id_quran_ausgabe_id_fk" FOREIGN KEY ("ausgabe_id") REFERENCES "public"."quran_ausgabe"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quran_verszeit" ADD CONSTRAINT "quran_verszeit_rezitation_id_quran_rezitation_id_fk" FOREIGN KEY ("rezitation_id") REFERENCES "public"."quran_rezitation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quran_wort" ADD CONSTRAINT "quran_wort_form_id_quran_wortform_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."quran_wortform"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quran_wortbedeutung" ADD CONSTRAINT "quran_wortbedeutung_form_id_quran_wortform_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."quran_wortform"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quran_wortzeit" ADD CONSTRAINT "quran_wortzeit_rezitation_id_quran_rezitation_id_fk" FOREIGN KEY ("rezitation_id") REFERENCES "public"."quran_rezitation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tajwid_regel" ADD CONSTRAINT "tajwid_regel_hoerbeispiel_medium_id_medium_id_fk" FOREIGN KEY ("hoerbeispiel_medium_id") REFERENCES "public"."medium"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gemeinde_rolle" ADD CONSTRAINT "gemeinde_rolle_benutzer_id_user_id_fk" FOREIGN KEY ("benutzer_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "konto_einwilligung" ADD CONSTRAINT "konto_einwilligung_benutzer_id_user_id_fk" FOREIGN KEY ("benutzer_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "konto_einwilligung" ADD CONSTRAINT "konto_einwilligung_lernende_id_lernende_id_fk" FOREIGN KEY ("lernende_id") REFERENCES "public"."lernende"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "konto_einwilligung" ADD CONSTRAINT "konto_einwilligung_erteilt_von_user_id_fk" FOREIGN KEY ("erteilt_von") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "konto_profil" ADD CONSTRAINT "konto_profil_benutzer_id_user_id_fk" FOREIGN KEY ("benutzer_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anwesenheit" ADD CONSTRAINT "anwesenheit_termin_id_unterrichtstermin_id_fk" FOREIGN KEY ("termin_id") REFERENCES "public"."unterrichtstermin"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anwesenheit" ADD CONSTRAINT "anwesenheit_lernende_id_lernende_id_fk" FOREIGN KEY ("lernende_id") REFERENCES "public"."lernende"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aufgabe" ADD CONSTRAINT "aufgabe_gruppe_id_gruppe_id_fk" FOREIGN KEY ("gruppe_id") REFERENCES "public"."gruppe"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aufgabe" ADD CONSTRAINT "aufgabe_erstellt_von_user_id_fk" FOREIGN KEY ("erstellt_von") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aufgabe_erledigt" ADD CONSTRAINT "aufgabe_erledigt_aufgabe_id_aufgabe_id_fk" FOREIGN KEY ("aufgabe_id") REFERENCES "public"."aufgabe"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aufgabe_erledigt" ADD CONSTRAINT "aufgabe_erledigt_lernende_id_lernende_id_fk" FOREIGN KEY ("lernende_id") REFERENCES "public"."lernende"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eltern_kind" ADD CONSTRAINT "eltern_kind_eltern_id_user_id_fk" FOREIGN KEY ("eltern_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eltern_kind" ADD CONSTRAINT "eltern_kind_lernende_id_lernende_id_fk" FOREIGN KEY ("lernende_id") REFERENCES "public"."lernende"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fehlmeldung" ADD CONSTRAINT "fehlmeldung_lernende_id_lernende_id_fk" FOREIGN KEY ("lernende_id") REFERENCES "public"."lernende"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fehlmeldung" ADD CONSTRAINT "fehlmeldung_erstellt_von_user_id_fk" FOREIGN KEY ("erstellt_von") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gruppe" ADD CONSTRAINT "gruppe_kurs_id_kurs_id_fk" FOREIGN KEY ("kurs_id") REFERENCES "public"."kurs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gruppen_leitung" ADD CONSTRAINT "gruppen_leitung_gruppe_id_gruppe_id_fk" FOREIGN KEY ("gruppe_id") REFERENCES "public"."gruppe"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gruppen_leitung" ADD CONSTRAINT "gruppen_leitung_benutzer_id_user_id_fk" FOREIGN KEY ("benutzer_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gruppen_mitglied" ADD CONSTRAINT "gruppen_mitglied_gruppe_id_gruppe_id_fk" FOREIGN KEY ("gruppe_id") REFERENCES "public"."gruppe"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gruppen_mitglied" ADD CONSTRAINT "gruppen_mitglied_lernende_id_lernende_id_fk" FOREIGN KEY ("lernende_id") REFERENCES "public"."lernende"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hifz_eintrag" ADD CONSTRAINT "hifz_eintrag_lernende_id_lernende_id_fk" FOREIGN KEY ("lernende_id") REFERENCES "public"."lernende"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hifz_eintrag" ADD CONSTRAINT "hifz_eintrag_lehrkraft_id_user_id_fk" FOREIGN KEY ("lehrkraft_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lernende" ADD CONSTRAINT "lernende_benutzer_id_user_id_fk" FOREIGN KEY ("benutzer_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lernende" ADD CONSTRAINT "lernende_eingang_id_eingang_id_fk" FOREIGN KEY ("eingang_id") REFERENCES "public"."eingang"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lernfortschritt" ADD CONSTRAINT "lernfortschritt_lernende_id_lernende_id_fk" FOREIGN KEY ("lernende_id") REFERENCES "public"."lernende"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lernfortschritt" ADD CONSTRAINT "lernfortschritt_stufe_id_lehrplan_stufe_id_fk" FOREIGN KEY ("stufe_id") REFERENCES "public"."lehrplan_stufe"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lernfortschritt" ADD CONSTRAINT "lernfortschritt_lehrkraft_id_user_id_fk" FOREIGN KEY ("lehrkraft_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "unterrichtstermin" ADD CONSTRAINT "unterrichtstermin_gruppe_id_gruppe_id_fk" FOREIGN KEY ("gruppe_id") REFERENCES "public"."gruppe"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "urkunde" ADD CONSTRAINT "urkunde_lernende_id_lernende_id_fk" FOREIGN KEY ("lernende_id") REFERENCES "public"."lernende"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_gelesen" ADD CONSTRAINT "chat_gelesen_kanal_id_chat_kanal_id_fk" FOREIGN KEY ("kanal_id") REFERENCES "public"."chat_kanal"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_gelesen" ADD CONSTRAINT "chat_gelesen_benutzer_id_user_id_fk" FOREIGN KEY ("benutzer_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_kanal" ADD CONSTRAINT "chat_kanal_gruppe_id_gruppe_id_fk" FOREIGN KEY ("gruppe_id") REFERENCES "public"."gruppe"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_meldung" ADD CONSTRAINT "chat_meldung_kanal_id_chat_kanal_id_fk" FOREIGN KEY ("kanal_id") REFERENCES "public"."chat_kanal"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_meldung" ADD CONSTRAINT "chat_meldung_gemeldet_von_user_id_fk" FOREIGN KEY ("gemeldet_von") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_nachricht" ADD CONSTRAINT "chat_nachricht_kanal_id_chat_kanal_id_fk" FOREIGN KEY ("kanal_id") REFERENCES "public"."chat_kanal"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_nachricht" ADD CONSTRAINT "chat_nachricht_absender_id_user_id_fk" FOREIGN KEY ("absender_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_regeln_bestaetigt" ADD CONSTRAINT "chat_regeln_bestaetigt_benutzer_id_user_id_fk" FOREIGN KEY ("benutzer_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_stumm" ADD CONSTRAINT "chat_stumm_kanal_id_chat_kanal_id_fk" FOREIGN KEY ("kanal_id") REFERENCES "public"."chat_kanal"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_stumm" ADD CONSTRAINT "chat_stumm_benutzer_id_user_id_fk" FOREIGN KEY ("benutzer_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hadith" ADD CONSTRAINT "hadith_sammlung_id_hadith_sammlung_id_fk" FOREIGN KEY ("sammlung_id") REFERENCES "public"."hadith_sammlung"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hadith_buch" ADD CONSTRAINT "hadith_buch_sammlung_id_hadith_sammlung_id_fk" FOREIGN KEY ("sammlung_id") REFERENCES "public"."hadith_sammlung"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "elifbe_audio" ADD CONSTRAINT "elifbe_audio_medium_id_medium_id_fk" FOREIGN KEY ("medium_id") REFERENCES "public"."medium"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "elifbe_audio" ADD CONSTRAINT "elifbe_audio_vereinbarung_medium_id_medium_id_fk" FOREIGN KEY ("vereinbarung_medium_id") REFERENCES "public"."medium"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "elifbe_fortschritt" ADD CONSTRAINT "elifbe_fortschritt_lernende_id_lernende_id_fk" FOREIGN KEY ("lernende_id") REFERENCES "public"."lernende"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "elifbe_fortschritt" ADD CONSTRAINT "elifbe_fortschritt_benutzer_id_user_id_fk" FOREIGN KEY ("benutzer_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "elifbe_fortschritt" ADD CONSTRAINT "elifbe_fortschritt_uebung_id_elifbe_uebung_id_fk" FOREIGN KEY ("uebung_id") REFERENCES "public"."elifbe_uebung"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "elifbe_uebung" ADD CONSTRAINT "elifbe_uebung_lektion_id_elifbe_lektion_id_fk" FOREIGN KEY ("lektion_id") REFERENCES "public"."elifbe_lektion"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anzeige_folie" ADD CONSTRAINT "anzeige_folie_medium_id_medium_id_fk" FOREIGN KEY ("medium_id") REFERENCES "public"."medium"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dienst" ADD CONSTRAINT "dienst_veranstaltung_id_veranstaltung_id_fk" FOREIGN KEY ("veranstaltung_id") REFERENCES "public"."veranstaltung"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dienst_eintrag" ADD CONSTRAINT "dienst_eintrag_dienst_id_dienst_id_fk" FOREIGN KEY ("dienst_id") REFERENCES "public"."dienst"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dienst_eintrag" ADD CONSTRAINT "dienst_eintrag_benutzer_id_user_id_fk" FOREIGN KEY ("benutzer_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hatim_teil" ADD CONSTRAINT "hatim_teil_hatim_id_hatim_id_fk" FOREIGN KEY ("hatim_id") REFERENCES "public"."hatim"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hatim_teil" ADD CONSTRAINT "hatim_teil_benutzer_id_user_id_fk" FOREIGN KEY ("benutzer_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_abo" ADD CONSTRAINT "push_abo_benutzer_id_user_id_fk" FOREIGN KEY ("benutzer_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "quran_wort_form_idx" ON "quran_wort" USING btree ("form_id");--> statement-breakpoint
CREATE INDEX "gemeinde_rolle_benutzer_idx" ON "gemeinde_rolle" USING btree ("benutzer_id");--> statement-breakpoint
CREATE INDEX "konto_einwilligung_benutzer_idx" ON "konto_einwilligung" USING btree ("benutzer_id");--> statement-breakpoint
CREATE INDEX "konto_einwilligung_lernende_idx" ON "konto_einwilligung" USING btree ("lernende_id","art");--> statement-breakpoint
CREATE INDEX "anwesenheit_lernende_idx" ON "anwesenheit" USING btree ("lernende_id");--> statement-breakpoint
CREATE INDEX "aufgabe_gruppe_idx" ON "aufgabe" USING btree ("gruppe_id");--> statement-breakpoint
CREATE INDEX "eltern_kind_lernende_idx" ON "eltern_kind" USING btree ("lernende_id");--> statement-breakpoint
CREATE INDEX "fehlmeldung_lernende_datum_idx" ON "fehlmeldung" USING btree ("lernende_id","datum");--> statement-breakpoint
CREATE INDEX "gruppen_leitung_benutzer_idx" ON "gruppen_leitung" USING btree ("benutzer_id");--> statement-breakpoint
CREATE INDEX "gruppen_mitglied_lernende_idx" ON "gruppen_mitglied" USING btree ("lernende_id");--> statement-breakpoint
CREATE INDEX "hifz_lernende_idx" ON "hifz_eintrag" USING btree ("lernende_id");--> statement-breakpoint
CREATE INDEX "lernende_status_idx" ON "lernende" USING btree ("status");--> statement-breakpoint
CREATE INDEX "unterrichtstermin_datum_idx" ON "unterrichtstermin" USING btree ("datum");--> statement-breakpoint
CREATE INDEX "chat_meldung_status_idx" ON "chat_meldung" USING btree ("status","erstellt_am");--> statement-breakpoint
CREATE INDEX "chat_nachricht_kanal_idx" ON "chat_nachricht" USING btree ("kanal_id","id");--> statement-breakpoint
CREATE INDEX "chat_nachricht_zeit_idx" ON "chat_nachricht" USING btree ("erstellt_am");--> statement-breakpoint
CREATE INDEX "moderationsprotokoll_kanal_idx" ON "moderationsprotokoll" USING btree ("kanal_id","zeitpunkt");--> statement-breakpoint
CREATE INDEX "hadith_buch_idx" ON "hadith" USING btree ("sammlung_id","buch_nr","sortierung");--> statement-breakpoint
CREATE INDEX "hadith_suche_idx" ON "hadith" USING gin ("suche");--> statement-breakpoint
CREATE INDEX "elifbe_fortschritt_benutzer_idx" ON "elifbe_fortschritt" USING btree ("benutzer_id");--> statement-breakpoint
CREATE INDEX "elifbe_fortschritt_lernende_idx" ON "elifbe_fortschritt" USING btree ("lernende_id");--> statement-breakpoint
CREATE INDEX "elifbe_uebung_lektion_idx" ON "elifbe_uebung" USING btree ("lektion_id","reihenfolge");--> statement-breakpoint
CREATE INDEX "freigabe_inhalt_idx" ON "freigabe" USING btree ("inhalt_typ","inhalt_id","am");--> statement-breakpoint
CREATE INDEX "freigabe_offen_idx" ON "freigabe" USING btree ("status","art");--> statement-breakpoint
CREATE INDEX "revision_inhalt_idx" ON "revision" USING btree ("inhalt_typ","inhalt_id","erstellt_am");--> statement-breakpoint
CREATE INDEX "seite_status_idx" ON "seite" USING btree ("status","veroeffentlichen_am");--> statement-breakpoint
CREATE INDEX "anzeige_folie_status_idx" ON "anzeige_folie" USING btree ("status","reihenfolge");--> statement-breakpoint
CREATE INDEX "besonderer_tag_datum_idx" ON "besonderer_tag" USING btree ("datum");--> statement-breakpoint
CREATE INDEX "hatim_teil_benutzer_idx" ON "hatim_teil" USING btree ("benutzer_id");--> statement-breakpoint
CREATE INDEX "push_abo_benutzer_idx" ON "push_abo" USING btree ("benutzer_id");--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_username_unique" UNIQUE("username");--> statement-breakpoint
ALTER TABLE "eingang" ADD CONSTRAINT "eingang_checkinHash_unique" UNIQUE("checkin_hash");