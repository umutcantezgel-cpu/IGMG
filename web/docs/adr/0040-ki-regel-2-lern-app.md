# ADR 0040 – KI-Regel 2: KI-Entwürfe in der Lern-App (Fortschreibung von ADR 0030 Nr. 4)

- Status: **angenommen im Tor L0 (20.10.2026)** mit den Abschnitten „Fortschreibung …“ (Orchestrator nach L3-E12; Gegenprüfung L0 ohne Mangel hoch/mittel) · vorher: angenommen im Kern (Nutzerentscheidungen vom 16.10.2026 „Fiqh-Inhalte“, „Sprachinhalte“, „Arabisch“; L3-E01, L3-E03, L3-E07: KI-Entwurf mit Quellenangabe je Aussage, zwei Freigaben, Arabisch nur mit freigegebenen Bedeutungen) (Lauf Lern-App); Verbotsliste und Freigaberegeln im Einzelnen sind Standard bis zur Antwort (L3-E09); Nr. 6: Schwellen nach dem genehmigten Plan §3.4, Pfade vorgeschlagen · Bezug: Plan „Lern-App“ Kontext (Widersprüche „KI-Regel“, „KI-Übersetzungen“; „Verfeinerung“ KI-Regel 2, Freigabe), §2.3, §3.3, §3.4; `_lernapp/PLAN.md` §3.9 (Status je Baustein), §6.4, §6.7; Lizenzbericht `_lernapp/berichte/lizenzen-l0.md` §1.4, §2 · **schreibt ADR 0030 Nr. 4 für die Lern-App fort** und präzisiert ADR 0030 Nr. 8; ADR 0030 Nr. 1–3 und 5–7 gelten weiter, für Bausteine des Wissenskurses verschärft durch Nr. 5 (zwei Freigaben statt einer)

## Kontext

- ADR 0030 Nr. 4 und KERN 3.0 („Religion“): Kein Agent schreibt Verse, Hadithe, Bittgebete, religiöse arabische Texte, Übersetzungen, Wortbedeutungen oder Tajwid- und Fiqh-Erklärungen. Arabischer Text stammt nur aus importierten Dateien oder aus den Codepunkten des Alphabets.
- Nutzerentscheidungen vom 16.10.2026:
  - **Fiqh-Inhalte:** Die KI entwirft Lektionen und Übungen streng nach benannten hanefitischen Quellen, mit Quellenangabe je Aussage. Nichts wird sichtbar, bevor zwei Prüfer (Imam/Hoca) jeden Baustein freigegeben haben.
  - **Sprachinhalte:** KI-Entwurf nach GER, ergänzt um offene Daten. Kein Koran- oder Hadith-Text in der Sprachausgabe.
  - **Arabisch:** Hocharabisch und ein Pfad „Koran-Arabisch“ aus den vorhandenen Koran-Wortdaten, nur mit freigegebenen Bedeutungen.
- „Bewusst abgelehnt: KI-erzeugte Übersetzungen“ (AUFTRAG Gemeinde-Plattform §1, ADR 0030 Nr. 8) meinte religiöse Übersetzungen. Sprachkurse brauchen Übersetzungen von Alltagssätzen.
- Risiken: erfundene Quellenangaben, falsch wiedergegebenes Arabisch, religiöse Formeln oder Koranwortlaut, die unbemerkt in Sprachkurse geraten.
- Die bestehende Freigabe kennt genau **eine** Prüfung mit Vier-Augen-Prinzip (`web/src/lib/religioes/freigabe.ts`).
- OpenITI steht unter CC BY-NC-SA 4.0 und darf nur lokal genutzt werden (ADR 0045).

## Entscheidung

