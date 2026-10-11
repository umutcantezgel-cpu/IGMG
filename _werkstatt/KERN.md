# KERN – Letzter Lauf · Version 1.0 (2026-10-11, Entwurf aus E0, gültig ab E1)

Quelle der Wahrheit für Gestaltung und Auslieferung dieses Laufs. Bei Widerspruch gilt der alte Kern 2.0 (Anhang), außer wo dieser Kern ihn mit Vermerk in ENTSCHEIDUNGEN.md fortschreibt. Änderungen nur durch den Orchestrator, mit Versionsnummer und Grund. Jedes Paket nennt die Version, gegen die es gebaut wurde.

## Das Projekt in fünf Sätzen
Die Web-App der IGMG Wetzlar ist das digitale Zuhause einer Moscheegemeinde mit vier Organisationen (Ana Teşkilatı, Kadın Teşkilatı, Gençlik Teşkilatı, Kadın Gençlik Teşkilatı) für Besucher aller Generationen, auf Deutsch, Türkisch und Englisch. Ihre Hauptaufgaben sind die nächste Gebetszeit, Veranstaltungen, Kurse mit Anmeldung und der Kontakt; Ehrenamtliche pflegen alles in einer Verwaltung mit Zwei-Faktor-Anmeldung. Technisch ist sie eine Next.js-16.4-App (React 19.3, TypeScript, Tailwind CSS 4, PostgreSQL mit Drizzle, Better Auth, next-intl) in `web/`, deren öffentliche Seiten statisch vorgerendert sind. Dieser Lauf hebt ihre Gestaltung als Weiterentwicklung des eigenen Designsystems auf Spitzenniveau – würdevoll, ruhig, warm, schnell und zugänglich. Zugleich wird sie so Vercel-startklar (Frankfurt), dass nach dem Zusammenführen auf `main` nur noch Menschen-Schritte bleiben.

## K-001 Leitidee
**„Die Website lebt im Takt des Tages: Die sechs Gebetszeiten und die stille Ordnung des Achtsterns geben ihr Maß – warm wie Papier, ruhig wie ein Raum, in dem vier Organisationen und alle Generationen zuhause sind.“**
- Takt des Tages → der Tagesbogen der Gebetszeiten ist der erste und stärkste Moment; die Gebetszeit ist überall die wichtigste Information.
- Ordnung des Achtsterns → das Formsystem (zwei Quadrate, 45° gedreht) liefert Raster, Trenner, Zustandsgrafiken und Markierungen – geometrisch, nie dekorativ-religiös, nie hinter Text.
- Warm wie Papier → Papier/Sand/Tinte bleiben die Fläche; Grün ist Marke und Handlung, nicht Hintergrundrauschen.
- Ruhig wie ein Raum → wenig, langsame, bedeutungsvolle Bewegung; viel Weißraum; ein Blickfang je Bildschirmhöhe.
- Vier Organisationen → vier Akzentfarben als Familie; jede Organisationsseite zeigt die Familie und hebt ihr Mitglied hervor.
- Austauschprobe: Tagesbogen (echte Zeiten Wetzlars), Weg der Gemeinde (eigene Zeitleiste), Familie der vier (eigene Organisationen) passen zu keiner anderen Gemeinde unverändert.

## K-002 Marke, Zielgruppe, Hauptaufgaben
- Marke: IGMG Wetzlar; Logos nur als 40-px-PNG (`web/public/bilder/logos/`), nie vergrößert oder nachgezeichnet.
- Zielgruppe: alle Generationen, viele Ältere, die meisten auf dem Telefon, viele zweisprachig de/tr; Pflege durch Ehrenamtliche.
- Hauptaufgaben (Probelauf mobil, Desktop, nur Tastatur): (1) nächste Gebetszeit sehen, (2) Veranstaltung finden und anmelden, (3) Kurs finden und Schüler voranmelden, (4) Kontakt aufnehmen.

