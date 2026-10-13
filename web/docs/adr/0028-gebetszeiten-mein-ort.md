# ADR 0028 – Gebetszeiten „Mein Ort“ nur im Browser und wählbare Methode IGMG-Gemeinschaftskalender

- Status: angenommen (umgesetzt 13.10.2026) (Lauf Gemeinde-Plattform) · Bezug: Plan „Gemeinde-Plattform“ §3.8, §2.10, §5 (Standort nur lokal), §7 (Z-19), MN-09 · ergänzt ADR 0008 (Gebetszeiten-Quelle)

## Kontext

- Bestand: Gebetszeiten (adhan-js, Methode Turkey) gibt es nur für einen Ort, Wetzlar. Die Geolokalisierung ist per `Permissions-Policy` gesperrt.
- Der Auftrag verlangt Gebetszeiten per GPS. Wetzlar ist nicht Frankfurt; die Zeiten unterscheiden sich.
- Datenschutz: Koordinaten dürfen nicht ins Netz. Es gibt keinen Standort am Server und keine fremde Geokodierung.
- Die Logik der Moschee-Gebetszeiten ist unantastbar. Eine Änderung braucht eine ADR und die Entscheidung des Imams.
- ADR 0008 beschreibt die Quelle für Wetzlar. Diese ADR ergänzt sie um den Ort der Besucherin oder des Besuchers.

## Entscheidung

1. **Ablauf:** neuer Tab, dann ein Knopf (≈ 1 KB), dann ein Lazy-Chunk ≤ 12 KB (adhan, Ortsliste), dann `getCurrentPosition`. Die Koordinaten werden auf zwei Nachkommastellen gerundet.
2. **Rechnung im Browser** mit den Moschee-Einstellungen und der Gerätezeitzone. `berechneTag` erhält einen Zeitzonen-Parameter mit dem Standard Europe/Berlin.
3. **Anzeige:**
   - Unterschied zu Wetzlar, z. B. „+2 Min.“
   - nächster Ort aus der lokalen GeoNames-Liste (≈ 40 Orte)
   - Qibla über `qiblaRichtung()` aus `src/lib/gebetszeiten/berechnung.ts`
   - Hinweis: „Berechnet für deinen Standort – die Zeiten der Moschee gelten für Wetzlar.“
4. **Ohne GPS:** Ort aus der Liste wählen. Die Wahl wird über localStorage gemerkt oder vergessen.
5. **Nie Koordinaten ins Netz:** E2E-Test mit Netz-Abhörung. Kein Standort am Server, keine fremde Geokodierung.
6. **Berechtigung:** `geolocation=(self)` nur auf den Gebetszeiten-Pfaden (de, tr, en). Test `kopfzeilen-pfade.test.ts`.
7. **Moschee-Zeiten** bleiben unverändert. Zusätzlich wählbar ist die Methode „IGMG-Gemeinschaftskalender (Annäherung, 18°/16° + Nachtdrittel)“. Die Moschee stellt nur nach Entscheidung des Imams um (MN-09, Standard: Berechnung wie bisher). Die offizielle Jahrestabelle läuft über den bestehenden Import.
8. **Bewegung:** B-21 (Ortswechsel: Zeiten überblenden, Qibla-Nadel dreht einmal).

## Alternativen

- Standort an den Server senden und dort rechnen: verworfen (Datenschutz, Z-19).
- Fremde Geokodierung für Ortsnamen: verworfen.
- Nur Wetzlar, mit Hinweis auf den Ortswechsel: verworfen. Der Auftrag verlangt Ortszeiten.
- Methode der Moschee ohne Imam umstellen: verworfen (Logik unantastbar; nur per ADR und Imam).
- Nur die Ortsliste ohne GPS: bleibt als Rückfall, ist kein Ziel.
- Zeitzone fest auf Wetzlar: verworfen. Die Rechnung nutzt die Gerätezeitzone mit Standard Europe/Berlin.

## Folgen

- Tests: Ort und Zeitzone (Wetzlar gegen Frankfurt); E2E mit GPS erlaubt und abgelehnt, jeweils mit Netz-Abhörung; Bundle-Test (Lazy-Chunk ≤ 12 KB, adhan nicht im ersten Chunk).
- Datenschutz: Der Standort bleibt lokal. Der Baustein „Standort nur lokal“ kommt in die Datenschutzerklärung (Plan §5).
- Quellen: GeoNames wird auf `/quellen` genannt (ADR 0025).
- MENSCHEN MN-09: Die Gemeinde bestätigt, ob die Methode IGMG-Gemeinschaftskalender gewählt wird. Bis dahin gilt die Berechnung wie bisher.
- OFFENE FRAGE: Ob die Annäherung 18°/16° + Nachtdrittel der Gemeinde entspricht, entscheidet der Imam. Diese ADR legt das nicht fest.
