# REFERENZ – Muster für alle Ansichtspakete (Stand E2, Startseite)

Referenzansicht ist die Startseite (`web/src/app/[locale]/(website)/page.tsx`, `web/src/components/website/start/*`). Jedes Ansichtspaket übernimmt diese Bauweise. Vorher lesen: KERN.md K-005 (Designsystem), K-007 (Bewegungsregister), K-008 (SVG-Formsystem), K-009 (Zustände), K-010 (Ton).

## 1. Werte nur aus dem System (Z-03)
Keine Klammerwerte (`px-[22px]`, `text-[15px]`, `max-w-[760px]`, `grid-cols-[repeat(…)]`), keine Hex-Farben, keine px in `style`. Zuordnung der häufigsten freien Werte:

| Bisher | Jetzt |
|---|---|
| `text-36 … md:text-48` + `leading-[1.15]` (Seiten-/Hero-Titel) | `text-display-1` |
| `text-30 leading-tight md:text-36` (Abschnittstitel) | `text-display-2` |
| `leading-[1.55]` bei `text-20` | `leading-einleitung` |
| `py-12 md:py-[88px]` (Abschnitt) | `py-abschnitt` |
| `py-10 md:py-[72px]` (kleiner Abschnitt, Hero) | `py-abschnitt-klein` |
| `max-w-[760px]` (Einleitung) | `max-w-einleitung` |
| `max-w-[56ch]`, `max-w-[62ch]`, `max-w-[70ch]` | `max-w-text` (52ch ≈ 70 Zeichen, seit Welle 0 der Sichtabnahme E3) |
| `max-w-[880px]` | `max-w-seitenkopf` |
| `grid-cols-[repeat(auto-fill,minmax(min(100%,340px),1fr))]` | `raster-karten grid` |
| `grid-cols-[repeat(auto-fill,minmax(min(100%,260px),1fr))]` | `raster-kacheln grid` |
| `flex-[2_1_560px]` + `flex-[1_1_320px]` (Haupt + Spalte) | `grid lg:grid-cols-3` + `lg:col-span-2` |
| `px-[22px]` (Knopf mit 2-px-Rand) | `px-5.5` |
| `px-[18px]` | `px-4.5` |
| `underline-offset-[3px]` | `underline-offset-3` |
| `size-[88px]`, `h-[300px]`, `h-[72px]` | `size-22`, `h-75`, `h-18` (4-px-Raster) |
| `min-[900px]:` / `max-[899px]:` | `verwaltung:` / `max-verwaltung:` |
| `z-50`, `z-60`, `z-[100]` | `z-(--ebene-overlay)`, `z-(--ebene-dialog)`, `z-(--ebene-sprung)`; Kopf `z-(--ebene-kopf)` |
| `transition-[box-shadow,border-color]`, `duration-150` | `transition duration-(--dauer-rueckmeldung)` |
| Streifen-Platzhalter `bg-[repeating-linear-gradient(…)]` | Komponente `Bildplatzhalter` (Utility `streifen-platzhalter`) |
| `[overflow-wrap:anywhere]` | `wrap-anywhere` |

Nicht im System und nicht ersetzbar? Dann im Bericht unter GEMEINSAME DATEIEN einen Token vorschlagen – nie selbst `globals.css` ändern.

**Belegte Ausnahmen (Medien ohne CSS-Variablen; Werte sind Spiegel der Tokens, Stand Stufe-C-Nacharbeit):**