1. **Geltung:** Diese Regel gilt für alle Inhalte der Lern-App. Außerhalb der Lern-App gilt ADR 0030 unverändert. Sie steht in jedem Briefing von Inhalts-Agenten.
2. **Erlaubt (KI-Entwurf):**
   1. **Sprachkurse** de, tr und Hocharabisch (voll vokalisiert): Rahmenpläne, Lemmata, Sätze, Dialoge, Geschichten, Lesetexte, Aufgaben, Grammatik-Tipps und die Übersetzungen dieser Sprachkurs-Inhalte zwischen de, tr und ar (L3-E03). Nur ohne Religionsbezug; religiöse Formeln nur aus der freigegebenen Liste erlaubter Alltagsformeln, dann mit Kennzeichen `religionsbezug` und zwei Freigaben (Nr. 5). Prüfung durch den Wächter (Nr. 6).
   2. **Wissenskurs `islam`, nur Deutsch:** Lektionen, prüfbare Aussagen, Quizfragen und Tipps in eigenen Worten, ausschließlich aus den gelieferten Passagen benannter Quellen und mit Beleg je Aussage (Nr. 4). Jede Quizfrage bezieht sich auf eine Aussage (Plan §3.3: Aufgaben nur aus Aussagen) und braucht selbst zwei Freigaben (Nr. 5).
   3. **Hilfsarbeiten:** Gegenprüfung, Rückübersetzung, Belegprüfung (sie ordnet nur die Warteschlange und ersetzt keine Freigabe), Arbeitslisten aus Verweisen, z. B. die Häufigkeitsliste der Koran-Wortformen für die Hoca.
3. **Verboten** (bleibt menschlich oder kommt nur aus Daten):
   - Verse, Hadithe, Bittgebete und andere religiöse Texte auf Arabisch schreiben, abschreiben, ergänzen oder „korrigieren“; arabische Schrift in den Inhaltsdateien von Wissenskurs und Koran-Pfad überhaupt (Arabisch erscheint dort nur aus gepinnten Daten über Verweise)
   - Übersetzungen von Versen, Hadithen und Bittgebeten sowie Übersetzungen religiöser Quelltexte, auch in Teilen; dazu gehört die sprachliche Modernisierung der Übersetzung von Joseph Hell (Lizenzbericht L0-E14)
   - Koran-Wortbedeutungen (MN-05) und Tajwid-Texte (MN-04)
   - Fatwa-Funktion, Fatwas zu Einzelfällen, Frage-Bot, Bewertung persönlicher Fälle
   - eine Sammlung von Bittgebeten (L0-E13, LM-16): Auswahl und Übersetzung sind Arbeit von Menschen; der arabische Wortlaut kommt nur aus gepinnten Dateien in `web/daten/**`; sichtbar erst nach zwei Freigaben (Nr. 5)
   - religiöse Formeln und Begriffe in Sprachkursen ohne Kennzeichnung `religionsbezug`
   - Sprachausgabe für Koran, Hadith, Bittgebete, Einträge mit Religionsbezug, den Wissenskurs und den Koran-Arabisch-Pfad (ADR 0039 Nr. 7)
   - KI zur Laufzeit in der App (ADR 0042)
4. **Quellenpflicht im Wissenskurs:**
   - Jede Aussage hat mindestens einen Beleg (`lernapp_beleg`): Werk, Kitab/Bab/Fasl, Ausgabe, Band und Seite, Art. KI-Aussagen sind immer `sinngemaess` (eigene Worte, keine Übersetzung, Nr. 3); `woertlich` nur für Stellen, die Menschen übersetzt haben. Fundstelle zusätzlich als OpenITI-Version-URI mit Meilenstein, wenn vorhanden.
   - Fiqh-Aussagen brauchen eine hanefitische Quelle, Glaubensaussagen eine maturiditische oder hanefitische.
   - Meinungsunterschiede innerhalb der Schule (Abu Hanifa, Abu Yusuf, Muhammad; Meinung, nach der Fatwa gegeben wird) nur mit dem Feld `meinung`. Strittige Themen werden als solche ausgewiesen.
   - Quellenkreis: die benannten Werke nach KERN 4.0 §2.4 (Plan §3.3) in den Ausgaben nach ADR 0045 Nr. 12. İlmihal-Werke (Diyanet/TDV, Bilmen, IGMG) dienen Menschen nur zum Abgleich, als Seitenverweis ohne Text (LM-05).
   - Der Agent erhält Passagen aus der lokalen Arbeitskopie. Ohne gelieferte Passage keine Aussage. Kein arabischer Text im Entwurf.
   - Verse und Hadithe nur als Verweis (`sure:vers`, `sammlung:nummer`). Angezeigt werden sie aus der Datenbank mit freigegebener Übersetzung, sonst mit „Übersetzung folgt“.
   - Prüfer: Pflichtfelder, Werk aus dem Quellenregister, passende Schule. Ob Passage und Zitatbereich in der lokalen Arbeitskopie existieren (SHA-256 aus `web/daten/hanafi-quellen/QUELLE.md`), prüft das Werkzeug lokal, weil der Text nicht im Repository liegt. Im CI laufen nur die Formalien.
