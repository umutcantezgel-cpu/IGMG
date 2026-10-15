# S2/S3 – Sicherheitsprüfung Gemeinde-Plattform: Befunde, Behebung, Restrisiken (Nacharbeit Stufe C, Paket N4)

- Stand: Arbeitsbaum-Branch `worktree-agent-a2e7dbaf03ceef09a`, Basis `claude/trusting-lovelace-6nfolz` @ `401366d`
  (vollständig hineingemergt). Behebung in drei Zwischenständen und dem Abschluss-Commit dieses Berichts:
  - `c38977e` Chat und Kinderschutz (S2a-1, -2, -3, -5, -7, -8)
  - `2759a4a` Konten, Schutzrollen, Freigaben, Passwort-Links, Sicherung (S2a-4, -6; S2b-1 … -4, -6; S3-1 … -4)
  - `c56bc6e` generierte Rechte-Matrix der Gemeinde-Plattform, Seitenfreigabe, Schalter `konten` (S2b-5, S3-3)
  - Nachtrag nach der Gegenprüfung der Behebung: Commit „Nacharbeit Stufe C, N4: Mangel der Gegenprüfung behoben – …“
    (Abschnitt 2.2; M-2/S2b-3 Start-Ausnahme, S2b-4 Zweitadresse und stilles Entfernen der Eltern)
- Migration `0013_sicherheit_s2_s3` (Tabelle `rollen_antrag`; Spalten `chat_kanal.kinderschutz_pause`,
  `chat_meldung.gemeldete_person`, `chat_meldung.gegen_leitung`; Bestandsdaten nachgetragen, archivierte Gruppen
  nachträglich geschlossen) und `0014_vier_augen_n4` (`rollen_antrag.art` Vergabe/Entzug, auch für
  `religioese_pruefung`; `einladung.freigabe_noetig`, `freigegeben_von`, `freigegeben_am`, `sprache`;
  `eltern_kind.beenden_beantragt_von`, `beenden_beantragt_am`; Start-Merker `einstellung` „schutzrollen_start“ für
  Installationen mit Leitung).
- **Urteil:** Alle 11 gegengeprüften Befunde ab „mittel“ (darunter 3× „hoch“) sind behoben und durch Regressionstests
  belegt. Die Gegenprüfung der Behebung fand zwei Umgehungen (M-2/S2b-3 über die Start-Ausnahme; S2b-4 über eine eigene
  Zweitadresse und das stille Entfernen der Mutter); beide sind behoben und mit den Wegen des Prüfers als
  Regressionstests belegt (Abschnitt 2.2). Von den 11 Befunden „niedrig“ ohne Gegenprüfung sind 6 behoben, 1 teilweise,
  4 offen (Restrisiken unten). **Offen hoch/kritisch: 0.**

---

## 1 Prüfumfang je Linse

| Linse | Gegenstand | Vorgehen der Prüfer |
|---|---|---|
| **S2a** – Chat, Kinderschutz, Gruppenrechte | Gruppen- und Elternkanal (S-01…S-18), Moderation und Meldung (D-02, D-03), Pausen, Ratengrenze S-13, Löschlauf S-12, Gruppenkontext (`ladeGruppenKontext`, `darfInGruppe`), Archivieren von Gruppen, Leitungszuweisung, Push an Gruppen, Einwilligung D-11 | Code-Pfade von Route/Action bis Dienst; Wegwerf-Tests gegen PGlite mit echtem Better Auth (Scratchpad `s2a/`, `s2a4/`); Nachweise S2a-1 … S2a-6 |
| **S2b** – Konten, Rollen, Freigaben | Eltern-Aktionen (Kinderzugang, Einwilligungen), Einladungen (Gemeinde und Verwaltung), Rollenvergabe (M-2 aus S1), religiöse Freigabe (Vier-Augen, ADR 0030), CMS-Freigaben und Revisionen, Kontolöschung, Newsletter-Bestätigung | Code-Pfade; Wegwerf-Tests `s2b/t1` … `s2b/t4` mit echtem Better Auth |
| **S3** – Betrieb und Anmeldung | Better Auth (`verification`, Passwort-Reset), Verwaltungs-Anmeldung und Schalter `konten`, lokaler Helfer-Server (`betrieb/lokal`: Sicherung, Probe, Spiegel, Takt, Überwachung, Compose), Medienauslieferung, Vorschau-Umgebung | Code und Konfiguration; Wegwerf-Test Passwort-Reset; Shell-Simulation der Sicherung |

Jeder Befund ab „mittel“ wurde von einer zweiten Instanz gegengeprüft (Versuch, ihn zu widerlegen; Verdikt mit Schwere).
Befunde „niedrig“ sind ungeprüft übernommen.

## 2 Befunde, Verdikt und Behebung

