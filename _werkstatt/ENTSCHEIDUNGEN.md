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