5. **Zwei Freigaben:**
   - Ein Baustein des Wissenskurses (Aussage, Beleg, Quizfrage, Tipp) ist `geprueft`, wenn zum **aktuellen** `inhaltHash` mindestens zwei Prüfungen `ok` vorliegen,
     - von zwei verschiedenen Personen mit der Rolle `religioese_pruefung`,
     - von denen keine den aktuellen Stand verfasst hat (Verfasser ist der KI-Lauf `ki:<lauf>` oder die Person der Redaktion, die einen Änderungsvorschlag eingearbeitet hat),
     - und mit dem Häkchen „Beleg am Original geprüft“ (`belegeGeprueft`) je Beleg.
   - Prüfende bearbeiten nicht selbst. Sie urteilen `ok`, `Änderungsvorschlag` oder `ablehnen`; die Redaktion (`lernapp.bearbeiten`) arbeitet Vorschläge ein. Jeder neue Hash setzt beide Freigaben zurück.
   - Die Administration kann Freigaben nicht ersetzen: `lernapp.religioes.pruefen` steht in `NIE_PER_ADMINISTRATION`.
   - Eine Lektion ist nur sichtbar, wenn **alle** ihre Bausteine geprüft sind. Sie trägt „Nach hanefitischer Lehre, geprüft von zwei Gelehrten der Gemeinde am [Datum]“ ohne Namen (O-8, LM-20); jede Aussage hat eine aufklappbare Quellenzeile.
   - Jeder Schritt steht zusätzlich in der Tabelle `freigabe`. Warteschlange: `/verwaltung/lernapp/religioes`, außerdem `/verwaltung/freigaben`.
   - Was Prüfende neben der Aussage sehen, entscheiden Menschen (Lizenzbericht §2, OpenITI). Standard bis dahin: die Fundstelle; geprüft wird an der eigenen Ausgabe.
   - **Koran-Arabisch:** Bedeutungen kommen nur aus `quran_wortbedeutung`, von Menschen verfasst (MN-05). Im Lern-App-Pfad erscheinen sie erst mit zwei Freigaben zum aktuellen Stand nach den Regeln oben (genehmigter Plan §3.1: „wie Wissen mit zwei Freigaben“; O-11, LM-13; L3-E07). Die Pipeline schreibt keine Bedeutungen, sie erzeugt nur die Arbeitsliste für die Hoca. Die eigene Wurzeltabelle (ADR 0045 Nr. 13) prüft die benannte Lehrkraft fachlich; sichtbar wird sie ebenfalls erst mit zwei Freigaben (L0-E12, LM-31).
   - **Sprachkurse:** Einträge mit Kennzeichen `religionsbezug` brauchen ebenfalls zwei Freigaben nach den Regeln oben (genehmigter Plan §2.3: „Freigabe ×2“; O-2). Bis dahin sind sie nicht sichtbar, auch nicht über den Schalter `lernapp_ungeprueft` (ADR 0041 Nr. 11); die Sprachstichprobe ersetzt sie nie. Die Liste erlaubter Alltagsformeln braucht zwei Freigaben; vorher sind die Formeln gesperrt, jede Änderung der Liste setzt zurück (ML-03, LM-09).
