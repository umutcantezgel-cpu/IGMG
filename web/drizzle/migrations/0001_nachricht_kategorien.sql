ALTER TABLE "nachricht" ADD COLUMN "wichtig" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "nachricht" ADD COLUMN "lesezeit" integer;--> statement-breakpoint
ALTER TABLE "nachricht" ALTER COLUMN "kategorie" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "nachricht" ALTER COLUMN "kategorie" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."nachricht_kategorie";--> statement-breakpoint
CREATE TYPE "public"."nachricht_kategorie" AS ENUM('ankuendigung', 'gemeinde', 'veranstaltung', 'bildung', 'religioes', 'soziales', 'neuigkeiten');--> statement-breakpoint
ALTER TABLE "nachricht" ALTER COLUMN "kategorie" SET DATA TYPE "public"."nachricht_kategorie" USING (CASE "kategorie" WHEN 'jugend' THEN 'gemeinde' WHEN 'wichtig' THEN 'neuigkeiten' ELSE "kategorie" END)::"public"."nachricht_kategorie";--> statement-breakpoint
ALTER TABLE "nachricht" ALTER COLUMN "kategorie" SET DEFAULT 'neuigkeiten';