Schwere: Prüfer → Gegenprüfung. „Test“ nennt den Regressionstest im Repository.

| Nr. | Befund | Schwere | Verdikt | Behebung | Commit | Test |
|---|---|---|---|---|---|---|
| S2a-1 | Archivierte Gruppe: Kinder/Eltern chatten weiter, Leitung ausgesperrt | hoch → **mittel** | echt | behoben | `c38977e` | `sicherheit-s2-chat.test.ts` „S2a-1“; `gruppen-wahrheitstafel.test.ts` (archivierte Gruppe) |
| S2a-5 | D-02: Meldung gegen Lehrkraft nach dem Löschlauf für sie sichtbar und schließbar | hoch → **hoch** | echt | behoben | `c38977e` | `sicherheit-s2-chat.test.ts` „S2a-5“ |
| S2a-2 | Leitung hebt die Kanalpause der Rolle kinderschutz auf | hoch → **hoch** | echt | behoben | `c38977e` | `sicherheit-s2-chat.test.ts` „S2a-2“ |
| S2a-4 | Administration (auch Bildung) macht sich zur Lehrkraft/Aufsicht/zum Elternteil | mittel → **mittel** | echt | behoben (Rest: Zweitkonto, s. 4) | `2759a4a` | `sicherheit-s2-konten.test.ts` „S2a-4“ |
| S2a-3 | Ratengrenze S-13 mit parallelen Anfragen überschreitbar | mittel → **mittel** | echt | behoben | `c38977e` | `sicherheit-s2-chat.test.ts` „S2a-3“ (40 parallel → 10) |
| S2b-2 | Elternteil übernimmt/löscht eigenes Konto einer/eines Jugendlichen ab 16 | hoch → **hoch** | echt | behoben | `2759a4a` | `sicherheit-s2-konten.test.ts` „S2b-2“ |
| S2b-4 | Bildung macht sich per Eltern-Einladung zum sorgeberechtigten Elternteil | mittel → **mittel** | echt | behoben; nach Gegenprüfung auch über Zweitadresse und stilles Entfernen der Eltern (2.2) | `2759a4a`, N4-Nachtrag | `sicherheit-s2-konten.test.ts` „S2b-4“; `sicherheit-n4-vier-augen.test.ts` „(B)“ |
| S2b-1 | Vier-Augen-Prinzip über die Warteschlange „Freigaben“ umgehbar | mittel → **mittel** | echt | behoben | `2759a4a` | `sicherheit-s2-freigabe.test.ts` |
| S2b-3 | M-2 umgehbar: Administration gibt sich `leitung`, vergibt `kinderschutz` | mittel → **mittel** | echt | behoben (Vier-Augen); nach Gegenprüfung auch über Entzug/Löschen der Leitung und Start-Ausnahme (2.2) | `2759a4a`, N4-Nachtrag | `sicherheit-s2-konten.test.ts` „S2b-3“; `sicherheit-n4-vier-augen.test.ts` „(A)“; `verwaltung-benutzer.test.ts` (M-2); `rechte-matrix.test.ts` (`rollenAntragEntscheiden`) |
| S3-1 | Passwort-Reset-Token im Klartext; Leserolle reicht zur Kontoübernahme | mittel → **mittel** | echt | behoben | `2759a4a` | `sicherheit-s3.test.ts` |
| S3-2 | Sicherung meldet „ok“ trotz Fehlschlag, Rotation löscht gute Sicherungen; Spiegel lädt private Blobs nie | mittel → **mittel** | echt | behoben | `2759a4a` | `tests/unit/betrieb-sicherung.test.ts` |
| S2a-6 | D-11 Übergang: Eltern heben den Widerruf der/des Jugendlichen auf | niedrig | – | behoben | `2759a4a` | `sicherheit-s2-konten.test.ts` „S2a-6“; `mein-bereich-lernen.test.ts` (Übergang) |
| S2a-7 | Leitung entfernt eigene Nachrichten spurlos („senden und löschen“) | niedrig | – | behoben (ohne Aufbewahrungsfrist, s. 4) | `c38977e` | `sicherheit-s2-chat.test.ts` „S2a-7“ |
| S2a-8 | Chat-Push an Kinder ohne/nach widerrufener Einwilligung „Gruppenchat“ | niedrig | – | behoben | `c38977e` | `mein-bereich-lernen.test.ts` (Push an eine Gruppe) |
| S2b-5 | Seite mit Vers/Hadith ohne religiöse Prüfung (Revision + offener Redaktionsantrag) | niedrig | – | behoben | `c56bc6e` | `sicherheit-s2-freigabe.test.ts` (Seite) |
| S2b-6 | Löschung des Kinderzugangs über den Widerruf lässt Chat-Texte stehen | niedrig | – | behoben | `2759a4a` | `sicherheit-s2-konten.test.ts` (Kinderzugang) |
| S2b-7 | Newsletter-Bestätigung und -Abmeldung per GET (Link-Scanner) | niedrig | – | **offen** | – | – |
| S3-3 | Schalter `konten` umgehbar über Verwaltungs-Anmeldung und -Reset | niedrig | – | behoben | `2759a4a`, `c56bc6e` | `sicherheit-s3.test.ts`; `sicherheit-s2-chat.test.ts` (Schalter) |
| S3-4 | Lokaler Server: jeder Container jedes Geheimnis, Token in der Prozessliste | niedrig | – | **teilweise** | `2759a4a` | `docker compose config` (s. 5) |
| S3-5 | Keine Sicherheitsmail bei 2FA-Abschaltung, Passwortänderung, Reset | niedrig | – | **offen** | – | – |
| S3-6 | Rezitations-Vereinbarung (Vertrag) als öffentliches Medium | niedrig | – | **offen** | – | – |
| S3-7 | Vorschau: Personendaten-Schalter an, Neon-Zweig und Blob-Speicher geteilt | niedrig | – | **offen** (Einrichtung) | – | – |

