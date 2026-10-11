# TEXTVORSCHLÄGE

Vorschläge für Texte außerhalb der Mikrotexte. Nichts davon ist eingebaut; Übernahme nach Prüfung durch die Gemeinde. Neue türkische und englische Mikrotexte stehen zusätzlich als Entwurf in `web/messages/neu-uebersetzt.json`.

## TV-01 · Startseite: Untertitel und Abschnittseinleitungen (Ton K-010: keine Floskeln wie „Entdecken Sie …“)
Ort: `web/messages/{de,tr,en}.json` › `start.*`. Keine neuen Fakten – nur vorhandene Angebote.

| Schlüssel | Heute (de) | Vorschlag de | Vorschlag tr (Entwurf) | Vorschlag en (Entwurf) |
|---|---|---|---|---|
| `start.untertitel` | Eine lebendige muslimische Gemeinde im Herzen von Wetzlar. Entdecken Sie unsere Aktivitäten, Gebetszeiten und Gemeinschaftsveranstaltungen. | Moscheegemeinde im Herzen von Wetzlar – mit Gebetszeiten, Koranunterricht und Begegnung für alle Generationen. | Wetzlar'ın merkezinde bir cami cemaati – namaz vakitleri, Kur'an dersleri ve her kuşak için buluşmalar. | A mosque community in the heart of Wetzlar – with prayer times, Quran classes and gatherings for every generation. |
| `start.veranstaltungenText` | Entdecken Sie die vielfältigen Aktivitäten und Programme unserer Gemeinde für alle Altersgruppen. | Gebete, Kurse und Begegnungen der nächsten Wochen – für alle Altersgruppen. | Önümüzdeki haftaların namazları, dersleri ve buluşmaları – her yaş için. | Prayers, classes and gatherings in the coming weeks – for all ages. |
| `start.neuigkeitenText` | Die neuesten Entwicklungen, Ankündigungen und wichtigen Informationen aus unserer Gemeinde. | Ankündigungen und Berichte aus dem Gemeindeleben. | Cemaat hayatından duyurular ve haberler. | Announcements and reports from community life. |
| `start.neuigkeitenTitel` | Bleiben Sie informiert | Aus der Gemeinde | Cemaatten | From the community |

Begründung: kürzer, konkret, ohne Werbesprache; die Überschrift „Aus der Gemeinde“ passt zur Kennung „Aktuelle Neuigkeiten“ darüber und vermeidet die Aufforderung im Imperativ.

## TV-02 · Veranstaltungen: Untertitel ohne Doppelung (Sichtabnahme E3, H-B04)
Ort: `web/messages/de.json` › `veranstaltungen.untertitel`, `kopf.bVeranstaltungen`. „Veranstaltungen und Events“ sagt dasselbe zweimal.

| Schlüssel | Heute (de) | Vorschlag de |
|---|---|---|
| `veranstaltungen.untertitel` | Aktuelle Veranstaltungen und Events der IGMG Wetzlar Moschee | Gebete, Kurse und Begegnungen der IGMG Wetzlar – die nächsten Termine |
| `kopf.bVeranstaltungen` | Kommende Veranstaltungen und Events | Kommende Termine der Gemeinde |

## TV-03 · Benennung Nachrichten oder Neuigkeiten (Sichtabnahme E3, H-B03)
Seitenkopf und Menü heißen „Nachrichten“, Brotkrumen, Bestandsmenü und Startseite „Neuigkeiten“. Vorschlag: auf der öffentlichen Website einheitlich **„Neuigkeiten“**, weil das Bestandsmenü und die vier Organisationsseiten den Begriff schon führen. „Nachrichten“ bleibt in der Verwaltung für das Postfach, so verwechselt dort niemand Postfach und Neuigkeiten. Die Entscheidung trifft die Gemeinde; bis dahin bleiben die Bestandstexte.

## TV-04 · Weg der Gemeinde: Stationstitel (Sichtabnahme E3, H-B12)
Ort: Seed `web/drizzle/seeds/bereiche/ueber-uns.ts` und Verwaltung › Seiteninhalte › Über uns. Die Stationstitel wiederholen die Kennung der Station, etwa „Frühe Jahre – Umzug in die Garbenheimerstraße“ neben der Pille „Frühe Jahre“. Außerdem steht dort ein Bindestrich „ - “ statt des Halbgeviertstrichs „ – “.
Vorschlag: Titel ohne die Kennung, also nur „Umzug in die Garbenheimerstraße“, und Halbgeviertstrich, wo ein Gedankenstrich gemeint ist. Das ist eine inhaltliche Änderung der Stammdaten und wird deshalb nicht im Lauf eingebaut.

## TV-05 · Ton: Fehlerseite und Korankurse (K-010, Sichtabnahme E3, H-B14)
| Schlüssel | Heute (de) | Vorschlag de |
|---|---|---|
| `fehlerseiten.nichtGefunden.text` | Die Adresse ist möglicherweise falsch geschrieben oder die Seite wurde verschoben. Nutzen Sie die Navigation oben oder gehen Sie zur Startseite. | Die Adresse ist vielleicht falsch geschrieben, oder die Seite ist umgezogen. Diese Wege führen weiter: |
| `korankurse.anmeldungText` | Melden Sie sich noch heute für unsere Korankurse an und beginnen Sie Ihre spirituelle Reise. | Anmeldung für die Korankurse: Wir melden uns mit Ort, Zeit und den nächsten Schritten. |

Begründung: Der neue 404-Satz führt zu der Liste der Hauptwege, die H-B14 unter dem Text ergänzt. Der Korankurs-Satz verzichtet auf Werbesprache und sagt, was nach der Anmeldung passiert.
