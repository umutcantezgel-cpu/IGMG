# KERN 4.0 – Lern-App (Ergänzung)

Gilt **zusätzlich** zu `_gemeinde/KERN.md` (KERN 3.0, mit dem Vorlauf-KERN und `web/docs/MUSTER.md`). Für die Lern-App
(`/lern-app/**`, `web/src/{app/lern-app,components/lernapp,lib/lernapp}/**`, `web/inhalte/lernapp/**`, Verwaltung
`lernapp/**`) gilt bei Widerspruch dieser Kern. Außerhalb der Lern-App bleibt KERN 3.0 unverändert.
Leitidee: `AUFTRAG.md` §3. Begründungen: `ENTSCHEIDUNGEN.md` L3-E01…L3-E12, ADR 0037–0045.

## 1. Unantastbar
- Alles aus KERN 3.0 „Unantastbar“: Logos, Wortlaut der Rechtstexte, religiöse Quellenregeln, Logik der
  Moschee-Gebetszeiten, Prüfungen des Cockpits.
- **Website bleibt, wie sie ist:** Sprachen de/tr/en (`ar` nie in `routing.locales`), vorgerenderte Seiten, Elifbe, Koran-Leser,
  Hadith. Angeschlossen wird nur an den vorgesehenen Stellen: Station auf `/lernen`, Proxy-Ausnahme, Header-Regel,
  Ausnahme `igmg-lernapp-*` im Root-SW, eingegrenzte RTL-Regel in `globals.css`.
- **`web/daten/**` unverändert;** neue Datensätze nur gepinnt mit SHA-256 und `QUELLE.md` (ADR 0025/0045). Tanzil-Text nie
  verändert.
- **Ohne Laufzeit-KI** (weder Server noch Drittanbieter), ohne Drittanfragen, Tracker und Werbung. Keine Fatwa-Funktion,
  kein Frage-Bot.
- **Ohne Druck:** keine Herzen oder Leben, Ligen, globalen Ranglisten, Zeitgrenzen, Käufe, hochzählenden Zahlen.
  „Stufe abgeschlossen“ ist kein Zertifikat.
- **Lizenzen** (Lizenzbefund L0, L0-E01/E02):
  - Kein NC-, ND- oder Research-only-Material, weder ausgeliefert noch als Basis ausgelieferter Stimmen oder Daten.
  - Ausgelieferter Code nur MIT, Apache-2.0, BSD, ISC, MPL-2.0, OFL. Ausgelieferte Daten, Audio und Bilder nur CC0, CC BY,
    CC BY-SA (gekennzeichnet). GPL und LGPL nur als lokales Werkzeug.
  - Lerninhalte stehen unter CC BY-SA 4.0, ohne technische Schutzmaßnahmen; Quellenangaben auch offline.
- **Abhängigkeiten** exakt gepinnt, jede Version mindestens 14 Tage alt (L0-E10).

## 2. Religion – KI-Regel 2 (ADR 0040, schreibt ADR 0030 Nr. 4 fort)

Steht in jedem Briefing. ADR 0030 gilt im Übrigen unverändert.

### 2.1 Erlaubt (KI-Entwurf)
1. **Sprachkurse:** Inhalte de/tr/ar einschließlich Hocharabisch (voll vokalisiert), Übersetzungen innerhalb der
   Sprachkurse, Grammatik-Tipps (L3-E03). Ohne Religionsbezug; religiöse Formeln nur aus der freigegebenen Liste
   erlaubter Alltagsformeln (§2.3), dann mit Kennzeichen `religionsbezug`.
2. **Wissenskurs:** deutsche Aussagen und Quizfragen, **nur** aus gelieferten Passagen der benannten Werke (§2.4), mit Beleg
   je Aussage: Werk, Kapitel/Abschnitt, Ausgabe, Passage. Meinungsunterschiede innerhalb der Schule nur, wenn die Quelle sie
   nennt (Feld `meinung`, z. B. Meinung, nach der Fatwa gegeben wird).

### 2.2 Verbotsliste (bleibt menschlich oder kommt nur aus gepinnten Dateien)
1. Koranverse, Hadithe, Bittgebete und andere religiöse Texte auf Arabisch schreiben, ergänzen oder „korrigieren“.
   Arabischer religiöser Text kommt nur aus gepinnten Dateien in `web/daten/**`.