| Datei | Warum Literale | Spiegel von |
|---|---|---|
| `web/src/lib/mail/vorlagen/farben.ts` (`MAILFARBE`, `MAILMASS`) | E-Mail-Programme kennen keine CSS-Variablen; die Vorlagen `Rahmen.tsx` und `index.tsx` lesen jede Farbe und jedes Maß nur aus dieser Datei | Farb-Tokens, `text-16/24`, `--radius-md/-lg`, Vielfache von `--spacing`; fünf feste Maße des Mailrahmens (Outlook-Breite 600 px, Grenze 480 px, Akzent 2 px, Haarlinie 1 px, 0 px); Gleichheit geprüft in `web/tests/unit/token-spiegel.test.ts` |
| `web/src/lib/seo/og-bild.tsx` (`OG_FARBEN`, 1200 × 630) | Satori rendert ein Bild, keine Seite | Farb-Tokens (Test `token-spiegel.test.ts`) |
| `web/src/components/verwaltung/styleguide/tokens.ts` | der Styleguide zeigt die Token-Werte als Text | `globals.css` (Test `styleguide-tokens.test.ts`) |
| `web/src/app/[locale]/layout.tsx` (`themeColor`) | Browser-Metadaten verlangen einen Farbwert als Text | `--color-gruen-950` (Test `token-spiegel.test.ts`) |
| `web/src/lib/gebetszeiten/bogen.ts` (`EINTRITT`) | `zeitAnteilEintritt` kehrt die Kurve für die Färbung im Takt der Linie um (H-E01) | `--ease-eintritt` (Test `token-spiegel.test.ts`) |

**Fehlalarm-Klassen von `freie-werte.mjs`:** Werte in Kommentaren, CSS-Attributselektoren (`[data-kategorie]`), die Zahl `0` in Inline-Stilen (`margin: 0`, kein Maß) und Optionen von Browser-Schnittstellen, die keine Gestaltung sind (z. B. `rootMargin: '200px'` des IntersectionObserver in `QiblaKompassBeiBedarf.tsx`: lädt den Kompass 200 px vor dem Sichtbarwerden).

