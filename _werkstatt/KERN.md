# KERN – Letzter Lauf · Version 1.2 (2026-10-12; 1.1: Register B-06–B-09, B-12 und Formsystem an die Umsetzung angeglichen; 1.2: B-03 Schublade, B-09 Wachsen aus der Mitte)

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
| B-03 | Öffnen | Zusammenhang | Menü, Dialog, Aufklapper öffnen/schließen | ein `opacity`+`translate-y 8px` `dauer-wechsel`/`ease-eintritt`; aus `dauer-rueckmeldung`/`ease-austritt`. Schublade (Telefonmenü, K-07): `opacity`+`translate-x 24px` von ihrer Kante, danach 4 Gruppen gestaffelt (`auftritt`, Verzögerung `dauer-rueckmeldung` + i × `staffel`). Radix-Bausteine der Verwaltung (Löschen-Dialog, Kontomenü) über `data-slot`/`data-state` in `globals.css`: Fläche `einblenden`, Dialog `auftritt-mitte` (transform, weil translate zentriert), Menü `auftritt`, Schließen `ausblenden` `dauer-rueckmeldung` | nur `opacity` |
| B-04 | Inhaltswechsel | Zusammenhang | Tabs, Monatswechsel, Sprachwechsel der Anzeige | Überblendung `dauer-wechsel` | sofort |
| B-05 | Seitenwechsel | Orientierung | Navigation über interne Links | `document.startViewTransition` aus `SeitenUebergang` (L-E10): Kopf fest (`kopf`), Inhalt (`seite`) Überblendung `dauer-wechsel`; gemeinsame Elemente (Karte → Detail: Veranstaltung, Nachricht, Organisation) Morph 400 ms über eigene `view-transition-name` | 0 s (kein Übergang) |
| B-06 | Tagesbogen | Charakter + Orientierung | Startseite, einmal, sobald die Seite nach der Hydrierung zur Ruhe kommt (`useNachRuhe`, Stufe-C-Nacharbeit) | Linie und Fläche des vergangenen Tages enthüllen sich bis „jetzt“. Version 1.3 ist ein Schiebefenster: Fenster und Inhalt laufen gegenläufig mit `translate` (`schiebefenster`, `dauer-moment`/`ease-eintritt`), nur im Compositor; vorher Schnittmaske `scale-x`, die je Bild neu zeichnete. Danach treten Sonne („jetzt“) und Achtstern (nächstes Gebet) hervor (`dauer-auftritt`, +0/+160 ms). Erreichte Punkte färben sich über eine Deckfläche (opacity, `dauer-wechsel`) | Endzustand sofort |
| B-07 | Weg der Gemeinde | Hierarchie + Charakter | Über uns, erstes Sichtbarwerden (`ErstesSichtbarwerden`), einmal, nur wenn beim Laden außerhalb des Bildschirms | Verbindungslinie wächst je Station (`scale-y`), 1400 ms über alle Stationen; Station tritt hervor, wenn die Linie sie erreicht | Endzustand |
| B-08 | Meilensteinlinie | Orientierung | Projekte, erstes Sichtbarwerden (`ErstesSichtbarwerden`), einmal | Linie bis zum letzten erledigten Meilenstein wächst (`scale-x`, `dauer-moment`); erledigte Marken treten hervor, wenn sie erreicht werden | Endzustand |
| B-09 | Familie der vier | Zusammenhang + Charakter | Organisationsseite, einmal; mit Skript sobald die Seite zur Ruhe kommt (`NachRuhe`, `@media (scripting: enabled)`), ohne Skript ab dem ersten Bild (reines CSS) | vier Achtstern-Segmente als Tönung; das eigene Segment wächst aus der Mitte (`scale` 0 → 1, 900 ms, +200 ms; Version 1.2: statt kreisförmiger Maske, weil die Maske je Bild neu zeichnete – E3-Tor, nur noch Compositor) | Endzustand |
| B-10 | Gebetszeit-Wechsel | Rückmeldung | nächstes Gebet wechselt (Leiste, Bogen, Anzeige) | Hervorhebung wandert per Überblendung `dauer-wechsel` (320 ms), Name und Restzeit blenden ein (`blendet-ein`); nie beim ersten Laden, der Countdown tickt ohne Bewegung | sofort |
| B-11 | Formular-Rückmeldung | Rückmeldung | Erfolg/Fehler nach Absenden | Erfolg `opacity`+`translate-y 8px` `dauer-wechsel`; Fehler: Fokus auf Zusammenfassung, keine Bewegung | nur `opacity` |
| B-12 | Laden | Rückmeldung | Senden/Speichern läuft (`LadeStern`) | Achtstern-Umriss zeichnet sich hin und zurück, 1200 ms, höchstens 4 Durchläufe (≈ 5 s), dann steht er | statisch |