2. Übersetzungen von Versen, Hadithen und Bittgebeten; Koran-Wortbedeutungen; Tajwid-Texte.
3. Fatwa-Funktion, Einzelfall-Fatwas, Frage-Bot und Antworten auf persönliche religiöse Fragen.
4. Arabische Schrift in den Inhaltsdateien des Wissenskurses und des Koran-Arabisch-Pfads
   (`web/inhalte/lernapp/{islam,koran}/**`). Arabisch erscheint dort nur aus gepinnten Daten über Verweise (`sure:vers`,
   `sammlung:nummer`, Wortform); Verse und Hadithe mit freigegebener Übersetzung, sonst „Übersetzung folgt“.
5. Aussagen ohne Beleg, Belege aus dem Gedächtnis, Quellen außerhalb der benannten Werke.
6. Koran-Arabisch: Der Agent schreibt keine Bedeutungen; er erzeugt nur eine Arbeitsliste für die Hoca. Koran-Wurzeln nie aus
   dem Gedächtnis, nur als Werkzeugvorschlag, fachlich geprüft von der benannten Lehrkraft und sichtbar erst mit zwei
   Freigaben (§2.3, L0-E12).
7. Deutsche Fassungen oder Übersetzungen von Quellentexten (Matn), auch die Modernisierung der Übersetzung von Joseph Hell,
   entstehen nur durch Menschen (L0-E14, L0-E15). KI-Aussagen sind eigene, sinngemäße Lehrsätze mit Beleg, keine Übersetzung
   eines Quellentexts.
8. Sprachausgabe für Koran, Hadith, Bittgebete, Einträge mit Religionsbezug, den Wissenskurs und den Koran-Arabisch-Pfad
   (§4).
9. Koran- oder Hadith-Wortlaut in Sprachkursen (§3).
10. Eine Sammlung von Bittgebeten (L0-E13, LM-16): Auswahl und Übersetzung machen Menschen, der arabische Wortlaut kommt nur
    aus gepinnten Dateien in `web/daten/**`; sichtbar erst nach zwei Freigaben (§2.3).

### 2.3 Freigabe
- **Wissen (zwei Freigaben, L3-E01/L3-E09):** Ein Baustein ist „geprüft“, wenn es zum **aktuellen Inhalts-Hash** zwei
  Prüfungen „ok“ gibt. Beide stammen von verschiedenen Personen mit `religioese_pruefung`, keine davon ist Verfasser, und
  jeder Beleg ist als „am Original geprüft“ bestätigt.
  - Die Administration ersetzt keine Prüfung (`NIE_PER_ADMINISTRATION`).
  - Jede Änderung (neuer Hash) setzt beide Freigaben zurück. Prüfende bearbeiten nicht selbst; ihre Vorschläge übernimmt die
    Redaktion, danach prüfen beide den neuen Hash.
  - Eine Lektion ist nur sichtbar, wenn **alle** ihre Bausteine geprüft sind. Quizfragen entstehen nur aus Aussagen und
    brauchen selbst zwei Freigaben.
  - Zurückziehen wirkt sofort (Status, Paket, Cache-Tag).
- **Sprachkurse mit Religionsbezug:** Einträge mit `religionsbezug` brauchen ebenfalls zwei Freigaben der religiösen Prüfung
  zum aktuellen Hash (genehmigter Plan §2.3 „Freigabe ×2“, O-2). Bis dahin sind sie nicht sichtbar, auch nicht über den
  Schalter `lernapp_ungeprueft`; die Sprachstichprobe ersetzt diese Freigaben nie.
- **Formelliste:** Alltagsformeln (z. B. Gruß, „inschallah“) erscheinen in Sprachkursen erst, wenn die religiöse Prüfung die
  Liste mit zwei Freigaben freigegeben hat; bis dahin sind sie gesperrt (LM-09). Jede Änderung der Liste setzt zurück.
- **Koran-Arabisch:** Wortbedeutungen erscheinen im Lern-App-Pfad nur mit zwei Freigaben zum aktuellen Stand (genehmigter
  Plan §3.1 „wie Wissen mit zwei Freigaben“, O-11, LM-13); ebenso die eigene Wurzeltabelle (L0-E12, LM-31).
- **Kennzeichnung:** „Nach hanefitischer Lehre; geprüft von zwei Gelehrten der Gemeinde am …“ – Rollen statt Namen
  (O-8/LM-20). Quellenzeile je Aussage aufklappbar; strittige Themen als solche ausgewiesen; „für Kinder geeignet“ je
  Lektion (O-9/LM-17).

