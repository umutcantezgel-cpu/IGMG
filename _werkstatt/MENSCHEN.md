# MENSCHEN – was nur ein Mensch erledigen kann

Format: Kennung · Thema · Was zu tun ist · Ort · Aufwand · Standardannahme bis zur Antwort. Offene Punkte der früheren Läufe stehen in `_lauf/MENSCHEN.md` (M-001…M-098) und `_lauf/release/MENSCHEN.md` (MR-001/002) und gelten weiter.

## Neu in diesem Lauf
- **ML-01 · Einwilligungs-Banner (Recht):** Bitte bestätigen, dass ohne Drittanbieter und mit Karte-nach-Klick kein Einwilligungs-Banner nötig ist. Ort: Rechtsberatung/Vorstand. Aufwand: 15 min. Annahme: kein Banner (L-E02).
- **ML-02 · Dunkelmodus:** Das Projekt hat nur ein helles Thema; Systemeinstellung „dunkel“ wird bewusst ignoriert. Ort: Geschmacksabnahme. Aufwand: 5 min. Annahme: nur hell.
- **ML-03 · Konzept-Hinweis abschalten:** Der Dialog „Alle angezeigten Daten sind fiktiv“ ist an (Seed) und lässt sich in der Verwaltung nicht ausschalten – der einzige Einstellungs-Schreibweg ist die Löschfrist (`web/src/server/actions/einstellungen.ts:12`), obwohl `KonzeptHinweis.tsx:22` einen Schalter beschreibt. Vor dem Livegang muss `einstellungen.allgemein.konzepthinweis` auf `false` (per SQL oder künftig im Startklar-Cockpit, siehe Plan). Ort: Datenbank/Cockpit. Aufwand: 5 min. Annahme: Cockpit prüft und meldet den Punkt.
- **ML-04 · Gründungsjahr:** „Führung seit 1975“ (Vorstand) widerspricht „[Gründungsjahr]“ (Über uns, Zeitleiste). Ort: Vorstand → Verwaltung › Seiteninhalte. Aufwand: 5 min. Annahme: Platzhalter bleibt, der „Weg der Gemeinde“ zeigt nur vorhandene Stationen.
- **ML-05 · Projektstand:** Meilensteine (Grundsteinlegung 09/2024 … Eröffnung 01/2026) liegen in der Vergangenheit, aber nur zwei sind erledigt; Spendenstand und Bankverbindung sind Platzhalter. Ort: Verwaltung › Seiteninhalte › Projekte. Aufwand: 15 min. Annahme: Die Meilensteinlinie zeigt genau die gepflegten Erledigt-Markierungen.
- **ML-06 · Vorstands-Postfächer:** `@igmg-wetzlar.de`-Adressen stehen öffentlich als mailto (Bestand, ungeprüft). Ort: Vorstand. Aufwand: 5 min. Annahme: bleiben.
- **ML-07 · Gebetszeiten-Koordinaten:** 50,567 / 8,5 (`web/src/lib/gebetszeiten/typen.ts:35`) liegen nach Schätzung 1,5–2 km nördlich des Zentrums; bitte mit der Adresse der Moschee abgleichen. Ort: Imam/Vorstand. Aufwand: 10 min. Annahme: unverändert (UNANTASTBAR Gebetszeiten-Quelle).
- **ML-08 · Ganztagstermine im Kalender-Abo:** `ganztaegig` wird nicht an den iCal-Export übergeben; Ganztagstermine erscheinen im Abo um 00:00. Ort: Entwicklung (kleines Paket, siehe PLAN). Aufwand: 30 min. Annahme: wird im Lauf behoben.