Staffeln ≤ 8 Elemente; je Bildschirmhöhe höchstens ein Auftritt mit Gewicht; Arbeitsansichten nur B-01–B-05, B-10–B-12.

Auslegung (E3-Tor, 11.10.): Eine Staffel zählt die nacheinander auftretenden Elemente. Bei B-07 sind das die Stationen (Punkte); die Verbindungslinie ist eine durchgehende Zeichnung, nur technisch in Abschnitte je Station geteilt (variable Kartenhöhen) – sie zählt nicht als Staffel-Element. Heute 5 Stationen; ab 9 Stationen in der Verwaltung wäre die Regel verletzt (Hinweis für die Pflege).

Bestand ohne Bewegung (Register-Abgleich Stufe C, `protokolle/C-animate-klassen.txt`): Die shadcn-Vorlagen unter `web/src/components/ui/` (seit E0 unverändert) tragen `animate-in`/`animate-out`/`fade-*`/`zoom-*`-Klassen. Ohne Animations-Plugin erzeugt Tailwind dafür keine Regeln, sie bewegen nichts; die tatsächliche Bewegung der eingebundenen Bausteine steht unter B-03. `ui/sonner.tsx` (`animate-spin`) ist nirgends eingebunden und wird nie gerendert. Beide Dateigruppen bleiben unverändert (Vorlagen-Bestand).

## K-008 SVG-Formsystem
- Grundgeometrie: Quadrat und dasselbe Quadrat um 45° gedreht = Achtstern (Bestand `Stern8` in `web/src/components/website/Icons.tsx`).
- Raster 24 px, Strich 2 px (`stroke-width="2"`, `vector-effect` nicht nötig bei Skalierung im Raster), runde Enden und Ecken (`stroke-linecap/linejoin="round"`), Farbe `currentColor` oder Token.
- Icon-Familie: **eine**, Lucide (`lucide-react`, 24-px-Raster, 2-px-Strich, runde Enden). `Icons.tsx` ist keine zweite Familie: Facebook, Instagram und YouTube sind Lucide-Pfade (ISC), die `lucide-react` 1.x nicht mehr ausliefert, im selben Strichstil (`Basis`); `Achtstern`/`Stern8` sind Marken des Formsystems, keine Icons. Keine zweite Bibliothek, keine Emojis (Stand Stufe-C-Nacharbeit, Befund Z-06).
- Ableitungen: Achtstern-Trenner (`Trenner`), Markierungen im Tagesbogen (Punkt, Achtstern für „nächstes Gebet“, Sonnenscheibe für „jetzt“), Zustandsgrafiken (leer, Fehler, Erfolg, offline, nicht gefunden) in `web/src/components/website/Zustandsgrafik.tsx`, Lade-Achtstern (`LadeStern`, B-12), Familie der vier (`organisation/FamilieDerVier.tsx`). Kleine Marken (≤ 20 px) als Fläche (`Achtstern`/`Stern8`), weil der 2-px-Umriss klein wie ein Zahnrad liest (Sichtprüfung E2). Muster nur als schmales Band (`achtstern-band` an der Kante des Seitenkopfs), nie hinter Text, höchstens 8 % Deckkraft; seit E4 regelmäßiger Achtstern auf voller Bandhöhe (20 px) im 48-px-Takt, damit er bei 1× als Stern liest (`bilder/O-band/`).
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
Wörtlich aus `_lauf/release/KERN.md` (nur Überschriftenebenen um zwei abgesenkt):

### KERN – Version 2.0

