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

## 2. Bausteine
- Seitenkopf: `PageHeader`/`Seitenkopf` (Kennung mit Achtstern, `text-display-1`, Einleitung, Achtstern-Band an der Kante). Nicht nachbauen.
- Abschnitt: `<section aria-labelledby=…>` → innen `mx-auto max-w-(--container-inhalt) px-4 py-abschnitt md:px-8`, Kopf mit Kennung (`text-16 font-bold text-gruen-800` + `Stern8` aus Icons.tsx in Standardgröße (14 px), wie im Seitenkopf – kein lucide-Icon und kein Punkt als Kennungszeichen; Sichtabnahme E3), `h2.text-display-2`, Einleitung `text-20 leading-einleitung text-pretty text-tinte-2 max-w-einleitung`, Aktion rechts (sekundärer Knopf).
- Knöpfe: primär `bg-gruen-700 … hover:bg-gruen-800 active:scale-98 transition duration-(--dauer-rueckmeldung)` (`transition`, nicht `transition-colors`: nur so läuft auch die Skalierung weich), sekundär `border-2 border-gruen-700 bg-weiss px-5.5 … hover:bg-gruen-50 active:scale-98`. Mindesthöhe `min-h-12` (48 px).
- Karten: `EventCard`, `NewsCard`, `CourseCard`, `OrgCard`, `PersonCard` – vorhandene nutzen. Hover: Rand `gruen-700` + `shadow-s2`; ganze Karte klickbar über `after:absolute after:inset-0` am Titel-Link.
- Zustände: `Zustandsgrafik` (`leer`, `fehler`, `erfolg`, `offline`, `nichtGefunden`) aus `web/src/components/website/Zustandsgrafik.tsx`. Leerzustand = Grafik + ein Satz + nächster Schritt (Link/Knopf), Karte `rounded-lg border border-linie bg-weiss px-6 py-12 text-center`.
- Trenner zwischen inhaltlich getrennten Blöcken: `Trenner` (Linie – Achtstern – Linie). Sparsam, höchstens einer je Bildschirmhöhe.
- Laden: `LadeStern` im Knopf neben dem Text („Wird gesendet …“), nie allein.
- Icons: nur lucide-react (Strich 2) und `web/src/components/website/Icons.tsx` (`Stern8`/`Achtstern` gefüllt, Social). Dekorativ immer `aria-hidden`.

## 3. Bewegung (nur Register K-007)
- Arbeitsansichten: nur B-01 (Rückmeldung: Farbe + `active:scale-98`), B-02 (Fokus, global), B-03 (Öffnen: Klasse `tritt-auf`, Dialoge automatisch), B-04 (Inhaltswechsel: `blendet-ein` am neuen Inhalt, z. B. `key` beim Tab-/Monatswechsel), B-05 (Seitenwechsel: automatisch im Seitenrahmen; gemeinsame Elemente nur nach Auftrag), B-10, B-11 (Formular-Erfolg: `tritt-auf` + Zustandsgrafik `erfolg`; Fehler: Fokus auf Zusammenfassung, keine Bewegung), B-12 (`LadeStern`).
- Keine eigenen `@keyframes`, keine Bewegung beim ersten Laden über dem Falz (LCP), nichts, was ohne JavaScript unsichtbar bleibt.
- Reduzierte Bewegung regelt `globals.css`; nichts selbst abfragen.

## 4. Text und Sprache
- Neue Mikrotexte in `web/messages/{de,tr,en}.json` (oder `messages/bereiche/*.json`) – im Paket nur als Bedarf melden (Schlüssel + drei Fassungen); Opus trägt ein und markiert tr/en in `neu-uebersetzt.json`.
- Ton (K-010): Deutsch sachlich-freundlich, Knöpfe nennen die Handlung, keine Floskeln.

## 5. Prüfstufe A je Paket
`pnpm exec tsc --noEmit -p .` · `pnpm exec eslint <Dateien>` · `pnpm exec prettier --check <Dateien>` · betroffene Tests · `node _werkstatt/werkzeuge/freie-werte.mjs <Dateien>` (0 neue Funde) · je ein Bild 390 und 1440 mit `_werkstatt/werkzeuge/einzelbild.mjs <pfad> --basis http://localhost:3200 --warte 4000` (immer `localhost`, nicht 127.0.0.1 – sonst hydriert die Seite im Entwicklungsserver nicht).
