# STATUS

**Statuszeile:** Phase P2 (Fundament fertig, Tor offen) · Welle – · Pakete P0: 30/56 Blätter, P2: F01–F10 gebaut · Z 0/12 · Tore –/– · Puffer 0 % · nächster Schritt: Docker-Probelauf, Tor P2 (Testläufer), dann Blätter abnehmen und P3 Durchstich

## Prüfpunkt (2026-10-11, ~03:00)
- **Erledigt:**
  - P0: Laufdateien, UMGEBUNG.md, Rollenbriefings, Text-Inventar LanguageContext, ADR 0001 (Versionen)
  - P1: ADRs 0002–0016 (web/docs/adr), PLAN.md v1, ABNAHME.md, KERN 1.1 (/suche, /offline); Lichtungen a/b/c gelungen (`_lauf/lichtung/*/ERGEBNIS.md`); Bildreferenzen: 238 Bilder in `_lauf/belege/referenz/` (lokal)
  - P2: F01–F10 (Next 16.4 in web/, Konfiguration, Header/CSP, i18n mit allen Pfaden, Tokens, Schriften lokal, shadcn/ui, Schema 34 Tabellen + Migration, Better Auth + 2FA + Passkey-Plugin, Rechte-Matrix, Audit, Adapter Krypto/Speicher/Mail/Rate/ALTCHA, Vitest/Playwright, Geheimnis-Hooks, Verwaltung-Anmeldung mit 2FA, Einladung, Dockerfile, docker-compose)
  - E2E „Anmelden mit Zwei-Faktor“ grün (4/4, desktop)
- **Laufende Pakete:** Kundschafter-Workflow `wf_333df54b-23b` (56 Blätter, 30 fertig); Docker-Build `docker compose build app` (Log `_lauf/werkzeuge/docker-build.log`)
- **Offene Agenten:** siehe oben
- **Nächster Schritt:** Docker-Probelauf (App + DB, Health) → Tor P2 per Haiku-Testläufer → Blätter-Stichprobe (3×3) → Gegenprüfer PLAN → P3 D01 Hülle
- **Dienste lokal:** `docker compose --profile entwicklung up -d db mailpit` (PostgreSQL 127.0.0.1:5432, Mailpit 127.0.0.1:8025)
- **Umgebung je Befehl:** `source _lauf/werkzeuge/umgebung.sh` (pnpm, Docker ohne Keychain-Helper, Telemetrie aus)

## Offene Punkte für spätere Pakete
- Passkey-Registrierung und -Anmeldung (Client-Plugin) → C12 Benutzer/Konto
- Passwort vergessen (sendResetPassword) → C12
- TOTP-Wiederverwendung im selben Zeitfenster (Lichtung b) → Sicherheitsprüfer Tor P3/P5
- Build braucht für Prerender mit DB-Inhalten eine Datenbank → ADR 0017 im Durchstich (D04)
- Redirect in Verwaltungsseiten liefert HTTP 200 + Client-Umleitung (gestreamt) – prüfen, ob 307 möglich (D05)

## Fortsetzung in neuer Sitzung
Zuerst lesen: `_lauf/STATUS.md`, `_lauf/KERN.md`, `_lauf/PLAN.md`, `web/docs/MUSTER.md` (sobald vorhanden), `_lauf/ENTSCHEIDUNGEN.md`. Plan: `/Users/umurey/.claude/plans/auftrag-f-r-claude-code-linear-snowglobe.md`.
