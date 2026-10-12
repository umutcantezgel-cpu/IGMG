# C3b · E2E am Endstand 325c38a (Auszug aus dem Scratchpad, ohne Einladungs- und Testausgaben)

Ablauf: `endstand.sh 325c38a`, E2E-Vollauf gegen den Build im Worktree bau-head (Port 3700), Postgres 16 lokal, Mailpit als Binärdatei (UA-02). Voller Mitschnitt: `$S/e2e/endstand-vollauf.log` (900 kB, nicht im Repo).

## Vollauf (17:18–18:35 UTC)
```
  6 failed
  61 skipped
  563 passed (18.0m)

Rot:
  [desktop] › tests/e2e/formular-meldung.spec.ts:47:5 › Meldung: Fehler mit Sprungverweis, zweiter Versuch ohne Neuladen, Ticket in der Verwaltung und Mails in Mailpit 
  [desktop] › tests/e2e/formular-mitgliedsantrag.spec.ts:33:5 › Mitgliedsantrag in drei Schritten bis zur Bestätigung 
  [desktop] › tests/e2e/formular-veranstaltungsanmeldung.spec.ts:43:5 › Anmeldung mit ALTCHA: Bestätigung und Benachrichtigung in Mailpit, Plätze zählen, dann ausgebucht 
  [desktop] › tests/e2e/formular-voranmeldung.spec.ts:30:5 › Voranmeldung in vier Schritten bis zur Bestätigung 
  [desktop] › tests/e2e/pwa.spec.ts:22:5 › offline: Gebetszeiten aus dem Vorrat, andere Seiten → Offline-Seite 
  [desktop] › tests/e2e/verwaltung-seiteninhalte-organisationen.spec.ts:50:5 › Kontaktdaten: Fehler am Feld mit Sprungverweis, dann speichern; die Kontaktseite zeigt die Angaben 
```

## Wiederholung der roten Tests (`altcha-wdh3.sh`, ein Worker, bis zu 4 Wiederholungen)
```
  ✘  1 [desktop] › tests/e2e/formular-meldung.spec.ts:47:5 › Meldung: Fehler mit Sprungverweis, zweiter Versuch ohne Neuladen, Ticket in der Verwaltung und Mails in
  ✓  2 [desktop] › tests/e2e/formular-meldung.spec.ts:47:5 › Meldung: Fehler mit Sprungverweis, zweiter Versuch ohne Neuladen, Ticket in der Verwaltung und Mails in
  ✓  3 [desktop] › tests/e2e/formular-mitgliedsantrag.spec.ts:33:5 › Mitgliedsantrag in drei Schritten bis zur Bestätigung (19.0s)
  ✓  4 [desktop] › tests/e2e/formular-veranstaltungsanmeldung.spec.ts:43:5 › Anmeldung mit ALTCHA: Bestätigung und Benachrichtigung in Mailpit, Plätze zählen, da
  ✘  5 [desktop] › tests/e2e/formular-voranmeldung.spec.ts:30:5 › Voranmeldung in vier Schritten bis zur Bestätigung (28.6s)
  ✓  6 [desktop] › tests/e2e/formular-voranmeldung.spec.ts:30:5 › Voranmeldung in vier Schritten bis zur Bestätigung (retry #1) (22.4s)
  ✘  7 [desktop] › tests/e2e/verwaltung-seiteninhalte-organisationen.spec.ts:50:5 › Kontaktdaten: Fehler am Feld mit Sprungverweis, dann speichern; die Kontaktseite
  ✘  8 [desktop] › tests/e2e/verwaltung-seiteninhalte-organisationen.spec.ts:50:5 › Kontaktdaten: Fehler am Feld mit Sprungverweis, dann speichern; die Kontaktseite
  ✘  9 [desktop] › tests/e2e/verwaltung-seiteninhalte-organisationen.spec.ts:50:5 › Kontaktdaten: Fehler am Feld mit Sprungverweis, dann speichern; die Kontaktseite
  ✓  10 [desktop] › tests/e2e/verwaltung-seiteninhalte-organisationen.spec.ts:50:5 › Kontaktdaten: Fehler am Feld mit Sprungverweis, dann speichern; die Kontaktseit
    Error: expect(locator).not.toHaveValue(expected) failed
    test-results/formular-meldung-Meldung-F-d5550-altung-und-Mails-in-Mailpit-desktop/test-failed-1.png
    Error: expect(locator).not.toHaveValue(expected) failed
    test-results/formular-voranmeldung-Vora-a9f3a-hritten-bis-zur-Bestätigung-desktop/test-failed-1.png
    Error: expect(locator).toBeVisible() failed
    test-results/verwaltung-seiteninhalte-o-5a992-taktseite-zeigt-die-Angaben-desktop/test-failed-1.png
    Error: expect(locator).toBeVisible() failed
    test-results/verwaltung-seiteninhalte-o-5a992-taktseite-zeigt-die-Angaben-desktop-retry1/test-failed-1.png
    Error: expect(locator).toBeVisible() failed
    test-results/verwaltung-seiteninhalte-o-5a992-taktseite-zeigt-die-Angaben-desktop-retry2/test-failed-1.png
  3 flaky
  2 passed (4.5m)
WDH_RC=0
```