### 2.4 Quellen (Lizenzbefund L0)
- **Benannte Werke:**
  - Fiqh: Mukhtasar al-Quduri, Nur al-Idah mit Maraqi al-Falah, al-Hidaya, al-Ikhtiyar, Radd al-Muhtar.
  - Glaube: al-Fiqh al-Akbar, al-Aqida at-Tahawiyya, al-Aqaid an-Nasafiyya. Die Nasafiyya fehlt in OpenITI und ist
    zurückgestellt, bis ein alter Druck beschafft ist (L0-E15).
  - Für Maraqi al-Falah, al-Hidaya und al-Ikhtiyar gelten die Ausgabenvorgaben aus dem Lizenzbericht.
- **OpenITI** (CC BY-NC-SA 4.0): nur lokal als Arbeitstext. Nicht ins Repository, nicht nach `web/daten/`, nicht ausliefern.
  Belege verweisen auf Werk, Kapitel, Ausgabe und die OpenITI-URI mit Passage als Fundstelle.
- **Ausgeliefert** werden nur eigene deutsche Aussagen mit Zitierangabe. Eigene kurze arabische Matn-Fassungen, geprüft
  gegen einen Druck mit abgelaufener Frist nach § 70 UrhG, erst nach Entscheidung der Menschen (LM-04, L0-E11).
- **Prüfoberfläche:** Bis LM-04 entschieden ist, sehen Prüfende die Fundstelle und prüfen am eigenen Exemplar. Ob der
  arabische Wortlaut in der Verwaltung angezeigt wird, entscheiden Menschen.
- **Nicht verwenden:** Shamela-Texte, Ḥiṣn al-Muslim (Original und Übersetzungen, L0-E13), Verlagsübersetzungen, Quranic
  Arabic Corpus und alle Ableger (L0-E12). İlmihal (Diyanet/TDV, Bilmen, IGMG) nur als Seitenverweis für Menschen (LM-05).

## 3. Religionswächter (Erweiterung von `_gemeinde/werkzeuge/religion-pruefung.mjs`, Prüfstufe A)
- **Arabische Schrift zusätzlich erlaubt** (Eintrag mit Begründung in `ERLAUBT`, jeweils nur zusammen mit dem Wächter):
  - `web/messages/lernapp/ar.json` (Bedienoberfläche)
  - `web/inhalte/lernapp/{sprache,uebersetzung,aussprache}/**` (Hocharabisch der Sprachkurse und Übersetzungen der Richtungen
    mit Arabisch)
  - `web/messages/verwaltung/lernapp-pruefung.json`, nur bei dreisprachiger Prüfoberfläche (O-3)
  - eigene Koran-Wurzeltabelle nur gepinnt in `web/daten/` nach fachlicher Prüfung (L0-E12)
- **Nie erlaubt:** `web/inhalte/lernapp/{islam,koran}/**`, Komponenten und Werkstatt-Dateien. In `_lernapp/**` stehen arabische
  Wörter nur in Umschrift; Zitate aus Quellen und Lizenztexten werden umschrieben.
- **Prüfungen in den erlaubten Lern-App-Dateien** (Normalisierung ohne Harakat und Tatweel, Alif-Formen vereinheitlicht):
  - **(a) Formel-Lexikon:** Basmala, Hamdala, „inschallah“, Eulogie nach dem Prophetennamen, Begriffe wie Sure, Vers, Hadith,
    Bittgebet sowie deutsche und türkische Religionsbegriffe. Treffer verlangen `religionsbezug: true`, sonst rot.
    Gekennzeichnete Bausteine brauchen zwei religiöse Freigaben (§2.3) und bekommen keine Sprachausgabe. Die arabischen
    Einträge von Lexikon und Formelliste schreibt kein Agent; sie stammen aus `web/daten/**` oder von der religiösen Prüfung
    und liegen gepinnt in `web/daten/` `[Ordnername festlegen]`.
  - **(b) Koran-N-Gramm:** ≥ 4 aufeinanderfolgende Wörter aus dem Tanzil-Text (`web/daten/tanzil`) → rot.
  - **(c) Hadith-N-Gramm:** ≥ 4 aufeinanderfolgende Wörter aus dem Bukhari-Bestand (`web/daten/hadith`) → rot (genehmigter
    Plan §3.4, O-10).
  - Ausnahmen nur über die Liste erlaubter Alltagsformeln mit zwei religiösen Freigaben (§2.3, LM-09).
