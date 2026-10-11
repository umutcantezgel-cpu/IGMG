# ENTSCHEIDUNGEN – Letzter Lauf

Kennung L-Exx. Folgenreiches mit Denkprotokoll (Ziel → drei Wege → Bewertung → Umkehrprobe → Folgen zweiter Ordnung).

## L-E01 · 2026-10-11 · Nutzer · Push auf `main` als regelmäßiges Update
- Abweichung von AUFTRAG G2/PUSH/VERÖFFENTLICHUNG auf ausdrückliche Anweisung des Nutzers („push auf main immer wieder mal als updates“).
- Regel: Arbeit zuerst auf ARBEITSBRANCH; auf `main` nur nach grünem Wellen-Build bzw. Etappentor, als Fast-Forward (`git push origin claude/blissful-edison-x3j16w:main`), nie erzwungen, keine halbfertigen ZWISCHENSTAND-Stände.
- Jeder Push auf `main` löst ein Produktions-Deployment aus → vorher V-02-Build und `pnpm check` grün; danach Prüfung des Produktions-Deployments per Vercel-MCP; bei Rot Revert-Commit auf `main`.

## L-E02 · 2026-10-11 · Nutzer · Startklar-Bausteine neu, kein Einwilligungs-Banner
- Befund: Der Release-Lauf (Kern 2.0, `_lauf/release`) endete bei P0/P1; Einwilligungs-Manager, Startklar-Cockpit, `pnpm startklar`, `release:check`, SITE_MODE (K-21), Umgebungsprüfung (K-30), GO-LIVE.md und docs/deploy fehlen.
- Entscheidung (Nutzer: „vom jetzigen Stand weiterarbeiten“): Cockpit, `pnpm startklar`, `pnpm release:check`, SITE_MODE und typisierte Umgebungsprüfung werden gebaut.
- Kein Einwilligungs-Banner: Die Website nutzt keine Drittanbieter; die einzige externe Einbettung (OpenStreetMap) lädt bereits erst nach Klick (`KarteNachKlick`); Geräte-Speicher nur für einen Hinweis-Merker (`KonzeptHinweis`, technisch erforderlich). Annahme in MENSCHEN.md (rechtliche Bestätigung).
- Folge: UNANTASTBAR „Verhalten des Einwilligungs-Managers“ ist gegenstandslos; „Prüfungen des Startklar-Cockpits“ gelten ab dessen Bau.

## L-E03 · 2026-10-11 · Opus · Wahrheit über frühere Prüfsuiten
- AUFTRAG §2 nennt `pnpm release:check` und `pnpm startklar` als Bestand; beide existieren nicht. Z-02/Z-12 werden gegen die tatsächlich vorhandenen Suiten gemessen (`check`, `test:integration`, `sprachen:pruefen`, `geheimnisse:pruefen`, Build) plus die neu gebauten `startklar`/`release:check`. Kein Kriterium wird dadurch still abgesenkt.

## L-E04 · 2026-10-11 · Opus · Großer Moment der Startseite: Tagesbogen im Hero, Leiste bleibt (Denkprotokoll)
- Ziel: ein großer Moment aus echten Inhalten, der die Leitidee „im Takt des Tages“ sichtbar macht, ohne Bestand zu brechen.
- Drei Wege: (A) Tagesbogen ersetzt den Foto-Platzhalter im Hero, Leiste bleibt · (B) Tagesbogen ersetzt auf der Startseite die Leiste (`ohneLeiste`) und übernimmt alle ihre Aufgaben · (C) Leiste bleibt, Hero-Moment ohne Gebetszeiten (z. B. Achtstern-Komposition).
- Bewertung: (B) wäre gestalterisch am saubersten, schiebt aber auf dem Telefon „Nächstes Gebet“ unter den Hero (Hauptaufgabe rutscht aus dem ersten Bildschirm) und ändert die Laufbuch-Regel D-16 → Rang 2/3 verletzt. (C) besteht die Austauschprobe nicht. (A) behält Leiste und Hauptaufgabe, der Bogen zeigt dieselben Daten als Form des Tages (Bild statt Tabelle); die Doppelung ist gewollt und klein (Liste im Bogen = Textalternative nach K-008).
- Umkehrprobe: Soll später ein echtes Moscheefoto in den Hero, wandert der Bogen in einen eigenen Abschnitt unter dem Hero; eine Zeile in `page.tsx`.
- Folgen zweiter Ordnung: Der Foto-Platzhalter „Foto: IGMG Wetzlar Moschee“ entfällt auf der Startseite (Schlüssel `start.fotoMoschee` bleibt für eine spätere Bildeinbindung); JS zusätzlich ≈ 2 KB (Geometrie + Live-Teil, `useJetzt` geteilt mit der Leiste).