### 2.1 Behebung im Einzelnen

**S2a-1 Archivierte Gruppe.** `ladeGruppenKontext` (`src/lib/rechte/gemeinde.ts`) nimmt für eigene Gruppen und Gruppen der
Kinder nur noch aktive Gruppen auf (wie schon für die Leitung). `ladeKanal` (`src/lib/chat/dienst.ts`) liest den Status
der Gruppe; in einer archivierten Gruppe gilt der Kanal als archiviert. `speichereGruppe` (`src/server/actions/gruppen.ts`)
archiviert beim Archivieren beide Kanäle und beendet laufende Mitgliedschaften (heute); beim Wiederöffnen öffnen sich die
Kanäle wieder (eine Pause der Rolle kinderschutz bleibt). Push geht nicht mehr an archivierte Gruppen. Die Migration
schließt bereits archivierte Gruppen nachträglich. Test: weder Lesen noch Schreiben über Dienst, Abruf-Route
`GET /api/mein/chat/<kanal>` (404) und Action `sendeChatNachricht`.

**S2a-5 D-02 nach dem Löschlauf.** Die Meldung hält die gemeldete Person (`chat_meldung.gemeldete_person`) und ob sie zur
Leitung gehört (`gegen_leitung`) fest – unabhängig von der löschbaren Nachricht. `offeneMeldungen` und
`offeneMeldungenZahl` (`src/server/queries/mein-bereich/unterricht.ts`) zeigen der Leitung nur Meldungen über bekannte
Lernende oder Eltern: nie über eigene Nachrichten, nie über jemanden aus der Leitung (bei der Meldung oder heute), nie
über Unbekannte. Kontext (`meldungsKontext`) und Abschluss (`moderiereMeldung`) laufen nur über diese Auswahl. Alles
andere sieht nur kinderschutz. Der Text der Moderationsseite sagt das (de/tr/en). Bestand: Migration füllt die Spalten
aus den noch vorhandenen Nachrichten nach; Meldungen ohne bekannte Person bleiben bei kinderschutz.

**S2a-2 Pause der Rolle kinderschutz.** `chat_kanal.kinderschutz_pause` vermerkt die Pause durch kinderschutz.
`setzeKanalPause` lehnt dann jede Änderung der Leitung ab (`keinRecht`, frisch in der Transaktion geprüft); die
Moderationsseite zeigt statt „fortsetzen“ den Hinweis (de/tr/en). Jedes Fortsetzen durch die Leitung erzeugt eine
Hinweis-Mail ohne Inhalt an kinderschutz (neue Vorlage `hinweis`, `planeHinweis` in `src/lib/mail/ausgang.ts`).

**S2a-3 Ratengrenze.** `sendeNachricht` zählt und speichert in einer Transaktion unter
`pg_advisory_xact_lock(hashtext('igmg:chat-rate:<konto>'))`. Test: 40 gleichzeitige Aufrufe → 10 gespeichert, 30 „rate“.