## K-003 Gestaltungsprinzipien (Tun · Lassen)
1. **Die Zeit zuerst.** Tun: Gebetszeit groß, klar, mit Restzeit; überall in zwei Schritten erreichbar. Lassen: Uhrzeiten verstecken, Countdown-Hektik, Sekundenzähler.
2. **Würde vor Effekt.** Tun: wenige, langsame, bedeutungsvolle Bewegungen; echte Inhalte. Lassen: Glas, Leuchtkugeln, Partikel, Verläufe ohne Grund, hochzählende Zahlen, Laufbänder, Orient-Kitsch, Halbmond/Kuppel-Cliparts, Kalligrafie oder Verse als Schmuck, Stockfotos.
3. **Ordnung aus Geometrie.** Tun: 24-px-Raster, Achtstern als einziges Ornament, klare Kanten. Lassen: Muster hinter Text, gemischte Icon-Stile, Emojis.
4. **Papier, Tinte, Grün.** Tun: warme Flächen, Grün für Handlung und Marke, Org-Farben nur in ihrem Kontext. Lassen: neue Farben außerhalb der Tokens, Farbe als einzige Information.
5. **Lesbar für alle.** Tun: ≥ 16 px, Zeilen 60–75 Zeichen, Zeilenhöhe 1,5–1,7, Kontrast AA, Touch 48 px mobil, Fokus immer sichtbar. Lassen: Hover-only-Information, dünne graue Schrift, Kleinstschrift.
6. **Mobil ist eine eigene Komposition.** Tun: Telefon zuerst entwerfen, Inhalte priorisieren. Lassen: gestapelten Desktop.
7. **Ruhig arbeiten.** Arbeitsansichten (Gebetszeiten, Formulare, Verwaltung, Rechtsseiten, Cockpit) bekommen nur Rückmeldung und Zustandswechsel; die Bildschirm-Anzeige nur Zustandswechsel.

## K-004 Stack und Konventionen
- Next.js 16.4 App Router mit Cache Components (`cacheComponents`, `ensureStatic = 'navigation'`), React 19.3 (`<ViewTransition>` verfügbar), TypeScript strict, Tailwind CSS 4 (`@theme` in `web/src/app/globals.css`), shadcn-artige `web/src/components/ui/` (cva, radix-ui), next-intl (Texte nur in `web/messages/**`), Drizzle/PostgreSQL (PGlite in Tests und Bau ohne DB), Better Auth.
- Muster: `web/docs/MUSTER.md` (Seite, Query mit `'use cache'`+Tag, Link, Komponente server-first, Server Action, Formulare, Verwaltungsmodul, Route Handler, Tests). ADRs `web/docs/adr/`. Vor Next.js-Code die Seite in `web/node_modules/next/dist/docs/` lesen.
- Öffentliche Client-Komponenten nutzen `klassen()` (`web/src/lib/klassen.ts`), nicht `cn()` (JS-Budget). Server-Komponenten bevorzugt; Client-Inseln klein.
- Öffentliche Seiten lesen keine Cookies/Header (statisch). Rechteprüfung serverseitig (`web/src/lib/rechte`).
- Prüfen: `pnpm check` (typen+lint+unit), `pnpm test:integration` (PGlite), `pnpm build`; E2E siehe ABNAHME (Umgebungsausnahme).

## K-005 Designsystem mit Erweiterungen
Bestand (unverändert, Auszug): Farben `gruen-950/800/700/100/50`, `tinte`, `tinte-2`, `tinte-3`, `rand`, `linie`, `sand`, `papier`, `weiss`, Status `fehler|warnung|info` (+`-toenung`), Org `org-at|kt|kgt|gt` (+`-text`, `-toenung`), Tags; Text `16/18/20/24/30/36/48`, `anzeige-64/96/144`; Abstände 4-px-Raster; Radien `sm|md|lg|pill`; Schatten `s1|s2|s3`; Container `inhalt|text`; Breakpoints `md|menu`.
**Neu (L-1.0), nur als Skalen in `@theme`, nie als Einzelwerte im Code:**
- Dauer: `--dauer-rueckmeldung: 150ms` · `--dauer-wechsel: 320ms` · `--dauer-auftritt: 640ms` · `--dauer-moment: 1200ms`. Ausgänge nutzen die nächstkleinere Stufe.
- Kurven (`--ease-*`, Tailwind-Utilities `ease-…`): `--ease-standard: cubic-bezier(0.2, 0, 0, 1)` · `--ease-eintritt: cubic-bezier(0.05, 0.7, 0.1, 1)` · `--ease-austritt: cubic-bezier(0.3, 0, 0.8, 0.15)`.
- Ebenen: `--ebene-kopf: 40` · `--ebene-overlay: 50` · `--ebene-dialog: 60` · `--ebene-toast: 70` · `--ebene-sprung: 100` (Nutzung `z-(--ebene-…)`; ersetzt `z-50`, `z-60`, `z-[100]`).
- Fluide Display-Stufen: `--text-display-1` (36→56 px, clamp) · `--text-display-2` (30→40 px) mit eigener Zeilenhöhe; Anzeige-clamps über `--text-anzeige-*`.
- Abschnittsrhythmus: `--spacing-abschnitt` (48→88 px, clamp) · `--spacing-abschnitt-klein` (40→64 px) → `py-abschnitt`.
- Breakpoint `--breakpoint-verwaltung: 56.25rem` (900 px) → `verwaltung:` ersetzt `min-[900px]`.
- Fokus: global `:focus-visible { outline: 2px solid var(--color-gruen-950); outline-offset: 2px }` (Bestand) – auf dunklen Flächen `outline-weiss`; ein Muster, keine ring-Mischung.
- Freie Werte werden auf vorhandene Stufen gemappt (z. B. `px-[22px]` → `px-5.5`, `underline-offset-[3px]` → `underline-offset-3`, `h-[3px]` → `h-0.75`).
- Thema: nur hell. `dark:` wird per `@custom-variant dark (&:where(.dunkel, .dunkel *))` gegenstandslos (kein Element trägt `.dunkel`).

