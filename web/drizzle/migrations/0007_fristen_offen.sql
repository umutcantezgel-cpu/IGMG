-- Tor B/C SP-B B4: Höchstfrist für offene Eingänge (365 Tage ab Eingang, nie früher als 30 Tage ab jetzt – kein
-- überraschendes Löschen beim Einspielen) und Abschlusszeit für gelöste Tickets (Frist der Melderangaben, E-037).
UPDATE "eingang" SET "loeschen_ab" = greatest("erstellt_am" + interval '365 days', now() + interval '30 days') WHERE "loeschen_ab" IS NULL;--> statement-breakpoint
UPDATE "ticket" SET "geschlossen_am" = coalesce("aktualisiert_am", "erstellt_am") WHERE "status" = 'geloest' AND "geschlossen_am" IS NULL;