**S2a-4 / S2b-4 Administration und Bildung in Gemeinde-Rollen.** NIE_PER_ADMINISTRATION gilt jetzt auch über Umwege:
`gemeindeEinladen` lehnt die eigene Adresse und Adressen von Konten mit der Rolle Administration ab;
`uebernimmEinladung` lehnt Elternteil/Lehrkraft/Schüler für Konten mit Administration ab (de/tr/en-Hinweis);
`gemeindeRollenSpeichern` vergibt solchen Konten keine Kontoart mit Gruppenzugang; `leitungZuweisen` lehnt das eigene
Konto und Konten mit Administration ab. Einladungen mit Bezug auf ein Kind (Eltern, Schüler ab 16) geben keinen Link mehr
an die Verwaltung zurück – nur per Mail an die eingeladene Adresse. Jede Leitungszuweisung und jede Einladung mit
Kindbezug geht als Hinweis ohne Namen an alle Konten mit Leitung oder Kinderschutz (`SCHUTZROLLEN_EMPFAENGER`). Bei der
Annahme einer Eltern-Einladung erfahren die bisherigen sorgeberechtigten Eltern von dem neuen Elternkonto, beim
Kinderpasswort die übrigen Eltern (neue Kontomails `konto-elternbezug`, `konto-kinderpasswort`, de/tr/en). Neu:
Verwaltungsaktion „Eltern-Kind-Bezug beenden“ (`elternBezugBeenden`, Lernende › Eltern, mit Audit und Hinweis).

**S2b-2 Eigenes Konto ab 16.** `bezug()` (`src/server/actions/kinder.ts`) unterscheidet Kinderzugang (`ist_kind`) und eigenes
Konto. `kinderPasswortSetzen` nur für Kinderzugänge und nur vor D-11 („eigene“), sonst `eigenesKonto`. Die Einwilligung
„Kinderzugang“ greift für eigene Konten nicht (weder Erteilen noch Widerruf mit Löschung). Die Elternseite blendet
Zugang und diese Einwilligung für eigene Konten aus (de/tr/en). `kinderzugang()` liefert nur Kinderzugänge.

**S2b-6 Löschen des Kinderzugangs.** Der Widerruf „Kinderzugang“ löscht über `loescheGemeindeKonto` (Chat-Texte als
Platzhalter ohne Text, Moderationsprotokoll, Sitzungen, Push-Abos, Links; nie Verwaltungskonten).

**S2a-6 D-11-Übergang.** Ab dem 16. Geburtstag erteilen Eltern für Gruppenchat und Push nichts Neues mehr (im Übergang nur
noch Widerruf); die Elternseite zeigt das.

**S2b-3 Schutzrollen (M-2).** Neues Modul `src/lib/rechte/schutzrollen.ts`: `leitung` und `kinderschutz` nie zusammen mit
`administration`, nie an sich selbst, und neu vergeben erst wirksam, wenn eine zweite Person bestätigt – mit wirksamer
Rolle Leitung oder Kinderschutz, ohne Administration, weder beantragend noch betroffen (`rollen_antrag`). Gilt für
„Rollen speichern“ und für Einladungen (Antrag bei der Annahme). Einzige Ausnahme: die allererste Leitung (Start).
Bestätigen/Ablehnen auf „Gemeinde im Blick“ und „Kinderschutz“ (`rollenAntragEntscheiden`); „Benutzer und Rollen“ zeigt
offene Anträge. Jeder Antrag und jede Vergabe geht als Hinweis an Leitung und Kinderschutz; Audit mit neuen Aktionen.

Nachtrag N4 zu S2a-4/S2b-4: Seit der Gegenprüfung (2.2) gehen Eltern-Einladungen an Adressen außerhalb der
Voranmeldung erst nach Freigabe durch eine zweite Person hinaus, und „Eltern-Kind-Bezug beenden“ ist nur noch ein Antrag.

Nachtrag N4 zu S2b-3: Auch der Entzug von Leitung, Kinderschutz und religiöser Prüfung bei anderen Konten braucht die
zweite Person; die Start-Ausnahme gilt nur, solange noch nie eine Leitung wirksam war (dauerhafter Merker), siehe 2.2.

**S2b-1 Vier-Augen in „Freigaben“.** `entscheideFreigabe` liest vor dem Freigeben `verfasstVon` der Zielzeile
(gemeinsamer Zielselektor für alle sechs religiösen Inhaltsarten) und lehnt mit `vierAugen` ab; dieselbe Bedingung steht
im UPDATE (kein Wettlauf). Gilt damit auch für Elifbe-Lektionen und besondere Tage über die Warteschlange.

**S2b-5 Seitenfreigabe.** `revisionWiederherstellen` zieht einen offenen Antrag zurück (wie das Speichern).
`entscheideFreigabe` gibt einen Redaktionsantrag nicht frei, wenn der aktuelle Stand Verse/Hadithe enthält und die Seite
nicht veröffentlicht ist – der Antrag geht dann in die religiöse Prüfung (`religioesePruefungNoetig`).

**S3-1 Passwort-Links.** `authOptionen.verification.storeIdentifier` mit eigener Hash-Funktion: Kennungen nur als SHA-256,
das Präfix bis zum Doppelpunkt bleibt lesbar (gezieltes Verwerfen beim Sperren und Löschen funktioniert weiter).
Verwaltungs-Anmeldung, -Passwortlink und -Zwei-Faktor nur für Konten der Verwaltung (Rolle oder offener Antrag), nie für
`.invalid`; Gemeinde-Konten richten den zweiten Faktor weiter im eigenen Bereich ein (`mein-bereich`). `sichern.sh` sichert `session`, `verification`, `ratenbegrenzung`, `rate_limit` nur als Struktur. Der
Sicherungszugang geht nur an den Dienst `sicherung`. Anleitung zur Leserolle: `web/docs/BETRIEB.md` Abschnitt 6a.

