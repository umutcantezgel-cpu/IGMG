-- Lauf Lern-App, Gruppen (L7-02; ADR 0043 Nr. 7/8, KERN 4.0 §5): Gruppenziel und Bestenliste je Lerngruppe, Bestenliste der
-- Familie (Elternkonto) und die eigene Zustimmung zur Bestenliste (nur ab 16). Nur additiv; nutzt keinen Enum-Wert aus 0017.
CREATE TABLE "lernapp_familie" (
	"eltern_id" text PRIMARY KEY NOT NULL,
	"bestenliste" boolean DEFAULT false NOT NULL,
	"geaendert_am" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lernapp_gruppe" (
	"gruppe_id" uuid PRIMARY KEY NOT NULL,
	"wochenziel_xp" integer,
	"bestenliste" boolean DEFAULT false NOT NULL,
	"geaendert_von" text,
	"geaendert_am" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lernapp_rangliste_zustimmung" (
	"benutzer_id" text PRIMARY KEY NOT NULL,
	"text_version" text NOT NULL,
	"erteilt_am" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "lernapp_familie" ADD CONSTRAINT "lernapp_familie_eltern_id_user_id_fk" FOREIGN KEY ("eltern_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lernapp_gruppe" ADD CONSTRAINT "lernapp_gruppe_gruppe_id_gruppe_id_fk" FOREIGN KEY ("gruppe_id") REFERENCES "public"."gruppe"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lernapp_gruppe" ADD CONSTRAINT "lernapp_gruppe_geaendert_von_user_id_fk" FOREIGN KEY ("geaendert_von") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lernapp_rangliste_zustimmung" ADD CONSTRAINT "lernapp_rangliste_zustimmung_benutzer_id_user_id_fk" FOREIGN KEY ("benutzer_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;