## K-006 Typografie und Komposition
- Schriften (Bestand, lokal): Text Atkinson Hyperlegible Next 400/700 (latin + latin-ext), Display „IGMG Wetzlar Titel“ (Source Serif 4, opsz, 600), Arabisch Amiri nur für arabische Inhalte. Keine neuen Schriften.
- Display (`font-display`) nur für h1/h2 und große Momente; Fließtext 16–20 px, Zeilenhöhe 1,5–1,6, `max-w-(--container-text)`; `hyphens-auto` mit `lang`; Display mobil am längsten Wort geprüft (de: „Veranstaltungen“, „Gemeindeleben“; tr: „Etkinliklerimiz“, „Teşkilatlarımız“).
- Komposition: ein Blickfang je Bildschirmhöhe; benachbarte Abschnitte wechseln Struktur und Dichte (z. B. Bogen → Kartenraster → Aufmacher+Liste); Raster mit bewussten Brüchen (Aufmacher über zwei Spalten); Mobil eigene Reihenfolge.

## K-007 Bewegungssystem und Register
Technik: nur CSS (Transitions, Keyframes, `stroke-dashoffset`, Masken) und React `<ViewTransition>`; keine Bewegungsbibliothek (≈0 KB JS). Animiert werden nur `transform`/`translate`/`scale`/`opacity`/`stroke-dashoffset`. `prefers-reduced-motion: reduce` → Überblendung oder Sofortzustand, Information gleich. Erster Bildschirm ohne Warten; Bewegung versteckt nie Inhalte (Ausgangszustand ohne JS = Endzustand sichtbar).

| ID | Name | Zweck | Auslöser | Stufen | Reduziert |
|---|---|---|---|---|---|
| B-01 | Rückmeldung | Rückmeldung | Hover/Druck auf Bedienelemente | Farbe `dauer-rueckmeldung`; Druck `scale(.98)` | nur Farbe |
| B-02 | Fokus | Orientierung | Tastaturfokus | Sofortzustand | gleich |
| B-03 | Öffnen | Zusammenhang | Menü, Dialog, Aufklapper öffnen/schließen | ein `opacity`+`translate-y 8px` `dauer-wechsel`/`ease-eintritt`; aus `dauer-rueckmeldung`/`ease-austritt` | nur `opacity` |
| B-04 | Inhaltswechsel | Zusammenhang | Tabs, Monatswechsel, Sprachwechsel der Anzeige | Überblendung `dauer-wechsel` | sofort |
| B-05 | Seitenwechsel | Orientierung | Navigation | `<ViewTransition>`: Kopf fest, Inhalt Überblendung `dauer-wechsel`; gemeinsame Elemente (Karte → Detail: Veranstaltung, Nachricht, Organisation) Morph 400 ms | 0 s |
| B-06 | Tagesbogen | Charakter + Orientierung | Startseite, nach Hydrierung, einmal | Bogen bis „jetzt“ zeichnet sich `dauer-moment`/`ease-eintritt`; Marken staffeln ≤ 6 × 80 ms; nächste Gebetszeit tritt `dauer-auftritt` hervor | Endzustand sofort |
| B-07 | Weg der Gemeinde | Hierarchie + Charakter | Über uns, erstes Sichtbarwerden, einmal | Pfad zeichnet sich durch die Stationen 1400 ms; Stationen erscheinen, wenn der Pfad sie erreicht | Endzustand |
| B-08 | Meilensteinlinie | Orientierung | Projekte, erstes Sichtbarwerden, einmal | Linie bis zum aktuellen Meilenstein `dauer-moment` | Endzustand |
| B-09 | Familie der vier | Zusammenhang + Charakter | Organisationsseite, nach Laden, einmal | vier Achtstern-Segmente; das eigene enthüllt sich per Maske 900 ms | Endzustand |
| B-10 | Gebetszeit-Wechsel | Rückmeldung | nächstes Gebet wechselt (Leiste, Bogen, Anzeige) | Hervorhebung wandert per Überblendung 400 ms | sofort |
| B-11 | Formular-Rückmeldung | Rückmeldung | Erfolg/Fehler nach Absenden | Erfolg `opacity`+`translate-y 8px` `dauer-wechsel`; Fehler: Fokus auf Zusammenfassung, keine Bewegung | nur `opacity` |
| B-12 | Laden | Rückmeldung | Senden/Speichern läuft | Achtstern zeichnet sich in Schleife 1200 ms, nach 5 s Stillstand (statisch) | statisch |