**S3-2 Sicherung und Spiegel.** `sichern.sh` wertet jeden Schritt der Kette aus (Statusdateien statt `pipefail`, das nicht
jede Shell kennt), prüft Mindestgröße und age-Kopf, verwirft Fehlschläge und behält die N neuesten gültigen Sicherungen
(eine Fehlerserie löscht keine guten mehr); deutlich kleinere Sicherungen werden gemeldet. `probe.sh` prüft Mindestgröße
und Größe gegenüber der vorigen. `spiegel.mjs` lädt über `get(…, { access: 'private' })` mit Token, zählt Fehlschläge und
meldet dann „fehler“.

**S3-3 Schalter `konten`.** Neben Anmeldung/Reset (S3-1) prüfen auch die Chat- und Lern-Actions den Schalter.

**S3-4 Lokaler Server (teilweise).** `docker-compose.yml` gibt jedem Dienst nur seine Werte (Caddy nur `ECHTZEIT_DOMAIN`,
Centrifugo nur `CENTRIFUGO_*`); `WARTUNG_TOKEN` geht per Standardeingabe an curl, das SMTP-Passwort nicht mehr als
Argument; `.env.beispiel` nennt das Blob-Token richtig (lesen und schreiben).

### 2.2 Gegenprüfung der Behebung: zwei Umgehungen, behoben (Nachtrag N4)

Die Gegenprüfung der Behebung (Wegwerf-Nachstellung des Prüfers im Scratchpad, `n4-pruef/m2-start.test.ts`) fand zwei
Wege, auf denen die Behebung von S2b-3 und S2b-4 nicht wirkte. Beide Wege laufen jetzt als Regressionstests in
`tests/integration/sicherheit-n4-vier-augen.test.ts` (13 Fälle); die Nachstellung des Prüfers scheitert an allen drei
Stellen (Leitung des Vorstands bleibt, Drittkonto ohne Kinderschutz; keine Einladungsmail an die Zweitadresse).

**(A) M-2/S2b-3 über die Start-Ausnahme.** Weg: Die Administration entzog allen Leitungskonten die Rolle (Rollen
speichern oder Konto löschen, ohne Bestätigung und ohne Mail); danach galt „es gibt keine Leitung“ wieder als Start, eine
Leitung für ein Zweitkonto wirkte sofort und bestätigte Kinderschutz für ein Drittkonto. Behebung
(`src/lib/rechte/schutzrollen.ts`, `src/server/actions/benutzer.ts`):
- **Dauerhafter Start-Merker** `einstellung` „schutzrollen_start“: gesetzt, sobald die erste Leitung über die
  Start-Ausnahme wirkt, eine Leitung bestätigt wird oder eine Leitung aus dem Bestand angetroffen wird (Migration für
  vorhandene Installationen, sonst beim nächsten Vorgang unter der Sperre). Die Start-Ausnahme gilt nur ohne Merker und
  ohne Leitung – eine entzogene Leitung bringt sie nie zurück. Kein Formular schreibt oder löscht diesen Schlüssel.
- **Entzug nur im Vier-Augen-Prinzip:** Fallen `leitung`, `kinderschutz` oder `religioese_pruefung` bei einem anderen
  Konto weg, entsteht ein Antrag (`rollen_antrag.art = 'entzug'`); die Rolle bleibt bis zur Bestätigung durch eine
  zweite Person (Leitung oder Kinderschutz, ohne Administration, weder beantragend noch betroffen) wirksam. Wird die
  Rolle wieder gewählt, verfällt der Antrag. Eigene Rollen gibt man sofort ab; vor dem Start wirkt der Entzug sofort
  (es gibt noch niemanden, der bestätigen könnte). Leitung/Kinderschutz mit offenem Entzug bekommt keine Administration
  dazu (`entzugVorAdministration`).
- **Löschen erst nach dem Entzug:** `kontoLoeschen` lehnt Konten mit diesen Rollen ab (`fehler=schutzrolle`), geprüft in
  der Transaktion.
- **Mails:** Beim Antrag und beim vollzogenen Entzug eine Mail an die betroffene Person (neue Verwaltungsvorlage
  `betroffen`: Art und Rolle, keine Namen) und ein Hinweis an Leitung und Kinderschutz (`rollenentzug`,
  `rolle_entzogen`). Die Sperre eines Kontos mit Schutzrolle bleibt der Notweg, meldet sich aber ebenso
  (`betroffen`/`gesperrt`, Hinweis `schutzrolle_gesperrt`).
