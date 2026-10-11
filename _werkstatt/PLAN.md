# PLAN – Letzter Lauf (Version 1.0, 2026-10-11)

Grundlage: KERN.md 1.0, LAGEBILD.md, Plan der Planabnahme (`/root/.claude/plans/letzter-auftrag-igmg-sunny-starfish.md`). Ein Paket = ein Auftrag mit Kennung, Rolle, Modell, Schreibrechten, Prüfstufe A und Rückgabe nach `_werkstatt/pakete/briefings/ROLLEN.md`. Gemeinsame Dateien (`globals.css`, `messages/*.json`, `next.config.ts`, `vercel.json`, `package.json`, `Seitenrahmen.tsx`) schreibt nur Opus.

## Mengengerüst und Kapazität
- Pflicht ≈ 45 Pakete (≈ 12 Opus, ≈ 33 Haiku), Kür ≈ 20 (Haiku nach Referenz, Opus nur Abnahme).
- Kapazität: 4 Haiku-Plätze × ≈ 4 Wellen/Tag; Opus parallel. 65 ÷ 16 × 1,2 ≈ 5 Tage.
- Schwere Läufe (Build, Suiten, Lighthouse, Bildsätze) nie parallel; Messungen gegen den eingefrorenen Ausgangsstand laufen auf Port 3100, Opus-Entwicklung auf `localhost:3200`.

## Etappen und Pakete

### E0 Start und Erkundung (erledigt bis auf Ausgangswerte und Funktionsliste)
| Kennung | Rolle | Modell | Inhalt | Stand |
|---|---|---|---|---|
| E0-PRUEFER-01 | Prüfer | Haiku | Werkzeuge, Ausgangsstand einfrieren | ✓ |
| E0-KUNDSCHAFTER-02/03/05/06 | Kundschafter | Haiku | Designsystem · Ansichten/Inhalte · Stack/Qualität · Auslieferung | ✓ / läuft (06) |
| E0-PRUEFER-02 | Prüfer | Haiku | Ausgangswerte Stufe B (11 Hauptansichten) | läuft |
| E0-PRUEFER-03 | Prüfer | Haiku | Funktionsliste aus LAGEBILD gegen Port 3100 | offen |

### E1 Plan
KERN 1.0 (✓), PLAN (dieses Dokument), ABNAHME (Z-01–Z-12 mit Ausgangswerten), ADR 0018–0023 (Opus, mit E3), L0-Planprüfung (Haiku, eine Runde).

### E2 Referenz und Kernsysteme
| Kennung | Rolle | Modell | Inhalt | Schreibrechte | Stand |
|---|---|---|---|---|---|
| O-01 | Opus | Opus | Designsystem-Skalen (K-005), `dark:` neutral | `globals.css` | ✓ 6b15832 |
| O-02 | Opus | Opus | Bewegungssystem (K-007), Seitenwechsel B-05 | `globals.css`, `Seitenrahmen.tsx`, `Header.tsx` | ✓ bis auf B-05-Nachweis |
| O-03 | Opus | Opus | SVG-Formsystem: `Achtstern`, Achtstern-Trenner, `Zustandsgrafik.tsx`, Lade-Achtstern (B-12) | `Icons.tsx`, `website/Zustandsgrafik.tsx` | teilweise |
| O-04 | Opus | Opus | Startseite mit Tagesbogen (B-06), alle Zustände | `page.tsx`, `website/start/*`, `lib/gebetszeiten/bogen.ts` | ✓ erste Fassung |
| H-STYLE | Baumeister | Haiku | Styleguide-Spiegel der neuen Skalen, Abschnitte Bewegung/Ebenen | `verwaltung/styleguide/**`, Test | läuft |
| H-FIX1 | Baumeister | Haiku | iCal unabhängig von Prozess-TZ | `lib/termine/ical.ts`, Test | ✓ 65bcb4b |
| H-FIX2 | – | – | `dark:` neutralisieren | – | ✓ in O-01 (`@custom-variant`) |
| H-FIX3 | Baumeister | Haiku | Ganztagstermine an iCal übergeben (ML-08) | `server/queries/veranstaltungen.ts`, `server/ical/*`, Tests | offen |
| H-V01 | Baumeister | Haiku | `.vercelignore` prüfen, ignore-Skript für ZWISCHENSTAND-Commits, regions/crons-Vorschlag | `web/scripts/vercel-ignore.mjs` (neu) | offen |
| H-V03 | Baumeister | Haiku | `lib/umgebung.ts` (zod, SITE_MODE), `.env.example` vollständig, `geheimnisse:erzeugen`, Tests | `lib/umgebung.ts`, `scripts/geheimnisse-erzeugen.mjs`, `.env.example`, Tests | offen |
| H-V06 | Baumeister | Haiku | Wartungsrouten GET + `Bearer CRON_SECRET` (POST + WARTUNG_TOKEN bleibt), `pg_try_advisory_lock`, Route `mail-ausgang`, Tests | `app/api/wartung/**`, `lib/wartung/**`, Tests | offen |
| E2-TOR | Prüfer + Opus | Haiku/Opus | Stufe B Startseite, Sichtabnahme frischer Opus-Unteragent (≥ 8), Vorschau V-13 | – | offen |