Staffeln ≤ 8 Elemente; je Bildschirmhöhe höchstens ein Auftritt mit Gewicht; Arbeitsansichten nur B-01–B-05, B-10–B-12.

## K-008 SVG-Formsystem
- Grundgeometrie: Quadrat und dasselbe Quadrat um 45° gedreht = Achtstern (Bestand `Stern8` in `web/src/components/website/Icons.tsx`).
- Raster 24 px, Strich 2 px (`stroke-width="2"`, `vector-effect` nicht nötig bei Skalierung im Raster), runde Enden und Ecken (`stroke-linecap/linejoin="round"`), Farbe `currentColor` oder Token.
- Icon-Familie: lucide-react (gleicher Strichstil) + eigene Zeichen in `Icons.tsx`; keine zweite Bibliothek, keine Emojis.
- Ableitungen: Achtstern-Trenner (Linie–Stern–Linie), Markierungen im Tagesbogen (Punkt, Achtstern für „nächstes Gebet“, Sonnenscheibe für „jetzt“), Zustandsgrafiken (leer, Fehler, Erfolg, offline, nicht gefunden) in `web/src/components/website/Zustandsgrafik.tsx`, Lade-Achtstern (B-12). Muster nur als schmales Band (Fuß, Abschnittskante), nie hinter Text, höchstens 8 % Deckkraft.
- Dekorativ: `aria-hidden`; bedeutungstragend: `role="img"` + Name (Tagesbogen mit Zusammenfassung, die Zeiten zusätzlich als Liste im Text). IDs eindeutig je Ansicht (`useId`).

## K-009 Komponenten, Zustände, Ansichtsarten
- Zustände je interaktivem Element: Ruhe, Hover (nur feine Zeiger), Fokus, gedrückt, deaktiviert, lädt, Fehler, Erfolg; leere Zustände mit Zustandsgrafik und nächstem Schritt; Fehlerseite mit Charakter (Zustandsgrafik, Wege zurück).
- Touch-Ziele 44 × 44, auf dem Telefon 48; Knöpfe sagen, was passiert.
- Erzählansichten: Startseite, Über uns, Projekte, Organisationsseite (je ein großer Moment). Arbeitsansichten: Gebetszeiten, Veranstaltungen (+Detail), Nachrichten, Korankurse, Voranmeldung, Kontakt, Startklar-Cockpit, Verwaltung, Rechtsseiten. Bildschirm-Anzeige: nur Zustandswechsel.
- Hauptansichten (12, fest): Startseite · Gebetszeiten · Veranstaltungen · Veranstaltungsdetail · Nachrichten · Über uns · Projekte · Organisationsseite · Korankurse · Schüler-Voranmeldung · Kontakt · Startklar-Cockpit. Referenzansicht: Startseite.

## K-010 Ton und Mikrotexte
- Deutsch du-los, freundlich-sachlich („Nächstes Gebet“, „Jetzt anmelden“); Türkisch höflich (siz), Englisch schlicht. Knöpfe nennen die Handlung. Keine Floskeln („nahtlos“, „Entdecken Sie …“).
- Neue Mikrotexte in allen drei Sprachen über `web/messages/**`; neue tr/en als Entwurf in `web/messages/neu-uebersetzt.json`; längere Texte als Vorschlag in `_werkstatt/TEXTVORSCHLAEGE.md`.