Gilt für den Release-Lauf. K-01 bis K-20 stammen aus `_lauf/KERN.md` v1.1, mit den dort dokumentierten Änderungen. K-21 bis K-32 und die Grenzen G-01 bis G-10 stammen wörtlich aus Abschnitt 8 bzw. 4 des Auftrags „Startklar machen“. Änderungen nur über `_lauf/release/ENTSCHEIDUNGEN.md` mit neuer Versionsnummer.

Änderungen: 2.0 (R-E11) – K-21 bis K-32 aufgenommen; K-03 um /meldung und /barrierefreiheit ergänzt. Die Grenzen des Auftrags „Startklar machen“ ersetzen G-01 bis G-10 der Version 1.1. Geltende Festlegungen der Nutzerantworten: R-E01 (main + push) und R-E09 (öffentliches Repo).

K-01 Rendering: Cache Components mit cacheComponents und partialPrefetching. Öffentliche Inhalte werden mit 'use cache', cacheLife und cacheTag zwischengespeichert; Änderungen in der Verwaltung lösen updateTag in der Server Action aus, sonst revalidateTag(tag, 'max'). Reine Inhaltsseiten sichern das mit ensureStatic ab. Öffentliche Seiten lesen keine Cookies; Anmeldung und alles Persönliche liegt im Bereich Verwaltung.

K-02 Mehrsprachigkeit: next-intl mit [locale]-Segment ganz oben; Deutsch ohne Präfix, /tr und /en mit Präfix; lokalisierte Pfade; hreflang und x-default. Alle UI-Texte stehen in messages/{de,tr,en}.json, keiner im Code. Bestandsübersetzungen gehen vor; neue Übersetzungen sind markiert und stehen in MENSCHEN.md. Datenbankinhalte: Deutsch Pflicht, Türkisch und Englisch optional mit sichtbarem Rückfall auf Deutsch.

K-03 Adressen auf Deutsch, für tr und en entsprechend lokalisiert: / · /gebetszeiten · /gebetszeiten/anzeige · /veranstaltungen · /veranstaltungen/[slug] · /nachrichten · /nachrichten/[slug] · /ueber-uns · /vorstand · /projekte · /kontakt · /igmg · /quran · /quran/[sure] · /islamisches-wissen · /islamisches-wissen/[thema] · /organisationen/[organisation] · /bildung/korankurse · /bildung/voranmeldung · /mitglied-werden · /webseite-fuer-moscheen · /impressum · /datenschutz · /suche · /offline · /meldung · /barrierefreiheit · /verwaltung/… *(1.1: /suche und /offline ergänzt, E-012; 2.0: /meldung (E-034) und /barrierefreiheit (K-28/R3) ergänzt, R-E11)*

K-04 Gestaltung: Design-Tokens aus der Übergabe als Tailwind-Theme (@theme); shadcn/ui-Bausteine nach diesen Tokens gestaltet; Komponentennamen wie in Design und Bestand (Header, PrayerTimesBar, Breadcrumbs, Footer …); Schriften selbst gehostet über next/font; Seitenübergänge mit React View Transitions, abgeschaltet bei reduzierter Bewegung.

K-05 Daten: PostgreSQL mit Drizzle; versionierte Migrationen; Zeitstempel in UTC, Anzeige in Europe/Berlin; Inhalte mit Entwurf, Veröffentlicht und Papierkorb (30 Tage); Personendaten werden echt gelöscht.

K-06 Rechte: Rollen Administration, Redaktion, Organisationsredaktion (je Organisation nur eigene Inhalte), Bildung (Kurse und Voranmeldungen), Mitgliederverwaltung (Anträge). Jede Server Action und jede Route prüft die Rolle serverseitig. Zwei-Faktor-Anmeldung (TOTP oder Passkey) ist für alle Konten Pflicht; Konten entstehen nur per Einladung.

K-07 Formulare: Server Actions mit Zod – ein Schema für Client und Server – und useActionState; mehrstufige Formulare mit Fortschritt; ALTCHA, Honigtopf-Feld und Ratenbegrenzung; Einwilligungen mit Zeitpunkt und Textversion gespeichert; Bestätigungsmail an Absender und Benachrichtigung an die zuständige Rolle; Fehlertext am Feld, Fokus auf die Rückmeldung.

