# ADR 0032 – CMS: Blöcke, Seiten, Revisionen, Freigaben, Menüs und Weiterleitungen

- Status: vorgeschlagen (Lauf Gemeinde-Plattform) · Bezug: Plan „Gemeinde-Plattform“ §3.7, §2.1, §2.3 (`schema/cms.ts`), §7 (Z-18) · Freigabe nach ADR 0030

## Kontext

- Bestand: Freie Seiten fehlen. Menüs sind fest in `components/website/navigation.ts` hinterlegt. Es gibt keine Revisionen.
- Ehrenamtliche sollen eigene Nachrichten und Seiten selbst pflegen (Ziel des Plans).
- Die Startseite hat feste Abschnitte.
- Öffentliche Seiten bleiben statisch (Plan §2.1). Die Verwaltung ist dynamisch.

## Entscheidung

1. **Blöcke** (Zod in `src/lib/validierung/bloecke.ts`, Renderer in `components/website/bloecke/*`): text, bild, galerie, aufruf, faq, trenner, spalten, termine, nachrichten, kontakt, karte (erst nach Klick), download, gebetszeiten. Die Blöcke `vers` und `hadith` sind nur Verweise auf freigegebene Datenbankinhalte (ADR 0030).
2. **Freie Seiten** über den Bestand `[locale]/[...rest]`. Die Auflösung prüft zuerst `generateStaticParams` und die Weiterleitungstabelle, sonst wird `notFound` ausgelöst. Reservierte Slugs werden geprüft.
3. **Ablauf:** Entwurf, dann Prüfung, dann veröffentlicht, mit Zeitplan. Jedes Speichern erzeugt eine Revision, für alle Inhaltstypen. Vorschau über ein signiertes `vorschau_token`.
4. **Freigaben:** redaktionell und religiös (Tabelle `freigabe`). Eine Freigabe sperrt das öffentliche Lesen, bis sie vorliegt.
5. **Menüs** kommen aus der Datenbank und ersetzen `components/website/navigation.ts`. Der Bestand bleibt als Rückfall.
6. **Startseite:** Abschnitte sind sortierbar.
7. **Rechte:** Organisationsredaktion nur für die eigene Organisation. Der Übersetzungsstand wird je Sprache geführt.
8. **Weiterleitungen** (Tabelle `weiterleitung`) werden vor `notFound` ausgewertet.
9. **Module** nach Muster §7 (`module.ts`): Seiten, Menüs, Startseite, Weiterleitungen, Islamisches Wissen, Freigaben, Anzeige, Besondere Tage, Hatim, Newsletter, Ehrenamt, Koran, Hadith, Elifbe, Gemeinde-Konten, Gemeinde im Blick, Meldungen und Kinderschutz.
10. **Cache-Tags** in `src/lib/cache/tags.ts`: `seite(id)`, `menue`, `weiterleitungen`.

## Alternativen

- Seiten im Code pflegen (Bestand): verworfen für Ehrenamtliche. Die Menüs behalten den Bestand als Rückfall.
- Externes CMS: verworfen („ohne Drittanbieter“).
- Nur die letzte Fassung speichern, ohne Revisionen: verworfen. Der Plan verlangt Revisionen für alle Typen.
- Veröffentlichen ohne Entwurf und Prüfung: verworfen. Der Plan sieht Entwurf, Prüfung, Veröffentlichung vor.
- Blockliste ohne festes Schema: nicht gewählt. Die Blöcke sind über Zod festgelegt.

## Folgen

- Tests (Integration, PGlite): Veröffentlichen, Revision, Weiterleitung, Zeitplan. Freigabe sperrt das öffentliche Lesen. Reservierte Slugs. Blöcke-Schema.
- Schema: `seite` (Blöcke, Slugs je Sprache, Zeitplan), `revision`, `menue`, `weiterleitung`, `freigabe`, `vorschau_token`.
- Z-18: Seite, Menü, Revision, Weiterleitung, Zeitplan, Freigabe und Anzeige-Folie ohne Entwicklerhilfe.
- Die Datei `module.ts` ist eine gemeinsame Datei und wird nur vom Orchestrator geändert.
