-- Nacharbeit 2, P2 (F-38, ADR 0034 Nr. 6): tägliche Mail-Zusammenfassung ohne Inhalte je Konto und Thema.
CREATE TABLE "mail_zusammenfassung" (
	"benutzer_id" text PRIMARY KEY NOT NULL,
	"themen" text[] DEFAULT '{}' NOT NULL,
	"seit" timestamp with time zone DEFAULT now() NOT NULL,
	"letzter_versand" timestamp with time zone,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "mail_zusammenfassung" ADD CONSTRAINT "mail_zusammenfassung_benutzer_id_user_id_fk" FOREIGN KEY ("benutzer_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;