K-08 Gebetszeiten: Quelle umschaltbar – (a) Tabellen-Import (CSV oder JSON) in der Verwaltung als verbindliche Quelle, (b) Berechnung mit adhan als vorläufiger Ersatz mit sichtbarem Hinweis „berechnet“, Methode und Parameter einstellbar (Annahme bis zur Klärung: Methode „Turkey“, steht in MENSCHEN.md). Zeitzone Europe/Berlin samt Sommerzeit. Nächstes Gebet und Restzeit berechnet der Browser aus den zwischengespeicherten Tageszeiten. Monatsansicht druckbar, im Ramadan mit hervorgehobenem Imsak und Iftar. Qibla-Richtung für Wetzlar fest berechnet, Kompass nur nach ausdrücklichem Klick. Die Anzeige für den Bildschirm in der Moschee ist aus der Ferne lesbar, aktualisiert sich um Mitternacht selbst und läuft offline weiter.

K-09 Termine: wiederkehrend über rrule mit Ausnahmen; Organisation, Kategorie, Zielgruppe, Ort, optionale Anmeldung mit Platzzahl; iCal-Datei je Termin und Abo-Feed je Organisation.

K-10 Medien: Upload nur in der Verwaltung; Speicher über einen Adapter (lokales Verzeichnis in der Entwicklung, S3-kompatibel im Betrieb); Prüfung von Typ und Größe; Alt-Text ist Pflicht; Auslieferung über next/image.

K-11 Barrierefreiheit: WCAG 2.2 AA. Aus dem Design: Fließtext mindestens 16 px, Kontrast 4,5:1 (große Schrift 3:1), Klickziele 44 px (Telefon 48 px), sichtbarer Fokus. Dazu: lang-Attribut je Sprache, Fehlermeldungen über aria-describedby, Restzeit-Anzeige ohne Daueransage für Screenreader, prefers-reduced-motion.

K-12 Leistung (Lighthouse mobil): Performance mindestens 90, Barrierefreiheit 100, Best Practices und SEO mindestens 95; LCP höchstens 2,5 s, CLS höchstens 0,1, INP höchstens 200 ms; JavaScript beim ersten Laden einer öffentlichen Seite höchstens 180 kB (gzip).

K-13 Sicherheit: Sicherheits-Header (Content-Security-Policy passend zu statischen Seiten, HSTS, Referrer-Policy, Permissions-Policy, X-Content-Type-Options, frame-ancestors); Datenbankzugriffe nur über Drizzle mit Parametern; keine Personendaten in Logs oder Fehlermeldungen; immer die neueste Next.js-Patchversion (für den 14.10.2026 ist ein Sicherheitsupdate angekündigt); pnpm audit ohne kritische und hohe Befunde.

K-14 Datenschutz-Technik: keine Anfragen an Dritte beim Seitenaufruf; Karte erst nach Klick; Next.js-Telemetrie und experimental.agentFeedback aus.

K-15 PWA: Manifest, Symbole (bis echte Logos in höherer Auflösung vorliegen ein neutrales Monogramm – das Logo wird nie nachgezeichnet), Offline-Seite, Gebetszeiten des laufenden Monats offline verfügbar.

K-16 SEO: Metadaten je Seite und Sprache, sitemap.ts mit Sprachvarianten, robots.ts, JSON-LD (Mosque, Organization, Event, NewsArticle, BreadcrumbList), OG-Bilder.

K-17 Code: TypeScript strict ohne any; ESLint Flat Config mit Next.js- und jsx-a11y-Regeln; Prettier; lint-staged prüft und formatiert beim Commit nur geänderte Dateien; 'use client' nur, wo Interaktion es verlangt; reactCompiler an; experimentelle Schalter nur mit ADR.

K-18 Struktur von web/: src/app/[locale]/(website) · src/app/[locale]/verwaltung · src/components/{ui,website,verwaltung} · src/lib (db, auth, mail, storage, gebetszeiten, termine, rechte, audit, validierung) · src/server (actions, queries) · messages/ · drizzle/ · tests/{unit,integration,e2e} · docs/ (adr, README, BETRIEB, HANDBUCH-VERWALTUNG, LIZENZEN, MUSTER, ABWEICHUNGEN).