- Ergebnis 0 ist Bedingung für jedes Tor (Unit-Test mit Positiv- und Negativproben aus `web/daten`).

## 4. Sprachausgabe (L3-E10, ADR 0039/0040)
- **Nur für Sprachkurse** und Schrift-Vorkurse. Nie für Koran, Hadith, Bittgebete, Einträge mit Religionsbezug, den
  Wissenskurs oder den Koran-Arabisch-Pfad. Der Wissenskurs hat kein Audio; der Koran-Arabisch-Pfad nutzt nur Wortzeiten
  freigegebener Rezitationen (`quran_wortzeit`).
- **Stimmen nur mit freier Kette** aus Daten, Basismodell und Gewichten (L0-E03); Wahl je Sprache in L3-E10:
  - de: Coqui-VITS Thorsten
  - tr: Ziel eigene Aufnahmen (LM-26 a, vorgezogen). Der Übergang Coqui tr glow-tts ist zurückgestellt, bis die Rechte am
    eingebetteten Datensatz „Talent_TR_Male“ schriftlich bestätigt sind (LM-24, Spike S3); Chatterbox ist kein Übergang
    (Abbrüche, I/İ-Fehler, ≈ 21 Tage CPU). Bis dahin „Audio folgt“.
  - ar: eigene Stimme auf ClArTTS (GPU, LM-26) oder menschliche Aufnahmen des A1/A2-Kerns; Chatterbox hat den
    Vokalisierungstest nicht bestanden (S3). Bis dahin „Audio folgt“. Bestehenskriterium einer ar-Stimme: Minimalpaar-Abstand
    im Median ≥ 1,2, Schadda-Form ≥ 1,1-mal so lang, keine Abbrüche, Hörprobe der Lehrkraft ≥ 95 % richtig.
  - de: Erzeugung über den eigenen ONNX-Export (4 Prozesse × 1 Thread, Echtzeitfaktor ≈ 0,33, ≈ 8 h je Sprache).
  - Von den Piper-Stimmen ist nur de_DE-mls-medium zulässig.
- **Engines** (piper1-gpl, espeak-ng, Coqui) laufen nur lokal beim Erzeugen; nie im Browser, nie im Vercel-Bau.
- **Format:** Opus 24 kbit/s mono, Lautheit normiert (EBU R128). Bündel `.lpa` je Zielsprache und Einheit im Blob
  `lernapp`, ausgeliefert über die eigene Route mit Byte-Bereichen (Muster L2-E06).
- **Herkunft:** Stimme je Clip im Audio-Manifest (Engine, Stimme, SHA bzw. menschliche Sprecherin). Synthetische Stimmen sind
  als solche benannt; Namensnennung in der App und auf `/quellen`. Bei Chatterbox wird das Wasserzeichen offengelegt;
  Klonen nur mit eingewilligter Referenzstimme.
- **Menschliche Aufnahmen** ersetzen die Sprachausgabe je Text-Hash, nur mit Sprecher-Vereinbarung (ADR 0029 Nr. 4).
- **Ohne Audio:** Die Hörübung wird übersprungen („Audio folgt“), keine Sackgasse. Einstellung „Hörübungen aus“; Abschrift
  nach jeder Hörübung.

## 5. Kinderschutz in der Lern-App (Kinder = unter 16, KERN 3.0)
- Keine Freitext-Kommunikation zwischen Personen.
- Schreibabgaben sieht nur die Lehrkraft der eigenen Gruppe, verschlüsselt gespeichert.
- „Fehler melden“ besteht nur aus Aufgabenschlüssel und Kategorie (genehmigter Plan §2.7). Die eigene Antwort („Meine
  Antwort hätte stimmen sollen“) können nur angemeldete Personen ab 16 optional mitschicken; ohne Konto und bei Kindern nie.
- **Bestenliste für Konten unter 16 im Code gesperrt**, nicht über einen Schalter. Für Personen ab 16 nur mit eigener
  Zustimmung (Schalter `lernapp_rangliste`, L3-E02). Anzeigenamen: Vorname + Initial (S-14).
- **Eltern** sehen nur die Lernwoche ihres eigenen Kindes, keine Bestenliste. Kinderkonten gleichen nur mit der Einwilligung
  `lernapp` der Eltern ab.
