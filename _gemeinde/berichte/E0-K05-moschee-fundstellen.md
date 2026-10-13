# E0-K05 – Moschee: Fundstellen „geplant / im Bau / Zukunft“

Auftrag H-E0-K05 (Kundschafter). Nur gelesen. Geschrieben wurde nur diese Datei. Keine Commits, keine Änderungen an Quellcode, Messages oder Seeds.

## Kurzfassung

- **Hauptbefund:** Der Seed `/home/user/IGMG/web/drizzle/seeds/bereiche/projekte.ts` stellt das Gebäude als „Neue Fatih Moschee Projekt“ im Status `in_planung` dar. Er enthält einen Spendenaufruf „für den Bau einer Moschee“ und offene Meilensteine bis „Januar 2026“. Die Seite `/projekte` zeigt das öffentlich, als Beispielinhalt (`istBeispiel: true`, Zeile 134).
- **Messages:** Seitenkopf und Meta-Description „Unsere aktuellen Bauprojekte“, Kennungen „Baufortschritt“ und „Bauprojekt“, Status „Geplant“ bei offenen Meilensteinen, 3D-Platzhalter.
- **Schema-Default:** `status` steht standardmäßig auf `in_planung` (`/home/user/IGMG/web/src/lib/validierung/seiteninhalte/projekte.ts:34`).
- **Startklar:** Keine Prüfung für Projektstatus oder überfällige Meilensteine. Die Platzhalterprüfung erfasst nur Impressum und Datenschutz (`/home/user/IGMG/web/src/lib/startklar/pruefungen.ts:315`).
- **Historisch, bleibt:** Nachricht „Moscheererweiterung genehmigt“ (veröffentlicht 2024-03-01) und Vorstandsgeschichte „Planung des Moschee-Neubaus“ (2009–2012).
- **Ohne Befund:** OG-Bilder, JSON-LD, Startseite, `public/`, Rechtstexte.

## 1. Seed „Projekte“ (öffentlich auf /projekte)

Datei: `/home/user/IGMG/web/drizzle/seeds/bereiche/projekte.ts`

| Zeile | Aktueller Text (kurz) | Vorschlag |
|---|---|---|
| 15–17 | Name „Neue Fatih Moschee Projekt“ / „Yeni Fatih Cami Projesi“ / „New Fatih Mosque Project“ | „Neue Fatih-Moschee“ (tr „Yeni Fatih Camii“, en „New Fatih Mosque“). Bezeichnung bestätigen (Frage 11). |
| 19 | `status: 'in_planung'` → Badge „In Planung“ | `'fertiggestellt'` (AUFTRAG 3.9) |
| 20 | Ort „[Ortsangabe]“ | Platzhalter „[Ortsangabe – von der Gemeinde]“ (MN-08) |
| 21–22 | Beginn 2024, Fertigstellung 2026 | Beginn „[Jahr – von der Gemeinde]“ (null). Fertigstellung „[Jahr – von der Gemeinde]“ (MN-08) |
| 24–26 | „…hat Fortschritte gemacht… von der örtlichen Verwaltung … blockiert… endlich… Genehmigungen… um … fortzufahren“ (tr 25, en 26) | „Die neue Fatih-Moschee in [Ortsangabe] ist fertiggestellt. Eröffnung: [Datum – von der Gemeinde]. [Kurzbeschreibung – von der Gemeinde]“. Behördenaussage streichen (Frage 5). |
| 28–32 | Kapazität 500 „Gläubige“, Fläche 1200 m² | Null bzw. Platzhalter bis zur Bestätigung (Frage 6) |
| 33–40 | Einrichtungen (sechs Einträge, Hauptgebetsraum bis Küche und Sozialräume) | Bestätigen oder leeren (Frage 6) |
| 44 | Titel „Die Bedeutung von Spenden“ | Neutral nach Festlegung des Spendenzwecks (Frage 4) |
| 46–48 | Spendentext „Jetzt brauchen wir Ihre Hilfe, um dieses Ziel zu erreichen… dieses wertvolle Projekt zu verwirklichen“ (tr 47, en 48) | „[Spendentext – von der Gemeinde]“ bis zum Spendenzweck (MN-13). Solange Spendenkarte ausblenden (Frage 4). |
| 57–59 | Unterstützen-Text „Werden Sie Teil dieses historischen Moments… für den Bau einer Moschee…“ (tr 58, en 59) | „Unterstützen Sie unsere Gemeinde. [Spendenzweck – von der Gemeinde]“. Wörter „Bau“ und „historischen Moments“ streichen. |
| 62–64 | Dank „…gemeinsam unsere neue Moschee in der [Ortsangabe] bauen…“ (tr 63, en 64) | „Wir danken allen, die die neue Fatih-Moschee in [Ortsangabe] möglich gemacht haben.“ |
| 68–77 | Meilenstein „Genehmigungen erhalten“, erledigt, März 2024 | Bleibt. Datum bestätigen (Frage 3). |
| 78–87 | „Architektenpläne finalisiert“, erledigt, April 2024 | Bleibt. Datum bestätigen (Frage 3). |
| 88–93 | „Grundsteinlegung“, September 2024, `erledigt: false` | Frist vergangen, aber offen. Auf erledigt setzen, Datum „[Datum – von der Gemeinde]“, oder Eintrag entfernen (Frage 3). |
| 94–103 | „Rohbau“, März 2025, offen | Wie Grundsteinlegung |
| 104–113 | „Innenausstattung“, Oktober 2025, offen | Wie Grundsteinlegung |
| 114–123 | „Eröffnung“ „Offizielle Eröffnung der neuen Moschee“, Januar 2026, offen | Auf erledigt setzen, Datum „[Datum – von der Gemeinde]“ (MN-08) |
| 135 | Quellenangabe, intern | Keine Änderung (nicht sichtbar) |

