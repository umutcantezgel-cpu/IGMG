# STATUS

**Statuszeile:** Phase P4 · Tor A bestanden (Reparaturen R1/R2 + O), Welle B: B01/B02/B04/B05 fertig, B03/B06/B07 laufen (Workflow woruff1a5) · Z 0/12 · nächster Schritt: Formularpakete abnehmen, B08/B09 Mails, A23b E2E-Bedienabläufe, Tor B

## Prüfpunkt (2026-10-11, ~06:05)
- **Erledigt seit letztem Prüfpunkt:**
  - Tor P3 bestanden (0246a4a), Welle-A-Vorarbeiten (32148dd)
  - B02 Formular-Infrastruktur + B04 Veranstaltungsanmeldung (dieser Commit): `verarbeiteFormular` (Rate → Honigtopf → ALTCHA → Zod → Prüfung → Transaktion eingang/einwilligung/mail_ausgang → Versand per `after`), Mail-Ausgang mit Wiederholung, Vorlagen Bestätigung/Benachrichtigung (React Email), Formular-Insel nach E-028 (JS Detail 178,7 kB), ALTCHA CSP-fest (`altcha/external`, Worker unter `/altcha/`)
  - Belege: Integration 59/59 (davon 8 Anmeldung), Unit 193, E2E Anmeldung bis Mailpit + Veranstaltungen 65/65, axe auf dem Formular im Fehlerzustand, Lighthouse Detail P 98 / LCP 1,9 s / JS 178,7 kB (`_lauf/belege/lighthouse/2026-10-11-03-57/`)
  - B01 FormWizard (E-029, Schritte vom Server, kein Client-JS) + B05 Schüler-Voranmeldung (4 Schritte, Kinderdaten verschlüsselt, zwei Einwilligungen): Unit 200, Integration 66/66, E2E Wizard + Anmeldung grün, axe Voranmeldung 3 Sprachen × 390/1440, Lighthouse P 99 / LCP 1,6 s
  - **Offen aus Messung:** Voranmeldung 205,8 kB JS – Ursache A18 (`[locale]/error.tsx` zieht `tailwind-merge` in alle Routen, FEHLERSTATISTIK); bei Abnahme A18 beheben und alle Routen neu messen
  - Tor A: DP-Befunde hoch behoben (Sans-Titel, Missionskarte, Terminliste, Kurshinweis/-status, Kategoriefarbe, Schlagwörter) oder bewusst dokumentiert; SP-A: 9 behoben, Freigabe-Blocker Löschfristen (C08) und Rechtstexte (M-079); echte 404; Übersetzungsprüfung A19–A21 eingespielt; A22 Unit-Tests Gebetszeiten (Befund A22-1 → M-082). Belege: E2E 326/326, Unit 339 (+3 erwartete Fehlschläge), Integration 66, Messrouten 166–173 kB
- **Laufende Pakete:** Workflow `wkol57rrk` (Run `wf_6899392c-b4b`, Welle A: A01→A02 · A03→A05→A06 · A04→A07→A17 · A08→A09→A18 · A10→A11→A12 · A15→A14)
- **Nächster Schritt:** Rückgaben Welle A nach L1 abnehmen, Integration (Routentabellen barrierefreiheit/datenschutz, neu-uebersetzt, MENSCHEN, ABWEICHUNGEN), Bau + E2E + messen, Tor A (DP/SP), Commit; Morgenbericht ab 07:00
- **Hinweis Budget:** Detailseite hat nach B04 nur 1,3 kB Luft (178,7/180) – neue Client-Komponenten auf Veranstaltungsseiten vermeiden; Formulare nur nach MUSTER 6a
- **Dienste lokal:** `docker compose --profile entwicklung up -d db mailpit` (PostgreSQL 127.0.0.1:5432, Mailpit 127.0.0.1:8025)
- **Umgebung je Befehl:** `source _lauf/werkzeuge/umgebung.sh` (pnpm, Docker ohne Keychain-Helper, Telemetrie aus)

## Offene Punkte für spätere Pakete
- Passkey-Registrierung und -Anmeldung (Client-Plugin) → C12 Benutzer/Konto
- Passwort vergessen (sendResetPassword) → C12
- TOTP-Wiederverwendung im selben Zeitfenster (Lichtung b) → Sicherheitsprüfer Tor P3/P5
- Redirect in Verwaltungsseiten liefert HTTP 200 + Client-Umleitung (gestreamt) – prüfen, ob 307 möglich (D05)

## Fortsetzung in neuer Sitzung
Zuerst lesen: `_lauf/STATUS.md`, `_lauf/KERN.md`, `_lauf/PLAN.md`, `web/docs/MUSTER.md`, `_lauf/ENTSCHEIDUNGEN.md`. Plan: `/Users/umurey/.claude/plans/auftrag-f-r-claude-code-linear-snowglobe.md`.