- **Lehrkräfte** sehen den Stand nur von Lernenden der eigenen Gruppe, die mit Einwilligung `lernapp` abgleichen (Schalter
  `lernapp_gruppen`).
- **Erinnerungen** sind standardmäßig aus. Push nur nach Opt-in, mit neutralem Text ohne Serienbezug; für Kinder nur mit
  der Einwilligung `push_kind` der Eltern.
- **Bildkarten:** nur Gegenstände und Symbole, keine Fotos und keine Gesichter (O-4). Bis zur Entscheidung der Gemeinde keine
  Menschen- oder Tierdarstellungen; die Motivliste gibt die Redaktion frei (L0-E16).
- Keine externen Links in Lektionen; keine Spendenaufrufe, Mitgliederwerbung oder Förderhinweise in der Lern-App (L0-E17).
- Inhaltsleitfaden mit Tabu-Themen (LM-09). Alkohol, Schwein und Ähnliches kommen nicht als Alltagsnormalität vor.
- Sanfte Texte: keine Formulierungen wie „verloren“ oder „verpasst“ im Serienkontext (Wortlaut-Test). Hinweis auf die
  Sitzungslänge.

## 6. Datenschutz und Funktionsschalter
- **Ohne Konto:** Seiten, Pakete, Audio und Modelle kommen nur per GET vom eigenen Ursprung; keine Cookies, keine Analyse,
  kein Personenbezug. Ein POST entsteht nur durch eine ausdrückliche Handlung (anonyme Meldung mit ALTCHA). Beleg ist ein
  E2E-Netzprotokoll.
- **Auf dem Gerät:** IndexedDB `igmg-lernapp` (Ereignisprotokoll). Export und Import als Datei, auch für Art. 20 DSGVO.
- **Sprachaufnahmen** verlassen das Gerät nie, auch nicht zur Lehrkraft. Whisper-Modelle kommen vom eigenen Ursprung
  (`allowRemoteModels=false`).
- **Server-Daten** nur mit Konto, Einwilligung `lernapp` und Schalter. Die Einwilligung fällt unter Art. 9 DSGVO, weil der
  Fortschritt im Wissenskurs auf die Religion schließen lässt.
- **Löschung:** 12 Monate nach der letzten Aktivität, kaskadierend mit dem Konto; Schreibabgaben nach 12 Monaten; ältere
  Ereignisse werden in den Kartenstand verdichtet.
- **Statistik:** nur Summen mit n ≥ 10; anonyme Telemetrie nur mit Opt-in und Schalter.
- **DSFA-Nachtrag** für die Lern-App, einschließlich der Ausnahme zu R-08 (Ranglisten): LM-08.
- **CSP:** `'wasm-unsafe-eval'`, `worker-src 'self'` (ohne `blob:`, ADR 0042 Fortschreibung S2), `media-src 'self' blob:` sowie COOP `same-origin` und COEP `require-corp` nur unter `/lern-app`. Mikrofon nur auf
  `…/ueben`, `…/wiederholen` und im Audio-Studio der Verwaltung.

**Schalter** (ADR 0035; ausgeschaltet heißt 404 und die Links verschwinden):

| Schalter | Personendaten | Vorschau | Produktion | Sperre im Cockpit |
|---|---|---|---|---|
| `lernapp` | nein | an | an nach Abnahme (`IN_PRODUKTION_AN`) | – |
| `lernapp_ungeprueft` (Einheiten ohne bestandene Muttersprachler-Stichprobe, mit Hinweis) | nein | an | an (Plan §6 ML-02, O-1) | – |
| `lernapp_sprechen` | nein (lokal) | an | aus bis Gerätetest (LM-07) | – |
| `lernapp_meldungen` (anonym, Kategorien) | nein | an | an | – |
| `lernapp_sync` | ja | an | aus | `konten` an, DSFA-Nachtrag (LM-08) |
| `lernapp_gruppen` (Zuweisungen, Gruppenziel, Schreibkorrektur) | ja | an | aus | `lernplattform` an, LM-08 |
| `lernapp_rangliste` | ja | an | aus | `lernapp_gruppen` an, LM-10 |
| `lernapp_statistik` (anonyme Telemetrie, Opt-in) | grenzwertig (IP) | an | aus | Entscheidung der DSB |
| `push_lernapp` | ja | an | aus | wie `push` |

