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
10. **Cache-Tags** in `src/lib/cache/tags.ts`: `seite(id)`, `menue`, `weiterleitungen`, `startseite` (F-40).

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

## Ergänzung F-40 (Nacharbeit 2, 15.10.2026): Startseite und Islamisches Wissen

**Startseite (Nr. 6):**

- Der Kopf mit dem Tagesbogen steht fest oben.
- Sortierbar und ausblendbar sind die Abschnitte darunter: `moschee`, `veranstaltungen`, `neuigkeiten`, `desTages` (`src/lib/startseite/abschnitte.ts`).
- Gespeichert wird die Einstellung `startseite` in der vorhandenen Tabelle `einstellung`, ohne neue Tabelle.
- Jedes Speichern legt eine Revision an (`revision`, Typ `startseite`) und schreibt einen Audit-Eintrag (`einstellung.geaendert`).
- Die Startseite liest die Ordnung über `ladeStartseitenOrdnung` (`'use cache: remote'`, eigener Tag `startseite`) und bleibt statisch.
- Rückfall auf die Reihenfolge des Bestands: ohne Datenbank (Beispielmodus), ohne Eintrag und bei ungültigem Wert. Fehlt einem gültigen Wert ein später hinzugekommener Abschnitt, wird er sichtbar angehängt.
- Bedienung nur über Knöpfe „Nach oben“/„Nach unten“ und „Anzeigen“ mit Live-Region; Ziehen gibt es nicht.
- Auf der Startseite kommt kein Client-Code hinzu.

**Islamisches Wissen (Nr. 9, ADR 0030):**

- `wissen_thema` erhält die Freigabespalten (Migration 0015).
- Öffentlich ist ein Thema nur, wenn es `status = veroeffentlicht` und `freigabe = geprueft` hat und nicht im Papierkorb liegt (Übersicht, Themenseite, Sitemap, Suche).
- `status` ist der redaktionelle Schalter „Auf der Website zeigen, sobald es geprüft ist“. Er ist keine inhaltliche Änderung und setzt die Freigabe nicht zurück.
- Jede Änderung an Titel, Kurztext oder Einführung setzt ein geprüftes Thema auf „zur Prüfung“ (`statusNachSpeichern`).
- Freigeben gibt es nur in der Warteschlange „Freigaben“, mit Vier-Augen-Prinzip.
- Bestand: Was vor F-40 veröffentlicht war, bleibt öffentlich. Migration und Seed setzen es auf „geprüft“, ohne prüfende Person und mit einem Vermerk im Freigabe-Verlauf. Die Verwaltung zeigt es als „Bestand, nicht einzeln geprüft“.
- Die Adresse (Slug) ist nach dem Anlegen fest; so gibt es keine toten Links und keine Weiterleitungen.
- Papierkorb 30 Tage (Löschlauf); endgültig löschen samt Revisionen und Verlauf nur aus dem Papierkorb und mit Rückfrage.
- Rechte: `startseite.bearbeiten` haben Redaktion und Administration, `wissen.bearbeiten` zusätzlich die religiöse Prüfung (Matrix unverändert). Beide stehen in der generierten Rechte-Matrix (`tests/integration/verwaltung/rechte-matrix-gemeinde.test.ts`).