## 2. Bausteine
- Seitenkopf: `PageHeader`/`Seitenkopf` (Kennung mit Achtstern, `text-display-1`, Einleitung, Achtstern-Band an der Kante). Nicht nachbauen. Detailseiten (E4, H-C02): Kopfbild über `bild` in der rechten Spalte ab lg (Fläche `h-55 md:h-75 lg:aspect-4/3 lg:h-auto rounded-lg border border-linie`), ohne gepflegtes Bild nur ab lg ein Platzhalter mit `bildAbLg`; Organisationsbezug über `kennungZeichen` (Logo 20 px, nie vergrößert) statt Achtstern.
- Abschnitt: `<section aria-labelledby=…>` → innen `mx-auto max-w-(--container-inhalt) px-4 py-abschnitt md:px-8`, Kopf mit Kennung (`text-16 font-bold text-gruen-800` + `Stern8` aus Icons.tsx mit `size-4` (16 px), wie auf der Startseite – kein lucide-Icon und kein Punkt als Kennungszeichen; Sichtabnahme E3), `h2.text-display-2`, Einleitung `text-20 leading-einleitung text-pretty text-tinte-2 max-w-einleitung`, Aktion rechts (sekundärer Knopf).
- Knöpfe: primär `bg-gruen-700 … hover:bg-gruen-800 active:scale-98 transition duration-(--dauer-rueckmeldung)` (`transition`, nicht `transition-colors`: nur so läuft auch die Skalierung weich), sekundär `border-2 border-gruen-700 bg-weiss px-5.5 … hover:bg-gruen-50 active:scale-98`. Mindesthöhe `min-h-12` (48 px).
- Karten: `EventCard`, `NewsCard`, `CourseCard`, `OrgCard`, `PersonCard` – vorhandene nutzen. Hover: Rand `gruen-700` + `shadow-s2`; ganze Karte klickbar über `after:absolute after:inset-0` am Titel-Link.
- Abzeichen (E4, H-C01): Kategorien neutral `border border-linie bg-sand text-tinte-2`; nur „Wichtig“ rot (`bg-tag-wichtig-bg text-tag-wichtig`); Status-Abzeichen „Empfohlen“/„Aktuell“ als weiße Pille mit grünem Rand und `Stern8`. Org-Farben nur in Band, Kante und Org-Text, nie als Kategorie.
- Terminzeile (E4, H-C01): `Calendar` + Datum, `Clock` + Uhrzeit (nur die Uhrzeit `whitespace-nowrap`), kein „·“ dazwischen; das Datum darf umbrechen.
- Gebetszeiten (E4, H-C09): Telefonleiste als Karte mit Fußzeilenknopf „Alle Zeiten“, nächstes Gebet in der Zeitenliste mit `Stern8` 16 px, Link „Alle Gebetszeiten“ mindestens 48 px hoch.
- Schrittweg in Formularen (E4, H-C10): Achtstern-Marken mit 2-px-Linie Spitze an Spitze, grün bis zur aktuellen Marke, kommende sandfarben; unter 1024 px als Markenreihe statt Balken.
- Zustände: `Zustandsgrafik` (`leer`, `fehler`, `erfolg`, `offline`, `nichtGefunden`) aus `web/src/components/website/Zustandsgrafik.tsx`. Leerzustand = Grafik + ein Satz + nächster Schritt (Link/Knopf), Karte `rounded-lg border border-linie bg-weiss px-6 py-12 text-center`.
- Trenner zwischen inhaltlich getrennten Blöcken: `Trenner` (Linie – Achtstern – Linie). Sparsam, höchstens einer je Bildschirmhöhe.
- Laden: `LadeStern` im Knopf neben dem Text („Wird gesendet …“), nie allein.
- Icons: nur lucide-react (Strich 2) und `web/src/components/website/Icons.tsx` (`Stern8`/`Achtstern` gefüllt, Social). Dekorativ immer `aria-hidden`.
- Nachrichtenkarten (C2, H-E08): In allen `NewsCard`-Varianten gilt die Reihenfolge Abzeichen → Datum/Lesezeit (`<time>`) → Titel → Kurztext. „Aktuell“ trägt `Stern8` wie „Empfohlen“. Die Seitenspalte ab 1240 px (`menu:`) hat Zeilen nach Inhalt (`menu:grid-rows-none`) und einen zweizeiligen Auszug.
- Nachrichtenkarten (C3, H-F03): Der Aufmacher „gross“ ist als ganze Karte klickbar. „Weiterlesen“ ist ein Textlink mit den Klassen der Standardkarte, Hover Rand `gruen-700` und `shadow-s2`. Auf /nachrichten trägt der Aufmacher den Titel über `titelStufe="abschnitt"` (display-2). Die Lesezeit steht mit `BookOpen`, nie mit Uhr. Die Startseiten-Liste ist eine Fläche (`rahmen={false}`).
- Begleitkarten (C2, L-E13, H-E03): Rubriken, die Daten ordnen (Kontaktdaten, Öffnungszeiten, Notfall, Adresse, Kalender-Abo), stehen in fetter Sans `font-text text-20 font-bold tracking-normal`. Inhaltstitel bleiben Serif.
- Leiste (C2, H-E07): Ab 768 px steht „berechnet“ neben „Nächstes Gebet“, unter 1240 px stehen Ort und Datum in einer Zeile. Höhe ≈ 170 px bei 1440 und ≈ 234 px bei 768 (de).
- Werkzeugknöpfe (C2): Teilen, Kalender, Menü und Sprache sind neutral, als dritte Knopfstufe `border border-rand bg-weiss … hover:border-gruen-700 hover:bg-gruen-50`, ohne grüne Füllung.
- Bildplatzhalter (C2, H-E09): Die Beschriftung ist ein Etikett `rounded-lg bg-weiss px-3 py-1 text-balance shadow-s1`, keine Pille. `Bildflaeche` (Über uns) nutzt denselben Baustein. Die Ära im Weg der Gemeinde steht als grüne Textzeile (`text-16 font-bold text-gruen-800`) ohne Fläche.
- Kursstatus (C2, H-E11): nach der Abzeichen-Regel. Steht eine Handlung an (Voranmeldung offen), ist das Abzeichen weiß mit `gruen-700`-Rand und `Stern8`, sonst neutral sand mit Rand `linie` und Text `tinte-2`. Kein Rot.
- Schrittmarke (C2, H-E10): Die aktuelle Marke ist voll grün mit weißer Ziffer, erledigte Marken sind hellgrün mit Häkchen, kommende sandfarben. Die Linien laufen Spitze an Spitze, die Statuszeile ab lg nur für Hilfstechnik (`lg:sr-only`).
- Wege-Kacheln der 404 (C2, H-E12): Symbole mit 20 px ohne Symbolkreis, der Satz steht im Kopf.
- Seitenwechsel (C2, H-E14): Der Morph Karte → Detail läuft 400 ms mit `ease-eintritt`, der Titel kommt vor dem Inhalt an.
- Seitenwechsel (C3, H-F08): Mit gemeinsamen Elementen (Karte → Detail) blendet der Inhalt erst nach `dauer-wechsel` ein. Titel und Bild kommen zuerst an, gesamt 640 ms. `SeitenUebergang` setzt dafür `data-uebergang="morph"` an `<html>` (globals.css).
- Zeitenliste der Gebetszeiten (C2, H-E13): Das nächste Gebet trägt den gefüllten Achtstern (16 px) wie Karte und Bogen, vergangene Zeiten stehen in `tinte-3`.
- Tagesbogen (C2, H-E01): Die Zeit des nächsten Gebets steht mit 24 px in `gruen-800`, die übrigen mit 18 px. Der Ort des nächsten Gebets trägt durchgehend eine Marke (Ring, dann Achtstern-Chip).
- Tagesbogen (C3, H-F04): Unter dem Horizont läuft die Linie mit derselben Steigung weiter und wird weich auf `tief` begrenzt (`tief · tanh(e·hoch/tief)`). So entsteht bei Güneş und Akşam keine Ecke (`bogen.ts`).