K-19 Betrieb: output standalone; Dockerfile und docker-compose (App, PostgreSQL, Mail-Fänger); Health-Check-Route; geschützte Route für Löschfristen, aufrufbar per Cron; README für Entwicklung, Betrieb, Backup und Updates.

K-20 Agentenhilfen: web/CLAUDE.md enthält @AGENTS.md, wo Next.js seine Regeln pflegt; die Next.js DevTools MCP nutzt du, wenn sie verbunden ist.

K-21 Betriebsarten über SITE_MODE: entwicklung · vorschau · produktion. Vorschau: Zugang nur mit Passwort, geprüft in proxy.ts, damit es auch vor statischen Seiten greift; X-Robots-Tag noindex und robots.txt mit vollständiger Sperre; sichtbares Band „Vorschau – nicht öffentlich“; E-Mails nur an Mail-Fänger oder Test-Postfach; Beispielinhalte erlaubt und als „Beispiel“ gekennzeichnet; fehlende Pflichtangaben als markierte Platzhalter. Produktion: keine Beispielinhalte und keine Platzhalter öffentlich; der Startklar-Check muss grün sein.

K-22 Stammdaten als einzige Quelle: Vereinsname, Rechtsform, Anschrift, Vertretungsberechtigte, Kontaktwege, Registergericht und Registernummer, USt-IdNr. und W-IdNr. (beide optional), verantwortliche Person nach Medienstaatsvertrag, Datenschutzbeauftragte Person (optional), Aufsichtsbehörde, Hosting-, E-Mail- und Speicheranbieter, Bankverbindung, Gemeinnützigkeit mit Bescheiddatum, Gebetszeiten-Quelle. Pflege nur durch die Rolle Administration, versioniert und mit Audit-Eintrag. Impressum, Datenschutzerklärung, Footer, JSON-LD und E-Mails lesen ausschließlich hier.

K-23 Einwilligungs-Konfiguration als einzige Quelle: Kategorien, Dienste, Speicher-Einträge (Name, Zweck, Dauer, Anbieter, Kategorie, Rechtsgrundlage) und Textversion. Daraus entstehen Banner, Einstellungsdialog, die Speicher-Tabelle der Datenschutzerklärung und die Sperre externer Inhalte: Karte und Videos erscheinen vor der Einwilligung als Platzhalter mit „Einmal laden“ und „Immer erlauben“. Selbst gehostet, ohne externen Dienst.

K-24 Banner: erste Ebene mit „Alle akzeptieren“, „Alle ablehnen“ und „Einstellungen“; Akzeptieren und Ablehnen gleich groß und gleich gewichtet; keine Vorauswahl; nur Kategorien, die die Website wirklich nutzt (Notwendig immer, Externe Medien, Statistik nur bei AN); Impressum und Datenschutz bleiben ohne Entscheidung erreichbar; keine Cookie-Wall; Widerruf über „Datenschutz-Einstellungen“ im Footer jeder Seite; neue Abfrage nach zwölf Monaten und bei neuer Textversion; Global Privacy Control gilt als Ablehnung; drei Sprachen; zugänglicher Dialog mit Fokusführung; keine Anzeige auf dem Bildschirm in der Moschee.

K-25 Einwilligungsnachweis: Zufallskennung, Zeitpunkt, Textversion und Auswahl – ohne IP-Adresse, Aufbewahrung laut Löschkonzept.

K-26 Endgerätezugriff: Cookies, Web-Speicher, IndexedDB, Cache Storage und Service Worker sind einzeln erfasst und entweder als unbedingt erforderlich begründet oder einwilligungspflichtig.

K-27 Rechtstexte: Deutsch ist maßgeblich, Türkisch und Englisch sind Übersetzungen mit diesem Hinweis; jede Fassung trägt Version und Stand-Datum; die Freigabe durch den Vorstand ist ein Schalter im Cockpit; jede Änderung erzeugt eine neue Version, und Formular-Einwilligungen speichern die Version, der zugestimmt wurde.

