# C3 · E2E-Befund Kontaktdaten (Abschlussprüfung 325c38a)

## Befund
- Test `web/tests/e2e/verwaltung-seiteninhalte-organisationen.spec.ts` „Kontaktdaten: Fehler am Feld mit Sprungverweis, dann speichern; die Kontaktseite zeigt die Angaben“.
  - Im Endstand-Lauf (Last 3–7) rot.
  - In der Wiederholung (`$S/e2e/altcha-wdh3.log`) dreimal rot, dann grün.
- Gespeichert war `"Testadresse 37d5, 00000 Testort[Adresse]"` (Spalte `seiteninhalt.inhalt->'adresse'` der E2E-Datenbank).
  - `fill()` hatte den Startwert `[Adresse]` nicht ersetzt; der neue Text stand davor.
  - Die öffentliche Seite zeigte den gespeicherten Wert richtig. Es ist also kein Zwischenspeicher-Befund.

## Ursache
- React 19.3 hydriert ein gesteuertes `<textarea>` mit `initTextarea` (`react-dom-client.production.js`, Zeilen 1398–1419).
  - Die Funktion setzt `defaultValue` und danach `value` auf den Wert aus dem Server-HTML.
  - Was vor dem Hydrieren eingetippt wurde, wird überschrieben.
  - Fällt die Hydrierung zwischen Markieren und Einfügen von `fill()`, steht die Schreibmarke vorn, und der Text landet vor dem alten Wert.
- Probe (`$S/kontakt-hydr/probe.mjs`, 3500 = 325c38a, 6-fach gedrosselter Prozessor, POST abgefangen, nichts gespeichert):
  - In 6 von 6 Proben war das Formular beim Füllen noch nicht hydriert.
  - Der Wert war direkt danach die Eingabe, nach 3 s wieder `[Adresse]`.

## Einordnung
- Kein Rückschritt dieses Laufs:
  - `KontaktFormular.tsx`, `OrganisationFormular.tsx` und der Spec sind seit früheren Läufen unverändert (letzte Änderungen 0487b9b, dc0382b).
  - Der Lauf hat am Verhalten der Hydrierung nichts geändert.
  - Ob der Test rot wird, hängt von der Last ab.
- Produktverhalten: Wer in der ersten Ladesekunde tippt, verliert die Eingabe. Formularlogik ist UNANTASTBAR (G8), deshalb ohne Eingriff. Der Vorschlag steht in MENSCHEN ML-28.

## Behebung im Test
- Neue Hilfe `fuelleUebernommen` im Spec: Sie füllt das Feld, bis das verborgene JSON-Feld `inhalt` (aus dem Zustand des Formulars) den Wert enthält.
  - Höchstens 15 s; jede Prüfung wartet 1 s.
  - Verwendet für „Adresse“ (Kontaktdaten) und „Mission“ (Organisation).
- Die Erwartungen des Tests bleiben gleich, nichts wird übersprungen.

## Nachlauf (alt gegen neu, Build bau-head 325c38a, Port 3700, ein Worker, drei Rechenschleifen als Last)
- Alter Spec, `--repeat-each=3`, ohne Wiederholung: 6/6 grün. Rechenschleifen als Last verzögern die Hydrierung im Browser nicht genug; der Wettlauf ist so nicht nachstellbar.
- Neuer Spec, `--repeat-each=4`, ohne Wiederholung: 8/8 grün (`$S/e2e/kontakt-fix.log`).
- Entscheidender Beleg ist die Drosselprobe:
  - Alte Abfolge (`probe.mjs`): 6/6 Eingaben verloren.
  - Logik von `fuelleUebernommen` (`probe-neu.mjs`, 6-fach gedrosselt): 6/6 übernommen nach 2–3 Füllversuchen. Wert und JSON standen nach 3 s noch.