- Bestätigen/Ablehnen auf „Gemeinde im Blick“ und „Kinderschutz“ (Abschnitt „Bestätigen (Vier-Augen-Prinzip)“,
  Vergabe und Entzug getrennt beschriftet); „Benutzer und Rollen“ zeigt offene Entzüge. Audit:
  `benutzer.leitung_start`, `benutzer.rolle_entzug_beantragt`, `benutzer.rolle_entzogen`,
  `benutzer.rolle_entzug_abgelehnt`.

**(B) S2b-4 über eine eigene Zweitadresse; stilles Entfernen der Mutter.** Weg: Bildung lud eine eigene Zweitadresse
als Elternteil mit Kindbezug ein, nahm an und setzte das Kinderpasswort; vorher entfernte `elternBezugBeenden` die echte
Mutter ohne Mail und ohne Bestätigung. Behebung (`src/lib/konto/eltern-freigabe.ts`, `gemeinde-konten.ts`,
`src/lib/konto/einladung.ts`, `kinder.ts`, `kinderkonto.ts`):
- **Eltern-Einladung außerhalb der Voranmeldung wartet:** Stammt die Adresse nicht aus den Eltern-Adressen der
  Voranmeldung des Kindes (verschlüsselter Lerndatensatz, Groß-/Kleinschreibung egal), entsteht die Einladung ohne
  gültigen Link und ohne Mail (`einladung.freigabe_noetig`); Hinweis `elterneinladung` an Leitung und Kinderschutz.
  Erst wenn eine zweite Person (Leitung oder Kinderschutz, ohne Administration, nicht die einladende und nicht die
  eingeladene Adresse) bestätigt, entstehen neuer Token und Mail in der gewählten Sprache; Ablehnen widerruft.
  `ladeGueltigeEinladung` lässt wartende Einladungen nicht zu. Adressen aus der Voranmeldung (auch die Aufnahme) gehen
  wie bisher sofort hinaus.
- **Annahme prüft erneut:** Eine ältere Eltern-Einladung (vor N4) an eine fremde Adresse wird beim Annehmen (neues Konto
  oder Übernahme) zur Freigabe zurückgestellt (`freigabe`, Text de/tr/en); der alte Link gilt dann nicht mehr.
- **Bezug beenden nur auf Antrag:** `elternBezugBeenden` vermerkt nur den Antrag (`eltern_kind.beenden_beantragt_*`),
  schreibt dem Elternkonto in seiner Sprache (`konto-elternbezug-beenden`) und gibt Leitung und Kinderschutz einen
  Hinweis. Erst die Bestätigung durch eine zweite Person (nicht die beantragende, nicht das Elternkonto) beendet den
  Bezug, mit Mail an das Elternkonto (`konto-elternbezug-beendet`); Ablehnen nimmt den Antrag zurück. Die Kontoart
  Eltern lässt sich einem Konto nicht mehr still nehmen, solange es mit Kindern verknüpft ist (`fehler=elternBezug`).
- **Unbestätigter Bezug:** Kinderzugang anlegen (`kinderzugangAnlegen`, `legeKinderkontoAn`) und Kinderpasswort setzen
  verlangen einen bestätigten Eltern-Kind-Bezug (`bestaetigtAm`); bestätigt ist er nur nach Annahme einer Einladung an
  eine Adresse aus der Voranmeldung oder nach Freigabe (`unbestaetigt`, Text de/tr/en).
- Verwaltung: Lernende › Eltern zeigt „Wartet auf Bestätigung“, „Beenden beantragt“, „Noch nicht bestätigt“;
  Gemeinde-Konten zeigt wartende Einladungen. Audit: `einladung.freigabe_noetig`, `einladung.freigegeben`,
  `einladung.abgelehnt`, `lernende.elternbezug_beenden_beantragt`, `lernende.elternbezug_beenden_abgelehnt`.

Die Entscheidungen laufen über die bestehende Action `rollenAntragEntscheiden` (Feld `art`: `rolle`, `einladung`,
`bezug`) – dieselbe Rechteprüfung wie bisher (`verwaltung.betreten`, dann Leitung oder Kinderschutz ohne
Administration, weder beantragend noch betroffen); die Rechte-Matrix-Tests bleiben unverändert gültig.

## 3 Weitere Aufgaben des Pakets

