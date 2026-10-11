# STATUS

**Statuszeile:** Phase P3 · Tor P3 läuft (D08, DP, SP, danach TL) · Pakete P0: 56/56 Blätter · Z 0/12 · Tore P2 grün · nächster Schritt: Tor-Befunde abarbeiten, Welle A starten (Vorarbeiten fertig)

## Prüfpunkt (2026-10-11, ~04:50)
- **Erledigt seit letztem Prüfpunkt:**
  - D05 Verwaltungs-Hülle + Modul Veranstaltungen (e3020c7), D06/D07/D09a/T5/T8 abgenommen
  - E-019 E2E-Datenbank `igmg_e2e` (1bb5ddd), Entwicklungs-DB von Testkonten bereinigt
  - K-12 Leistung (f39e6a7): CLS 0, JS 172–177 kB, Lighthouse mobil (devtools) Perf. 99 / A 100 / BP ≥ 96 / SEO 100 / LCP 1,6 s; `pnpm messen` (E-026)
  - `web/docs/MUSTER.md` geschrieben (vorläufig, nach Tor P3 festschreiben)
  - Welle-A-Vorarbeiten (E-027): `messages/bereiche/<bereich>.json`, `src/lib/validierung/seiteninhalte/<bereich>.ts`, `drizzle/seeds/bereiche/<bereich>.ts` als Platzhalter; `ladeGebetszeitenMonat`, `src/lib/gebetszeiten/hijri.ts`; Testhilfe `tests/integration/hilfen/verwaltung.ts`
- **Laufende Pakete:** Workflow `wf_d3f34fc4-181` (Tor P3)
- **Nächster Schritt:** Tor-Befunde → Commit → Welle A in 6 Ketten (A01→A02 · A03→A05→A06 · A04→A07→A17 · A08→A09→A18 · A10→A11→A12 · A15→A14), A16 selbst (O)
- **Dienste lokal:** `docker compose --profile entwicklung up -d db mailpit` (PostgreSQL 127.0.0.1:5432, Mailpit 127.0.0.1:8025)
- **Umgebung je Befehl:** `source _lauf/werkzeuge/umgebung.sh` (pnpm, Docker ohne Keychain-Helper, Telemetrie aus)

## Offene Punkte für spätere Pakete
- Passkey-Registrierung und -Anmeldung (Client-Plugin) → C12 Benutzer/Konto
- Passwort vergessen (sendResetPassword) → C12
- TOTP-Wiederverwendung im selben Zeitfenster (Lichtung b) → Sicherheitsprüfer Tor P3/P5
- Anmeldung zu Veranstaltungen (Formular, Platzzählung via `TAG.anmeldungenVon`) → B04
- Redirect in Verwaltungsseiten liefert HTTP 200 + Client-Umleitung (gestreamt) – prüfen, ob 307 möglich (D05)

## Fortsetzung in neuer Sitzung
Zuerst lesen: `_lauf/STATUS.md`, `_lauf/KERN.md`, `_lauf/PLAN.md`, `web/docs/MUSTER.md` (sobald vorhanden), `_lauf/ENTSCHEIDUNGEN.md`. Plan: `/Users/umurey/.claude/plans/auftrag-f-r-claude-code-linear-snowglobe.md`.
