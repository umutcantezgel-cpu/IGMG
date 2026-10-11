# STATUS

**Statuszeile:** Phase P4 · Tor A bestanden · Welle B: alle fünf Formulare fertig (B01–B07) · Welle C: C08, C13, C14, C15, C16 fertig · Z 0/12 · nächster Schritt: Bündel 2 (C01, C02, C03, C06, C09, C10), parallel C12 Benutzer (Orchestrator); danach C04/C05/C10b Meldung, C07, C11, B08/B09 prüfen, Tor B

## Prüfpunkt (2026-10-11, ~08:25)
- **Erledigt seit letztem Prüfpunkt:**
  - B03 Kontaktformular, B06 Mitglied werden, B07 Webseite für Moscheen (Haiku, L1 9–10/10)
  - C08 Eingänge + C16 Löschfristen (Orchestrator): Liste ohne Personendaten, Detail mit Audit des Abrufs, Status startet Frist, verschlüsselte Notizen, Export CSV/JSON mit Audit, endgültiges Löschen, Löschlauf `POST /api/wartung/loeschfristen`, Einstellungen › Löschfristen
  - C13 Audit-Log, C14 Styleguide, C15 Rich-Text-Editor (Haiku, je 10/10); Module audit, styleguide, einstellungen, eingaenge freigeschaltet
  - Befunde O behoben: Absenden ohne JavaScript → 500 (E-032, `zurueckOhneSkript`), ALTCHA-Rennen beim schnellen Absenden (`AltchaFeld` stößt `verify()` an), fehlender Audit-Eintrag bei der ersten Anmeldung, Betreff „Mitgliedsanfrage“ vereinheitlicht; E2E: eigene Absenderadresse je Test (Anmeldegrenze)
  - Entscheidungen E-032 (ohne JS), E-033 (Ankündigungen oben auf „Nachrichten“), E-034 (Meldung als eigene Seite); MENSCHEN M-083–M-087
  - Belege: `_lauf/belege/welle-b/abnahme-b03-b06-b07-c08-c13-c16.md` – Unit 450 (+3 erwartete Fehlschläge), Integration 131/131, Build grün, E2E 360 + Nachlauf 6/6, Lighthouse 9 Routen P 98–99 / A·BP·SEO 100 / JS 168,9–172,5 kB
- **Laufende Pakete:** keine
- **Nächster Schritt:** Bündel 2 starten (Workflow, 6 Haiku), währenddessen C12 Benutzer und Rollen (Orchestrator, Stufe 3)
- **Dienste lokal:** `docker compose --profile entwicklung up -d db mailpit` (PostgreSQL 127.0.0.1:5432, Mailpit 127.0.0.1:8025); Dev-Server 127.0.0.1:3000 (Hintergrund)
- **Umgebung je Befehl:** `source _lauf/werkzeuge/umgebung.sh` (pnpm, Docker ohne Keychain-Helper, Telemetrie aus)

## Offene Punkte für spätere Pakete
- Medienwahl im Rich-Text-Editor (`bildAuswahl`) → C11; Neuigkeiten-Bild (`bildId`) → C11
- Zähler Postfach/Tickets in der Seitenleiste → Orchestrator nach C09/C10 (Layout)
- SP-A-03 Proxy-Vertrauen für `x-forwarded-for` (Ratenbegrenzung, Better Auth) → P5
- Passkey-Registrierung und -Anmeldung (Client-Plugin) → C12 Benutzer/Konto
- Passwort vergessen (sendResetPassword) → C12
- TOTP-Wiederverwendung im selben Zeitfenster (Lichtung b) → Sicherheitsprüfer Tor P3/P5
- Redirect in Verwaltungsseiten liefert HTTP 200 + Client-Umleitung (gestreamt) – prüfen, ob 307 möglich (D05)

## Fortsetzung in neuer Sitzung
Zuerst lesen: `_lauf/STATUS.md`, `_lauf/KERN.md`, `_lauf/PLAN.md`, `web/docs/MUSTER.md`, `_lauf/ENTSCHEIDUNGEN.md`. Plan: `/Users/umurey/.claude/plans/auftrag-f-r-claude-code-linear-snowglobe.md`.
