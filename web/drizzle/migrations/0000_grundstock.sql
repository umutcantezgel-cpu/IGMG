CREATE TYPE "public"."inhalt_status" AS ENUM('entwurf', 'veroeffentlicht');--> statement-breakpoint
CREATE TYPE "public"."organisation" AS ENUM('at', 'kt', 'gt', 'kgt');--> statement-breakpoint
CREATE TYPE "public"."rolle" AS ENUM('administration', 'redaktion', 'organisationsredaktion', 'bildung', 'mitgliederverwaltung');--> statement-breakpoint
CREATE TYPE "public"."kosten" AS ENUM('kostenlos', 'kostenpflichtig');--> statement-breakpoint
CREATE TYPE "public"."nachricht_kategorie" AS ENUM('neuigkeiten', 'gemeinde', 'bildung', 'veranstaltung', 'jugend', 'wichtig');--> statement-breakpoint
CREATE TYPE "public"."prioritaet" AS ENUM('niedrig', 'mittel', 'hoch');--> statement-breakpoint
CREATE TYPE "public"."veranstaltung_kategorie" AS ENUM('gebet', 'bildung', 'gemeinde', 'kultur', 'jugend', 'frauen');--> statement-breakpoint
CREATE TYPE "public"."gebetszeit_quelle" AS ENUM('import', 'berechnet');--> statement-breakpoint
CREATE TYPE "public"."eingang_art" AS ENUM('kontakt', 'veranstaltungsanmeldung', 'voranmeldung', 'mitgliedsantrag', 'moschee_anfrage');--> statement-breakpoint
CREATE TYPE "public"."eingang_status" AS ENUM('neu', 'in_bearbeitung', 'erledigt', 'abgelehnt');--> statement-breakpoint
CREATE TYPE "public"."meldung_typ" AS ENUM('beschwerde', 'wunsch', 'vorschlag', 'information', 'intern');--> statement-breakpoint
CREATE TYPE "public"."ticket_prioritaet" AS ENUM('niedrig', 'mittel', 'hoch', 'dringend');--> statement-breakpoint
CREATE TYPE "public"."ticket_status" AS ENUM('offen', 'in_bearbeitung', 'geloest', 'geschlossen');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "passkey" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"public_key" text NOT NULL,
	"user_id" text NOT NULL,
	"credential_id" text NOT NULL,
	"counter" integer NOT NULL,
	"device_type" text NOT NULL,
	"backed_up" boolean NOT NULL,
	"transports" text,
	"created_at" timestamp with time zone,
	"aaguid" text
);
--> statement-breakpoint
CREATE TABLE "rate_limit" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"count" integer NOT NULL,
	"last_request" bigint NOT NULL,
	CONSTRAINT "rate_limit_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "two_factor" (
	"id" text PRIMARY KEY NOT NULL,
	"secret" text NOT NULL,
	"backup_codes" text NOT NULL,
	"user_id" text NOT NULL,
	"verified" boolean DEFAULT true,
	"failed_verification_count" integer DEFAULT 0,
	"locked_until" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"two_factor_enabled" boolean DEFAULT false,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "einladung" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"rollen" jsonb NOT NULL,
	"token_hash" text NOT NULL,
	"laeuft_ab" timestamp with time zone NOT NULL,
	"angenommen_am" timestamp with time zone,
	"widerrufen_am" timestamp with time zone,
	"erstellt_von" text,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "einladung_tokenHash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "rolle_zuweisung" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"benutzer_id" text NOT NULL,
	"rolle" "rolle" NOT NULL,
	"organisation" "organisation",
	"erstellt_von" text,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "rolle_zuweisung_eindeutig" UNIQUE NULLS NOT DISTINCT("benutzer_id","rolle","organisation"),
	CONSTRAINT "rolle_zuweisung_organisation_passend" CHECK (("rolle_zuweisung"."rolle" = 'organisationsredaktion') = ("rolle_zuweisung"."organisation" is not null))
);
--> statement-breakpoint
CREATE TABLE "audit_eintrag" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"zeitpunkt" timestamp with time zone DEFAULT now() NOT NULL,
	"benutzer_id" text,
	"aktion" text NOT NULL,
	"ziel_typ" text,
	"ziel_id" text,
	"details" jsonb
);
--> statement-breakpoint
CREATE TABLE "einstellung" (
	"schluessel" text PRIMARY KEY NOT NULL,
	"wert" jsonb NOT NULL,
	"geaendert_am" timestamp with time zone DEFAULT now() NOT NULL,
	"geaendert_von" text
);
--> statement-breakpoint
CREATE TABLE "mail_ausgang" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vorlage" text NOT NULL,
	"sprache" text DEFAULT 'de' NOT NULL,
	"daten_verschluesselt" "bytea" NOT NULL,
	"schluessel_id" smallint NOT NULL,
	"versuche" integer DEFAULT 0 NOT NULL,
	"naechster_versuch" timestamp with time zone DEFAULT now() NOT NULL,
	"gesendet_am" timestamp with time zone,
	"fehler" text,
	"bezug_eingang_id" uuid,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ratenbegrenzung" (
	"schluessel" text PRIMARY KEY NOT NULL,
	"fenster_start" timestamp with time zone NOT NULL,
	"zaehler" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verbrauchte_challenge" (
	"signatur_hash" text PRIMARY KEY NOT NULL,
	"laeuft_ab" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "medium" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"schluessel" text NOT NULL,
	"typ" text NOT NULL,
	"groesse" integer NOT NULL,
	"breite" integer,
	"hoehe" integer,
	"alt" jsonb NOT NULL,
	"bildrechte" text,
	"dateiname" text,
	"im_papierkorb_seit" timestamp with time zone,
	"erstellt_von" text,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "medium_schluessel_unique" UNIQUE("schluessel")
);
--> statement-breakpoint
CREATE TABLE "ankuendigung" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"status" "inhalt_status" DEFAULT 'entwurf' NOT NULL,
	"im_papierkorb_seit" timestamp with time zone,
	"ist_beispiel" boolean DEFAULT false NOT NULL,
	"quelle" text,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL,
	"aktualisiert_am" timestamp with time zone DEFAULT now() NOT NULL,
	"erstellt_von" text,
	"aktualisiert_von" text,
	"titel" jsonb NOT NULL,
	"inhalt" jsonb NOT NULL,
	"prioritaet" "prioritaet" DEFAULT 'mittel' NOT NULL,
	"organisation" "organisation",
	"sichtbar_ab" timestamp with time zone,
	"laeuft_ab" timestamp with time zone,
	"link" text
);
--> statement-breakpoint
CREATE TABLE "kurs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"status" "inhalt_status" DEFAULT 'entwurf' NOT NULL,
	"im_papierkorb_seit" timestamp with time zone,
	"ist_beispiel" boolean DEFAULT false NOT NULL,
	"quelle" text,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL,
	"aktualisiert_am" timestamp with time zone DEFAULT now() NOT NULL,
	"erstellt_von" text,
	"aktualisiert_von" text,
	"slug" text NOT NULL,
	"titel" jsonb NOT NULL,
	"beschreibung" jsonb,
	"zielgruppe" jsonb,
	"alter" jsonb,
	"zeiten" jsonb,
	"dauer" jsonb,
	"ort" jsonb,
	"leitung" jsonb,
	"kosten" jsonb,
	"plaetze" integer,
	"inhalte" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"empfohlen" boolean DEFAULT false NOT NULL,
	"voranmeldung_moeglich" boolean DEFAULT true NOT NULL,
	"sortierung" integer DEFAULT 0 NOT NULL,
	"bild_id" uuid,
	CONSTRAINT "kurs_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "nachricht" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"status" "inhalt_status" DEFAULT 'entwurf' NOT NULL,
	"im_papierkorb_seit" timestamp with time zone,
	"ist_beispiel" boolean DEFAULT false NOT NULL,
	"quelle" text,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL,
	"aktualisiert_am" timestamp with time zone DEFAULT now() NOT NULL,
	"erstellt_von" text,
	"aktualisiert_von" text,
	"slug" text NOT NULL,
	"titel" jsonb NOT NULL,
	"kurztext" jsonb,
	"inhalt" jsonb,
	"kategorie" "nachricht_kategorie" DEFAULT 'neuigkeiten' NOT NULL,
	"organisation" "organisation",
	"veroeffentlicht_am" timestamp with time zone,
	"empfohlen" boolean DEFAULT false NOT NULL,
	"bild_id" uuid,
	"klartext" jsonb DEFAULT '{"de":""}'::jsonb NOT NULL,
	"suche_de" "tsvector" GENERATED ALWAYS AS (to_tsvector('german', coalesce(klartext->>'de', ''))) STORED,
	"suche_tr" "tsvector" GENERATED ALWAYS AS (to_tsvector('turkish', coalesce(klartext->>'tr', klartext->>'de', ''))) STORED,
	"suche_en" "tsvector" GENERATED ALWAYS AS (to_tsvector('english', coalesce(klartext->>'en', klartext->>'de', ''))) STORED,
	CONSTRAINT "nachricht_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "seiteninhalt" (
	"bereich" text PRIMARY KEY NOT NULL,
	"inhalt" jsonb NOT NULL,
	"ist_beispiel" boolean DEFAULT false NOT NULL,
	"quelle" text,
	"aktualisiert_am" timestamp with time zone DEFAULT now() NOT NULL,
	"aktualisiert_von" text
);
--> statement-breakpoint
CREATE TABLE "veranstaltung" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"status" "inhalt_status" DEFAULT 'entwurf' NOT NULL,
	"im_papierkorb_seit" timestamp with time zone,
	"ist_beispiel" boolean DEFAULT false NOT NULL,
	"quelle" text,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL,
	"aktualisiert_am" timestamp with time zone DEFAULT now() NOT NULL,
	"erstellt_von" text,
	"aktualisiert_von" text,
	"slug" text NOT NULL,
	"titel" jsonb NOT NULL,
	"kurztext" jsonb,
	"beschreibung" jsonb,
	"kategorie" "veranstaltung_kategorie" NOT NULL,
	"organisation" "organisation",
	"zielgruppe" jsonb,
	"ort" jsonb,
	"beginn" timestamp with time zone NOT NULL,
	"ende" timestamp with time zone,
	"ganztaegig" boolean DEFAULT false NOT NULL,
	"wiederholung" text,
	"ausnahmen" date[] DEFAULT '{}'::date[] NOT NULL,
	"anmeldung_aktiv" boolean DEFAULT false NOT NULL,
	"plaetze" integer,
	"kosten" "kosten" DEFAULT 'kostenlos' NOT NULL,
	"empfohlen" boolean DEFAULT false NOT NULL,
	"teilnehmer_hinweis" jsonb,
	"bild_id" uuid,
	"klartext" jsonb DEFAULT '{"de":""}'::jsonb NOT NULL,
	"suche_de" "tsvector" GENERATED ALWAYS AS (to_tsvector('german', coalesce(klartext->>'de', ''))) STORED,
	"suche_tr" "tsvector" GENERATED ALWAYS AS (to_tsvector('turkish', coalesce(klartext->>'tr', klartext->>'de', ''))) STORED,
	"suche_en" "tsvector" GENERATED ALWAYS AS (to_tsvector('english', coalesce(klartext->>'en', klartext->>'de', ''))) STORED,
	CONSTRAINT "veranstaltung_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "wissen_thema" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"status" "inhalt_status" DEFAULT 'entwurf' NOT NULL,
	"im_papierkorb_seit" timestamp with time zone,
	"ist_beispiel" boolean DEFAULT false NOT NULL,
	"quelle" text,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL,
	"aktualisiert_am" timestamp with time zone DEFAULT now() NOT NULL,
	"erstellt_von" text,
	"aktualisiert_von" text,
	"slug" text NOT NULL,
	"kategorie" text NOT NULL,
	"titel" jsonb NOT NULL,
	"kurztext" jsonb,
	"inhalt" jsonb,
	"sortierung" integer DEFAULT 0 NOT NULL,
	"klartext" jsonb DEFAULT '{"de":""}'::jsonb NOT NULL,
	"suche_de" "tsvector" GENERATED ALWAYS AS (to_tsvector('german', coalesce(klartext->>'de', ''))) STORED,
	"suche_tr" "tsvector" GENERATED ALWAYS AS (to_tsvector('turkish', coalesce(klartext->>'tr', klartext->>'de', ''))) STORED,
	"suche_en" "tsvector" GENERATED ALWAYS AS (to_tsvector('english', coalesce(klartext->>'en', klartext->>'de', ''))) STORED,
	CONSTRAINT "wissen_thema_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "gebetszeit_import" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dateiname" text,
	"von" date NOT NULL,
	"bis" date NOT NULL,
	"zeilen" integer NOT NULL,
	"erstellt_von" text,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gebetszeit_tag" (
	"datum" date PRIMARY KEY NOT NULL,
	"imsak" time NOT NULL,
	"gunes" time NOT NULL,
	"ogle" time NOT NULL,
	"ikindi" time NOT NULL,
	"aksam" time NOT NULL,
	"yatsi" time NOT NULL,
	"quelle" "gebetszeit_quelle" NOT NULL,
	"import_id" uuid
);
--> statement-breakpoint
CREATE TABLE "quran_quelle" (
	"id" text PRIMARY KEY NOT NULL,
	"bezeichnung" text NOT NULL,
	"url" text NOT NULL,
	"version" text NOT NULL,
	"sha256" text NOT NULL,
	"lizenz" text NOT NULL,
	"importiert_am" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quran_sure" (
	"nr" integer PRIMARY KEY NOT NULL,
	"name_ar" text NOT NULL,
	"name" jsonb,
	"verse_anzahl" integer NOT NULL,
	"quelle_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quran_vers" (
	"sure" integer NOT NULL,
	"vers" integer NOT NULL,
	"text_ar" text NOT NULL,
	"uebersetzung" jsonb,
	CONSTRAINT "quran_vers_sure_vers_pk" PRIMARY KEY("sure","vers")
);
--> statement-breakpoint
CREATE TABLE "eingang" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"art" "eingang_art" NOT NULL,
	"status" "eingang_status" DEFAULT 'neu' NOT NULL,
	"sprache" text DEFAULT 'de' NOT NULL,
	"bezug_id" uuid,
	"anzahl" integer DEFAULT 1 NOT NULL,
	"daten_verschluesselt" "bytea" NOT NULL,
	"schluessel_id" smallint NOT NULL,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL,
	"erledigt_am" timestamp with time zone,
	"loeschen_ab" timestamp with time zone,
	"bearbeitet_von" text
);
--> statement-breakpoint
CREATE TABLE "eingang_notiz" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"eingang_id" uuid NOT NULL,
	"text_verschluesselt" "bytea" NOT NULL,
	"schluessel_id" smallint NOT NULL,
	"autor_id" text,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "einwilligung" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"eingang_id" uuid NOT NULL,
	"text_schluessel" text NOT NULL,
	"text_version" text NOT NULL,
	"sprache" text NOT NULL,
	"erteilt_am" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "postfach_nachricht" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"unterhaltung_id" uuid NOT NULL,
	"absender_id" text,
	"text" text NOT NULL,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ticket" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nummer" serial NOT NULL,
	"titel" text NOT NULL,
	"beschreibung" text NOT NULL,
	"typ" "meldung_typ" DEFAULT 'intern' NOT NULL,
	"kategorie" text,
	"organisation" "organisation",
	"prioritaet" "ticket_prioritaet" DEFAULT 'mittel' NOT NULL,
	"status" "ticket_status" DEFAULT 'offen' NOT NULL,
	"melder_verschluesselt" "bytea",
	"schluessel_id" smallint,
	"erstellt_von" text,
	"zugewiesen_an" text,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL,
	"aktualisiert_am" timestamp with time zone DEFAULT now() NOT NULL,
	"geschlossen_am" timestamp with time zone,
	CONSTRAINT "ticket_nummer_unique" UNIQUE("nummer")
);
--> statement-breakpoint
CREATE TABLE "ticket_kommentar" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticket_id" uuid NOT NULL,
	"autor_id" text,
	"text" text NOT NULL,
	"intern" boolean DEFAULT true NOT NULL,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "unterhaltung" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"betreff" text NOT NULL,
	"erstellt_von" text,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL,
	"letzte_nachricht_am" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "unterhaltung_teilnehmer" (
	"unterhaltung_id" uuid NOT NULL,
	"benutzer_id" text NOT NULL,
	"gelesen_bis" timestamp with time zone,
	CONSTRAINT "unterhaltung_teilnehmer_unterhaltung_id_benutzer_id_pk" PRIMARY KEY("unterhaltung_id","benutzer_id")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "passkey" ADD CONSTRAINT "passkey_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "two_factor" ADD CONSTRAINT "two_factor_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rolle_zuweisung" ADD CONSTRAINT "rolle_zuweisung_benutzer_id_user_id_fk" FOREIGN KEY ("benutzer_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kurs" ADD CONSTRAINT "kurs_bild_id_medium_id_fk" FOREIGN KEY ("bild_id") REFERENCES "public"."medium"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nachricht" ADD CONSTRAINT "nachricht_bild_id_medium_id_fk" FOREIGN KEY ("bild_id") REFERENCES "public"."medium"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "veranstaltung" ADD CONSTRAINT "veranstaltung_bild_id_medium_id_fk" FOREIGN KEY ("bild_id") REFERENCES "public"."medium"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gebetszeit_tag" ADD CONSTRAINT "gebetszeit_tag_import_id_gebetszeit_import_id_fk" FOREIGN KEY ("import_id") REFERENCES "public"."gebetszeit_import"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quran_sure" ADD CONSTRAINT "quran_sure_quelle_id_quran_quelle_id_fk" FOREIGN KEY ("quelle_id") REFERENCES "public"."quran_quelle"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quran_vers" ADD CONSTRAINT "quran_vers_sure_quran_sure_nr_fk" FOREIGN KEY ("sure") REFERENCES "public"."quran_sure"("nr") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eingang_notiz" ADD CONSTRAINT "eingang_notiz_eingang_id_eingang_id_fk" FOREIGN KEY ("eingang_id") REFERENCES "public"."eingang"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "einwilligung" ADD CONSTRAINT "einwilligung_eingang_id_eingang_id_fk" FOREIGN KEY ("eingang_id") REFERENCES "public"."eingang"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "postfach_nachricht" ADD CONSTRAINT "postfach_nachricht_unterhaltung_id_unterhaltung_id_fk" FOREIGN KEY ("unterhaltung_id") REFERENCES "public"."unterhaltung"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "postfach_nachricht" ADD CONSTRAINT "postfach_nachricht_absender_id_user_id_fk" FOREIGN KEY ("absender_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_erstellt_von_user_id_fk" FOREIGN KEY ("erstellt_von") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_zugewiesen_an_user_id_fk" FOREIGN KEY ("zugewiesen_an") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_kommentar" ADD CONSTRAINT "ticket_kommentar_ticket_id_ticket_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."ticket"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_kommentar" ADD CONSTRAINT "ticket_kommentar_autor_id_user_id_fk" FOREIGN KEY ("autor_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "unterhaltung" ADD CONSTRAINT "unterhaltung_erstellt_von_user_id_fk" FOREIGN KEY ("erstellt_von") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "unterhaltung_teilnehmer" ADD CONSTRAINT "unterhaltung_teilnehmer_unterhaltung_id_unterhaltung_id_fk" FOREIGN KEY ("unterhaltung_id") REFERENCES "public"."unterhaltung"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "unterhaltung_teilnehmer" ADD CONSTRAINT "unterhaltung_teilnehmer_benutzer_id_user_id_fk" FOREIGN KEY ("benutzer_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "passkey_userId_idx" ON "passkey" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "passkey_credentialID_idx" ON "passkey" USING btree ("credential_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "twoFactor_secret_idx" ON "two_factor" USING btree ("secret");--> statement-breakpoint
CREATE INDEX "twoFactor_userId_idx" ON "two_factor" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "einladung_email_idx" ON "einladung" USING btree ("email");--> statement-breakpoint
CREATE INDEX "rolle_zuweisung_benutzer_idx" ON "rolle_zuweisung" USING btree ("benutzer_id");--> statement-breakpoint
CREATE INDEX "audit_zeitpunkt_idx" ON "audit_eintrag" USING btree ("zeitpunkt");--> statement-breakpoint
CREATE INDEX "audit_ziel_idx" ON "audit_eintrag" USING btree ("ziel_typ","ziel_id");--> statement-breakpoint
CREATE INDEX "audit_benutzer_idx" ON "audit_eintrag" USING btree ("benutzer_id");--> statement-breakpoint
CREATE INDEX "mail_ausgang_offen_idx" ON "mail_ausgang" USING btree ("gesendet_am","naechster_versuch");--> statement-breakpoint
CREATE INDEX "verbrauchte_challenge_ablauf_idx" ON "verbrauchte_challenge" USING btree ("laeuft_ab");--> statement-breakpoint
CREATE INDEX "nachricht_datum_idx" ON "nachricht" USING btree ("veroeffentlicht_am");--> statement-breakpoint
CREATE INDEX "nachricht_suche_de_idx" ON "nachricht" USING gin ("suche_de");--> statement-breakpoint
CREATE INDEX "nachricht_suche_tr_idx" ON "nachricht" USING gin ("suche_tr");--> statement-breakpoint
CREATE INDEX "nachricht_suche_en_idx" ON "nachricht" USING gin ("suche_en");--> statement-breakpoint
CREATE INDEX "veranstaltung_beginn_idx" ON "veranstaltung" USING btree ("beginn");--> statement-breakpoint
CREATE INDEX "veranstaltung_status_idx" ON "veranstaltung" USING btree ("status","im_papierkorb_seit");--> statement-breakpoint
CREATE INDEX "veranstaltung_suche_de_idx" ON "veranstaltung" USING gin ("suche_de");--> statement-breakpoint
CREATE INDEX "veranstaltung_suche_tr_idx" ON "veranstaltung" USING gin ("suche_tr");--> statement-breakpoint
CREATE INDEX "veranstaltung_suche_en_idx" ON "veranstaltung" USING gin ("suche_en");--> statement-breakpoint
CREATE INDEX "wissen_suche_de_idx" ON "wissen_thema" USING gin ("suche_de");--> statement-breakpoint
CREATE INDEX "wissen_suche_tr_idx" ON "wissen_thema" USING gin ("suche_tr");--> statement-breakpoint
CREATE INDEX "wissen_suche_en_idx" ON "wissen_thema" USING gin ("suche_en");--> statement-breakpoint
CREATE INDEX "eingang_art_status_idx" ON "eingang" USING btree ("art","status");--> statement-breakpoint
CREATE INDEX "eingang_bezug_idx" ON "eingang" USING btree ("bezug_id");--> statement-breakpoint
CREATE INDEX "eingang_loeschen_idx" ON "eingang" USING btree ("loeschen_ab");--> statement-breakpoint
CREATE INDEX "postfach_unterhaltung_idx" ON "postfach_nachricht" USING btree ("unterhaltung_id","erstellt_am");--> statement-breakpoint
CREATE INDEX "ticket_status_idx" ON "ticket" USING btree ("status","prioritaet");