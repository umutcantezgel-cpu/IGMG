# Abnahme C11b – Bilder an Inhalten (L1)

## Grundlage (Orchestrator)
- `src/lib/medien/bild.ts`: `ladeBilder`, `bildIdsAus`, `ungueltigeBildIds`, `bildFehlerFuer`.
- `bildId` in den Schemas, Datensätzen und Formularwerten von Neuigkeit, Veranstaltung und Kurs; Prüfung in den drei Speicher-Actions (`bildUngueltig`). Bildknoten im Neuigkeiten-Text sind erlaubt, wenn das Bild nutzbar ist.
- Öffentliche Abfragen liefern `bild` (und für die Neuigkeit `textBilder`) mit Tag `medien`.
- `ladeBildAuswahl()` für die Formularseiten; Texte `messages/verwaltung/medienwahl.json`.
- `/medien` wird 1 Tag gecacht, die Bildoptimierung übernimmt dieses Höchstalter.
- Tor-B/C-Hinweise SP-C2 H2–H5 und der PDF-Hinweis (M-097).
- Tests: `tests/integration/bilder-an-inhalten.test.ts` (6) und `verwaltung-medien.test.ts` (Papierkorb).

## Pakete
| Paket | Rolle/Modell | Vollständig | Richtig | Geprüft | Dokumentiert | Dateihoheit | Summe | Ergebnis |
|---|---|---|---|---|---|---|---|---|
| C11b-O öffentlich | Baumeister · Haiku | 2 | 2 | 2 | 2 | 2 | 10 | abgenommen. `MedienBild` über `getImageProps` (kein Client-JS), Karten, Detail mit Vorladen, RichText-Bildknoten; Unit 8 Tests |
| C11b-V Verwaltung | Baumeister · Haiku | 2 | 2 | 1 | 2 | 2 | 9 | abgenommen. Dialog und Bildfeld, drei Formulare, sechs Seiten; Unit 15 Tests. Speichern im Browser vom Paket nicht geprüft (Anmeldung über 127.0.0.1 hydriert nicht), vom Orchestrator per E2E nachgeholt |

## Stichproben des Orchestrators
- **Anmeldung mit Zwei-Faktor auf dem Dev-Server über localhost:** funktioniert, kein Rückschritt aus Tor B/C. Das Paket hatte 127.0.0.1 verwendet.
- **Bildschirmfoto** „Neue Nachricht“ bei 390 px: Bildfeld nach dem Kurztext, „Bild einfügen“ in der Werkzeugleiste.
- **E2E** `tests/e2e/bilder-an-inhalten.spec.ts`: Hochladen, Titelbild wählen, Bild im Text wählen, Veröffentlichen. Öffentlich erscheinen zwei Bilder über `/_next/image` mit dem Alt-Text der Mediathek; das Bild lädt.
- **Dev-Hinweis „uncached data … outside of Suspense“** auf Verwaltungsseiten: kommt von der Instant-Navigation-Prüfung im Dev-Modus, ist schon vor C11b vorhanden (auch bei Ankündigungen) und hat keine Wirkung auf Build oder Tests.

## Offen
- Nach dem Hochladen in einem neuen Tab zeigt der Dialog das neue Bild erst nach dem Neuladen der Formularseite. Niedrig; der Hinweis im Dialog führt zur Mediathek.
- Die Bildgrenze 300 steht doppelt (Server und Client). Niedrig, Kommentar im Code.
- Testdaten des Pakets in der Entwicklungsdatenbank (fiktiv): Neuigkeit „Testbeitrag Eins: Bildprüfung (fiktiv)“ (empfohlen) und ein Testbild. Nur lokal, nicht im Repo, nicht im Betrieb.