## 7. Oberfläche, Rechts-nach-links, Schriften
- **Layout:** `web/src/app/lern-app/[ui]/layout.tsx` setzt `<html lang dir>`; `ar` → `dir="rtl"`. Texte in
  `web/messages/lernapp/{de,tr,ar}.json`. Im Client kein next-intl, nur der kleine Formatierer.
- **Nur logische Richtungen:** `ms-/me-/ps-/pe-/start-/end-/text-start`. Der Regeltest `tests/unit/lernapp/rtl-regeln.test.ts`
  verbietet `ml-/mr-/pl-/pr-/left-/right-/text-left/text-right` in `src/components/lernapp/**`. Gerichtete Zeichen (Pfeile,
  Fortschritt) spiegeln über `rtl:`.
- **Fremde Richtung im Inhalt:** Jeder anderssprachige Teil trägt `lang` und `dir` (z. B. Arabisch in der deutschen
  Oberfläche); gemischte Zeilen werden isoliert (`<bdi>`, `unicode-bidi: isolate`).
- **Schriften:**
  - Arabische Oberfläche: Noto Sans Arabic 400/700 (OFL, selbst gehostet, Teilmenge mit `unicode-range`), Token
    `--font-arabisch-ui` (ADR 0044), nur im Lern-App-Layout.
  - Vokalisierter Kursinhalt: `--font-arabic` (Amiri) mit `--text-arabisch-1/2/3`; Harakat werden nie abgeschnitten.
  - `--font-quran` bleibt dem Koran vorbehalten.
  - Die globale Regel für `[lang='ar']` und `[dir='rtl']` in `globals.css` (Amiri, Zeilenhöhe 2) gilt nicht mehr für die
    Oberfläche der Lern-App (Teilbaum-Form `:is([lang='ar'],[dir='rtl']):not(:where([data-oberflaeche],[data-oberflaeche] *))`, ADR 0044 Fortschreibung Nr. 1); auf der Website bleibt sie wirksam.
- **Werkzeugklassen:** neu `auslauf-anfang`, `auslauf-ende`, `raster-wortbank`, `lern-leiste` als `@utility`. Keine freien
  Werte (`freie-werte.mjs`: 0).
- **Ziffern und Plural:** In der arabischen Oberfläche östlich-arabische Ziffern, umschaltbar (O-5/LM-18). Arabische
  Pluralformen zero/one/two/few/many/other. `sprachen:pruefen` prüft die Lern-App-Texte (de ⊆ tr, de ⊆ ar, gleiche
  Platzhalter).
- **Verwaltung** bleibt deutsch und von links nach rechts. Nur die Prüfoberfläche Sprache ist dreisprachig, ihre
  Inhaltsblöcke tragen `dir` (O-3, Fortschreibung ADR 0016).
- **Gestaltung:** Formensprache wie KERN 3.0 (Achtstern, 24-px-Raster, 2-px-Strich). Oberflächensymbole nur aus Lucide.
  Abzeichen entstehen aus der Achtstern-Geometrie. Der Stil der Bildkarten wird in L2 festgelegt: Linien-Symbole im
  gleichen Raster (Lucide, Tabler MIT) oder OpenMoji (CC BY-SA 4.0) nach Motivliste.

## 8. Zugänglichkeit (WCAG 2.2 AA)
- Jeder Übungstyp ist vollständig per Tastatur bedienbar. Ziehen ist nie nötig (2.5.7), Ziele messen ≥ 24 × 24 px.
- Keine Zeitgrenzen. Fehler stehen als Text, nicht nur als Farbe. Eine Live-Region je Bildschirm; nach der Antwort liegt
  der Fokus auf „Weiter“, und das Rückmeldeblatt verdeckt den Fokus nie.
- Alternativen: „Hörübungen aus“, „Sprechübungen aus“, „Ich kann gerade nicht hören/sprechen“.
- axe: 0 ernste und kritische Befunde auf allen Lern-App-Routen × 3 Sprachen × 2 Breiten. Prüfung mit Screenreadern: LM-19.

## 9. Budgets
Fortgeschrieben am 16.10.2026 nach Spike S1: Der Next/React-Grundstock allein sind ≈ 128 KB gz (Seite `/lern-app/de` des
Spikes ≈ 136 KB, modern, ohne `noModule`-Polyfill). Die Budgets gelten deshalb als **Lern-App-eigener Anteil über dem
Grundstock** plus einer Gesamtgrenze je Route (Messweise `web/scripts/messen.mjs`, `jsKb`).

