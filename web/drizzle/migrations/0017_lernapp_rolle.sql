-- Lauf Lern-App (ADR 0041 Nr. 1, ADR 0038 Nr. 10, PLAN §3.9): nur Enum-Erweiterungen in eigener Migration. Alle Migrationen
-- laufen in EINER Transaktion; PostgreSQL 16 erlaubt neue Enum-Werte dort nicht im selben Lauf (e2e/LIESMICH 1a). Deshalb
-- nutzt keine spätere Migration 'sprachpruefung' oder 'lernapp' als Literal (Standardwerte, Prüfbedingungen, Indizes).
ALTER TYPE "public"."rolle" ADD VALUE 'sprachpruefung';--> statement-breakpoint
ALTER TYPE "public"."konto_einwilligung_art" ADD VALUE 'lernapp';