K-28 Datenschutzerklärung aus dem Verarbeitungsverzeichnis (VVT): Jede Verarbeitung – Hosting und Server-Protokolle, Kontakt, Veranstaltungsanmeldung, Schüler-Voranmeldung, Mitgliedsantrag, Moschee-Anfrage, Verwaltungskonten, E-Mail-Versand, Medien, externe Medien, Einwilligungsnachweis, gegebenenfalls Statistik – erscheint mit Zweck, Rechtsgrundlage, Empfängern, Drittlandbezug und Speicherdauer.

K-29 Uploads: Bilder werden beim Hochladen neu kodiert und von Metadaten (EXIF, GPS) befreit; bei Personenfotos bestätigt die hochladende Person die Einwilligung der Abgebildeten, bei Kindern die der Eltern.

K-30 Konfiguration: Umgebungsvariablen werden beim Start typgeprüft; fehlende oder ungültige Werte brechen mit verständlicher Meldung ab; .env.example ist vollständig kommentiert; Geheimnisse sind per Skript erzeugbar.

K-31 Deploy-Ziele, ohne Code-Änderung umschaltbar: (A) Docker-Server in Deutschland mit Reverse-Proxy und automatischem HTTPS, PostgreSQL, SMTP und verschlüsselten Backups; (B) Vercel mit Region Frankfurt, EU-PostgreSQL, EU-Objektspeicher und Vercel-Cron. Ratenbegrenzung und Sitzungen funktionieren mit mehreren Instanzen.

K-32 Startklar-Cockpit in der Verwaltung und Befehl pnpm startklar mit derselben Prüfliste: Stammdaten-Pflichtfelder · keine Platzhalter und Beispielinhalte in veröffentlichten Inhalten · Rechtstexte freigegeben · Gebetszeiten-Quelle bestätigt · Testmail zugestellt · letztes Backup und letzte Wiederherstellungsprobe erfolgreich · Cron-Aufgaben aktiv · alle Verwaltungskonten mit Zwei-Faktor, keine Testkonten · SITE_URL mit HTTPS · Betriebsart produktion · robots erlaubt · jede menschliche Aufgabe aus MENSCHEN.md. Jede Prüfung zeigt eine Ampel, eine Erklärung in einfacher Sprache und den Ort der Behebung.

#### Grenzen (Auftrag „Startklar machen“, Abschnitt 4)
G-01 Schreiben nur in web/ und _lauf/release/; alles andere nur lesen. Kein Push, kein Umschreiben der Geschichte. *(R-E01: Push nach main ist durch den Nutzer erlaubt; das Umschreiben der Geschichte bleibt verboten.)*
G-02 Kein Produktions-Deployment. Ein Vorschau-Deployment nur laut Einstellung, mit vorhandenem Zugang, passwortgeschützt und noindex. Keine Konten, Domains, DNS-Einträge oder kostenpflichtigen Dienste anlegen oder ändern.
G-03 Keine echten Personendaten in Code, Seeds, Tests oder Logs; keine echten E-Mails – nur Mail-Fänger oder das Test-Postfach der Vorschau.
G-04 Rechtstexte sind Entwürfe nach aktuellem Stand mit Quellen. Du gibst sie nie als rechtlich geprüft aus; die Prüfung durch Anwalt oder Datenschutzbeauftragten steht in der Go-Live-Liste.
G-05 Keine erfundenen Fakten: Vereinsname, Anschrift, Vorstand, Registernummer, Identifikationsnummern, Bankverbindung und Ansprechpersonen nur aus vorhandenen Unterlagen, sonst ein Stammdatenfeld mit Platzhalter.
G-06 Religiöse Texte nie aus dem Modellgedächtnis; Lizenzen für Quran-Text und Übersetzungen belegt oder Platzhalter.
G-07 Datenschutz: keine Anfrage an Dritte und kein einwilligungspflichtiger Speicher vor der Einwilligung; kein externer Einwilligungsdienst, keine Tracker.
G-08 Bestandsschutz: Alle bisher grünen Tests bleiben grün, die Design-Treue bleibt erhalten; umgebaut wird nur, was einen Befund behebt.
G-09 Nur offene Lizenzen (MIT, Apache-2.0, BSD, ISC, MPL-2.0); die Lizenzliste bleibt aktuell.
G-10 Geheimnisse nie im Repository; Skripte erzeugen sie.