### E3 Ausführung I
| Kennung | Rolle | Modell | Inhalt |
|---|---|---|---|
| O-05 | Opus | Opus | ADR 0018/0019: `attachDatabasePool`, `vercel-build` mit/ohne DB, Migrationssperre, `instrumentation.ts` auf Vercel |
| O-06 | Opus | Opus | ADR 0020: `BlobSpeicher`, Direkt-Upload, Bildvarianten 480/960/1600/2560, `MedienBild` srcset |
| O-07 | Opus | Opus | `lib/startklar/pruefungen.ts` (Kernbibliothek, gemeinsam für Cockpit und CLI) |
| O-08 | Opus | Opus | Momente: Weg der Gemeinde (B-07), Meilensteinlinie (B-08), Familie der vier (B-09) |
| H-A01…A07 | Baumeister | Haiku | je eine Arbeitsansicht nach Referenz: Gebetszeiten, Veranstaltungen, Veranstaltungsdetail (+ Morph B-05), Nachrichten (+ Morph), Korankurse, Voranmeldung, Kontakt |
| H-S01 | Baumeister | Haiku | Cockpit-UI `/verwaltung/startklar` (Recht `einstellung.bearbeiten`, keine neue Aktion) |
| H-S02 | Baumeister | Haiku | `pnpm startklar` (`web/scripts/startklar.ts`) und `pnpm release:check` (Bündel), Tests der Prüflogik |
| E3-TOR | Prüfer + Opus | Haiku/Opus | Stufe B, Sichtabnahme, Vorschau |

### E4 Ausführung II
| Kennung | Rolle | Modell | Inhalt |
|---|---|---|---|
| H-G01…G04 | Baumeister | Haiku | gemeinsame Bausteine exklusiv: Header, Footer (Achtstern-Band), PrayerTimesBar (B-10), Seitenkopf mit geteiltem Element |
| H-Z01…Z03 | Grafiker/Baumeister | Haiku | Zustände: leer, Fehler, 404, global-error, offline (Zustandsgrafik); FormWizard/Felder (B-11, B-12) |
| H-W01…W03 | Baumeister | Haiku | E-Mail-Vorlagen, Bildschirm-Anzeige (nur Zustandswechsel), Verwaltungs-Hülle (Feinschliff, `verwaltung:`-Breakpoint) |
| H-D01…D04 | Dokumentar | Haiku | `docs/deploy/VERCEL.md` (30-Minuten-Runbook), `VERCEL-ENV.md`, `docs/GO-LIVE.md`, `docs/recht/VERARBEITUNGSVERZEICHNIS.md`, Hosting-Baustein v2 |
| H-B… | Baumeister | Haiku | Befundpakete aus den Sichtabnahmen (≤ 2 je Ansicht und Kategorie) |
| E4-TOR | Prüfer + Opus | Haiku/Opus | Stufe B |

### E5 Kür und Abschluss
Kür nach Wirkung (je ein Haiku-Paket nach Referenz): Bildschirm-Anzeige · Fehlerseite mit Charakter · Verwaltungs-Übersicht · Islamisches Wissen · IGMG · Vorstand · Webseite für Moscheen · Suche · Quran-Seiten · OG-Bilder · Druckansicht Gebetszeiten · Choreografie des Mobilmenüs. Danach Stufe C (Haiku), BERICHT.md mit Galerie (Dokumentar), Endprüfung durch frischen Opus-Unteragenten, CLAUDE.md-Block entfernen, ABSCHLUSS.

## Wellen (Takt L2)
- Welle = bis zu 4 Haiku-Pakete mit disjunkten Schreibrechten + Opus-Arbeit. Nach jeder Welle: gemeinsame Dateien übertragen (Opus), Build durch Haiku-Prüfer, Commit und Push des Arbeitsbranchs; bei Grün und `pnpm check` grün Fast-Forward auf `main` (L-E01), danach Produktions-Deployment per Vercel-MCP lesen.
- Stündlich (L4): STATUS, PRÜFPUNKT, Commit `ZWISCHENSTAND …`.

## Risiken
- B-05 (React `<ViewTransition>`) löste im Entwicklungsserver nicht aus → Nachweis im Produktions-Build; sonst bleibt der Seitenwechsel ohne Überblendung (schrittweise Verbesserung), Register-Eintrag wird angepasst.
- Lighthouse-Schwankung durch parallele Arbeit → Messblöcke mit Uhrzeit, Spanne der drei Läufe als Toleranz (Z-08).
- Produktion ohne Datenbank: jeder Push auf `main` muss den PGlite-Rückfall im Bau erhalten.