6. **Arabisch nur aus Daten oder aus erlaubten Sprachkurs-Dateien** (`_gemeinde/werkzeuge/religion-pruefung.mjs`, gemeinsame Datei, nur der Orchestrator):
   - Neue Erlaubnisse (Eintrag mit Begründung in `ERLAUBT`, KERN 4.0 §3), jeweils nur zusammen mit dem Wächter unten:
     - `web/messages/lernapp/ar.json` (Oberfläche)
     - `web/inhalte/lernapp/{sprache,uebersetzung,aussprache}/**` (Hocharabisch der Sprachkurse; Übersetzungen, Glossen und Tipps der Richtungen mit Arabisch)
     - `web/messages/verwaltung/lernapp-pruefung.json`, nur bei dreisprachiger Prüfoberfläche (ADR 0041 Nr. 10)
     - die eigene Koran-Wurzeltabelle, nur gepinnt in `web/daten/` nach fachlicher Prüfung (ADR 0045 Nr. 13)
   - **Nie** erlaubt: `web/inhalte/lernapp/islam/**`, `web/inhalte/lernapp/koran/**` (nur Verweise), Komponenten und Werkstatt-Dateien. In `_lernapp/**` stehen arabische Wörter nur in Umschrift.
   - Wächter in den erlaubten Lern-App-Dateien (Normalisierung ohne Harakat und Tatweel, Alif-Formen vereinheitlicht):
     1. **Formel-Lexikon** (normalisiert ohne Harakat, dazu deutsche und türkische Religionsbegriffe): Treffer verlangen das Kennzeichen `religionsbezug`, sonst rot.
     2. **Koran-n-Gramm:** mindestens 4 aufeinanderfolgende normalisierte Wörter aus dem Tanzil-Text ergeben rot.
     3. **Hadith-n-Gramm:** mindestens 4 aufeinanderfolgende normalisierte Wörter aus dem Bukhari-Bestand ergeben rot (genehmigter Plan §3.4, KERN 4.0 §3, O-10).
     - Eingaben: `web/daten/tanzil`, `web/daten/hadith`. Ausnahmen nur über die Liste erlaubter Alltagsformeln mit zwei Freigaben (Nr. 5).
   - Arabische Einträge in Formel-Lexikon und Formel-Liste schreibt kein Agent. Sie stammen aus `web/daten/**` oder von der religiösen Prüfung und liegen gepinnt in `web/daten/` `[Ordnername festlegen]`.
7. **Herkunft:** Jeder KI-Eintrag trägt `quelle: 'ki:<lauf>/<modell>/<promptVersion>'`. Von Menschen korrigierte Einträge sind eingefroren (`menschlichGeprueft`). Ein neuer KI-Import überschreibt sie nicht, sondern legt einen Konflikt an.

## Fortschreibung durch Spike S8 (20.10.2026, Beleg `_lernapp/belege/S8-quellen-lokal.md`)

1. **Nr. 4, Belegform:** `werk`, `kapitel` in Umschrift, `ausgabe`, Band/Seite der Vorlage (±1), `passage` (Kennung `werk.msNNNN` aus dem Passagen-Index), `fundstelle` als OpenITI-URI mit Meilenstein, `passageSha256Text`. Der Zitatbereich bezieht sich auf den bereinigten Passagentext; den Prüfer `beleg-pruefe` baut L6.
2. **Nr. 5, Prüfoberfläche:** Prüfende sehen die Fundstelle mit Band und Seite, keinen arabischen Text, bis LM-04 entschieden ist.
3. Quellenkreis und Abdeckung: ADR 0045, Fortschreibung S3/S8 Nr. 7.

## Fortschreibung nach der Sicherheitsprüfung S-L1 (20.10.2026, `_lernapp/berichte/s-l1.md` M-3)

1. **Ein Kern für alle Prüfstellen:** `web/src/lib/lernapp/waechter/kern.mjs` (reines JavaScript, ohne arabische Schrift) nutzen
   das Werkzeug `_gemeinde/werkzeuge/religion-pruefung.mjs`, der Import und `pnpm lernapp:pruefen`
   (`web/src/lib/lernapp/inhalt/religion.ts`). So greift der Wächter auch im Vercel-Bau, in dem `_gemeinde/` fehlt; die
   Eingaben der Verwaltung (L3-06) rufen dasselbe Modul.
2. **Verschleierung:** Die Normalisierung entfernt alle Format- und kombinierenden Zeichen (u. a. U+00AD, U+034F, U+180E) sowie
   U+2028/U+2029 und vereinheitlicht Ha-, Ya- und Kaf-Formen. Aufgelöst werden Codepunkt-Folgen, HTML-Entitäten,
   `fromCharCode`/`fromCodePoint` und Prozent-Kodierung. Im Wissenskurs, im Koran-Pfad und in Textdateien der Werkstatt ist
   auch verschleierte arabische Schrift Rot.
   - Vermerk L3-02 (Gegenprüfung L2/L3-02, 21.10.2026): U+2028/U+2029 werden nicht mehr nur entfernt, sondern trennen Wörter
     wie ein Leerzeichen; enthält ein Text solche Trenner, prüft der Wächter zusätzlich die Lesart ohne Trenner
     (`woerterVarianten` in `kern.mjs`). Codepunkte und Entitäten in Daten- und Textdateien außerhalb der Erlaubnisse sind
     Rot (`DATENDATEI` in `_gemeinde/werkzeuge/religion-pruefung.mjs`). Tests: `tests/unit/lernapp/religion-waechter.test.ts`.