- Seitenende (C3, H-F01, L-E15): Ein Abschlussblock direkt vor dem Fuß ist hell. Fläche `overflow-hidden rounded-lg bg-gruen-50`, Band `h-1.5 bg-gruen-700` als erstes Kind, Titel in Tinte, genau ein gefüllter Knopf. Der Fuß bleibt die einzige tiefgrüne Schlussfläche.

## 3. Bewegung (nur Register K-007)
- Arbeitsansichten: nur B-01 (Rückmeldung: Farbe + `active:scale-98`), B-02 (Fokus, global), B-03 (Öffnen: Klasse `tritt-auf`, Dialoge automatisch), B-04 (Inhaltswechsel: `blendet-ein` am neuen Inhalt, z. B. `key` beim Tab-/Monatswechsel), B-05 (Seitenwechsel: automatisch im Seitenrahmen; gemeinsame Elemente nur nach Auftrag), B-10, B-11 (Formular-Erfolg: `tritt-auf` + Zustandsgrafik `erfolg`; Fehler: Fokus auf Zusammenfassung, keine Bewegung), B-12 (`LadeStern`).
- Keine eigenen `@keyframes`, keine Bewegung beim ersten Laden über dem Falz (LCP), nichts, was ohne JavaScript unsichtbar bleibt.
- Reduzierte Bewegung regelt `globals.css`; nichts selbst abfragen.

## 4. Text und Sprache
- Neue Mikrotexte in `web/messages/{de,tr,en}.json` (oder `messages/bereiche/*.json`) – im Paket nur als Bedarf melden (Schlüssel + drei Fassungen); Opus trägt ein und markiert tr/en in `neu-uebersetzt.json`.
- Ton (K-010): Deutsch sachlich-freundlich, Knöpfe nennen die Handlung, keine Floskeln.

## 5. Prüfstufe A je Paket
`pnpm exec tsc --noEmit -p .` · `pnpm exec eslint <Dateien>` · `pnpm exec prettier --check <Dateien>` · betroffene Tests · `node _werkstatt/werkzeuge/freie-werte.mjs <Dateien>` (0 neue Funde) · je ein Bild 390 und 1440 mit `_werkstatt/werkzeuge/einzelbild.mjs <pfad> --basis http://localhost:3200 --warte 4000` (immer `localhost`, nicht 127.0.0.1 – sonst hydriert die Seite im Entwicklungsserver nicht).