## L-E05 · 2026-10-11 · Opus · Designsystem-Architektur (Denkprotokoll)
- Ziel: neue Skalen ohne zweite Quelle, ohne Bibliothek, ohne Bruch der bestehenden Klassen.
- Drei Wege: (A) alles in `@theme` · (B) `@theme` für Tailwind-Namensräume (text, spacing, container, ease, breakpoint), `:root` für Dauern/Ebenen/Staffel (kein Namensraum in Tailwind 4) + `@utility` für Raster und Platzhalter · (C) eigene CSS-Klassen-Bibliothek.
- Gewählt (B): Klassen wie `py-abschnitt`, `text-display-1`, `max-w-einleitung`, `ease-eintritt`, `duration-(--dauer-wechsel)`, `z-(--ebene-kopf)`, `raster-karten` – geprüft per Tailwind-Kompilierung (`_werkstatt/protokolle`), Styleguide-Spiegel wird erweitert (H-STYLE).
- `dark:` über `@custom-variant dark (&:where(.dunkel, .dunkel *))` neutralisiert statt Klassen zu löschen (shadcn-Dateien bleiben upstream-nah; ML-02).
- Umkehrprobe: Ein späteres Dunkelthema setzt `.dunkel` am `<html>` und definiert die Farbtokens dort neu.

## L-E06 · 2026-10-11 · Opus · Bewegung nur CSS + React `<ViewTransition>`
- Keine Bewegungsbibliothek (0 KB JS). Seitenwechsel über `<ViewTransition enter/exit="seite">` im Seitenrahmen, Kopf als eigene Gruppe `kopf` (steht still). Große Momente als CSS-Animationen auf Elementen, die erst nach der Hydrierung entstehen – so ist der Server-Zustand immer vollständig sichtbar (kein Aufblitzen, keine verdeckten Inhalte, LCP unberührt).
- Offen: Im Entwicklungsserver löste die Seitenwechsel-Überblendung noch nicht aus; Prüfung im Produktions-Build (E2-Tor). Ohne Unterstützung bleibt der Wechsel wie bisher (schrittweise Verbesserung).

## L-E07 · 2026-10-11 · Opus · Formular-Integrationstests: Zeitgrenze statt Abschwächung
- Befund (E2-TOR, Wiederholung): In formular-kontakt/-meldung laufen 3 bzw. 4 Tests in die Grenze von 30 s; ein Folgefehler („expected 2 to be 1“) stammt aus dem abgebrochenen Vorgänger, der nach der Grenze noch schreibt.
- Ursache gemessen: Die Tests lösen echte ALTCHA-Aufgaben (PBKDF2, 5 000 Runden, Zähler gleichverteilt bis 10 000). Bei Last 4,6 dauert eine Lösung 7,8 s (Zähler 2 000), 18,1 s (5 000) bzw. 38,8 s (10 000). ALTCHA-Code und Formularlogik sind seit dem Ausgangsstand 9ebb4bc unverändert (`git log 9ebb4bc.. -- src/lib/validierung src/server/actions/formulare`: keine Commits). Es ist keine Regression, sondern Rechenzeit unter Last.
- Entscheidung: `testTimeout` des Integrationsprojekts 30 s → 240 s (bis vier Lösungen je Test), der 13-Lösungen-Test 120 s → 600 s. Keine Prüfung entfällt, keine Kosten im Produktionscode sinken (UNANTASTBAR Formularlogik).

## L-E08 · 2026-10-11 · Opus · Rubrik und Sichtabnahme (Antwort auf L0-Fragen)
- Sechs Kategorien der Rubrik (AUFTRAG §10 „Mittel der sechs Kategorien“): Typografie · Komposition · Farbe und Bild · Bewegung · Grafik · Details („Grafik und Details“ sind zwei Kategorien).
- Sichtabnahme: am E2-Tor durch einen frischen Opus-Unteragenten (AUFTRAG §9 als besondere Regel), an späteren Toren durch Opus selbst (§10). Die Endprüfung (Z-04) macht wieder ein frischer Opus-Unteragent mit Blindvergleich.