## K-011 Budgets
Lighthouse mobil: Performance ≥ 90, Barrierefreiheit 100, Best Practices ≥ 95, SEO ≥ 95; LCP ≤ 2,5 s; CLS ≤ 0,1; INP ≤ 200 ms; JS erster Aufruf öffentliche Seite ≤ 180 KB gz (Bestand 166–175 KB); Bewegung ≤ 60 KB gz zusätzlich (Ziel ≈ 0); große Momente bei 4× Drosselung ≤ 5 % verworfene Bilder.

## K-012 Glossar
Tagesbogen · Weg der Gemeinde · Familie der vier · Achtstern · Leiste (PrayerTimesBar) · Anzeige (Bildschirm-Anzeige) · Cockpit (Startklar-Cockpit) · Betriebsart (SITE_MODE: entwicklung/vorschau/produktion) · Bau-Datenbank (PGlite für den Bau ohne DB) · Variante (beim Upload erzeugte Bildgröße).

## K-013 Auslieferung (Vercel-Pflicht)
- V-01: `vercel.json` (Services-Modus, Service `web`) mit `$schema`, `regions: ["fra1"]`, `crons`, `ignoreCommand` (überspringt Commits mit „ZWISCHENSTAND“); Node 24 (`engines`), pnpm 12.11.2 (`packageManager`); `.vercelignore` (`_werkstatt`, `_archiv`, `_lauf`).
- V-02: Bau wie Vercel: `vercel build` (CLI 63) in frischer Kopie, `VERCEL_ENV` preview und production.
- V-03: `web/src/lib/umgebung.ts` (zod, Betriebsart, Pflichtwerte je Betriebsart, verständliche Meldungen), `pnpm geheimnisse:erzeugen`, `web/docs/deploy/VERCEL-ENV.md`.
- V-04 (ADR 0018/0019): Neon Postgres (Vercel Marketplace, Frankfurt), `pg`-Pool + `attachDatabasePool` (`@vercel/functions`); Vorschau auf Neon-Branches; `vercel-build`: mit DATABASE_URL Migration unter Advisory Lock, dann Bau gegen diese DB; ohne DB PGlite-Rückfall.
- V-05 (ADR 0020): Vercel Blob (fra1, privat), Direkt-Upload im Browser, Verarbeitung serverseitig (EXIF weg), Varianten 480/960/1600/2560 WebP; Dateisystem/S3 bleiben für Docker/lokal.
- V-06 (ADR 0021): Cron täglich `loeschfristen`, `mail-ausgang`; GET + `Bearer CRON_SECRET`; `pg_try_advisory_lock`; idempotent.
- V-07: Zustand in DB (Bestand); kein Dateisystem außer `/tmp`.
- V-08: Tags/`updateTag` (Bestand), lange Cache-Header für `public/bilder`, `public/symbole`.
- V-09: Vercel Authentication (aktiv), noindex in Betriebsart vorschau, Bypass-Geheimnis durch Menschen.
- V-10: Health-Route (Bestand), Logs ohne Personendaten, Backups/PITR und Instant Rollback im Runbook.
- V-11: Verarbeitungsverzeichnis, Hosting-Baustein v2 (Entwurf), Cockpit + `pnpm startklar` mit Region, Pflichtvariablen, CRON_SECRET, Speicher, Domain/HTTPS, Betriebsart.
- V-12: Empfehlung in MENSCHEN (Pro, App bleibt Hobby-tauglich).
- V-13: `web/docs/deploy/VERCEL.md`, `web/docs/GO-LIVE.md`, Vorschauprüfung per Vercel-MCP an jedem Tor.

## Markierte Annahmen
- A-01 Kein Einwilligungs-Banner nötig (L-E02, ML-01).
- A-02 Nur helles Thema (ML-02).
- A-03 Neon und Vercel Blob als Anbieter (Menschen legen Konten an; ADR 0018/0020).
- A-04 Die Zeitleiste „Über uns“ wird nur mit vorhandenen Inhalten gezeichnet; vier Standorte nur, wenn belegt.

## Anhang: Kern 2.0 der früheren Läufe (unverändert)
Siehe `_lauf/release/KERN.md` (wird beim Festschreiben in E1 wörtlich angehängt).