## 2. Messages (öffentlich sichtbar)

Basis: `/home/user/IGMG/web/messages/`

| Datei:Zeile | Aktueller Text | Sichtbar auf / Ort | Vorschlag |
|---|---|---|---|
| `bereiche/projekte.json:7` (de `kopf.untertitel`) | „Unsere aktuellen Bauprojekte und Initiativen“ | /projekte Seitenkopf und Meta-Description (`projekte/page.tsx:16`, `:30`) | „Projekte und Initiativen unserer Gemeinde“ |
| `bereiche/projekte.json:58` (tr) | „Güncel inşaat projelerimiz ve girişimlerimiz“ | wie oben | „Güncel projelerimiz ve girişimlerimiz“ |
| `bereiche/projekte.json:109` (en) | „Our current construction projects and initiatives“ | wie oben | „Our projects and initiatives“ |
| `bereiche/projekte.json:27` (de `bezeichnungen.meilensteinKennung`) | „Baufortschritt“ (tr :78 „İnşaat ilerlemesi“, en :129 „Construction progress“) | Kennung über Meilensteinen (`Meilensteine.tsx:45`) | „Chronik“ (tr „Kronoloji“, en „Timeline“) |
| `bereiche/projekte.json:28` (de `beschreibungKennung`) | „Bauprojekt“ (tr :79 „İnşaat projesi“, en :130 „Building project“) | Kennung im Bauprojekt (`Bauprojekt.tsx:49`) | „Projekt“ (tr „Proje“, en „Project“) |
| `bereiche/projekte.json:41` (de `meilenstein.geplant`) | „Geplant“ (tr :92 „Planlandı“, en :143 „Planned“) | Karten offener Meilensteine (`Meilensteine.tsx:202`) | „Ausstehend“ nur für tatsächlich offene Punkte |
| `bereiche/projekte.json:10` (de `3d.text`) | „3D-Modell: {name} [Modell von der Gemeinde]“ (tr :61, en :112) | Bildplatzhalter (`Bauprojekt.tsx:34`) | AUFTRAG 1 nennt „3D-Modell“ unter „Bewusst abgelehnt“ (Zeile 125). Vorschlag: „Foto: {name} [Foto von der Gemeinde]“ (MN-08, Frage 7). |
| `bereiche/projekte.json:13–14` (Statuslabels) und :64–65, :115–116 | „In Planung“, „Im Bau“ | Statusbadge (`Bauprojekt.tsx:41`) | Bleibt. Erscheint nur bei dem jeweiligen Status. |
| `de.json:623`, `tr.json:282`, `en.json:282` (`kopf.bProjekt`) | „Aktuelle Projekte und Initiativen“ / „Güncel projeler ve girişimler“ / „Current projects and initiatives“ | Menü-Beschreibung (`navigation.ts:40`) | Grenzfall. „Aktuelle“ streichen: „Projekte und Initiativen“. |
| `bereiche/kontakt.json:40` (de), :90 (tr), :140 (en) | „Die Karte wird eingebunden, sobald die Lage der Moschee bestätigt ist. [Koordinaten fehlen]“ | Anfahrt, nur ohne Koordinaten (`Anfahrt.tsx:59`) | Grenzfall. Koordinaten nachtragen (MN-08, Frage 10). |
| `de.json:188–209`, `tr.json:188–209`, `en.json:188–209` (`bestand.aboutUs`, Zeile 209 „Zukunft – Weiterhin im Dienste…“) | Altbestand | Nicht sichtbar. Kein Verweis auf `aboutUs` in `src/`. | Keine Änderung für die Sichtbarkeit. Bereinigung nach AUFTRAG 3.9. |