3. **4-Gramme über Zeilen und Felder:** Der Abgleich läuft über den Wortstrom der ganzen Datei bzw. über alle Texte einer
   Inhaltsdatei (Sätze einer Lektion, Dialogzeilen).
4. **Formel-Lexikon (KERN 4.0 §3 a) „fail closed“:** Ein Treffer verlangt `religionsbezug: true`; sonst bricht der Import ab
   und `lernapp:pruefen` meldet einen Befund. Texte ohne Kennzeichen (Thema, Kann-Beschreibung, Lektionsziel) und die
   Oberfläche `ar.json` dürfen nie treffen. Eine Übersetzung erbt das Kennzeichen ihres Zieleintrags.
   - Arabische Einträge sind nur Verweise in den Tanzil-Text (Sure:Vers, Wörter); sie werden zur Laufzeit aus `web/daten`
     aufgelöst. Startliste: Basmala, Gottesname, Hamdala, inschallah, maschallah, subhanallah, Takbir, Friedensgruß, Sure.
     Die Eulogie fängt der Hadith-4-Gramm-Abgleich.
   - Deutsche und türkische Begriffe stehen als Startliste mit ausdrücklichen Endungen in `kern.mjs`.
   - Bestätigen und ergänzen: religiöse Prüfung bzw. Redaktion (LM-09). Danach liegt die geprüfte Liste gepinnt in
     `web/daten/` (Ordnername: Entscheidung der Menschen).

## Fortschreibung Vorschau des Wissenskurses (27.10.2026, `_lernapp/ENTSCHEIDUNGEN.md` L3-E22)

1. **Nr. 5, Ausnahme auf Zeit per Schalter:** Mit `lernapp_wissen_vorschau` (ADR 0035, Fortschreibung Lern-App 3) liefert der
   Paketbau Lektionen ohne zwei Freigaben als **Entwurf** aus (`paket/wissen.ts`, `freigabe.ts` `wissenVorschauSichtbar`):
   Vermerk `entwurf: true` statt des Prüfvermerks, Paket und Verzeichnis `vorschau: true`, in der Oberfläche „Entwurf zur
   Prüfung“ (keine geprüfte Lehrmeinung). Nie sichtbar bleiben zurückgezogene Bausteine, Bausteine mit Einwand einer Person
   mit der Rolle zum aktuellen Hash, Aussagen ohne Beleg und Inhalte, die KI-Regel 2 sperrt. Die strenge Regel (Nr. 5) gilt
   unverändert, sobald der Schalter aus ist; vor dem öffentlichen Start ist er aus oder alles geprüft.
2. **Import:** Die Inhaltsdateien `web/inhalte/lernapp/islam/**` kommen unverändert in die Datenbank
   (`inhalt/wissen-import.ts`), Status „Entwurf“, ohne Prüfungen; jede Änderung setzt die Freigaben des Bausteins zurück
   (neuer Hash). Das gilt auch für die Belege: Ihre Hashes gehen in den Hash der Aussage ein, ein neuer, geänderter oder
   entfallener Beleg ist eine Änderung der Aussage. Ein in der Datenbank abgeschalteter Kurs `islam` bleibt beim Import aus.
   Werk- und Verfassernamen stammen aus `web/daten/hanafi-quellen/QUELLE.md`.

## Alternativen