## L-E09 · 2026-10-11 · Opus · Produktions-Builds ohne persistenten Turbopack-Zwischenspeicher
- Befund (E2-TOR): Das ausgelieferte Stylesheet enthielt weder die neuen `@theme`-Tokens (`text-display-*`, `spacing-abschnitt`, Kurven) noch Keyframes, Bewegungsklassen und View-Transition-Regeln, wohl aber Klassen wie `duration-(--dauer-wechsel)` aus den TSX-Dateien. Der Server lief mit dem Build des Haupt-Repos von 18:00 (BUILD_ID `sxuaHSy3x-lABnPNPztj3`), gebaut mit dem Zwischenspeicher `.next/cache/turbopack` des Ausgangsbuilds von 17:15: altes `globals.css`, frisch eingelesene Klassen.
- Gegenprobe: Ein sauberer Build von 1fdc6a3 in einem frischen Worktree enthält alles (Keyframes, `text-display-1`, `.bogen-enthuellt`, `::view-transition-new(.seite)`, `.tritt-auf`). Eine kleine Änderung an `globals.css` mit warmem Zwischenspeicher kam an; die Veraltung ließ sich so nicht nachstellen, der Befund bleibt.
- Next 16.4 setzt `turbopackFileSystemCacheForBuild` standardmäßig auf `true`, und Vercel stellt `.next/cache` zwischen Deployments wieder her („Restored build cache from previous deployment“ im Protokoll von dpl_Bd4TrKhRFssmDf5hNvy5JPy5tcfS).
- Entscheidung: `experimental.turbopackFileSystemCacheForBuild: false` in `next.config.ts`. Dev behält seinen Zwischenspeicher. Preis: längere Bauzeit (sauberer Vorschau-Build lokal ≈ 166 s). Prüfer bauen für Tore immer in einem frischen Worktree und starten den Server aus genau diesem Build (BUILD_ID im Protokoll).
- Umkehrprobe: Ist der Fehler upstream behoben und belegt, kann der Schalter entfallen; eine Zeile.

## L-E10 · 2026-10-11 · Opus · Seitenwechsel B-05 mit eigenem `document.startViewTransition` (Denkprotokoll)
- Befund: React-`<ViewTransition enter/exit>` im Seitenrahmen löste weder im Entwicklungsserver noch im sauberen Produktions-Build (MuILuVNcIAwiw5iKUYvht) aus: 0 Aufrufe von `startViewTransition` in je drei Navigationen (`werkzeuge/vt-probe2.mjs`). Der Fiber-Baum (`werkzeuge/vt-fiber.mjs`) zeigt die ViewTransition korrekt über `<main>`, aber unter Next' `<Activity>`/Offscreen-Hüllen je Routensegment. Mit Cache Components versteckt Next verlassene Seiten, statt sie auszuhängen; React meldete im Seitentausch-Commit (Transition-Lane) keine Ein-/Austritts-Grenze (instrumentiert, `vt-probe3.mjs`).
- Drei Wege: (A) ViewTransition im `[locale]`-Layout mit `update` plus Link-`transitionTypes`: Der Kopf liegt im Seiteninhalt jeder Seite und bekäme eigene Namen, das bricht „Kopf steht“. (B) Seitenrahmen in ein gemeinsames Layout umbauen: großer Umbau aller Seiten (Bereich und Brotkrumen je Seite). (C) Eigener Klick-Baustein: interne Linkklicks in der Einfangphase abfangen, `document.startViewTransition(() => { router.push(ziel); warten bis Adresse = Ziel })`, Inhalt statisch mit `view-transition-name: seite`.
- Gewählt (C), `components/website/SeitenUebergang.tsx` (≈ 60 Zeilen, keine Abhängigkeit). Rückfall auf den normalen Klick bei fehlender Unterstützung, reduzierter Bewegung, Zusatztasten, `target`, `download`, fremder Herkunft und Sprung auf derselben Seite. Höchstens 4 s Wartezeit, dann endet der Übergang ohne Bild-Einfrieren. Versteckte Seiten (Activity, `display: none`) sind nicht gerendert und nehmen nicht teil, daher keine doppelten Namen. Die Gruppe `.seite` morpht nicht (Höhen wechseln).
- Gemessen (Entwicklungsserver): je Klick genau 1 Aufruf, Ziel erreicht. Nachweis im Produktions-Build und Bilder: E2-Tor-Wiederholung.
- Umkehrprobe: Sobald React/Next Activity-Wechsel als Ein-/Austritt melden, ersetzt eine `<ViewTransition>` im Seitenrahmen den Baustein (Register B-05 anpassen).
