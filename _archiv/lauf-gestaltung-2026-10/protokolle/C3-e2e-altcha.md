# E2E-Wiederholung ALTCHA am Endstand 58a3344 (bau-head, Port 3700, ein Worker, ruhige Last)

Vollauf 13:20–13:39 UTC: 562 grün, 61 übersprungen, 7 rot (6 × ALTCHA-Feld nach 20 s leer, 1 × PWA-offline wie auf 3100). Der Lauf fiel teils mit Diagnose-Last zusammen (bis 7,5).

## Wiederholung 1 (sechs Specs, je ein Lauf)
```
  ✘  1 [desktop] › tests/e2e/formular-kontakt.spec.ts:33:5 › Kontaktformular: Fehler mit Sprungverweis, zweiter Versuch ohne Neuladen, Bestätigung und Benachrichti
  ✓  2 [desktop] › tests/e2e/formular-meldung.spec.ts:47:5 › Meldung: Fehler mit Sprungverweis, zweiter Versuch ohne Neuladen, Ticket in der Verwaltung und Mails in
  ✓  3 [desktop] › tests/e2e/formular-moschee-anfrage.spec.ts:33:5 › Webseite-Anfrage in drei Schritten bis zur Bestätigung (18.5s)
  ✘  5 [desktop] › tests/e2e/formular-veranstaltungsanmeldung.spec.ts:43:5 › Anmeldung mit ALTCHA: Bestätigung und Benachrichtigung in Mailpit, Plätze zählen, da
  ✘  6 [desktop] › tests/e2e/formular-voranmeldung.spec.ts:30:5 › Voranmeldung in vier Schritten bis zur Bestätigung (29.3s)
  ✘  7 [desktop] › tests/e2e/verwaltung-eingaenge.spec.ts:25:5 › Eingänge: Kontaktanfrage ansehen, abschließen, Notiz, Export und endgültig löschen (25.0s)
  4 failed
  2 passed (2.9m)
```

## Wiederholung 2 (vier noch rote Specs, --retries=4)
```
  ✓  1 [desktop] › tests/e2e/formular-kontakt.spec.ts:33:5 › Kontaktformular: Fehler mit Sprungverweis, zweiter Versuch ohne Neuladen, Bestätigung und Benachrichti
  ✘  2 [desktop] › tests/e2e/formular-veranstaltungsanmeldung.spec.ts:43:5 › Anmeldung mit ALTCHA: Bestätigung und Benachrichtigung in Mailpit, Plätze zählen, da
  ✓  3 [desktop] › tests/e2e/formular-veranstaltungsanmeldung.spec.ts:43:5 › Anmeldung mit ALTCHA: Bestätigung und Benachrichtigung in Mailpit, Plätze zählen, da
  ✘  4 [desktop] › tests/e2e/formular-voranmeldung.spec.ts:30:5 › Voranmeldung in vier Schritten bis zur Bestätigung (29.0s)
  ✓  5 [desktop] › tests/e2e/formular-voranmeldung.spec.ts:30:5 › Voranmeldung in vier Schritten bis zur Bestätigung (retry #1) (14.2s)
  ✓  6 [desktop] › tests/e2e/verwaltung-eingaenge.spec.ts:25:5 › Eingänge: Kontaktanfrage ansehen, abschließen, Notiz, Export und endgültig löschen (20.5s)
  2 flaky
  2 passed (3.0m)
```

## Einordnung
- Alle sechs ALTCHA-Tests sind am Endstand mindestens einmal grün. Rote Läufe: nur das versteckte Feld `altcha` nach 20 s leer, das Widget zeigt „Wird überprüft…“ (PBKDF2, Kosten 5000, Zähler zufällig bis 10 000). Das ist die bekannte Rechenzeit-Klasse L-E07 (8–39 s in dieser VM).
- Die Formularlogik ist unverändert und UNANTASTBAR. Seit dem letzten Vollauf (f2a5f8d) hat sich am ALTCHA-Pfad nichts geändert: FormWizard nur mit Schrittmarken-Farben und sr-only-Zeile, `lib/validierung/altcha.ts` unverändert seit 0487b9b.
- PWA-offline: Umgebungsbefund wie im Ausgangsstand 3100 (`C-e2e.md` b).
