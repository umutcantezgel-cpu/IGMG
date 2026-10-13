ALTER TABLE "einladung" ADD COLUMN "lernende_id" uuid;--> statement-breakpoint
ALTER TABLE "gruppe" ADD COLUMN "kursart" "kursart";--> statement-breakpoint
ALTER TABLE "einladung" ADD CONSTRAINT "einladung_lernende_id_lernende_id_fk" FOREIGN KEY ("lernende_id") REFERENCES "public"."lernende"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lernende" ADD CONSTRAINT "lernende_eingang_eindeutig" UNIQUE("eingang_id");