- ADR 0030 unverändert, also kein KI-Entwurf im Wissenskurs: verworfen durch die Nutzerentscheidung. ≈ 1.400 Aussagen von Hand wären im Lauf nicht zu schaffen.
- Eine Freigabe mit Vier-Augen-Prinzip wie ADR 0030: verworfen. Der Nutzer verlangt zwei Prüfer je Baustein.
- KI-Entwurf aus Modellwissen ohne gelieferte Passagen: verworfen. Erfundene Belege wären nicht erkennbar.
- Prüfende bearbeiten direkt: nicht gewählt. Wer ändert, wäre Verfasser und könnte nicht mehr freigeben; dann bräuchte jede Änderung eine dritte Person.
- KI-Vorschläge für Koran-Wortbedeutungen mit anschließender Freigabe: verworfen (bleibt menschlich, MN-05).
- Für Koran-Wortbedeutungen im Lern-App-Pfad nur der Status „geprüft“ nach ADR 0030 (eine Freigabe im Vier-Augen-Prinzip): nicht als Standard gewählt. Der genehmigte Plan §3.1 verlangt „wie Wissen mit zwei Freigaben“ (offene Frage unten).
- Religionsbezogene Sprachkurs-Einträge mit nur einer Freigabe (O-2) und ein Hadith-n-Gramm erst ab 5 Wörtern (O-10), wie im Entwurf der Verfeinerung vorgeschlagen: nicht gewählt. Der genehmigte Plan §2.3 und §3.4 nennt „Freigabe ×2“ und 4 Wörter.
- Arabische OpenITI-Passagen in der Verwaltung neben der Aussage (`_lernapp/PLAN.md` §6.7 Nr. 6): zurückgestellt bis zur Entscheidung der Menschen (Lizenz CC BY-NC-SA 4.0).

## Folgen

- ADR 0030 bekommt im Status den Vermerk „Nr. 4 für die Lern-App fortgeschrieben durch ADR 0040“. KERN (Lern-App) übernimmt Nr. 2–6.
- Tests:
  - Unit `freigabe-zwei`: zwei verschiedene Prüfende, Verfasser ausgeschlossen, Bindung an den Hash, Rücksetzen, Administration zählt nicht.
  - Unit `religion-waechter`: Formeln, Koran- und Hadith-n-Gramme mit Positiv- und Negativproben aus `web/daten`.
  - Integration: eine Freigabe → unsichtbar, zwei → sichtbar, für Wissensbausteine, Sprachkurs-Einträge mit `religionsbezug`, Formelliste und Koran-Bedeutungen; Lektion nur vollständig; keine Sprachausgabe für Koran und Hadith.
- Prüfaufwand ≈ 200 h für Imam und Hoca. Veröffentlicht wird gestaffelt, Reinheit und Gebet zuerst (LM-03; mindestens zwei Prüfkonten, MN-24).
- Abnahme: Z-L02 (0 sichtbare Bausteine ohne zwei Freigaben), Z-L03 (Koran-Pfad nur freigegebene Bedeutungen), Z-L10 (`religion-pruefung` und Wächter 0).
- Schwelle des Hadith-n-Gramms: 4 Wörter wie im genehmigten Plan §3.4. Fehlalarme werden gemessen und nur über die Liste erlaubter Alltagsformeln (zwei Freigaben) ausgenommen; eine höhere Schwelle bräuchte eine Entscheidung der Menschen.
- OFFENE FRAGE: Rahmenpläne (`web/inhalte/lernapp/rahmen/`) stehen nicht in `ERLAUBT`; arabische Beispiele dort nur in Umschrift oder als Verweis auf Sprachkurs-Einträge. Falls arabische Schrift nötig ist, ergänzt der Orchestrator die Erlaubnis samt Wächter.
- OFFENE FRAGE: Reicht für Koran-Wortbedeutungen im Lern-App-Pfad der Status „geprüft“ nach ADR 0030 (Imam/Vorstand, LM-13 b)? Standard bis zur Antwort: zwei Freigaben nach dem genehmigten Plan §3.1; bis dahin zeigt der Pfad nur Wortformen, deren Bedeutung zwei Freigaben hat.
- OFFENE FRAGE: Sollen Prüfende arabische Passagen aus OpenITI in der Verwaltung sehen? (Menschen; Standard: nein, nur Fundstelle.)
- OFFENE FRAGE: Wer einen Stand verfasst, zählt nicht als Freigabe. Bei KI-Entwürfen reichen Imam und Hoca (MN-24); bei von Menschen verfassten Inhalten (Koran-Bedeutungen der Hoca, MN-05) braucht es ein drittes Konto mit `religioese_pruefung` (LM-03). Bis dahin bleiben solche Inhalte im Lern-App-Pfad unsichtbar.