#### Einstellungen des Laufs (Abschnitt 0)
Ziel v1.0.0-rc.1 · Träger und Aufsicht (Annahme): eingetragener Verein in Hessen, HBDI · Karte (OpenStreetMap) und YouTube-Videos vorbereitet · Statistik: AUS · Deploy-Ziele: beide vorbereiten · Vorschau-Deployment: AUS · Produktions-Deployment: AUS · Git: main + push (R-E01) · Abhängigkeiten: Patch und Minor erlaubt, Major nur mit ADR.

Glossar: Paket – ein Auftrag an genau einen Agenten · Welle – Pakete ohne gegenseitige Abhängigkeit, die gleichzeitig laufen · Tor – Prüfpunkt am Ende einer Phase oder Welle · Seitenblatt – Bauvorlage einer Seite aus Design und Bestand · Muster – die im Durchstich festgelegten Bauweisen in web/docs/MUSTER.md.

#### Grenzen (Abschnitt 4, für Paket-Auszüge)
G-01 Schreiben nur in web/ und _lauf/; bestand/ und design/ werden nur gelesen. Kein git push, kein Umschreiben der Geschichte. *(Push durch E-004 erlaubt: nur main, immer pushen; kein Umschreiben der Geschichte bleibt.)*
G-02 Nichts deployen; keine Cloud-Konten, Domains oder kostenpflichtigen Dienste anlegen; keine echten E-Mails versenden – in der Entwicklung landen sie im Mail-Fänger oder in einer Datei.
G-03 Keine Geheimnisse im Repository: alle .env-Dateien außer .env.example stehen in .gitignore; nur Öffentliches trägt das Präfix NEXT_PUBLIC_.
G-04 Keine echten Personendaten in Code, Seeds, Tests oder Logs; Testdaten sind erkennbar fiktiv, etwa „Testperson Eins“.
G-05 Keine erfundenen Fakten über die Gemeinde – Namen, Adressen, Telefonnummern, Bankverbindungen, Termine, Zahlen. Inhalte kommen aus bestand/ und design/; Fehlendes wird zum Platzhalter in eckigen Klammern und steht in MENSCHEN.md.
G-06 Religiöse Texte: Koran, Hadithe und Bittgebete nie aus dem Modellgedächtnis. Arabischer Korantext nur wörtlich aus einer etablierten Quelle mit geprüfter Lizenz und Quellenangabe; Übersetzungen nur mit geklärter Lizenz, sonst Platzhalter. Gebetszeiten gelten erst als offiziell, wenn die Gemeinde die Quelle bestätigt hat.
G-07 Datenschutz: Alle Formulardaten gelten als besonders schutzwürdig. Nur nötige Felder; Zugriff nur für berechtigte Rollen; jeder Zugriff auf Personendaten im Audit-Log; Export- und Löschfunktion; Löschfristen einstellbar. Keine Tracker, nur technisch nötige Cookies, keine Anfragen an Dritte ohne Einwilligung.
G-08 Rechtstexte (Impressum, Datenschutzerklärung, Einwilligungen): Seiten und Aufbau ja, Inhalt nur als markierter Entwurf; die fachliche Prüfung steht in MENSCHEN.md.
G-09 Nur Pakete mit offenen Lizenzen (MIT, Apache-2.0, BSD, ISC, MPL-2.0); die Liste steht in web/docs/LIZENZEN.md.
G-10 Was abgenommen ist, bleibt grün; umgebaut wird nur, was einem Z-Kriterium dient.

#### Ordnerzuordnung (E-001)
- design/ ≙ Workspace-Wurzel `/Users/umurey/Downloads/IGMG Wetzlar Website Design/` (*.dc.html, tokens/, assets/, readme.md, SKILL.md, support.js, styles.css) – nur lesen
- bestand/ ≙ `uploads/igmg-wetzlar-website/` – nur lesen
- web/ und _lauf/ – einzige Schreiborte