## 3. Weitere Seeds

| Datei:Zeile | Aktueller Text | Art | Vorschlag |
|---|---|---|---|
| `/home/user/IGMG/web/drizzle/seeds/bereiche/ueber-uns.ts:94–101` | Zeitleisten-Station „Zukunft“ (tr „Gelecek“, en „Future“), Titel „Zukunft - Weiterhin im Dienste unserer Gemeinde“ (:96, en :98), Bildbeschreibung „Foto: Zukunftsvision - Gemeinsam in die Zukunft“ (:101) | Öffentlich (/ueber-uns, `Zeitleiste.tsx`). Grenzfall: nicht gebäudebezogen, aber letzte Station. | Laut AUFTRAG 3.9: kennzeichnung „[Jahr]“, titel „[Jahr – von der Gemeinde] – Eröffnung der neuen Fatih-Moschee“, Bildbeschreibung „Foto: Neue Fatih-Moschee [Foto – von der Gemeinde]“ (tr/en analog) |
| `/home/user/IGMG/web/drizzle/seeds/bereiche/ueber-uns.ts:84`, `:89` | 2019 „Umzug zur Philipsstraße (aktueller Standort)“; Foto „Moderne Moschee - Neues Zuhause in der Philipsstraße“ | Historisch, bleibt. Widerspruch zu projekte.ts:20 (neue Moschee an „[Ortsangabe]“). | Frage 1 |
| `/home/user/IGMG/web/drizzle/seeds/daten/nachrichten.ts:175–197` (slug `moscheererweiterung-genehmigt`; `veroeffentlicht` :193 = 2024-03-01; `empfohlen` :194 = true) | „Moscheererweiterung genehmigt“; kurztext „…Bauarbeiten beginnen im Herbst.“ (:182, tr :183, en :184); absatz „Nach langen Verhandlungen und Planungen…“ (:187) | Historisch, öffentlich (/nachrichten, Badge „Empfohlen“ in `NewsCard.tsx:194–197`). Bleibt wahr zum Datum. | Kein Textwechsel. Empfohlen-Badge und Datum prüfen (Frage 8). Optional eigener Nachtrag „[Datum]: Eröffnung“, nicht als Ersatz. |
| `/home/user/IGMG/web/drizzle/seeds/bereiche/vorstand.ts:103` („Planung des Moschee-Neubaus“, 2009–2012); `:105–106` („Umzug zur Philipsstraße“, „Aufbau des modernen Gemeindezentrums“, 2012–2025) | Vorstandsgeschichte | Bleibt (Auftrag). | Keine Änderung |
| `/home/user/IGMG/web/drizzle/seeds/bereiche/igmg.ts:63–64` | Verbandsgeschichte: „Bau von Moscheen“ allgemein | Allgemein, kein Befund | Keine Änderung |

## 4. Defaults, Schema, Komponenten

| Datei:Zeile | Inhalt | Bewertung |
|---|---|---|
| `/home/user/IGMG/web/src/lib/validierung/seiteninhalte/projekte.ts:34` | `status: z.enum(PROJEKT_STATI).default('in_planung')` | Greift, wenn kein Status gespeichert ist, und zeigt dann „In Planung“. Vorschlag: Default `fertiggestellt` oder Pflichtfeld (Frage 9). |
| `projekte.ts:33, :35, :38, :54–55, :63–65` | Defaults „[Projektname – von der Gemeinde]“, „[Ortsangabe]“, „[Projektbeschreibung – von der Gemeinde]“, „[Spendentext – von der Gemeinde]“, „[Text – von der Gemeinde]“ | In Ordnung (Platzhalter) |
| `projekte.ts:41` `modell: null` | Kein 3D-Modell als Standard | In Ordnung |
| `/home/user/IGMG/web/src/components/website/projekte/Bauprojekt.tsx:13–15, :34, :49` | Statusstil (Hammer bei `im_bau`), Kennung „Bauprojekt“, 3D-Platzhalter | Textfunde siehe Abschnitt 2 |
| `/home/user/IGMG/web/src/components/website/projekte/Meilensteine.tsx:39, :45, :56, :202` | „Geplant“, „Baufortschritt“, „{erledigt} von {gesamt} Meilensteinen abgeschlossen“ | Anzeige folgt den Seed-Daten. Nach Korrektur entsprechend. |
| `/home/user/IGMG/web/src/components/website/projekte/Spenden.tsx:20–22, :57–60` | Spendenkarte: Fortschritt nur mit Beträgen, Bankverbindung als Platzhalter | Kein Fundtext. Karte nach Frage 4 ausblenden oder mit Zweck umschreiben. |

## 5. Startklar und Cockpit