## Kontaktdaten: alter gegen neuen Spec (`kontakt-fix.sh`, drei Rechenschleifen als Last, ohne Wiederholung)
```
== ALT 18:51:01 Last 0.61
  ✓  1 [desktop] › tests/e2e/verwaltung-seiteninhalte-organisationen.spec.ts:38:5 › Organisationsredaktion GT speichert die eigene Organisation; die öffentliche Se
  ✓  2 [desktop] › tests/e2e/verwaltung-seiteninhalte-organisationen.spec.ts:50:5 › Kontaktdaten: Fehler am Feld mit Sprungverweis, dann speichern; die Kontaktseite
  ✓  3 [desktop] › tests/e2e/verwaltung-seiteninhalte-organisationen.spec.ts:38:5 › Organisationsredaktion GT speichert die eigene Organisation; die öffentliche Se
  ✓  4 [desktop] › tests/e2e/verwaltung-seiteninhalte-organisationen.spec.ts:50:5 › Kontaktdaten: Fehler am Feld mit Sprungverweis, dann speichern; die Kontaktseite
  ✓  5 [desktop] › tests/e2e/verwaltung-seiteninhalte-organisationen.spec.ts:38:5 › Organisationsredaktion GT speichert die eigene Organisation; die öffentliche Se
  ✓  6 [desktop] › tests/e2e/verwaltung-seiteninhalte-organisationen.spec.ts:50:5 › Kontaktdaten: Fehler am Feld mit Sprungverweis, dann speichern; die Kontaktseite
  6 passed (1.2m)
ALT_RC=0
== NEU 18:52:15 Last 3.53
  ✓  1 [desktop] › tests/e2e/verwaltung-seiteninhalte-organisationen.spec.ts:50:5 › Organisationsredaktion GT speichert die eigene Organisation; die öffentliche Se
  ✓  2 [desktop] › tests/e2e/verwaltung-seiteninhalte-organisationen.spec.ts:62:5 › Kontaktdaten: Fehler am Feld mit Sprungverweis, dann speichern; die Kontaktseite
  ✓  3 [desktop] › tests/e2e/verwaltung-seiteninhalte-organisationen.spec.ts:50:5 › Organisationsredaktion GT speichert die eigene Organisation; die öffentliche Se
  ✓  4 [desktop] › tests/e2e/verwaltung-seiteninhalte-organisationen.spec.ts:62:5 › Kontaktdaten: Fehler am Feld mit Sprungverweis, dann speichern; die Kontaktseite
  ✓  5 [desktop] › tests/e2e/verwaltung-seiteninhalte-organisationen.spec.ts:50:5 › Organisationsredaktion GT speichert die eigene Organisation; die öffentliche Se
  ✓  6 [desktop] › tests/e2e/verwaltung-seiteninhalte-organisationen.spec.ts:62:5 › Kontaktdaten: Fehler am Feld mit Sprungverweis, dann speichern; die Kontaktseite
  ✓  7 [desktop] › tests/e2e/verwaltung-seiteninhalte-organisationen.spec.ts:50:5 › Organisationsredaktion GT speichert die eigene Organisation; die öffentliche Se
  ✓  8 [desktop] › tests/e2e/verwaltung-seiteninhalte-organisationen.spec.ts:62:5 › Kontaktdaten: Fehler am Feld mit Sprungverweis, dann speichern; die Kontaktseite
  8 passed (1.8m)
NEU_RC=0
== FERTIG 18:54:06
```

## Einordnung
- ALTCHA (Meldung, Mitgliedsantrag, Veranstaltungsanmeldung, Voranmeldung): Zeitgrenze der Lösungsrechnung unter Last (L-E07). In der Wiederholung grün.
- PWA offline: Der Service Worker greift in dieser Umgebung nicht; der Ausgangsstand 3100 zeigt dasselbe Bild (STUFE-C2). Das ist ein Umgebungsbefund.
- Kontaktdaten: Wettlauf mit der Hydrierung, im Test behoben (3ac362e), siehe `C3-e2e-kontakt.md`; Produktverhalten in ML-28.