- **Rechte-Matrix (Z-13-Lücke):** `tests/integration/verwaltung/rechte-matrix-gemeinde.test.ts` – generiert für die 17
  Verwaltungs-Action-Dateien seit b702c7c (80 Actions) × 11 Personengruppen (auch Leitung, religiöse Prüfung,
  Kinderschutz): Ein Spion auf `verlangeRecht` belegt die erste Rechteprüfung laut Code; nicht Zugelassene werden ohne
  Datenänderung abgewiesen; Vollständigkeitsprüfung über alle Exporte. 882 Fälle grün. Die neue Action
  `benutzer.rollenAntragEntscheiden` steht in der bestehenden Matrix (`rechte-matrix.test.ts`, Regel über die Matrix
  hinaus). Die Matrix selbst (`src/lib/rechte/matrix.ts`) brauchte keine neuen Aktionen.
- **Gruppen-Wahrheitstafel:** Soll-Tafel nach ADR 0026 (`tests/hilfen/gruppen-soll.ts`, unabhängig vom Code) gegen
  `darfInGruppe` (`tests/unit/rechte/gruppen-wahrheitstafel.test.ts`, 420 Fälle + Mehrfachbezug) und gegen
  `verlangeGruppenRecht` mit Datenbank (`tests/integration/gruppen-wahrheitstafel.test.ts`, 6 Kontoarten einschließlich
  Administration × 14 Aktionen × 3 Gruppen einschließlich archivierter × 3 Ziele = 756 Fälle). Keine Abweichung.
- **Lernkette:** `tests/integration/lernkette.test.ts` (aus der Stufe-C-Prüfung k2 übernommen): Voranmeldung → Aufnahme →
  Eltern-Einladung → Kinderzugang → Gruppe → Anwesenheit → Fortschritt; 7/7 grün.

## 4 Restrisiken

1. **Zweitkonten (S2a-4, S2b-3):** Wer Administration oder Bildung hat, kann weiterhin eine eigene Zweitadresse als
   Lehrkraft einladen (ohne Kindbezug gibt es den Link zurück) und dieses Konto als Aufsicht zuweisen; ebenso eine
   Einladung „Schüler ab 16“ an eine eigene Adresse (die Voranmeldung kennt keine Adresse der/des Jugendlichen). Das ist
   technisch nicht von einer echten Person zu unterscheiden. Gemildert durch: Hinweis-Mails an alle Konten mit Leitung
   und Kinderschutz bei jeder Leitungszuweisung und jeder Einladung mit Kindbezug, Sichtbarkeit der Leitung in der
   Gruppe, Audit. Eltern-Einladungen an Adressen außerhalb der Voranmeldung und das Beenden eines Eltern-Kind-Bezugs
   brauchen seit N4 eine zweite Person (2.2). Rest: Eine Voranmeldung, die Bildung selbst über das öffentliche Formular
   einreicht und aufnimmt, ist ein neuer Lerndatensatz mit „eigenen“ Eltern-Adressen – ihr Zugang beschränkt sich auf
   die Gruppe, der Bildung diesen Datensatz zuordnet (Hinweis an die Schutzrollen nur bei Einladungen über die
   Verwaltung, nicht bei der Aufnahme).
2. **Start der Schutzrollen:** Solange noch nie eine Leitung wirksam war, wirkt die erste vergebene Leitung sofort;
   danach (dauerhafter Merker) braucht jede Vergabe und jeder Entzug eine zweite Person. Gibt es niemanden mehr, der
   bestätigen kann (alle Leitungen und Kinderschutzkonten gesperrt oder per Entzug entfernt), bleiben neue Schutzrollen
   unbestätigt – Wiederherstellung dann nur über die Datenbank (Betrieb, MENSCHEN). Bestehende Konten, die schon
   Administration und Leitung zugleich haben, bestätigen nichts; beim nächsten Speichern ihrer Rollen verlangt die
   Oberfläche die Trennung (der Entzug der Leitung wartet dann auf die zweite Person). Die Sperre eines Kontos mit
   Schutzrolle bleibt ohne Bestätigung möglich (Notweg), meldet sich aber bei der Person und den Schutzrollen.
   Ende-zu-Ende-Tests, die ein Konto mit `leitung` per Einladung anlegen, brauchen eine frische Datenbank (sonst wartet
   die Rolle auf Bestätigung).
3. **Freigaben-Warteschlange:** zeigt eigene Einträge weiter mit „Freigeben“; der Server lehnt mit Hinweis ab.
4. **S2a-7:** Die Leitung entfernt eigene Nachrichten nicht mehr; eine Aufbewahrung entfernter Texte für kinderschutz
   (D-03 „außer bei Meldung“) ist nicht umgesetzt – andere Leitungspersonen entfernen weiter sofort.
5. **S3-4:** Das Vercel-Blob-Token des Spiegels darf schreiben und löschen (Vercel bietet kein reines Lesetoken);
   `lokal-meldung` nutzt weiter `WARTUNG_TOKEN`.
