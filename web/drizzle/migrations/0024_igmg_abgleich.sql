-- Marktstart IGMG P6 (ADR 0048): IGMG-Gebetskalender als Quelle. Nur additiv (ADR 0019): neuer Enum-Wert 'igmg', Laufprotokoll
-- des Abgleichs, Verweis auf den Lauf und Stand je Tag. Alle Migrationen laufen in EINER Transaktion; PostgreSQL erlaubt den
-- neuen Enum-Wert dort nicht im selben Lauf (vgl. 0017). Deshalb nutzt keine Migration 'igmg' als Literal.
ALTER TYPE "public"."gebetszeit_quelle" ADD VALUE 'igmg' BEFORE 'berechnet';--> statement-breakpoint
CREATE TABLE "gebetszeit_abgleich" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quelle" text NOT NULL,
	"status" text NOT NULL,
	"gestartet" timestamp with time zone DEFAULT now() NOT NULL,
	"beendet" timestamp with time zone,
	"von" date,
	"bis" date,
	"tage_geprueft" integer DEFAULT 0 NOT NULL,
	"tage_neu" integer DEFAULT 0 NOT NULL,
	"tage_geaendert" integer DEFAULT 0 NOT NULL,
	"konflikte" integer DEFAULT 0 NOT NULL,
	"max_abweichung_min" integer DEFAULT 0 NOT NULL,
	"fehler_code" text,
	"inhalt_sha256" text,
	"quell_stand" text,
	"details" jsonb,
	CONSTRAINT "gebetszeit_abgleich_quelle" CHECK ("gebetszeit_abgleich"."quelle" in ('igmg-feed', 'igmg-datei')),
	CONSTRAINT "gebetszeit_abgleich_status" CHECK ("gebetszeit_abgleich"."status" in ('ok', 'unveraendert', 'auffaellig', 'freigegeben', 'fehler'))
);
--> statement-breakpoint
ALTER TABLE "gebetszeit_tag" ADD COLUMN "abgleich_id" uuid;--> statement-breakpoint
ALTER TABLE "gebetszeit_tag" ADD COLUMN "aktualisiert_am" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
CREATE INDEX "gebetszeit_abgleich_gestartet_idx" ON "gebetszeit_abgleich" USING btree ("gestartet");--> statement-breakpoint
ALTER TABLE "gebetszeit_tag" ADD CONSTRAINT "gebetszeit_tag_abgleich_id_gebetszeit_abgleich_id_fk" FOREIGN KEY ("abgleich_id") REFERENCES "public"."gebetszeit_abgleich"("id") ON DELETE set null ON UPDATE no action;