| Teil | Budget (gz) | Laden |
|---|---|---|
| Hülle (Rahmen, Kopf, Inseln) | eigener Anteil ≤ 20 KB | statisch |
| Start, Lernpfad, Fortschritt | eigener Anteil ≤ 30 KB, Route gesamt ≤ 180 KB (wie die Website) | statisch; Insel für den lokalen Stand |
| Lektionsspieler | zusätzlich ≤ 60 KB, Route gesamt ≤ 210 KB (Ausnahme mit Grund: Spielerkern, Abgleich, FSRS, lokale Datenbank) | erst in der Lektion |
| je Übungstyp | ≤ 15 KB | `import()` beim ersten Auftreten, vorab für die nächste Aufgabe |
| arabische Bildschirmtastatur | ≤ 10 KB | erst bei arabischem Freitext |
| Sprechmodul (Worker, transformers.js, ORT-WASM, Whisper-base q8; 10 Dateien ≈ 95 MB, Fortschreibung S2) | außerhalb des Routenbudgets | nur nach Klick, Größe vorher angezeigt, Gerätecheck |
| Mein Bereich (Lehrkraft) | ≤ 230 KB | wie bisher |

- **Ladezeiten:** LCP ≤ 2,5 s, INP ≤ 200 ms, CLS ≤ 0,1. Auf den Messrouten Lighthouse Leistung ≥ 90, Zugänglichkeit 100.
- **Regeltest** `tests/unit/lernapp/bundle-regeln.test.ts`: kein next-intl und kein `@/lib/utils` im Client der Lern-App;
  `@huggingface/transformers` nur in `*.worker.ts`; Übungstypen nur per `import()`.
- **Bau:** Der Vercel-Bau bleibt ≤ 15 min. Audio und Modelle entstehen nie im Bau; Einheitenpakete werden nur im
  Beispielmodus vorgerendert.
- **Speicher:**
  - Blob `lernapp` ≈ 0,93 GB, nur Audio (≈ 310 MB je Sprache; Modelle statisch nach ADR 0042; Kosten: LM-15).
  - Offline je Stufe und Richtung A1 ≈ 25 MB bis C1 ≈ 90 MB; `navigator.storage.persist()` erst beim bewussten Speichern.
  - Platte der Arbeitsumgebung: Budget laut `PLAN.md` §15.

## 10. Bewegungsregister (Fortschreibung B-28…B-35)
Nur CSS, jede Bewegung mit reduzierter Variante. Eigene `@keyframes` nur über das Register.
`tests/unit/bewegung-regeln.test.ts` gilt auch für `src/components/lernapp/**`. Pfade unter `web/src/components/lernapp/`.

| ID | Bewegung | Umsetzung | Reduziert |
|---|---|---|---|
| B-28 | Lektionsleiste füllt sich je Aufgabe (`scaleX` von `inline-start` aus) | `Fortschrittsleiste.tsx` | ohne Übergang |
| B-29 | Rückmeldeblatt von unten (translate 24 px, Kurve B-03); richtig: Achtstern füllt sich (B-18), falsch: Farbe und Text ohne Bewegung | `Rueckmeldung.tsx` | nur Deckkraft |
| B-30 | Lektion abgeschlossen (großer Moment): Achtstern-Ring zeichnet sich ≤ 1,6 s; XP und Tagesziel stehen statisch | `Abschluss.tsx` (`linie-zeichnet`) | Endzustand |
| B-31 | Wortkachel wandert in die Antwortzeile: Deckkraft + 8 px (wie B-22) | `aufgaben/Wortbank.tsx` | sofort |
| B-32 | Paar gefunden: Häkchen zeichnet sich (wie B-23), Paar wird gedämpft | `aufgaben/Paare.tsx` | Häkchen sofort |
| B-33 | Serie: Der heutige Stern im Wochenband füllt sich einmal am Tag | `Serie.tsx` | gefüllt |
| B-34 | Abzeichen erhalten: Deckkraft + Skalierung .96 → 1 (wie B-14) | `Abzeichen.tsx` | nur Deckkraft |
| B-35 | Aufnahme läuft: Pegelbalken (funktional) | `sprechen/Pegel.tsx` | statischer Punkt + Text „Aufnahme läuft“ |
| (B-17, B-24, B-27) | Schreibweg, Lernpfad, Offline-Ring | wiederverwendet | wie bisher |

Keine Mondsichel, keine hochzählenden Zahlen.