6. **Offen „niedrig“:** S2b-7 Newsletter per GET (Bestätigung/Abmeldung durch Link-Scanner möglich), S3-5 keine
   Sicherheitsmail bei 2FA-Abschaltung/Passwortänderung/Reset, S3-6 Rezitations-Vereinbarung als öffentliches Medium,
   S3-7 Vorschau-Umgebung mit Produktionsdaten und gemeinsamem Blob-Speicher (Einrichtung bei Vercel/Neon, MENSCHEN).
   Alle betroffenen Funktionen mit Personendaten sind in der Produktion per Schalter aus.
7. **Sicherung ohne Docker geprüft:** Die Skripte laufen im Unit-Test mit Platzhaltern für `pg_dump`/`age`; ein Lauf mit
   echtem Postgres und age im Gemeindehaus steht aus (LIESMICH Schritte 6–8).
8. **Übersetzungen:** neue tr/en-Texte sind Entwürfe und in `web/messages/neu-uebersetzt.json` gemeldet (Prüfung K-02),
   auch die N4-Texte (`konto.einladung.freigabe`, `konto.mails.elternbezugBeenden.*`, `konto.mails.elternbezugBeendet.*`,
   `kinder.detail.zugang.fehler.unbestaetigt`).

## 5 Prüfungen

| Befehl | Ergebnis |
|---|---|
| `pnpm typen` | grün |
| `eslint` und `prettier --check` (alle geänderten Dateien seit 401366d) | grün |
| `vitest run --project unit` | 96 Dateien, 1445 grün + 3 erwartet fehlgeschlagen |
| `vitest run --project integration` (vollständig, 1429 s) | 67 Dateien: 64 grün, 1 übersprungen, 2 rot mit 3 Tests – alle drei erwarteten noch das alte Verhalten vor S3-1 (Zwei-Faktor-Einrichtung unter /verwaltung für ein Konto ohne Verwaltungsrolle; Passwort-Link für eine Adresse ohne Konto). Tests auf das neue Verhalten umgestellt (`verwaltung/rechte-anmeldung`, `verwaltung-passwort`), danach beide Dateien 60/60 grün (2 Fälle neu). Während des Laufs ergänzt und danach einzeln grün: `sicherheit-s2-konten` 15/15, `verwaltung-benutzer` 17/17. Stand danach: 2617 Tests grün, 2 erwartet fehlgeschlagen, 4 übersprungen |
| neue Integrationstests einzeln | `sicherheit-s2-chat` 12, `sicherheit-s2-konten` 15 (davon 1 Versand aller neuen Mailvorlagen), `sicherheit-s2-freigabe` 4, `sicherheit-s3` 4, `gruppen-wahrheitstafel` 2 (756 Fälle), `lernkette` 7, `rechte-matrix-gemeinde` 882 – alle grün |
| `pnpm sprachen:pruefen` | grün (2951 Schlüssel de/tr/en; 4064 Verwaltung) |
| `node _gemeinde/werkzeuge/religion-pruefung.mjs` (Haupt-Checkout und Arbeitsbaum) | grün (5317 bzw. 5331 Dateien) |
| `docker compose config --quiet` (beide Profile, Kopie mit `.env.beispiel`) | rc 0 |
| **Nachtrag N4 (Gegenprüfung):** `pnpm typen`; `eslint` und `prettier --check` der geänderten Dateien | grün |
| N4: `sicherheit-n4-vier-augen` (neu, 13 Fälle: Weg des Prüfers zu M-2 und S2b-4, Entzug, Merker, Sperre, Freigabe, Altbestand, Bezug beenden, unbestätigter Bezug, Mailversand) | grün |
| N4: betroffene Integrationstests (`sicherheit-s2-konten`, `konten`, `mein-bereich-lernen`, `verwaltung-benutzer`, `gemeinde-konten`, `verwaltung-aufnahme`, `lernkette`, `datenschutz-konten`, `gruppen-wahrheitstafel`, `verwaltung/rechte-matrix`, `verwaltung/rechte-matrix-gemeinde`, `verwaltung-lernen`) | grün; Fixtures auf bestätigte Bezüge umgestellt, S2b-4-Fälle auf Freigabe bzw. Antrag |
| N4: `vitest run --project unit` | 96 Dateien, 1445 grün + 3 erwartet fehlgeschlagen |
| N4: `vitest run --project integration` (vollständig, 1497 s) | 67 Dateien grün, 1 übersprungen; 2630 Tests grün, 2 erwartet fehlgeschlagen, 4 übersprungen |
| N4: Nachstellung des Prüfers (`n4-pruef/m2-start.test.ts`) gegen den neuen Stand | alle drei Angriffe scheitern |
| N4: `pnpm sprachen:pruefen`; `node _gemeinde/werkzeuge/religion-pruefung.mjs` | grün |
| `sh -n`, `dash -n`, `bash -n` der Kit-Skripte; `node --check spiegel.mjs` | ok |