| Datei:Zeile | Befund |
|---|---|
| `/home/user/IGMG/web/src/lib/startklar/pruefungen.ts:303–310` (`inhalte.beispiele`) | Zählt Seiteninhalte mit `istBeispiel`, also auch den Projekte-Seed. Warnung, solange Beispielinhalt gespeichert ist. Kein Baubezug. |
| `pruefungen.ts:315–327` | Platzhalterprüfung nur für `impressum` und `datenschutz`. Lücke: `[Ortsangabe]` und `[Bankverbindung – von der Gemeinde]` auf /projekte werden nicht geprüft. Neue Prüfung vorschlagen. |
| (fehlt) | Keine Prüfung „Projektstatus / Meilenstein vergangen, aber offen“ (AUFTRAG 3.9, Z-21). Im Code kein Treffer für „Meilenstein“ in `src/lib/startklar`. Neu anlegen. |

## 6. Geprüft ohne Befund

- **OG-Bilder:** `/home/user/IGMG/web/src/app/[locale]/opengraph-image.tsx` und `/home/user/IGMG/web/src/lib/seo/og-bild.tsx` nutzen nur `meta.titel` („IGMG Wetzlar“) und `start.untertitel` (de/tr/en). Kein Baubezug. Es gibt kein eigenes OG-Bild für /projekte.
- **JSON-LD:** `/home/user/IGMG/web/src/lib/seo/jsonld.ts:72–90` (Mosque). Kein Baubezug.
- **Startseite:** `/home/user/IGMG/web/src/app/[locale]/(website)/page.tsx:44`. Aufmacher ist die neueste als „empfohlen“ markierte Nachricht, derzeit „Neue Gebetszeiten für den Winter“ (2025-07-20). Die Moschee-Nachricht erscheint dort nicht.
- **public/:** nur Logos und Symbole, keine Baufotos, keine Renderings.
- **docs/:** Einzige Fundstelle mit Baubezug ist `/home/user/IGMG/web/docs/ABWEICHUNGEN.md:37` (A-S10: „Status „Im Bau“/„Fertiggestellt“ ergänzt“). Das ist intern, nicht öffentlich. `docs/adr/0004-caching-grenzen.md:19` nennt Projekte nur als statische Seite. `docs/recht/`: keine Treffer.
- **Verwaltung (nicht öffentlich):** `/home/user/IGMG/web/messages/verwaltung/seiteninhalte.json:41, :59–60, :111–123, :185–186` (Feldnamen, Statuslabels). Kein Änderungsbedarf für die Öffentlichkeit.
- **Anfrageformular:** `messages/bereiche/moschee-anfrage.json` „Projektdetails“ ist ein Angebot an andere Moscheen. Kein Befund.

## 7. OFFENE FRAGEN (Standard bis zur Antwort in Klammern)

1. **Standort:** Ist die neue Fatih-Moschee ein neuer Ort, oder ist es die Philipsstraße? Widerspruch zwischen `ueber-uns.ts:84` („aktueller Standort“, 2019) und `projekte.ts:20` („[Ortsangabe]“). (Platzhalter „[Ortsangabe – von der Gemeinde]“, nichts behaupten.)
2. **Eröffnungsdatum und Fertigstellungsjahr** (MN-08). (Platzhalter „[Datum – von der Gemeinde]“.)
3. **Meilensteine** (Grundsteinlegung, Rohbau, Innenausstattung, Eröffnung): Stimmen die Daten? (Laut AUFTRAG 3.9 erledigt, Datum als Platzhalter.)
4. **Spendenzweck** (MN-13). (Spendenkarte aus, bis Zweck bestätigt.)
5. **Behördenaussage** („von der örtlichen Verwaltung kontinuierlich blockiert“, `projekte.ts:24–26`): nicht belegt. (Streichen. Vorstand und Recht entscheiden.)
6. **Kapazität 500, Fläche 1200 m², Einrichtungen** (`projekte.ts:28–40`): nicht belegt. (Platzhalter bzw. leer.)
7. **3D-Modell-Platzhalter** (`projekte.json:10`): AUFTRAG 1 nennt 3D-Modelle „bewusst abgelehnt“. (Foto-Platzhalter.)
8. **Empfohlen-Badge der Nachricht 2024** (`nachrichten.ts:194`) und Sichtbarkeit des Datums. (Text und Flag unverändert.)
9. **Schema-Default** `in_planung` (`projekte.ts:34`): Vorschlag `fertiggestellt` laut AUFTRAG 3.9. (Änderung nur nach Entscheidung.)
10. **Lage-Hinweis Karte** (`kontakt.json:40`): Koordinaten (MN-08). (Text unverändert.)
11. **Gebäudebezeichnung** „Neue Fatih Moschee Projekt“: Vorschlag „Neue Fatih-Moschee“. (Bezeichnung bestätigen.)
