-- Lauf Lern-App, S-L3 M-1 (ADR 0043 Fortschreibung Nr. 17, D-L03/D-L04, KERN 4.0 §6): Lerntage je Konto und Kurs, damit
-- Bestenliste und Gruppenziel nur Sprachkurse und der Stand der Lehrkraft nur zugewiesene Kurse zählen (kein Rückschluss
-- auf Wissenskurs oder Koran-Arabisch, Art. 9 DSGVO). Nur additiv; der Bestand wird aus `lernapp_ereignis` nachgetragen –
-- mit denselben Regeln wie `web/src/lib/lernapp/ereignisse/kurs.ts` (`kursDesEreignisses`).
CREATE TABLE "lernapp_tag_kurs" (
	"benutzer_id" text NOT NULL,
	"tag" date NOT NULL,
	"kurs" text NOT NULL,
	"xp" integer DEFAULT 0 NOT NULL,
	"lektionen" smallint DEFAULT 0 NOT NULL,
	CONSTRAINT "lernapp_tag_kurs_benutzer_id_tag_kurs_pk" PRIMARY KEY("benutzer_id","tag","kurs")
);
--> statement-breakpoint
ALTER TABLE "lernapp_tag_kurs" ADD CONSTRAINT "lernapp_tag_kurs_benutzer_id_lernapp_profil_benutzer_id_fk" FOREIGN KEY ("benutzer_id") REFERENCES "public"."lernapp_profil"("benutzer_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
INSERT INTO "lernapp_tag_kurs" ("benutzer_id", "tag", "kurs", "xp", "lektionen")
SELECT "benutzer_id", "tag", "kurs", sum("xp")::integer, least(sum("lektionen"), 32767)::smallint
FROM (
	SELECT
		"benutzer_id",
		"tag",
		CASE
			WHEN "art" = 'lektion' THEN
				CASE
					WHEN "daten"->>'kurs' IN ('tr-aus-de', 'ar-aus-de', 'de-aus-tr', 'ar-aus-tr', 'de-aus-ar', 'tr-aus-ar', 'islam', 'koran')
						AND left("daten"->>'lektion', length("daten"->>'kurs') + 1) = ("daten"->>'kurs') || '.'
					THEN "daten"->>'kurs'
					ELSE 'unbekannt'
				END
			ELSE
				CASE
					WHEN split_part("daten"->>'bezug', '.', 1) IN ('tr-aus-de', 'ar-aus-de', 'de-aus-tr', 'ar-aus-tr', 'de-aus-ar', 'tr-aus-ar', 'islam', 'koran')
						AND strpos("daten"->>'bezug', '.') > 0
					THEN split_part("daten"->>'bezug', '.', 1)
					ELSE 'unbekannt'
				END
		END AS "kurs",
		CASE WHEN "art" = 'xp' THEN ("daten"->>'menge')::integer ELSE 0 END AS "xp",
		CASE WHEN "art" = 'lektion' THEN 1 ELSE 0 END AS "lektionen"
	FROM "lernapp_ereignis"
	WHERE "art" IN ('lektion', 'xp')
) AS "e"
GROUP BY "benutzer_id", "tag", "kurs";
