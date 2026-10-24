# Lehrplan Wissenskurs „Islamisches Wissen nach hanefitischer Lehre“ (nur Deutsch)

- **Etappe:** L6, Paket L6-04 Teil 1 (Lehrplan), zusammen mit L6-01 (Quellen lokal, Passagen-Index, `web/daten/hanafi-quellen/QUELLE.md`).
- **Stand:** 21.10.2026 · **Status:** Entwurf. Dieser Lehrplan enthält **keine religiösen Aussagen**, nur Gliederung, Lernziele und
  Fundstellen. Aussagen, Belege und Quizfragen entstehen erst in den Einheitendateien und werden nur mit zwei Freigaben
  sichtbar (ADR 0040 Nr. 5).
- **Bezug:** PLAN §5.2 (28 Einheiten), §6.1 (Ablage), §6.4 (Prüfer „Wissen“), §6.7 (religiöse Pipeline), §14 L6;
  ADR 0040 Nr. 2–5 mit Fortschreibung S8; ADR 0045 Nr. 12 mit Fortschreibung S3/S8 Nr. 7; KERN (Lern-App) §2/§3;
  Beleg `_lernapp/belege/S8-quellen-lokal.md` §3.5, §4 Nr. 3–6; Schema `web/src/lib/lernapp/inhalt/schema.ts`
  (`ISLAM_BEREICHE`, `ISLAM_WERKE`, `IslamEinheitDateiSchema`).
- **Erzeugt** aus dem lokalen Passagen-Index (Werkzeug `openiti-passagen` 1.2.0); jede Fundstelle wurde gegen den Index
  geprüft (Kapitel vorhanden, Passagen im Register, Radd al-Muḥtār nur bis ms6764). Kapitelangaben von Hand umschrieben;
  Seiten der Druckvorlage ±1, am Druck prüfen.
- **Schrift:** nur Umschrift, keine arabische Schrift (KERN §3).

## 1. Grundsätze

1. **Ablage:** Das Schema sieht keine Lehrplandatei unter `web/inhalte/lernapp/islam/` vor; jede JSON-Datei dort ist eine
   Einheit (`dateiArtVon` → `islam-einheit`). Deshalb steht der Lehrplan hier. Jede Einheit wird später als
   `web/inhalte/lernapp/islam/<bereich>/<schlüssel>.json` abgelegt, z. B. `islam/taharah/islam.grund.e01.json`.
2. **Schlüssel:** Einheit `islam.<stufe>.eNN` (Stufen `grund`, `aufbau`, `vertiefung`, L3-E04), Lektion `<einheit>.lNN`.
   Vorschlag für Bausteine: Aussage `<lektion>.aNN`, Quizfrage `<lektion>.qNN` (das Schema verlangt nur das Präfix).
3. **Reihenfolge:** Reinheit und Gebet zuerst (PLAN §5.2, LM-03): Sie bilden `islam.grund.e01`–`e08` und werden zuerst
   entworfen und geprüft. Danach Glaube, dann die übrigen Bereiche in der Folge von `ISLAM_BEREICHE`.
4. **Stufen (Standard bis zur Antwort):** Grundstufe = Reinheit, Gebet, Glaube; Aufbaustufe = Fasten, Zakat, Hadsch,
   Erlaubtes und Verbotenes; Vertiefung = Anstand, Geschichte, Grundwissen.
5. **Belegbasis:** Je Lektion die Kapitel, aus denen die Aussagen entworfen werden. Grundtext der ʿIbādāt ist Nūr al-Īḍāḥ,
   zweiter Matn Mukhtaṣar al-Qudūrī; Begründung und Vergleich aus al-Hidāya und al-Ikhtiyār; die Meinung, nach der Fatwa
   gegeben wird, aus Radd al-Muḥtār. Glaube nur aus al-Fiqh al-Akbar und der Ṭaḥāwiyya (Fiqh-Werke sind dort nicht
   zulässig und umgekehrt: Schema-Regel „Fiqh-Aussage braucht ein Fiqh-Werk“).
6. **Nicht als Beleg:** Marāqī al-Falāḥ (zurückgestellt, LM-33; liegt nur als lokaler Arbeitstext vor), al-ʿAqāʾid
   an-Nasafiyya (fehlt), Ḥāshiyat aṭ-Ṭaḥṭāwī (nicht im Register), Radd al-Muḥtār ab ms6765 (Vorspann Bd. 7, Takmila).
7. **Verbote (ADR 0040 Nr. 3):** Lektionen zu Gebetsruf, Qunūt, Takbīr, Totengebet, Rezitation und Besuch der
   Prophetenmoschee behandeln nur Regeln. Wortlaut von Versen, Hadithen, Bittgebeten und Formeln wird nicht geschrieben
   und nicht übersetzt; Verse und Hadithe nur als Verweis (`sure:vers`, `bukhari:nummer`). Keine Fatwa- oder
   Frage-Funktion; Fallfragen sind allgemeine Lehrfälle.
8. **Kinder (LM-17):** Spalte „Kinder“ ist ein Vorschlag für `kinderGeeignet` je Lektion; „nein“ bei Ganzkörperwaschung,
   Monatsblutung, Sühne beim Fasten, Tod und Leichenwaschung, Ehe und Blick/Berührung. Entscheidung: Menschen.
9. **Strittig:** Mit „strittig“ markierte Lektionen enthalten Fragen, in denen Gemeindepraxis oder Meinungen auseinandergehen
   (Beginn des Ramadan, Besuch der Prophetenmoschee, Scheidung). Aussagen dort nur mit Quelle und `strittig: true`;
   Meinungen innerhalb der Schule nur mit `meinung` und Beleg.
10. **Belegbar / teilweise / zurückgestellt:** nach S8 §3.5 und §4 Nr. 6. Zurückgestellte Lektionen bekommen keinen
    Entwurf, bis Menschen ein Werk benennen (LM-04).

## 2. Überblick

| Nr. | Schlüssel | Bereich | Titel | Lektionen | Belegbasis |
|---|---|---|---|---|---|
| 1 | `islam.grund.e01` | taharah | Reinheit I: Wasser, Unreinheit und Istinjāʾ | 6 | belegbar |
| 2 | `islam.grund.e02` | taharah | Reinheit II: Die Gebetswaschung (wuḍūʾ) | 6 | belegbar |
| 3 | `islam.grund.e03` | taharah | Reinheit III: Ganzkörperwaschung, Tayammum, Masḥ und Monatsblutung | 7 | belegbar |
| 4 | `islam.grund.e04` | salah | Gebet I: Pflicht, Gebetszeiten und Gebetsruf | 6 | belegbar |
| 5 | `islam.grund.e05` | salah | Gebet II: Bedingungen, Pflichtteile und Ablauf | 6 | belegbar |
| 6 | `islam.grund.e06` | salah | Gebet III: Gemeinschaftsgebet, Störungen und Niederwerfung des Versehens | 6 | belegbar |
| 7 | `islam.grund.e07` | salah | Gebet IV: Witr, freiwillige Gebete, Nachholen und Krankengebet | 6 | belegbar |
| 8 | `islam.grund.e08` | salah | Gebet V: Reise, Freitag, Festtage und Totengebet | 7 | belegbar |
| 9 | `islam.grund.e09` | akaid | Glaube I: Grundlagen des Glaubens und die Einheit Gottes | 6 | belegbar |
| 10 | `islam.grund.e10` | akaid | Glaube II: Engel, Bücher und Propheten | 6 | belegbar |
| 11 | `islam.grund.e11` | akaid | Glaube III: Bestimmung, Jenseits und Gemeinschaft | 6 | belegbar |
| 12 | `islam.aufbau.e01` | sawm | Fasten I: Pflicht, Arten, Absicht und Monatsbeginn | 5 | belegbar |
| 13 | `islam.aufbau.e02` | sawm | Fasten II: Was das Fasten bricht, Nachholen, Sühne und Iʿtikāf | 6 | belegbar |
| 14 | `islam.aufbau.e03` | zakat | Zakat I: Pflicht, Bedingungen und Vermögensarten | 6 | belegbar |
| 15 | `islam.aufbau.e04` | zakat | Zakat II: Empfänger und Ṣadaqat al-Fiṭr | 4 | belegbar |
| 16 | `islam.aufbau.e05` | hajj | Hadsch I: Pflicht, Bedingungen, Zeiten und Iḥrām | 5 | belegbar |
| 17 | `islam.aufbau.e06` | hajj | Hadsch II: Ablauf, ʿUmra, Verstöße und Opfertier | 7 | belegbar |
| 18 | `islam.aufbau.e07` | halal_haram | Erlaubtes und Verbotenes I: Speisen, Getränke, Schlachtung und Opfer | 6 | belegbar |
| 19 | `islam.aufbau.e08` | halal_haram | Erlaubtes und Verbotenes II: Kauf, Zins und Miete | 6 | belegbar |
| 20 | `islam.aufbau.e09` | halal_haram | Erlaubtes und Verbotenes III: Ehe und Familie – Grundlagen | 6 | belegbar |
| 21 | `islam.vertiefung.e01` | akhlaq | Anstand I: Kleidung, Schmuck und Gebrauchsgegenstände | 4 | belegbar |
| 22 | `islam.vertiefung.e02` | akhlaq | Anstand II: Blick, Rede und Anstand im Gottesdienst | 5 | belegbar |
| 23 | `islam.vertiefung.e03` | akhlaq | Anstand III: Erwerb, Fürsorge und Wettkampf | 4 | belegbar |
| 24 | `islam.vertiefung.e04` | siyar | Geschichte I: Das Leben des Propheten (Grundlagen) | 5 | zurückgestellt |
| 25 | `islam.vertiefung.e05` | siyar | Geschichte II: Die Gefährten und die ersten Kalifen | 5 | zurückgestellt |
| 26 | `islam.vertiefung.e06` | siyar | Geschichte III: Abū Ḥanīfa, seine Schüler und die hanefitische Schule | 5 | zurückgestellt |
| 27 | `islam.vertiefung.e07` | grundwissen | Grundwissen I: Fiqh – Urteilsarten, Meinungen der Schule und Fatwa | 4 | teilweise belegbar |
| 28 | `islam.vertiefung.e08` | grundwissen | Grundwissen II: Umgang mit Koran und Hadith | 4 | teilweise belegbar |

Summe: 28 Einheiten, 155 Lektionen. Je Bereich: taharah 3, salah 5, akaid 3, sawm 2, zakat 2, hajj 2, halal_haram 3, akhlaq 3, siyar 3, grundwissen 2 (PLAN §5.2).

## 3. Grundstufe – Reinheit, Gebet, Glaube

### 3.1 `islam.grund.e01` – Reinheit I: Wasser, Unreinheit und Istinjāʾ

- **Bereich:** `taharah` · **Ablage:** `web/inhalte/lernapp/islam/taharah/islam.grund.e01.json` · **Belegbasis:** belegbar
- **Lernziele:** Lernende
  - kann die Wasserarten, die die Werke für die Reinigung unterscheiden, benennen und Beispiele zuordnen
  - kennt die Einteilung der Unreinheiten (najāsa), was davon nachgesehen wird und wie sie entfernt werden
  - kann Urteil, Ablauf und Anstand der Reinigung nach der Notdurft (istinjāʾ) beschreiben
- **Belegbasis der Einheit (Begründung, Vergleich, Fatwa-Meinung):**
  - Mukhtaṣar al-Qudūrī, Kitāb aṭ-Ṭahāra (Anfang: Wuḍūʾ, Ghusl, Wasser) – `quduri.ms0001`–`ms0003`, Bd. 1, S. 11–16
  - Mukhtaṣar al-Qudūrī, Bāb al-Anjās – `quduri.ms0006`, Bd. 1, S. 21–23 (Kap. k0005)
  - al-Hidāya, Bāb al-Māʾ alladhī yajūzu bihi l-Wuḍūʾ – `hidaya.ms0008`–`ms0017`, Bd. 1, S. 17–25 (Kap. k0002)
  - al-Hidāya, Bāb al-Anjās wa-Taṭhīruhā – `hidaya.ms0028`–`ms0033`, Bd. 1, S. 34–38 (Kap. k0006)
  - al-Ikhtiyār, Faṣl fī l-Māʾ alladhī yajūzu t-Taṭhīr bihi; Wuqūʿ an-Najāsa fī l-Biʾr; al-Asʾār – `ikhtiyar.ms0010`–`ms0016`, Bd. 1, S. 13–19 (Kap. k0009–k0013)
  - al-Ikhtiyār, Bāb al-Anjās wa-Taṭhīruhā – `ikhtiyar.ms0031`–`ms0038`, Bd. 1, S. 31–37 (Kap. k0019)
  - Radd al-Muḥtār, Bāb al-Miyāh – `radd_al_muhtar.ms0164`–`ms0245`, Bd. 1, S. 179–229 (Kap. k0046)
  - Radd al-Muḥtār, Bāb al-Anjās – `radd_al_muhtar.ms0376`–`ms0449`, Bd. 1, S. 308–351 (Kap. k0091)

| Lektion | Titel | Kinder | Hinweis | Belegbasis (Grundtext) |
|---|---|---|---|---|
| `islam.grund.e01.l01` | Wasser für die Reinigung: Arten und Einteilung | ja |  | Nūr al-Īḍāḥ, Kitāb aṭ-Ṭahāra › al-Miyāh, Aqsām al-Miyāh – `nur_al_idah.ms0001`, Bd. 1, S. 9–11 (Kap. k0002–k0004) |
| `islam.grund.e01.l02` | Reste (suʾr), Gefäße und Kleidung bei Zweifel, Brunnen | ja |  | Nūr al-Īḍāḥ, Faṣl fī Aḥkām as-Suʾr; Faṣl fī t-Taḥarrī; Faṣl fī Aḥkām al-Ābār – `nur_al_idah.ms0001`–`ms0002`, Bd. 1, S. 11–14 (Kap. k0005–k0012)<br>Radd al-Muḥtār, Faṣl fī l-Biʾr – `radd_al_muhtar.ms0215`–`ms0245`, Bd. 1, S. 211–229 (Kap. k0064) |
| `islam.grund.e01.l03` | Istinjāʾ und Anstand bei der Notdurft | ja |  | Nūr al-Īḍāḥ, Faṣl fī l-Istinjāʾ; Ādāb Qaḍāʾ al-Ḥāja – `nur_al_idah.ms0002`–`ms0003`, Bd. 1, S. 14–17 (Kap. k0013–k0018)<br>Radd al-Muḥtār, Faṣl al-Istinjāʾ – `radd_al_muhtar.ms0422`–`ms0449`, Bd. 1, S. 335–351 (Kap. k0100) |
| `islam.grund.e01.l04` | Arten der Unreinheit und was davon nachgesehen wird | ja |  | Nūr al-Īḍāḥ, Bāb al-Anjās wa-ṭ-Ṭahāra ʿanhā › Aqsām an-Najāsa, mā yuʿfā ʿanhu – `nur_al_idah.ms0010`–`ms0011`, Bd. 1, S. 34 (Kap. k0071–k0073) |
| `islam.grund.e01.l05` | Wie Unreinheit entfernt wird: Waschen, Boden, Umwandlung | ja |  | Nūr al-Īḍāḥ, Bimā taṭhuru n-Najāsa; Ṭahārat al-Arḍ; aṭ-Ṭahāra bi-l-Istiḥāla – `nur_al_idah.ms0011`, Bd. 1, S. 34–35 (Kap. k0074–k0076) |
| `islam.grund.e01.l06` | Häute verendeter Tiere und Ähnliches | ja |  | Nūr al-Īḍāḥ, Faṣl fī Ṭahārat Jild al-Mayta – `nur_al_idah.ms0011`, Bd. 1, S. 35–36 (Kap. k0077) |

### 3.2 `islam.grund.e02` – Reinheit II: Die Gebetswaschung (wuḍūʾ)

- **Bereich:** `taharah` · **Ablage:** `web/inhalte/lernapp/islam/taharah/islam.grund.e02.json` · **Belegbasis:** belegbar
- **Lernziele:** Lernende
  - kann Anlass, Bedingungen und Pflichtteile der Gebetswaschung nennen
  - unterscheidet Pflichtteile, Sunna-Handlungen, Anstand und Verpöntes bei der Waschung
  - kann erklären, was die Waschung ungültig macht und was nicht
- **Belegbasis der Einheit (Begründung, Vergleich, Fatwa-Meinung):**
  - Mukhtaṣar al-Qudūrī, Kitāb aṭ-Ṭahāra (Anfang: Wuḍūʾ, Ghusl, Wasser) – `quduri.ms0001`–`ms0003`, Bd. 1, S. 11–16
  - al-Hidāya, Kitāb aṭ-Ṭahārāt (Anfang: Wuḍūʾ, Ghusl) – `hidaya.ms0001`–`ms0008`, Bd. 1, S. 1–18
  - al-Ikhtiyār, Farāʾiḍ al-Wuḍūʾ; Sunan al-Wuḍūʾ; Faṣl Nawāqiḍ al-Wuḍūʾ – `ikhtiyar.ms0002`–`ms0007`, Bd. 1, S. 7–11 (Kap. k0003–k0005)
  - Radd al-Muḥtār, Kitāb aṭ-Ṭahāra (Anfang bis vor Bāb al-Miyāh) – `radd_al_muhtar.ms0001`–`ms0164`, Bd. 1, S. 1–179

| Lektion | Titel | Kinder | Hinweis | Belegbasis (Grundtext) |
|---|---|---|---|---|
| `islam.grund.e02.l01` | Anlass, Bedingungen und Pflichtteile der Waschung | ja |  | Nūr al-Īḍāḥ, Faṣl fī l-Wuḍūʾ › Farāʾiḍuhu, Sababuhu, Shurūṭ – `nur_al_idah.ms0003`–`ms0004`, Bd. 1, S. 17–18 (Kap. k0019–k0023) |
| `islam.grund.e02.l02` | Vollständigkeit der Waschung und Sunna-Handlungen | ja |  | Nūr al-Īḍāḥ, Faṣl fī Tamām Aḥkām al-Wuḍūʾ; Faṣl fī Sunan al-Wuḍūʾ – `nur_al_idah.ms0004`, Bd. 1, S. 18–19 (Kap. k0024–k0025) |
| `islam.grund.e02.l03` | Anstand (ādāb) und Verpöntes (makrūhāt) bei der Waschung | ja |  | Nūr al-Īḍāḥ, Faṣl fī Ādāb al-Wuḍūʾ; Faṣl fī Makrūhāt al-Wuḍūʾ – `nur_al_idah.ms0004`–`ms0005`, Bd. 1, S. 19–20 (Kap. k0026–k0027) |
| `islam.grund.e02.l04` | Arten der Waschung: Pflicht, notwendig, empfohlen | ja |  | Nūr al-Īḍāḥ, Faṣl fī Aqsām al-Wuḍūʾ – `nur_al_idah.ms0005`, Bd. 1, S. 20–21 (Kap. k0028) |
| `islam.grund.e02.l05` | Was die Waschung ungültig macht | ja |  | Nūr al-Īḍāḥ, Faṣl fī Nawāqiḍ al-Wuḍūʾ – `nur_al_idah.ms0005`, Bd. 1, S. 21 (Kap. k0029)<br>Radd al-Muḥtār, Maṭlab Nawāqiḍ al-Wuḍūʾ – `radd_al_muhtar.ms0090`–`ms0100`, Bd. 1, S. 134–139 (Kap. k0032) |
| `islam.grund.e02.l06` | Was die Waschung nicht ungültig macht | ja |  | Nūr al-Īḍāḥ, Faṣl fīmā lā yanquḍu l-Wuḍūʾ – `nur_al_idah.ms0005`–`ms0006`, Bd. 1, S. 21–22 (Kap. k0030) |

### 3.3 `islam.grund.e03` – Reinheit III: Ganzkörperwaschung, Tayammum, Masḥ und Monatsblutung

- **Bereich:** `taharah` · **Ablage:** `web/inhalte/lernapp/islam/taharah/islam.grund.e03.json` · **Belegbasis:** belegbar
- **Lernziele:** Lernende
  - kennt Anlässe, Pflichtteile und Sunna der Ganzkörperwaschung (ghusl)
  - kann Bedingungen, Ablauf und Ungültigkeit der Trockenreinigung (tayammum) und des Bestreichens der Khuffs (masḥ) erklären
  - kennt die Grundbegriffe zu Monatsblutung, Wochenbett und Dauerblutung und ihre Folgen für Gebet und Fasten
- **Belegbasis der Einheit (Begründung, Vergleich, Fatwa-Meinung):**
  - Mukhtaṣar al-Qudūrī, Bāb at-Tayammum; Bāb al-Masḥ ʿalā l-Khuffayn; Bāb al-Ḥayḍ – `quduri.ms0003`–`ms0006`, Bd. 1, S. 15–21 (Kap. k0002–k0004)
  - al-Hidāya, Bāb at-Tayammum; Bāb al-Masḥ; Bāb al-Ḥayḍ wa-l-Istiḥāḍa – `hidaya.ms0017`–`ms0028`, Bd. 1, S. 25–34 (Kap. k0003–k0005)
  - al-Ikhtiyār, Faṣl Farḍ al-Ghusl wa-Sunanihi; Mūjibāt al-Ghusl – `ikhtiyar.ms0007`–`ms0010`, Bd. 1, S. 11–13 (Kap. k0006–k0008)
  - al-Ikhtiyār, Bāb at-Tayammum; Bāb al-Masḥ; Bāb al-Ḥayḍ – `ikhtiyar.ms0016`–`ms0031`, Bd. 1, S. 19–31 (Kap. k0014–k0016)
  - Radd al-Muḥtār, Maṭlab fī Abḥāth al-Ghusl; Maṭlab Sunan al-Ghusl – `radd_al_muhtar.ms0119`–`ms0131`, Bd. 1, S. 151–158 (Kap. k0040–k0041)
  - Radd al-Muḥtār, Bāb at-Tayammum – `radd_al_muhtar.ms0245`–`ms0298`, Bd. 1, S. 229–260 (Kap. k0071)
  - Radd al-Muḥtār, Bāb al-Masḥ ʿalā l-Khuffayn – `radd_al_muhtar.ms0298`–`ms0334`, Bd. 1, S. 260–282 (Kap. k0076)
  - Radd al-Muḥtār, Bāb al-Ḥayḍ – `radd_al_muhtar.ms0334`–`ms0376`, Bd. 1, S. 282–308 (Kap. k0084)

| Lektion | Titel | Kinder | Hinweis | Belegbasis (Grundtext) |
|---|---|---|---|---|
| `islam.grund.e03.l01` | Ganzkörperwaschung: Anlässe, Pflichtteile, Sunna, Anstand | nein (Vorschlag) |  | Nūr al-Īḍāḥ, Fuṣūl fī l-Ghusl – `nur_al_idah.ms0006`–`ms0007`, Bd. 1, S. 22–25 (Kap. k0031–k0036) |
| `islam.grund.e03.l02` | Tayammum: Bedingungen, Grundpfeiler, Sunna | ja |  | Nūr al-Īḍāḥ, Bāb at-Tayammum › Shurūṭ, Arkān, Sunan – `nur_al_idah.ms0007`–`ms0008`, Bd. 1, S. 25–26 (Kap. k0037–k0041) |
| `islam.grund.e03.l03` | Tayammum: Aufschub, Wassersuche, Gebet, Verletzte, Ungültigkeit | ja |  | Nūr al-Īḍāḥ, Bāb at-Tayammum › Taʾkhīr, Ṭalab al-Māʾ, Nawāqiḍ – `nur_al_idah.ms0008`, Bd. 1, S. 26–28 (Kap. k0042–k0047) |
| `islam.grund.e03.l04` | Bestreichen der Khuffs (masḥ ʿalā l-khuffayn) | ja |  | Nūr al-Īḍāḥ, Bāb al-Masḥ ʿalā l-Khuffayn – `nur_al_idah.ms0008`–`ms0009`, Bd. 1, S. 28–30 (Kap. k0048–k0054) |
| `islam.grund.e03.l05` | Verbände und Schienen (jabīra) | ja |  | Nūr al-Īḍāḥ, Faṣl fī l-Jabīra – `nur_al_idah.ms0009`, Bd. 1, S. 30–31 (Kap. k0055) |
| `islam.grund.e03.l06` | Monatsblutung, Wochenbett und Dauerblutung | nein (Vorschlag) |  | Nūr al-Īḍāḥ, Bāb al-Ḥayḍ wa-n-Nifās wa-l-Istiḥāḍa – `nur_al_idah.ms0009`–`ms0010`, Bd. 1, S. 31–32 (Kap. k0057–k0063) |
| `islam.grund.e03.l07` | Was in diesen Zuständen und ohne Waschung verboten ist; Entschuldigte (maʿdhūr) | nein (Vorschlag) |  | Nūr al-Īḍāḥ, Mā yaḥrumu bi-l-Ḥayḍ …; Mā yaḥrumu ʿalā l-Muḥdith; Ḥukm al-Istiḥāḍa – `nur_al_idah.ms0010`, Bd. 1, S. 32–34 (Kap. k0064–k0070) |

### 3.4 `islam.grund.e04` – Gebet I: Pflicht, Gebetszeiten und Gebetsruf

- **Bereich:** `salah` · **Ablage:** `web/inhalte/lernapp/islam/salah/islam.grund.e04.json` · **Belegbasis:** belegbar
- **Lernziele:** Lernende
  - kann nennen, für wen das Gebet Pflicht ist und welche Zeiten die Werke für die fünf Gebete bestimmen
  - kennt Zeiten, in denen das Gebet ungültig oder verpönt ist
  - kann Urteil und Form von Gebetsruf (adhān) und iqāma beschreiben (ohne Wortlaut von Bittgebeten)
- **Belegbasis der Einheit (Begründung, Vergleich, Fatwa-Meinung):**
  - Mukhtaṣar al-Qudūrī, Kitāb aṣ-Ṣalāh (Anfang: Zeiten) – `quduri.ms0006`–`ms0007`, Bd. 1, S. 20–26
  - Mukhtaṣar al-Qudūrī, Bāb al-Adhān – `quduri.ms0007`, Bd. 1, S. 25–26 (Kap. k0007)
  - Mukhtaṣar al-Qudūrī, Bāb al-Awqāt allatī tukrahu fīhā ṣ-Ṣalāh – `quduri.ms0011`, Bd. 1, S. 32–33 (Kap. k0011)
  - al-Hidāya, Bāb al-Mawāqīt; Bāb al-Adhān – `hidaya.ms0033`–`ms0039`, Bd. 1, S. 38–43 (Kap. k0008–k0009)
  - al-Ikhtiyār, Awqāt aṣ-Ṣalawāt; al-Awqāt al-Mustaḥabba; al-Awqāt allatī tukrahu fīhā ṣ-Ṣalāh – `ikhtiyar.ms0038`–`ms0043`, Bd. 1, S. 38–42 (Kap. k0024–k0025)
  - al-Ikhtiyār, Bāb al-Adhān wa-l-Iqāma – `ikhtiyar.ms0043`–`ms0046`, Bd. 1, S. 42–45 (Kap. k0027)
  - Radd al-Muḥtār, Kitāb aṣ-Ṣalāh (Anfang: Zeiten) – `radd_al_muhtar.ms0449`–`ms0503`, Bd. 1, S. 350–383
  - Radd al-Muḥtār, Bāb al-Adhān – `radd_al_muhtar.ms0503`–`ms0533`, Bd. 1, S. 383–401 (Kap. k0119)

| Lektion | Titel | Kinder | Hinweis | Belegbasis (Grundtext) |
|---|---|---|---|---|
| `islam.grund.e04.l01` | Wer zum Gebet verpflichtet ist und was die Pflicht begründet | ja |  | Nūr al-Īḍāḥ, Kitāb aṣ-Ṣalāh › Shurūṭ Wujūbihā; Sababuhā – `nur_al_idah.ms0011`, Bd. 1, S. 36 (Kap. k0079–k0080) |
| `islam.grund.e04.l02` | Die Zeiten der fünf Gebete | ja |  | Nūr al-Īḍāḥ, Awqāt aṣ-Ṣalāh – `nur_al_idah.ms0011`–`ms0012`, Bd. 1, S. 36–37 (Kap. k0081) |
| `islam.grund.e04.l03` | Zwei Gebete in einer Zeit; empfohlene Zeiten | ja |  | Nūr al-Īḍāḥ, al-Jamʿ bayna Farḍayn; al-Mustaḥabb min al-Awqāt – `nur_al_idah.ms0012`, Bd. 1, S. 37–38 (Kap. k0082–k0083) |
| `islam.grund.e04.l04` | Zeiten, in denen das Gebet ungültig oder verpönt ist | ja |  | Nūr al-Īḍāḥ, Faṣl fī l-Awqāt allatī lā taṣiḥḥu fīhā ṣ-Ṣalāh – `nur_al_idah.ms0012`, Bd. 1, S. 38–39 (Kap. k0084) |
| `islam.grund.e04.l05` | Gebetsruf und iqāma: Urteil und Form | ja |  | Nūr al-Īḍāḥ, Bāb al-Adhān › Ḥukm, Kayfiyya – `nur_al_idah.ms0012`–`ms0013`, Bd. 1, S. 39 (Kap. k0086–k0089) |
| `islam.grund.e04.l06` | Gebetsruf: Empfohlenes, Verpöntes, Ruf für Nachzuholendes; Verhalten beim Hören | ja |  | Nūr al-Īḍāḥ, Bāb al-Adhān › Mustaḥabb, Makrūh, li-l-Fawāʾit – `nur_al_idah.ms0013`, Bd. 1, S. 39–41 (Kap. k0090–k0093) |

### 3.5 `islam.grund.e05` – Gebet II: Bedingungen, Pflichtteile und Ablauf

- **Bereich:** `salah` · **Ablage:** `web/inhalte/lernapp/islam/salah/islam.grund.e05.json` · **Belegbasis:** belegbar
- **Lernziele:** Lernende
  - kann die Bedingungen des Gebets (Reinheit, Bedeckung, Qibla, Zeit, Absicht) nennen
  - unterscheidet Grundpfeiler (arkān), notwendige Teile (wājibāt), Sunna und Anstand
  - kann den Ablauf eines Gebets in der Reihenfolge der Werke beschreiben (Rezitationen nur als Verweis)
- **Belegbasis der Einheit (Begründung, Vergleich, Fatwa-Meinung):**
  - Mukhtaṣar al-Qudūrī, Bāb Shurūṭ aṣ-Ṣalāh; Bāb Ṣifat aṣ-Ṣalāh – `quduri.ms0007`–`ms0011`, Bd. 1, S. 26–31 (Kap. k0008–k0009)
  - al-Hidāya, Bāb Shurūṭ aṣ-Ṣalāh; Bāb Ṣifat aṣ-Ṣalāh – `hidaya.ms0039`–`ms0054`, Bd. 1, S. 43–55 (Kap. k0010–k0011)
  - al-Ikhtiyār, Bāb mā yufʿalu qabla ṣ-Ṣalāh; Bāb al-Afʿāl fī ṣ-Ṣalāh – `ikhtiyar.ms0046`–`ms0059`, Bd. 1, S. 45–54 (Kap. k0028–k0029)
  - al-Ikhtiyār, Bāb al-Qirāʾa – `ikhtiyar.ms0060`–`ms0062`, Bd. 1, S. 56–57 (Kap. k0031)
  - Radd al-Muḥtār, Bāb Shurūṭ aṣ-Ṣalāh – `radd_al_muhtar.ms0533`–`ms0602`, Bd. 1, S. 401–441 (Kap. k0127)
  - Radd al-Muḥtār, Bāb Ṣifat aṣ-Ṣalāh – `radd_al_muhtar.ms0602`–`ms0779`, Bd. 1, S. 441–547 (Kap. k0141)

| Lektion | Titel | Kinder | Hinweis | Belegbasis (Grundtext) |
|---|---|---|---|---|
| `islam.grund.e05.l01` | Reinheit von Körper, Kleidung und Ort; Bedeckung der ʿawra | ja |  | Nūr al-Īḍāḥ, Bāb Shurūṭ aṣ-Ṣalāh wa-Arkānihā – `nur_al_idah.ms0013`–`ms0014`, Bd. 1, S. 41–42 (Kap. k0094–k0095)<br>Nūr al-Īḍāḥ, Ṭahārat al-Makān, ath-Thawb; Satr al-ʿAwra – `nur_al_idah.ms0014`–`ms0015`, Bd. 1, S. 43–44 (Kap. k0099–k0104) |
| `islam.grund.e05.l02` | Gebetsrichtung und Absicht | ja |  | Nūr al-Īḍāḥ, Sharāʾiṭ aṣ-Ṣalāh; Mutaʿalliqāt ash-Shurūṭ – `nur_al_idah.ms0014`, Bd. 1, S. 42–43 (Kap. k0097–k0098)<br>Nūr al-Īḍāḥ, Istiqbāl al-Qibla – `nur_al_idah.ms0015`, Bd. 1, S. 44–45 (Kap. k0105) |
| `islam.grund.e05.l03` | Grundpfeiler des Gebets (arkān) | ja |  | Nūr al-Īḍāḥ, Arkān aṣ-Ṣalāh – `nur_al_idah.ms0014`, Bd. 1, S. 42 (Kap. k0096) |
| `islam.grund.e05.l04` | Notwendige Teile des Gebets (wājibāt) | ja |  | Nūr al-Īḍāḥ, Faṣl fī Wājib aṣ-Ṣalāh – `nur_al_idah.ms0015`–`ms0016`, Bd. 1, S. 45–46 (Kap. k0106) |
| `islam.grund.e05.l05` | Sunna-Handlungen und Anstand im Gebet | ja |  | Nūr al-Īḍāḥ, Faṣl fī Sunanihā; Faṣl fī Ādāb aṣ-Ṣalāh – `nur_al_idah.ms0016`–`ms0017`, Bd. 1, S. 46–48 (Kap. k0107–k0108)<br>Nūr al-Īḍāḥ, Matā yusannu Rafʿ al-Yadayn – `nur_al_idah.ms0017`–`ms0018`, Bd. 1, S. 49–50 (Kap. k0110) |
| `islam.grund.e05.l06` | Ablauf des Gebets Schritt für Schritt | ja |  | Nūr al-Īḍāḥ, Faṣl fī Kayfiyyat Tarkīb aṣ-Ṣalāh – `nur_al_idah.ms0017`–`ms0018`, Bd. 1, S. 48–50 (Kap. k0109) |

### 3.6 `islam.grund.e06` – Gebet III: Gemeinschaftsgebet, Störungen und Niederwerfung des Versehens

- **Bereich:** `salah` · **Ablage:** `web/inhalte/lernapp/islam/salah/islam.grund.e06.json` · **Belegbasis:** belegbar
- **Lernziele:** Lernende
  - kennt Urteil und Bedingungen des Gemeinschaftsgebets, wer vorangeht und wie die Reihen geordnet werden
  - kann erklären, was das Gebet ungültig macht, was verpönt ist und wann man es unterbrechen darf
  - kann Anlass und Ausführung der Niederwerfung des Versehens (sajdat as-sahw) beschreiben
- **Belegbasis der Einheit (Begründung, Vergleich, Fatwa-Meinung):**
  - Mukhtaṣar al-Qudūrī, Bāb Sujūd as-Sahw – `quduri.ms0012`, Bd. 1, S. 34–36 (Kap. k0013)
  - al-Hidāya, Bāb al-Imāma; Bāb al-Ḥadath fī ṣ-Ṣalāh; Bāb mā yufsidu ṣ-Ṣalāh – `hidaya.ms0054`–`ms0066`, Bd. 1, S. 55–65 (Kap. k0012–k0014)
  - al-Hidāya, Bāb Idrāk al-Farīḍa – `hidaya.ms0072`–`ms0075`, Bd. 1, S. 70–72 (Kap. k0017)
  - al-Hidāya, Bāb Sujūd as-Sahw – `hidaya.ms0076`–`ms0080`, Bd. 1, S. 74–77 (Kap. k0019)
  - al-Ikhtiyār, Bāb Ṣalāt al-Jamāʿa; Bāb mā yukrahu li-l-Muṣallī – `ikhtiyar.ms0062`–`ms0070`, Bd. 1, S. 57–63 (Kap. k0032–k0033)
  - al-Ikhtiyār, Bāb Sujūd as-Sahw – `ikhtiyar.ms0078`–`ms0082`, Bd. 1, S. 72–75 (Kap. k0040)
  - Radd al-Muḥtār, Bāb al-Imāma – `radd_al_muhtar.ms0779`–`ms0866`, Bd. 1, S. 547–599 (Kap. k0200)
  - Radd al-Muḥtār, Bāb mā yufsidu ṣ-Ṣalāh wa-mā yukrahu fīhā – `radd_al_muhtar.ms0890`–`ms0974`, Bd. 1, S. 613 – Bd. 2, S. 3 (Kap. k0228)
  - Radd al-Muḥtār, Bāb Idrāk al-Farīḍa – `radd_al_muhtar.ms1051`–`ms1071`, Bd. 2, S. 50–62 (Kap. k0275)
  - Radd al-Muḥtār, Bāb Sujūd as-Sahw – `radd_al_muhtar.ms1097`–`ms1128`, Bd. 2, S. 77–95 (Kap. k0286)

| Lektion | Titel | Kinder | Hinweis | Belegbasis (Grundtext) |
|---|---|---|---|---|
| `islam.grund.e06.l01` | Imām und Gefolgschaft: Urteil und Bedingungen | ja |  | Nūr al-Īḍāḥ, Bāb al-Imāma › Ḥukm, Shurūṭ, Shurūṭ Ṣiḥḥat al-Iqtidāʾ – `nur_al_idah.ms0018`–`ms0019`, Bd. 1, S. 50–51 (Kap. k0111–k0115) |
| `islam.grund.e06.l02` | Gründe für das Fernbleiben, wer vorangeht, Reihen; nach dem Pflichtgebet | ja |  | Nūr al-Īḍāḥ, Musqiṭāt al-Jamāʿa; al-Aḥaqq bi-l-Imāma; Tartīb aṣ-Ṣufūf – `nur_al_idah.ms0019`–`ms0020`, Bd. 1, S. 51–54 (Kap. k0116–k0122) |
| `islam.grund.e06.l03` | Was das Gebet ungültig macht | ja |  | Nūr al-Īḍāḥ, Bāb mā yufsidu ṣ-Ṣalāh – `nur_al_idah.ms0020`–`ms0023`, Bd. 1, S. 54–60 (Kap. k0123) |
| `islam.grund.e06.l04` | Was es nicht ungültig macht; Verpöntes; Sichtschutz (sutra) | ja |  | Nūr al-Īḍāḥ, Faṣl fīmā lā yufsidu; fīmā yukrahu; fī Ittikhādh as-Sutra – `nur_al_idah.ms0021`–`ms0023`, Bd. 1, S. 55–59 (Kap. k0124–k0128) |
| `islam.grund.e06.l05` | Unterbrechen des Gebets; Anschluss an ein laufendes Pflichtgebet | ja |  | Nūr al-Īḍāḥ, Faṣl fīmā yūjibu Qaṭʿ aṣ-Ṣalāh – `nur_al_idah.ms0023`, Bd. 1, S. 59–60 (Kap. k0129–k0131)<br>Nūr al-Īḍāḥ, Bāb Idrāk al-Farīḍa – `nur_al_idah.ms0029`–`ms0030`, Bd. 1, S. 75–77 (Kap. k0178–k0182) |
| `islam.grund.e06.l06` | Niederwerfung des Versehens und Zweifel im Gebet | ja |  | Nūr al-Īḍāḥ, Bāb Sujūd as-Sahw; Faṣl fī sh-Shakk – `nur_al_idah.ms0030`–`ms0031`, Bd. 1, S. 77–80 (Kap. k0183–k0192) |

### 3.7 `islam.grund.e07` – Gebet IV: Witr, freiwillige Gebete, Nachholen und Krankengebet

- **Bereich:** `salah` · **Ablage:** `web/inhalte/lernapp/islam/salah/islam.grund.e07.json` · **Belegbasis:** belegbar
- **Lernziele:** Lernende
  - kennt Urteil und Form des Witr-Gebets nach hanefitischer Lehre (Bittgebete nur als Verweis)
  - kann Sunna- und freiwillige Gebete, Tarāwīḥ und das Gebet auf Fahrzeugen einordnen
  - kann die Regeln zum Nachholen versäumter Gebete und zum Gebet des Kranken erklären
- **Belegbasis der Einheit (Begründung, Vergleich, Fatwa-Meinung):**
  - Mukhtaṣar al-Qudūrī, Bāb Qaḍāʾ al-Fawāʾit – `quduri.ms0011`, Bd. 1, S. 31–32 (Kap. k0010)
  - Mukhtaṣar al-Qudūrī, Bāb an-Nawāfil – `quduri.ms0011`–`ms0012`, Bd. 1, S. 33–34 (Kap. k0012)
  - Mukhtaṣar al-Qudūrī, Bāb Ṣalāt al-Marīḍ; Bāb Sujūd at-Tilāwa – `quduri.ms0012`–`ms0013`, Bd. 1, S. 36–38 (Kap. k0014–k0015)
  - Mukhtaṣar al-Qudūrī, Bāb Qiyām Shahr Ramaḍān – `quduri.ms0016`, Bd. 1, S. 45–46 (Kap. k0021)
  - al-Hidāya, Bāb Ṣalāt al-Witr; Bāb an-Nawāfil – `hidaya.ms0066`–`ms0072`, Bd. 1, S. 65–70 (Kap. k0015–k0016)
  - al-Hidāya, Bāb Qaḍāʾ al-Fawāʾit – `hidaya.ms0075`–`ms0076`, Bd. 1, S. 72–74 (Kap. k0018)
  - al-Hidāya, Bāb Ṣalāt al-Marīḍ; Bāb Sujūd at-Tilāwa – `hidaya.ms0080`–`ms0084`, Bd. 1, S. 77–80 (Kap. k0020–k0021)
  - al-Ikhtiyār, Bāb Ṣalāt al-Witr – `ikhtiyar.ms0059`–`ms0060`, Bd. 1, S. 54–56 (Kap. k0030)
  - al-Ikhtiyār, Bāb Qaḍāʾ al-Fawāʾit; Bāb an-Nawāfil; Bāb Ṣalāt at-Tarāwīḥ – `ikhtiyar.ms0070`–`ms0077`, Bd. 1, S. 63–70 (Kap. k0035–k0037)
  - al-Ikhtiyār, Bāb Sujūd at-Tilāwa; Bāb Ṣalāt al-Marīḍ – `ikhtiyar.ms0082`–`ms0086`, Bd. 1, S. 75–79 (Kap. k0041–k0042)
  - Radd al-Muḥtār, Bāb al-Witr wa-n-Nawāfil – `radd_al_muhtar.ms0974`–`ms1051`, Bd. 2, S. 3–50 (Kap. k0249)
  - Radd al-Muḥtār, Bāb Qaḍāʾ al-Fawāʾit – `radd_al_muhtar.ms1071`–`ms1097`, Bd. 2, S. 62–77 (Kap. k0280)
  - Radd al-Muḥtār, Bāb Ṣalāt al-Marīḍ – `radd_al_muhtar.ms1128`–`ms1141`, Bd. 2, S. 95–103 (Kap. k0287)
  - Radd al-Muḥtār, Bāb Sujūd at-Tilāwa – `radd_al_muhtar.ms1141`–`ms1171`, Bd. 2, S. 103–120 (Kap. k0289)

| Lektion | Titel | Kinder | Hinweis | Belegbasis (Grundtext) |
|---|---|---|---|---|
| `islam.grund.e07.l01` | Das Witr-Gebet | ja |  | Nūr al-Īḍāḥ, Bāb al-Witr › Ḥukm, Kayfiyya, Qunūt – `nur_al_idah.ms0023`–`ms0024`, Bd. 1, S. 60–62 (Kap. k0132–k0136) |
| `islam.grund.e07.l02` | Sunna- und freiwillige Gebete | ja |  | Nūr al-Īḍāḥ, Faṣl fī n-Nawāfil; Taḥiyyat al-Masjid, Ṣalāt aḍ-Ḍuḥā – `nur_al_idah.ms0024`–`ms0025`, Bd. 1, S. 62–64 (Kap. k0137–k0143) |
| `islam.grund.e07.l03` | Tarāwīḥ; freiwilliges Gebet im Sitzen, auf Reittier, Fahrzeug und Schiff | ja |  | Nūr al-Īḍāḥ, Faṣl fī Ṣalāt an-Nafl jālisan; ʿalā d-Dābba; fī s-Safīna; fī t-Tarāwīḥ – `nur_al_idah.ms0025`–`ms0026`, Bd. 1, S. 64–68 (Kap. k0144–k0154) |
| `islam.grund.e07.l04` | Nachholen versäumter Gebete (qaḍāʾ al-fawāʾit) | ja |  | Nūr al-Īḍāḥ, Bāb Qaḍāʾ al-Fawāʾit › Tartīb, Musqiṭāt – `nur_al_idah.ms0029`, Bd. 1, S. 74–75 (Kap. k0174–k0177) |
| `islam.grund.e07.l05` | Gebet des Kranken; Ausgleich für Gebete und Fasten Verstorbener | ja |  | Nūr al-Īḍāḥ, Bāb Ṣalāt al-Marīḍ; Faṣl fī Isqāṭ aṣ-Ṣalāh wa-ṣ-Ṣawm – `nur_al_idah.ms0028`–`ms0029`, Bd. 1, S. 72–74 (Kap. k0165–k0173) |
| `islam.grund.e07.l06` | Niederwerfung bei der Rezitation und Dankesniederwerfung | ja |  | Nūr al-Īḍāḥ, Bāb Sujūd at-Tilāwa; Faṣl fī Sajdat ash-Shukr – `nur_al_idah.ms0031`–`ms0033`, Bd. 1, S. 80–82 (Kap. k0193–k0202) |

### 3.8 `islam.grund.e08` – Gebet V: Reise, Freitag, Festtage und Totengebet

- **Bereich:** `salah` · **Ablage:** `web/inhalte/lernapp/islam/salah/islam.grund.e08.json` · **Belegbasis:** belegbar
- **Lernziele:** Lernende
  - kann die Regeln zum Kürzen des Gebets auf Reisen und zum Wohnort erklären
  - kennt Urteil, Bedingungen und Ablauf von Freitags- und Festgebet und die Takbīr-Tage (Wortlaut nur als Verweis)
  - kann die Pflichten der Gemeinschaft beim Tod eines Muslims nennen: Waschung, Leichentuch, Totengebet, Bestattung
- **Belegbasis der Einheit (Begründung, Vergleich, Fatwa-Meinung):**
  - Mukhtaṣar al-Qudūrī, Bāb Ṣalāt al-Musāfir; al-Jumuʿa; al-ʿĪdayn; al-Kusūf; al-Istisqāʾ – `quduri.ms0013`–`ms0016`, Bd. 1, S. 38–45 (Kap. k0016–k0020)
  - Mukhtaṣar al-Qudūrī, Bāb Ṣalāt al-Khawf; Ṣalāt al-Janāʾiz; ash-Shahīd – `quduri.ms0016`–`ms0018`, Bd. 1, S. 46–50 (Kap. k0022–k0024)
  - al-Hidāya, Bāb Ṣalāt al-Musāfir … Bāb ash-Shahīd – `hidaya.ms0084`–`ms0101`, Bd. 1, S. 80–95 (Kap. k0022–k0029)
  - al-Ikhtiyār, Bāb Ṣalāt al-Musāfir; al-Jumuʿa; al-ʿĪdayn – `ikhtiyar.ms0086`–`ms0098`, Bd. 1, S. 79–88 (Kap. k0043–k0045)
  - al-Ikhtiyār, Bāb Ṣalāt al-Kusūf – `ikhtiyar.ms0077`–`ms0078`, Bd. 1, S. 70–72 (Kap. k0038)
  - al-Ikhtiyār, Bāb Ṣalāt al-Khawf – `ikhtiyar.ms0098`–`ms0100`, Bd. 1, S. 88–90 (Kap. k0048)
  - al-Ikhtiyār, Bāb al-Janāʾiz – `ikhtiyar.ms0100`–`ms0108`, Bd. 1, S. 90–97 (Kap. k0050)
  - al-Ikhtiyār, Bāb ash-Shahīd – `ikhtiyar.ms0108`–`ms0110`, Bd. 1, S. 97–99 (Kap. k0055)
  - Radd al-Muḥtār, Bāb Ṣalāt al-Musāfir – `radd_al_muhtar.ms1171`–`ms1197`, Bd. 2, S. 120–136 (Kap. k0292)
  - Radd al-Muḥtār, Bāb al-Jumuʿa – `radd_al_muhtar.ms1197`–`ms1245`, Bd. 2, S. 136–165 (Kap. k0294)
  - Radd al-Muḥtār, Bāb al-ʿĪdayn – `radd_al_muhtar.ms1245`–`ms1270`, Bd. 2, S. 165–181 (Kap. k0305)
  - Radd al-Muḥtār, Bāb al-Kusūf; al-Istisqāʾ; Ṣalāt al-Khawf – `radd_al_muhtar.ms1270`–`ms1282`, Bd. 2, S. 181–189 (Kap. k0318–k0321)
  - Radd al-Muḥtār, Bāb Ṣalāt al-Janāʾiz – `radd_al_muhtar.ms1282`–`ms1376`, Bd. 2, S. 189–247 (Kap. k0322)
  - Radd al-Muḥtār, Bāb ash-Shahīd – `radd_al_muhtar.ms1376`–`ms1388`, Bd. 2, S. 247–253 (Kap. k0348)

| Lektion | Titel | Kinder | Hinweis | Belegbasis (Grundtext) |
|---|---|---|---|---|
| `islam.grund.e08.l01` | Gebet des Reisenden: Kürzen, Bedingungen, Dauer, Wohnort | ja |  | Nūr al-Īḍāḥ, Bāb Ṣalāt al-Musāfir; al-Waṭan wa-Aqsāmuhu – `nur_al_idah.ms0026`–`ms0028`, Bd. 1, S. 69–72 (Kap. k0156–k0164) |
| `islam.grund.e08.l02` | Freitagsgebet: Urteil, Bedingungen, Predigt | ja |  | Nūr al-Īḍāḥ, Bāb Ṣalāt al-Jumuʿa – `nur_al_idah.ms0033`–`ms0034`, Bd. 1, S. 83–85 (Kap. k0204–k0209) |
| `islam.grund.e08.l03` | Festgebete und Takbīr der Tashrīq-Tage | ja |  | Nūr al-Īḍāḥ, Bāb Ṣalāt al-ʿĪdayn; Aḥkām al-Aḍḥā; Takbīr at-Tashrīq – `nur_al_idah.ms0034`–`ms0035`, Bd. 1, S. 85–87 (Kap. k0210–k0217) |
| `islam.grund.e08.l04` | Gebet bei Finsternis, Regenbitte und Gebet in Gefahr | ja |  | Nūr al-Īḍāḥ, Bāb Ṣalāt al-Kusūf; Bāb al-Istisqāʾ; Bāb Ṣalāt al-Khawf – `nur_al_idah.ms0035`–`ms0036`, Bd. 1, S. 87–90 (Kap. k0218–k0226) |
| `islam.grund.e08.l05` | Beim Sterbenden und nach dem Tod: Waschung und Leichentuch | nein (Vorschlag) |  | Nūr al-Īḍāḥ, Bāb Aḥkām al-Janāʾiz › al-Muḥtaḍar, Tajhīz, Kafan – `nur_al_idah.ms0036`–`ms0038`, Bd. 1, S. 90–93 (Kap. k0227–k0232) |
| `islam.grund.e08.l06` | Totengebet: Pflichtteile, Bedingungen, Sunna; wer vorangeht | ja |  | Nūr al-Īḍāḥ, Faṣl fī Ṣalāt al-Janāza; Faṣl fī Aḥaqq an-Nās bi-ṣ-Ṣalāh ʿalayh – `nur_al_idah.ms0038`–`ms0039`, Bd. 1, S. 93–97 (Kap. k0233–k0244) |
| `islam.grund.e08.l07` | Tragen, Bestattung und Grabbesuch; der Märtyrer | ja |  | Nūr al-Īḍāḥ, Faṣl fī Ḥamlihā wa-Dafnihā; Ziyārat al-Qubūr; Bāb Aḥkām ash-Shahīd – `nur_al_idah.ms0039`–`ms0041`, Bd. 1, S. 97–100 (Kap. k0245–k0253) |

### 3.9 `islam.grund.e09` – Glaube I: Grundlagen des Glaubens und die Einheit Gottes

- **Bereich:** `akaid` · **Ablage:** `web/inhalte/lernapp/islam/akaid/islam.grund.e09.json` · **Belegbasis:** belegbar
- **Lernziele:** Lernende
  - kann erklären, was die Werke unter Glaube (īmān) verstehen und wie Glaube und Islam zusammenhängen
  - kann die Lehre von der Einheit Gottes (tawḥīd) und Seinen Eigenschaften (ṣifāt) in eigenen Worten wiedergeben
  - unterscheidet wesenhafte Eigenschaften und Handlungseigenschaften nach der maturiditisch-hanefitischen Lehre
- **Belegbasis der Einheit (Begründung, Vergleich, Fatwa-Meinung):**
  - al-Fiqh al-Akbar, Bayān Uṣūl al-Īmān bis al-Qawl fī ṣ-Ṣifāt – `fiqh_akbar.ms0001`–`ms0002`, Bd. 1, S. 5–29 (Kap. k0001–k0006)
  - al-ʿAqīda aṭ-Ṭaḥāwiyya, Nr. 1–18 – `tahawiyya.ms0001`, Bd. 1, S. 17–21 (Kap. k0001–k0018)

| Lektion | Titel | Kinder | Hinweis | Belegbasis (Grundtext) |
|---|---|---|---|---|
| `islam.grund.e09.l01` | Was Glaube ist; Glaube und Islam | ja |  | al-Fiqh al-Akbar, Taʿrīf al-Īmān; al-Islām wa-l-Īmān – `fiqh_akbar.ms0004`, Bd. 1, S. 55–59 (Kap. k0017–k0018)<br>al-Fiqh al-Akbar, Bayān Uṣūl al-Īmān – `fiqh_akbar.ms0001`, Bd. 1, S. 5–14 (Kap. k0001)<br>al-ʿAqīda aṭ-Ṭaḥāwiyya, Nr. 61–67 – `tahawiyya.ms0005`, Bd. 1, S. 42–45 (Kap. k0061–k0067) |
| `islam.grund.e09.l02` | Die Einheit Gottes (tawḥīd) | ja |  | al-Fiqh al-Akbar, Waḥdāniyyat Allāh – `fiqh_akbar.ms0001`, Bd. 1, S. 14–16 (Kap. k0002)<br>al-ʿAqīda aṭ-Ṭaḥāwiyya, Nr. 1–4 – `tahawiyya.ms0001`, Bd. 1, S. 17–19 (Kap. k0001–k0004) |
| `islam.grund.e09.l03` | Gott ist ewig und den Geschöpfen nicht ähnlich | ja |  | al-ʿAqīda aṭ-Ṭaḥāwiyya, Nr. 5–12 – `tahawiyya.ms0001`, Bd. 1, S. 19–20 (Kap. k0005–k0012)<br>al-ʿAqīda aṭ-Ṭaḥāwiyya, Nr. 34 – `tahawiyya.ms0002`, Bd. 1, S. 25–26 (Kap. k0034)<br>al-ʿAqīda aṭ-Ṭaḥāwiyya, Nr. 38 – `tahawiyya.ms0003`, Bd. 1, S. 28–29 (Kap. k0038)<br>al-Fiqh al-Akbar, Maʿnā l-Qurb wa-l-Buʿd – `fiqh_akbar.ms0005`, Bd. 1, S. 67–68 (Kap. k0023) |
| `islam.grund.e09.l04` | Eigenschaften Gottes: wesenhafte und Handlungseigenschaften | ja |  | al-Fiqh al-Akbar, aṣ-Ṣifāt adh-Dhātiyya wa-l-Fiʿliyya; Ṣifāt Allāh azaliyya – `fiqh_akbar.ms0001`, Bd. 1, S. 16–20 (Kap. k0003–k0004)<br>al-Fiqh al-Akbar, al-Qawl fī ṣ-Ṣifāt – `fiqh_akbar.ms0002`, Bd. 1, S. 27–29 (Kap. k0006)<br>al-ʿAqīda aṭ-Ṭaḥāwiyya, Nr. 13–17 – `tahawiyya.ms0001`, Bd. 1, S. 20–21 (Kap. k0013–k0017) |
| `islam.grund.e09.l05` | Gottes Allmacht, Wissen und Herrschaft | ja |  | al-ʿAqīda aṭ-Ṭaḥāwiyya, Nr. 49–51 – `tahawiyya.ms0004`, Bd. 1, S. 36–38 (Kap. k0049–k0051)<br>al-ʿAqīda aṭ-Ṭaḥāwiyya, Nr. 88 – `tahawiyya.ms0007`, Bd. 1, S. 55–56 (Kap. k0088)<br>al-ʿAqīda aṭ-Ṭaḥāwiyya, Nr. 90–92 – `tahawiyya.ms0007`, Bd. 1, S. 56–57 (Kap. k0090–k0092) |
| `islam.grund.e09.l06` | Angeborene Veranlagung (fiṭra) und Gotteserkenntnis | ja |  | al-Fiqh al-Akbar, Mā faṭara Allāhu ʿalayhi n-Nās – `fiqh_akbar.ms0002`–`ms0003`, Bd. 1, S. 31–35 (Kap. k0008)<br>al-Fiqh al-Akbar, Maʿrifatunā bi-llāh – `fiqh_akbar.ms0004`–`ms0005`, Bd. 1, S. 59–61 (Kap. k0019) |

### 3.10 `islam.grund.e10` – Glaube II: Engel, Bücher und Propheten

- **Bereich:** `akaid` · **Ablage:** `web/inhalte/lernapp/islam/akaid/islam.grund.e10.json` · **Belegbasis:** belegbar
- **Lernziele:** Lernende
  - kann die Glaubensinhalte zu Engeln, Offenbarungsschriften und Gesandten nennen
  - kann erklären, wie die Werke den Koran als Rede Gottes beschreiben (Verse nur als Verweis)
  - kennt die Lehre von Prophetenschaft, Sündlosigkeit der Propheten und dem Siegel der Propheten
- **Belegbasis der Einheit (Begründung, Vergleich, Fatwa-Meinung):**
  - al-Fiqh al-Akbar, al-Qawl fī l-Qurʾān – `fiqh_akbar.ms0001`–`ms0002`, Bd. 1, S. 20–27 (Kap. k0005)
  - al-Fiqh al-Akbar, ʿIṣmat al-Anbiyāʾ; al-Qawl fī r-Rasūl – `fiqh_akbar.ms0003`, Bd. 1, S. 37–41 (Kap. k0010–k0011)
  - al-ʿAqīda aṭ-Ṭaḥāwiyya, Nr. 29–33 – `tahawiyya.ms0002`, Bd. 1, S. 22–25 (Kap. k0029–k0033)
  - al-ʿAqīda aṭ-Ṭaḥāwiyya, Nr. 52–53 – `tahawiyya.ms0004`, Bd. 1, S. 38 (Kap. k0052–k0053)

| Lektion | Titel | Kinder | Hinweis | Belegbasis (Grundtext) |
|---|---|---|---|---|
| `islam.grund.e10.l01` | Glaubensartikel: Engel, Bücher, Gesandte | ja |  | al-ʿAqīda aṭ-Ṭaḥāwiyya, Nr. 53 – `tahawiyya.ms0004`, Bd. 1, S. 38 (Kap. k0053)<br>al-ʿAqīda aṭ-Ṭaḥāwiyya, Nr. 66–67 – `tahawiyya.ms0005`, Bd. 1, S. 44–45 (Kap. k0066–k0067)<br>al-Fiqh al-Akbar, Bayān Uṣūl al-Īmān – `fiqh_akbar.ms0001`, Bd. 1, S. 5–14 (Kap. k0001) |
| `islam.grund.e10.l02` | Der Koran als Rede Gottes | ja |  | al-Fiqh al-Akbar, al-Qawl fī l-Qurʾān – `fiqh_akbar.ms0001`–`ms0002`, Bd. 1, S. 20–27 (Kap. k0005)<br>al-Fiqh al-Akbar, Tafāḍul Āyāt al-Qurʾān – `fiqh_akbar.ms0005`–`ms0006`, Bd. 1, S. 68–70 (Kap. k0024)<br>al-ʿAqīda aṭ-Ṭaḥāwiyya, Nr. 33 – `tahawiyya.ms0002`, Bd. 1, S. 24–25 (Kap. k0033)<br>al-ʿAqīda aṭ-Ṭaḥāwiyya, Nr. 56 – `tahawiyya.ms0004`, Bd. 1, S. 38–40 (Kap. k0056) |
| `islam.grund.e10.l03` | Propheten: Sündlosigkeit, Rang und Wunder | ja |  | al-Fiqh al-Akbar, ʿIṣmat al-Anbiyāʾ – `fiqh_akbar.ms0003`, Bd. 1, S. 37–39 (Kap. k0010)<br>al-Fiqh al-Akbar, Āyāt al-Anbiyāʾ wa-Karāmāt al-Awliyāʾ – `fiqh_akbar.ms0004`, Bd. 1, S. 51–53 (Kap. k0015)<br>al-ʿAqīda aṭ-Ṭaḥāwiyya, Nr. 52 – `tahawiyya.ms0004`, Bd. 1, S. 38 (Kap. k0052)<br>al-ʿAqīda aṭ-Ṭaḥāwiyya, Nr. 98–99 – `tahawiyya.ms0007`–`ms0008`, Bd. 1, S. 58–59 (Kap. k0098–k0099) |
| `islam.grund.e10.l04` | Muḥammad als Gesandter und Siegel der Propheten; seine Kinder | ja |  | al-Fiqh al-Akbar, al-Qawl fī r-Rasūl – `fiqh_akbar.ms0003`, Bd. 1, S. 39–41 (Kap. k0011)<br>al-Fiqh al-Akbar, Abnāʾ Rasūl Allāh wa-Banātuhu – `fiqh_akbar.ms0006`, Bd. 1, S. 70–72 (Kap. k0025)<br>al-ʿAqīda aṭ-Ṭaḥāwiyya, Nr. 29–32 – `tahawiyya.ms0002`, Bd. 1, S. 22–24 (Kap. k0029–k0032) |
| `islam.grund.e10.l05` | Himmelsreise, Becken, Fürsprache und Bund (mīthāq) | ja |  | al-ʿAqīda aṭ-Ṭaḥāwiyya, Nr. 39–42 – `tahawiyya.ms0003`, Bd. 1, S. 29–31 (Kap. k0039–k0042)<br>al-Fiqh al-Akbar, Shafāʿat al-Anbiyāʾ wa-l-Mīzān wa-l-Ḥawḍ – `fiqh_akbar.ms0005`, Bd. 1, S. 61–63 (Kap. k0020) |
| `islam.grund.e10.l06` | Engel im Leben des Menschen: die Schreibenden und der Todesengel | ja |  | al-ʿAqīda aṭ-Ṭaḥāwiyya, Nr. 78–79 – `tahawiyya.ms0006`, Bd. 1, S. 50 (Kap. k0078–k0079) |

### 3.11 `islam.grund.e11` – Glaube III: Bestimmung, Jenseits und Gemeinschaft

- **Bereich:** `akaid` · **Ablage:** `web/inhalte/lernapp/islam/akaid/islam.grund.e11.json` · **Belegbasis:** belegbar
- **Lernziele:** Lernende
  - kann die Lehre von der göttlichen Bestimmung (qadar) und dem Erwerb der Handlungen (kasb) in eigenen Worten erklären
  - kennt die Glaubensinhalte zu Grab, Auferstehung, Paradies, Hölle und der Schau Gottes
  - kann die Haltung der Werke zu Sünde und Glaube, zu den Gefährten und zur Gemeinschaft wiedergeben
- **Belegbasis der Einheit (Begründung, Vergleich, Fatwa-Meinung):**
  - al-Fiqh al-Akbar, al-Qawl fī l-Qadar; Mā faṭara Allāhu ʿalayhi n-Nās; aṭ-Ṭāʿāt wa-l-Maʿāṣī – `fiqh_akbar.ms0002`–`ms0003`, Bd. 1, S. 29–37 (Kap. k0007–k0009)
  - al-Fiqh al-Akbar, al-Mufāḍala bayna ṣ-Ṣaḥāba bis Ruʾyat Allāh fī l-Ākhira – `fiqh_akbar.ms0003`–`ms0004`, Bd. 1, S. 41–55 (Kap. k0012–k0016)
  - al-Fiqh al-Akbar, Shafāʿa, Mīzān und Ḥawḍ; al-Janna wa-n-Nār; ʿAdhāb al-Qabr – `fiqh_akbar.ms0005`, Bd. 1, S. 61–67 (Kap. k0020–k0022)
  - al-ʿAqīda aṭ-Ṭaḥāwiyya, Nr. 18–28 – `tahawiyya.ms0001`–`ms0002`, Bd. 1, S. 21–22 (Kap. k0018–k0028)
  - al-ʿAqīda aṭ-Ṭaḥāwiyya, Nr. 43–48 – `tahawiyya.ms0003`–`ms0004`, Bd. 1, S. 31–36 (Kap. k0043–k0048)
  - al-ʿAqīda aṭ-Ṭaḥāwiyya, Nr. 80–87 – `tahawiyya.ms0006`–`ms0007`, Bd. 1, S. 50–55 (Kap. k0080–k0087)

| Lektion | Titel | Kinder | Hinweis | Belegbasis (Grundtext) |
|---|---|---|---|---|
| `islam.grund.e11.l01` | Göttliche Bestimmung und menschliches Handeln | ja |  | al-Fiqh al-Akbar, al-Qawl fī l-Qadar – `fiqh_akbar.ms0002`, Bd. 1, S. 29–31 (Kap. k0007)<br>al-Fiqh al-Akbar, aṭ-Ṭāʿāt maḥbūba … wa-l-Maʿāṣī maqdūra – `fiqh_akbar.ms0003`, Bd. 1, S. 35–37 (Kap. k0009)<br>al-ʿAqīda aṭ-Ṭaḥāwiyya, Nr. 18–28 – `tahawiyya.ms0001`–`ms0002`, Bd. 1, S. 21–22 (Kap. k0018–k0028)<br>al-ʿAqīda aṭ-Ṭaḥāwiyya, Nr. 43–48 – `tahawiyya.ms0003`–`ms0004`, Bd. 1, S. 31–36 (Kap. k0043–k0048)<br>al-ʿAqīda aṭ-Ṭaḥāwiyya, Nr. 84–87 – `tahawiyya.ms0006`–`ms0007`, Bd. 1, S. 51–55 (Kap. k0084–k0087) |
| `islam.grund.e11.l02` | Tod, Grab und Auferstehung | ja |  | al-Fiqh al-Akbar, ʿAdhāb al-Qabr – `fiqh_akbar.ms0005`, Bd. 1, S. 65–67 (Kap. k0022)<br>al-ʿAqīda aṭ-Ṭaḥāwiyya, Nr. 80–82 – `tahawiyya.ms0006`, Bd. 1, S. 50–51 (Kap. k0080–k0082)<br>al-ʿAqīda aṭ-Ṭaḥāwiyya, Nr. 89 – `tahawiyya.ms0007`, Bd. 1, S. 56 (Kap. k0089) |
| `islam.grund.e11.l03` | Paradies, Hölle und die Schau Gottes | ja |  | al-Fiqh al-Akbar, Ruʾyat Allāh fī l-Ākhira – `fiqh_akbar.ms0004`, Bd. 1, S. 53–55 (Kap. k0016)<br>al-Fiqh al-Akbar, al-Janna wa-n-Nār lā tafnayān – `fiqh_akbar.ms0005`, Bd. 1, S. 63–65 (Kap. k0021)<br>al-ʿAqīda aṭ-Ṭaḥāwiyya, Nr. 35–37 – `tahawiyya.ms0002`–`ms0003`, Bd. 1, S. 26–28 (Kap. k0035–k0037)<br>al-ʿAqīda aṭ-Ṭaḥāwiyya, Nr. 83 – `tahawiyya.ms0006`, Bd. 1, S. 51 (Kap. k0083) |
| `islam.grund.e11.l04` | Zeichen der Stunde | ja |  | al-Fiqh al-Akbar, Ashrāṭ as-Sāʿa – `fiqh_akbar.ms0006`, Bd. 1, S. 72 (Kap. k0026)<br>al-ʿAqīda aṭ-Ṭaḥāwiyya, Nr. 100 – `tahawiyya.ms0008`, Bd. 1, S. 59–60 (Kap. k0100) |
| `islam.grund.e11.l05` | Sünde, Hoffnung und Glaube; die Leute der Qibla | ja |  | al-Fiqh al-Akbar, Lā yakfuru Muslim bi-Dhanb – `fiqh_akbar.ms0003`, Bd. 1, S. 43–45 (Kap. k0013)<br>al-ʿAqīda aṭ-Ṭaḥāwiyya, Nr. 54 – `tahawiyya.ms0004`, Bd. 1, S. 38 (Kap. k0054)<br>al-ʿAqīda aṭ-Ṭaḥāwiyya, Nr. 57–60 – `tahawiyya.ms0004`–`ms0005`, Bd. 1, S. 40–42 (Kap. k0057–k0060)<br>al-ʿAqīda aṭ-Ṭaḥāwiyya, Nr. 68–70 – `tahawiyya.ms0005`, Bd. 1, S. 45–46 (Kap. k0068–k0070) |
| `islam.grund.e11.l06` | Die Gefährten und die Gelehrten; Gemeinschaft und Mitte | ja |  | al-Fiqh al-Akbar, al-Mufāḍala bayna ṣ-Ṣaḥāba – `fiqh_akbar.ms0003`, Bd. 1, S. 41–43 (Kap. k0012)<br>al-Fiqh al-Akbar, Dhikr baʿḍ ʿAqāʾid Ahl as-Sunna – `fiqh_akbar.ms0003`–`ms0004`, Bd. 1, S. 45–51 (Kap. k0014)<br>al-ʿAqīda aṭ-Ṭaḥāwiyya, Nr. 73–75 – `tahawiyya.ms0006`, Bd. 1, S. 48–49 (Kap. k0073–k0075)<br>al-ʿAqīda aṭ-Ṭaḥāwiyya, Nr. 93–97 – `tahawiyya.ms0007`, Bd. 1, S. 57–58 (Kap. k0093–k0097)<br>al-ʿAqīda aṭ-Ṭaḥāwiyya, Nr. 101–105 – `tahawiyya.ms0008`, Bd. 1, S. 60–62 (Kap. k0101–k0105) |

## 4. Aufbaustufe – Fasten, Zakat, Hadsch, Erlaubtes und Verbotenes

### 4.1 `islam.aufbau.e01` – Fasten I: Pflicht, Arten, Absicht und Monatsbeginn

- **Bereich:** `sawm` · **Ablage:** `web/inhalte/lernapp/islam/sawm/islam.aufbau.e01.json` · **Belegbasis:** belegbar
- **Lernziele:** Lernende
  - kann Begriff, Grund und Bedingungen der Fastenpflicht im Ramadan nennen
  - unterscheidet die Arten des Fastens und kennt die Regeln zur Absicht
  - kann wiedergeben, wie die Werke den Beginn des Ramadan feststellen (strittiges Thema, ausgewiesen)
- **Belegbasis der Einheit (Begründung, Vergleich, Fatwa-Meinung):**
  - Mukhtaṣar al-Qudūrī, Kitāb aṣ-Ṣawm – `quduri.ms0023`–`ms0025`, Bd. 1, S. 62–66 (Kap. k0037)
  - al-Hidāya, Kitāb aṣ-Ṣawm (Anfang) – `hidaya.ms0128`–`ms0133`, Bd. 1, S. 117–122
  - al-Ikhtiyār, Kitāb aṣ-Ṣawm (vor Bāb al-Iʿtikāf) – `ikhtiyar.ms0140`–`ms0155`, Bd. 1, S. 124–137
  - Radd al-Muḥtār, Kitāb aṣ-Ṣawm (Anfang) – `radd_al_muhtar.ms1582`–`ms1624`, Bd. 2, S. 369–394

| Lektion | Titel | Kinder | Hinweis | Belegbasis (Grundtext) |
|---|---|---|---|---|
| `islam.aufbau.e01.l01` | Begriff, Grund und Bedingungen der Pflicht | ja |  | Nūr al-Īḍāḥ, Kitāb aṣ-Ṣawm › Taʿrīf, Sabab, Shurūṭ, Rukn – `nur_al_idah.ms0041`, Bd. 1, S. 100 (Kap. k0255–k0260) |
| `islam.aufbau.e01.l02` | Arten des Fastens | ja |  | Nūr al-Īḍāḥ, Ḥukmuhu; Faṣl fī Ṣifat aṣ-Ṣawm wa-Taqsīmihi – `nur_al_idah.ms0041`–`ms0042`, Bd. 1, S. 100–102 (Kap. k0261–k0262) |
| `islam.aufbau.e01.l03` | Die Absicht beim Fasten | ja |  | Nūr al-Īḍāḥ, Faṣl fī Tabyīt an-Niyya wa-Taʿyīnihā – `nur_al_idah.ms0042`, Bd. 1, S. 102–103 (Kap. k0263–k0265) |
| `islam.aufbau.e01.l04` | Beginn des Ramadan: Sichtung des Neumonds, Tag des Zweifels | ja | strittig | Nūr al-Īḍāḥ, Faṣl fīmā yathbutu bihi l-Hilāl – `nur_al_idah.ms0042`–`ms0043`, Bd. 1, S. 103–105 (Kap. k0266–k0269)<br>Radd al-Muḥtār, Mabḥath fī Ṣawm Yawm ash-Shakk; Ruʾyat al-Hilāl; Ikhtilāf al-Maṭāliʿ – `radd_al_muhtar.ms1601`–`ms1624`, Bd. 2, S. 381–394 (Kap. k0390–k0394) |
| `islam.aufbau.e01.l05` | Freiwilliges Fasten und Gelübde | ja |  | Nūr al-Īḍāḥ, Ṣawm at-Taṭawwuʿ – `nur_al_idah.ms0047`, Bd. 1, S. 112–113 (Kap. k0289–k0290)<br>Nūr al-Īḍāḥ, Bāb mā yalzamu l-Wafāʾ bihi min Mandhūr aṣ-Ṣawm – `nur_al_idah.ms0047`–`ms0048`, Bd. 1, S. 113–114 (Kap. k0291–k0293) |

### 4.2 `islam.aufbau.e02` – Fasten II: Was das Fasten bricht, Nachholen, Sühne und Iʿtikāf

- **Bereich:** `sawm` · **Ablage:** `web/inhalte/lernapp/islam/sawm/islam.aufbau.e02.json` · **Belegbasis:** belegbar
- **Lernziele:** Lernende
  - kann unterscheiden, was das Fasten nicht bricht, was nur Nachholen und was zusätzlich Sühne (kaffāra) verlangt
  - kennt die Gründe, nicht zu fasten, und die Regeln zu Nachholen und Ersatzleistung (fidya)
  - kann Arten und Regeln des Iʿtikāf beschreiben
- **Belegbasis der Einheit (Begründung, Vergleich, Fatwa-Meinung):**
  - Mukhtaṣar al-Qudūrī, Bāb al-Iʿtikāf – `quduri.ms0025`, Bd. 1, S. 65–66 (Kap. k0038)
  - al-Hidāya, Bāb mā yūjibu l-Qaḍāʾ wa-l-Kaffāra; Bāb al-Iʿtikāf – `hidaya.ms0133`–`ms0147`, Bd. 1, S. 122–134 (Kap. k0040–k0041)
  - al-Ikhtiyār, Bāb al-Iʿtikāf – `ikhtiyar.ms0155`–`ms0158`, Bd. 1, S. 136–139 (Kap. k0071)
  - Radd al-Muḥtār, Bāb mā yufsidu ṣ-Ṣawm wa-mā lā yufsiduhu – `radd_al_muhtar.ms1624`–`ms1702`, Bd. 2, S. 394–440 (Kap. k0395)
  - Radd al-Muḥtār, Bāb al-Iʿtikāf – `radd_al_muhtar.ms1702`–`ms1725`, Bd. 2, S. 440–453 (Kap. k0411)

| Lektion | Titel | Kinder | Hinweis | Belegbasis (Grundtext) |
|---|---|---|---|---|
| `islam.aufbau.e02.l01` | Was das Fasten nicht bricht | ja |  | Nūr al-Īḍāḥ, Bāb mā lā yufsidu ṣ-Ṣawm – `nur_al_idah.ms0043`–`ms0044`, Bd. 1, S. 105–106 (Kap. k0270) |
| `islam.aufbau.e02.l02` | Was Nachholen und Sühne verlangt | nein (Vorschlag) |  | Nūr al-Īḍāḥ, Bāb mā yufsidu ṣ-Ṣawm wa-tajibu bihi l-Kaffāra; Faṣl fī l-Kaffāra – `nur_al_idah.ms0044`–`ms0045`, Bd. 1, S. 106–108 (Kap. k0271–k0275) |
| `islam.aufbau.e02.l03` | Was nur Nachholen verlangt; Enthaltung am Tag | ja |  | Nūr al-Īḍāḥ, Bāb mā yufsidu ṣ-Ṣawm min ghayr Kaffāra; Faṣl fī l-Imsāk – `nur_al_idah.ms0045`–`ms0046`, Bd. 1, S. 108–110 (Kap. k0276–k0277) |
| `islam.aufbau.e02.l04` | Verpöntes und Empfohlenes für Fastende | ja |  | Nūr al-Īḍāḥ, Faṣl fīmā yukrahu li-ṣ-Ṣāʾim wa-mā yustaḥabb – `nur_al_idah.ms0046`, Bd. 1, S. 110–111 (Kap. k0278–k0281) |
| `islam.aufbau.e02.l05` | Gründe, nicht zu fasten: Reise, Krankheit, Alter; Nachholen und fidya | ja |  | Nūr al-Īḍāḥ, Faṣl fī l-ʿAwāriḍ; al-Fidya – `nur_al_idah.ms0046`–`ms0047`, Bd. 1, S. 111–112 (Kap. k0282–k0288) |
| `islam.aufbau.e02.l06` | Iʿtikāf | ja |  | Nūr al-Īḍāḥ, Bāb al-Iʿtikāf – `nur_al_idah.ms0048`–`ms0049`, Bd. 1, S. 114–117 (Kap. k0294–k0300) |

### 4.3 `islam.aufbau.e03` – Zakat I: Pflicht, Bedingungen und Vermögensarten

- **Bereich:** `zakat` · **Ablage:** `web/inhalte/lernapp/islam/zakat/islam.aufbau.e03.json` · **Belegbasis:** belegbar
- **Lernziele:** Lernende
  - kann Begriff, Grund und Bedingungen der Zakat-Pflicht nennen
  - kennt die Vermögensarten, für die die Werke Zakat bestimmen, und das Prinzip der Mindestmenge (niṣāb)
  - kann die Regeln zu Gold, Silber, Forderungen und Handelsware in eigenen Worten wiedergeben
- **Belegbasis der Einheit (Begründung, Vergleich, Fatwa-Meinung):**
  - Mukhtaṣar al-Qudūrī, Kitāb az-Zakāh bis Bāb Zakāt az-Zurūʿ – `quduri.ms0019`–`ms0022`, Bd. 1, S. 51–59 (Kap. k0026–k0034)
  - al-Hidāya, Kitāb az-Zakāh (Anfang) – `hidaya.ms0102`–`ms0104`, Bd. 1, S. 95–98
  - al-Hidāya, Bāb Ṣadaqat as-Sawāʾim … Bāb Zakāt az-Zurūʿ – `hidaya.ms0104`–`ms0121`, Bd. 1, S. 98–112 (Kap. k0032–k0036)
  - al-Ikhtiyār, Kitāb az-Zakāh (Anfang) – `ikhtiyar.ms0110`–`ms0117`, Bd. 1, S. 98–106
  - al-Ikhtiyār, Bāb Zakāt as-Sawāʾim – `ikhtiyar.ms0117`–`ms0123`, Bd. 1, S. 105–110 (Kap. k0057)
  - al-Ikhtiyār, Bāb Zakāt adh-Dhahab wa-l-Fiḍḍa; az-Zurūʿ – `ikhtiyar.ms0123`–`ms0129`, Bd. 1, S. 110–115 (Kap. k0062–k0063)
  - al-Ikhtiyār, Bāb al-Maʿdin – `ikhtiyar.ms0131`–`ms0132`, Bd. 1, S. 117–118 (Kap. k0065)
  - Radd al-Muḥtār, Kitāb az-Zakāh (Anfang) – `radd_al_muhtar.ms1392`–`ms1423`, Bd. 2, S. 256–275
  - Radd al-Muḥtār, Bāb as-Sāʾima … Zakāt al-Ghanam – `radd_al_muhtar.ms1423`–`ms1456`, Bd. 2, S. 275–295 (Kap. k0357–k0360)
  - Radd al-Muḥtār, Bāb Zakāt al-Māl – `radd_al_muhtar.ms1456`–`ms1479`, Bd. 2, S. 295–308 (Kap. k0366)
  - Radd al-Muḥtār, Bāb ar-Rikāz; Bāb al-ʿUshr – `radd_al_muhtar.ms1494`–`ms1529`, Bd. 2, S. 318–339 (Kap. k0374–k0375)

| Lektion | Titel | Kinder | Hinweis | Belegbasis (Grundtext) |
|---|---|---|---|---|
| `islam.aufbau.e03.l01` | Begriff, Weisheit, Grund und Bedingungen der Zakat | ja |  | Nūr al-Īḍāḥ, Kitāb az-Zakāh › Taʿrīf, Ḥukm, Sabab, Rukn, Shurūṭ – `nur_al_idah.ms0049`, Bd. 1, S. 119–121 (Kap. k0303–k0309) |
| `islam.aufbau.e03.l02` | Vermögensarten; Weidevieh | ja |  | Nūr al-Īḍāḥ, al-Ajnās allatī tajibu fīhā z-Zakāh; Zakāt as-Sawāʾim – `nur_al_idah.ms0049`–`ms0052`, Bd. 1, S. 121–126 (Kap. k0310–k0315) |
| `islam.aufbau.e03.l03` | Gold und Silber: Mindestmengen | ja |  | Nūr al-Īḍāḥ, Zakāt al-Fiḍḍa wa-dh-Dhahab; Niṣāb – `nur_al_idah.ms0052`, Bd. 1, S. 126–127 (Kap. k0316–k0318) |
| `islam.aufbau.e03.l04` | Forderungen und Handelsware | ja |  | Nūr al-Īḍāḥ, Zakāt ad-Dayn; ʿUrūḍ at-Tijāra – `nur_al_idah.ms0052`, Bd. 1, S. 127–129 (Kap. k0319–k0323) |
| `islam.aufbau.e03.l05` | Ernte und Früchte; Bodenschätze und Funde | ja |  | Nūr al-Īḍāḥ, Zakāt az-Zurūʿ wa-th-Thimār; al-Maʿdin wa-r-Rikāz – `nur_al_idah.ms0052`–`ms0054`, Bd. 1, S. 129–131 (Kap. k0324–k0325) |
| `islam.aufbau.e03.l06` | Verschiedene Bestimmungen | ja |  | Nūr al-Īḍāḥ, Aḥkām mutafarriqa – `nur_al_idah.ms0054`, Bd. 1, S. 131–133 (Kap. k0326) |

### 4.4 `islam.aufbau.e04` – Zakat II: Empfänger und Ṣadaqat al-Fiṭr

- **Bereich:** `zakat` · **Ablage:** `web/inhalte/lernapp/islam/zakat/islam.aufbau.e04.json` · **Belegbasis:** belegbar
- **Lernziele:** Lernende
  - kann die Empfängergruppen der Zakat nennen und wem sie nicht gegeben wird
  - kennt Begriff, Grund, Zeitpunkt und Maß der Ṣadaqat al-Fiṭr
- **Belegbasis der Einheit (Begründung, Vergleich, Fatwa-Meinung):**
  - Mukhtaṣar al-Qudūrī, Bāb man yajūzu dafʿ aṣ-Ṣadaqa ilayh; Bāb Ṣadaqat al-Fiṭr – `quduri.ms0022`–`ms0023`, Bd. 1, S. 59–62 (Kap. k0035–k0036)
  - al-Hidāya, Bāb man yajūzu dafʿ aṣ-Ṣadaqa ilayh; Ṣadaqat al-Fiṭr – `hidaya.ms0121`–`ms0128`, Bd. 1, S. 112–118 (Kap. k0037–k0038)
  - al-Ikhtiyār, Bāb Maṣārif az-Zakāh; Ṣadaqat al-Fiṭr – `ikhtiyar.ms0132`–`ms0140`, Bd. 1, S. 118–125 (Kap. k0066–k0067)
  - Radd al-Muḥtār, Bāb al-Maṣrif – `radd_al_muhtar.ms1529`–`ms1561`, Bd. 2, S. 339–357 (Kap. k0379)
  - Radd al-Muḥtār, Bāb Ṣadaqat al-Fiṭr – `radd_al_muhtar.ms1561`–`ms1582`, Bd. 2, S. 357–369 (Kap. k0385)

| Lektion | Titel | Kinder | Hinweis | Belegbasis (Grundtext) |
|---|---|---|---|---|
| `islam.aufbau.e04.l01` | Die Empfängergruppen der Zakat | ja |  | Nūr al-Īḍāḥ, Maṣrif az-Zakāh – `nur_al_idah.ms0054`–`ms0055`, Bd. 1, S. 133–135 (Kap. k0327)<br>Mukhtaṣar al-Qudūrī, Bāb man yajūzu dafʿ aṣ-Ṣadaqa ilayh – `quduri.ms0022`–`ms0023`, Bd. 1, S. 59–61 (Kap. k0035) |
| `islam.aufbau.e04.l02` | Wem Zakat nicht gegeben wird | ja |  | Nūr al-Īḍāḥ, Maṣrif az-Zakāh – `nur_al_idah.ms0054`–`ms0055`, Bd. 1, S. 133–135 (Kap. k0327)<br>al-Hidāya, Bāb man yajūzu dafʿ aṣ-Ṣadaqa ilayh wa-man lā yajūz – `hidaya.ms0121`–`ms0124`, Bd. 1, S. 112–115 (Kap. k0037) |
| `islam.aufbau.e04.l03` | Ṣadaqat al-Fiṭr: Begriff, Weisheit, Grund, Bedingungen | ja |  | Nūr al-Īḍāḥ, Ṣadaqat al-Fiṭr › Taʿrīf, Ḥikma, Rukn, Sabab, Shurūṭ – `nur_al_idah.ms0055`–`ms0056`, Bd. 1, S. 135–136 (Kap. k0328–k0333) |
| `islam.aufbau.e04.l04` | Ṣadaqat al-Fiṭr: Zeitpunkt, Arten, Maß und Wert | ja |  | Nūr al-Īḍāḥ, Waqt Wujūbihā; al-Aṣnāf; Miqdār; Ikhrāj al-Qīma – `nur_al_idah.ms0056`, Bd. 1, S. 136–137 (Kap. k0334–k0337) |

### 4.5 `islam.aufbau.e05` – Hadsch I: Pflicht, Bedingungen, Zeiten und Iḥrām

- **Bereich:** `hajj` · **Ablage:** `web/inhalte/lernapp/islam/hajj/islam.aufbau.e05.json` · **Belegbasis:** belegbar
- **Lernziele:** Lernende
  - kann Begriff, Grund und die Bedingungen der Hadsch-Pflicht nennen
  - unterscheidet Grundpfeiler, notwendige Teile und Sunna des Hadsch
  - kennt Iḥrām, Mīqāt und die Arten des Hadsch (ifrād, qirān, tamattuʿ)
- **Belegbasis der Einheit (Begründung, Vergleich, Fatwa-Meinung):**
  - Mukhtaṣar al-Qudūrī, Kitāb al-Ḥajj – `quduri.ms0025`–`ms0034`, Bd. 1, S. 66–78 (Kap. k0039)
  - Mukhtaṣar al-Qudūrī, Bāb al-Qirān; Bāb at-Tamattuʿ – `quduri.ms0029`–`ms0030`, Bd. 1, S. 70–72 (Kap. k0040–k0041)
  - al-Hidāya, Kitāb al-Ḥajj (Anfang) – `hidaya.ms0147`–`ms0150`, Bd. 1, S. 133–137
  - al-Hidāya, Bāb al-Iḥrām; al-Qirān; at-Tamattuʿ – `hidaya.ms0150`–`ms0178`, Bd. 1, S. 137–160 (Kap. k0043–k0045)
  - al-Ikhtiyār, Mawāqīt al-Ḥajj az-Zamāniyya wa-l-Makāniyya (mit Iḥrām, Dukhūl Makka, ʿUmra) – `ikhtiyar.ms0160`–`ms0182`, Bd. 1, S. 141–158 (Kap. k0073–k0074)
  - al-Ikhtiyār, Bāb at-Tamattuʿ; Bāb al-Qirān – `ikhtiyar.ms0182`–`ms0185`, Bd. 1, S. 158–161 (Kap. k0078–k0079)
  - Radd al-Muḥtār, Kitāb al-Ḥajj (Anfang) – `radd_al_muhtar.ms1725`–`ms1770`, Bd. 2, S. 453–480
  - Radd al-Muḥtār, Faṣl fī l-Iḥrām – `radd_al_muhtar.ms1770`–`ms1853`, Bd. 2, S. 479–529 (Kap. k0419)
  - Radd al-Muḥtār, Bāb al-Qirān; Bāb at-Tamattuʿ – `radd_al_muhtar.ms1853`–`ms1876`, Bd. 2, S. 529–542 (Kap. k0444–k0445)

| Lektion | Titel | Kinder | Hinweis | Belegbasis (Grundtext) |
|---|---|---|---|---|
| `islam.aufbau.e05.l01` | Begriff, Zeitpunkt der Pflicht und Grund | ja |  | Nūr al-Īḍāḥ, Kitāb al-Ḥajj › Taʿrīf, Zaman Farḍiyyatihi, Ḥukm, Sabab – `nur_al_idah.ms0056`, Bd. 1, S. 137–138 (Kap. k0339–k0342) |
| `islam.aufbau.e05.l02` | Bedingungen der Pflicht, der Ausführung und der Gültigkeit | ja |  | Nūr al-Īḍāḥ, Shurūṭ Farḍiyyatihi; Shurūṭ Wujūb Adāʾihi; Shurūṭ Ṣiḥḥatihi – `nur_al_idah.ms0056`–`ms0057`, Bd. 1, S. 138 (Kap. k0343–k0345) |
| `islam.aufbau.e05.l03` | Zeit, Grundpfeiler, notwendige Teile und Sunna | ja |  | Nūr al-Īḍāḥ, Waqtuhu; Arkānuhu; Wājibātuhu; Sunan al-Ḥajj – `nur_al_idah.ms0057`, Bd. 1, S. 138–140 (Kap. k0346–k0349) |
| `islam.aufbau.e05.l04` | Iḥrām und Mīqāt | ja |  | Nūr al-Īḍāḥ, al-Iḥrām; Mawāqīt al-Ḥajj al-Makāniyya – `nur_al_idah.ms0057`–`ms0058`, Bd. 1, S. 140–141 (Kap. k0350–k0351) |
| `islam.aufbau.e05.l05` | Arten des Hadsch: ifrād, qirān, tamattuʿ | ja |  | Nūr al-Īḍāḥ, Baḥth al-Qirān; Baḥth at-Tamattuʿ – `nur_al_idah.ms0060`–`ms0062`, Bd. 1, S. 146–150 (Kap. k0363–k0373) |

### 4.6 `islam.aufbau.e06` – Hadsch II: Ablauf, ʿUmra, Verstöße und Opfertier

- **Bereich:** `hajj` · **Ablage:** `web/inhalte/lernapp/islam/hajj/islam.aufbau.e06.json` · **Belegbasis:** belegbar
- **Lernziele:** Lernende
  - kann den Ablauf des Hadsch in der Reihenfolge der Werke beschreiben
  - kennt die ʿUmra mit Grundpfeiler, Bedingungen und Ablauf
  - kann erklären, welche Folgen Verstöße im Iḥrām haben und was für das Opfertier gilt
- **Belegbasis der Einheit (Begründung, Vergleich, Fatwa-Meinung):**
  - Mukhtaṣar al-Qudūrī, Bāb Jināyāt al-Muḥrim; al-Iḥṣār; al-Fawāt; al-Hady – `quduri.ms0030`–`ms0034`, Bd. 1, S. 72–78 (Kap. k0042–k0045)
  - al-Hidāya, Bāb al-Jināyāt – `hidaya.ms0178`–`ms0198`, Bd. 1, S. 160–176 (Kap. k0046)
  - al-Hidāya, Bāb al-Iḥṣār; al-Fawāt; al-Ḥajj ʿan al-Ghayr; al-Hady – `hidaya.ms0202`–`ms0214`, Bd. 1, S. 180–189 (Kap. k0049–k0052)
  - al-Ikhtiyār, Bāb al-Jināyāt – `ikhtiyar.ms0185`–`ms0195`, Bd. 1, S. 161–168 (Kap. k0080)
  - al-Ikhtiyār, Bāb al-Iḥṣār; al-Ḥajj ʿan al-Ghayr; al-Hady – `ikhtiyar.ms0195`–`ms0208`, Bd. 1, S. 168 – Bd. 2, S. 3 (Kap. k0082–k0084)
  - Radd al-Muḥtār, Bāb al-Jināyāt – `radd_al_muhtar.ms1876`–`ms1960`, Bd. 2, S. 542–590 (Kap. k0446)
  - Radd al-Muḥtār, Bāb al-Iḥṣār – `radd_al_muhtar.ms1960`–`ms1967`, Bd. 2, S. 590–594 (Kap. k0448)
  - Radd al-Muḥtār, Bāb al-Ḥajj ʿan al-Ghayr – `radd_al_muhtar.ms1967`–`ms2000`, Bd. 2, S. 594–614 (Kap. k0451)
  - Radd al-Muḥtār, Bāb al-Hady – `radd_al_muhtar.ms2000`–`ms2024`, Bd. 2, S. 614 – Bd. 3, S. 3 (Kap. k0460)

| Lektion | Titel | Kinder | Hinweis | Belegbasis (Grundtext) |
|---|---|---|---|---|
| `islam.aufbau.e06.l01` | Ablauf I: vom Iḥrām bis zum Saʿy | ja |  | Nūr al-Īḍāḥ, Kitāb al-Ḥajj › Kayfiyyat al-Ḥajj – `nur_al_idah.ms0058`–`ms0060`, Bd. 1, S. 140–146 |
| `islam.aufbau.e06.l02` | Ablauf II: ʿArafa, Muzdalifa, Minā und die Ṭawāfe | ja |  | Nūr al-Īḍāḥ, Kitāb al-Ḥajj › Kayfiyyat al-Ḥajj – `nur_al_idah.ms0058`–`ms0060`, Bd. 1, S. 140–146 |
| `islam.aufbau.e06.l03` | Die ʿUmra | ja |  | Nūr al-Īḍāḥ, Baḥth al-ʿUmra – `nur_al_idah.ms0060`, Bd. 1, S. 144–146 (Kap. k0354–k0362) |
| `islam.aufbau.e06.l04` | Verstöße im Iḥrām und ihre Wiedergutmachung | ja |  | Nūr al-Īḍāḥ, Bāb al-Jināyāt – `nur_al_idah.ms0062`–`ms0067`, Bd. 1, S. 150–158 (Kap. k0374) |
| `islam.aufbau.e06.l05` | Verhinderung, Versäumnis und Hadsch für andere | ja |  | Mukhtaṣar al-Qudūrī, Bāb al-Iḥṣār; Bāb al-Fawāt – `quduri.ms0033`, Bd. 1, S. 75–76 (Kap. k0043–k0044)<br>al-Hidāya, Bāb al-Iḥṣār; al-Fawāt; al-Ḥajj ʿan al-Ghayr – `hidaya.ms0202`–`ms0209`, Bd. 1, S. 180–185 (Kap. k0049–k0051) |
| `islam.aufbau.e06.l06` | Das Opfertier (hady): Zeit und Ort | ja |  | Nūr al-Īḍāḥ, al-Hady; Waqt adh-Dhabḥ; Makān Dhabḥ al-Hady – `nur_al_idah.ms0062`–`ms0063`, Bd. 1, S. 152–153 (Kap. k0375–k0377) |
| `islam.aufbau.e06.l07` | Besuch der Moschee des Propheten | ja | strittig | Nūr al-Īḍāḥ, Faṣl fī Ziyārat an-Nabī – `nur_al_idah.ms0063`–`ms0067`, Bd. 1, S. 153–158 (Kap. k0378) |

### 4.7 `islam.aufbau.e07` – Erlaubtes und Verbotenes I: Speisen, Getränke, Schlachtung und Opfer

- **Bereich:** `halal_haram` · **Ablage:** `web/inhalte/lernapp/islam/halal_haram/islam.aufbau.e07.json` · **Belegbasis:** belegbar
- **Lernziele:** Lernende
  - kann die Bedingungen einer gültigen Schlachtung und der Jagd nennen
  - kennt die Grundregeln der Werke zu erlaubten Tieren und zu berauschenden Getränken
  - kann Pflicht, Zeit und Tier des Opfers (uḍḥiyya) und die Verteilung des Fleisches beschreiben
- **Belegbasis der Einheit (Begründung, Vergleich, Fatwa-Meinung):**
  - Mukhtaṣar al-Qudūrī, Kitāb al-Ashriba; Kitāb aṣ-Ṣayd wa-dh-Dhabāʾiḥ; Kitāb al-Uḍḥiyya – `quduri.ms0111`–`ms0114`, Bd. 1, S. 204–209 (Kap. k0103–k0105)
  - al-Hidāya, Kitāb adh-Dhabāʾiḥ; Kitāb al-Uḍḥiyya – `hidaya.ms0905`–`ms0924`, Bd. 4, S. 62–78 (Kap. k0197–k0198)
  - al-Hidāya, Kitāb al-Ashriba; Kitāb aṣ-Ṣayd – `hidaya.ms0960`–`ms0981`, Bd. 4, S. 108–126 (Kap. k0202–k0203)
  - al-Ikhtiyār, Kitāb al-Ashriba – `ikhtiyar.ms0795`–`ms0799`, Bd. 4, S. 99–102 (Kap. k0229)
  - al-Ikhtiyār, Kitāb aṣ-Ṣayd; Kitāb adh-Dhabāʾiḥ – `ikhtiyar.ms0904`–`ms0920`, Bd. 5, S. 3–16 (Kap. k0256–k0257)
  - al-Ikhtiyār, Kitāb al-Uḍḥiyya – `ikhtiyar.ms0920`–`ms0928`, Bd. 5, S. 16–22 (Kap. k0259)
  - Radd al-Muḥtār, Kitāb adh-Dhabāʾiḥ; Kitāb al-Uḍḥiyya – `radd_al_muhtar.ms5959`–`ms6026`, Bd. 6, S. 293–336 (Kap. k1722–k1723)
  - Radd al-Muḥtār, Kitāb al-Ashriba – `radd_al_muhtar.ms6205`–`ms6227`, Bd. 6, S. 448–461 (Kap. k1739)
  - Radd al-Muḥtār, Kitāb aṣ-Ṣayd – `radd_al_muhtar.ms6227`–`ms6252`, Bd. 6, S. 461–477 (Kap. k1741)

| Lektion | Titel | Kinder | Hinweis | Belegbasis (Grundtext) |
|---|---|---|---|---|
| `islam.aufbau.e07.l01` | Schlachtung: wer, womit und wie | ja |  | Mukhtaṣar al-Qudūrī, Kitāb aṣ-Ṣayd wa-dh-Dhabāʾiḥ – `quduri.ms0111`–`ms0113`, Bd. 1, S. 205–208 (Kap. k0104)<br>al-Hidāya, Kitāb adh-Dhabāʾiḥ – `hidaya.ms0905`–`ms0915`, Bd. 4, S. 62–70 (Kap. k0197)<br>al-Ikhtiyār, Kitāb adh-Dhabāʾiḥ – `ikhtiyar.ms0911`–`ms0920`, Bd. 5, S. 9–16 (Kap. k0257) |
| `islam.aufbau.e07.l02` | Erlaubte und verbotene Tiere | ja |  | Mukhtaṣar al-Qudūrī, Kitāb aṣ-Ṣayd wa-dh-Dhabāʾiḥ – `quduri.ms0111`–`ms0113`, Bd. 1, S. 205–208 (Kap. k0104)<br>al-Hidāya, Kitāb adh-Dhabāʾiḥ – `hidaya.ms0905`–`ms0915`, Bd. 4, S. 62–70 (Kap. k0197)<br>Radd al-Muḥtār, Kitāb adh-Dhabāʾiḥ – `radd_al_muhtar.ms5959`–`ms5987`, Bd. 6, S. 293–311 (Kap. k1722) |
| `islam.aufbau.e07.l03` | Jagd | ja |  | Mukhtaṣar al-Qudūrī, Kitāb aṣ-Ṣayd wa-dh-Dhabāʾiḥ – `quduri.ms0111`–`ms0113`, Bd. 1, S. 205–208 (Kap. k0104)<br>al-Hidāya, Kitāb aṣ-Ṣayd – `hidaya.ms0968`–`ms0981`, Bd. 4, S. 115–126 (Kap. k0203)<br>al-Ikhtiyār, Kitāb aṣ-Ṣayd – `ikhtiyar.ms0904`–`ms0911`, Bd. 5, S. 3–9 (Kap. k0256) |
| `islam.aufbau.e07.l04` | Getränke: das Verbot des Berauschenden | ja |  | Mukhtaṣar al-Qudūrī, Kitāb al-Ashriba – `quduri.ms0111`, Bd. 1, S. 204–205 (Kap. k0103)<br>al-Hidāya, Kitāb al-Ashriba – `hidaya.ms0960`–`ms0968`, Bd. 4, S. 108–115 (Kap. k0202)<br>al-Ikhtiyār, Kitāb al-Ashriba – `ikhtiyar.ms0795`–`ms0799`, Bd. 4, S. 99–102 (Kap. k0229) |
| `islam.aufbau.e07.l05` | Das Opfer: wer, wann und welches Tier | ja |  | Mukhtaṣar al-Qudūrī, Kitāb al-Uḍḥiyya – `quduri.ms0113`–`ms0114`, Bd. 1, S. 208–209 (Kap. k0105)<br>al-Hidāya, Kitāb al-Uḍḥiyya – `hidaya.ms0915`–`ms0924`, Bd. 4, S. 70–78 (Kap. k0198)<br>Nūr al-Īḍāḥ, Aḥkām al-Aḍḥā – `nur_al_idah.ms0035`, Bd. 1, S. 86 (Kap. k0215) |
| `islam.aufbau.e07.l06` | Das Opfer: Fleisch, Fell und Verpöntes | ja |  | al-Ikhtiyār, Kitāb al-Uḍḥiyya – `ikhtiyar.ms0920`–`ms0928`, Bd. 5, S. 16–22 (Kap. k0259)<br>Radd al-Muḥtār, Kitāb al-Uḍḥiyya – `radd_al_muhtar.ms5987`–`ms6026`, Bd. 6, S. 311–336 (Kap. k1723) |

### 4.8 `islam.aufbau.e08` – Erlaubtes und Verbotenes II: Kauf, Zins und Miete

- **Bereich:** `halal_haram` · **Ablage:** `web/inhalte/lernapp/islam/halal_haram/islam.aufbau.e08.json` · **Belegbasis:** belegbar
- **Lernziele:** Lernende
  - kann erklären, wie ein Kaufvertrag nach den Werken zustande kommt und welche Bedingungen er braucht
  - kennt Grundformen unwirksamer Verträge und das Zinsverbot (ribā) mit seinen Grundregeln
  - kann die Grundregeln zu Geldwechsel, Vorauskauf, Miete und Lohn wiedergeben (allgemeine Lehrfälle, keine Einzelfallauskunft)
- **Belegbasis der Einheit (Begründung, Vergleich, Fatwa-Meinung):**
  - Mukhtaṣar al-Qudūrī, Kitāb al-Buyūʿ – `quduri.ms0034`–`ms0042`, Bd. 1, S. 78–92 (Kap. k0046)
  - Mukhtaṣar al-Qudūrī, Kitāb al-Ijāra – `quduri.ms0049`–`ms0053`, Bd. 1, S. 101–106 (Kap. k0059)
  - al-Hidāya, Kitāb al-Buyūʿ (Anfang) – `hidaya.ms0523`–`ms0531`, Bd. 3, S. 20–27
  - al-Ikhtiyār, mā yanʿaqidu bihi l-Bayʿ; Shurūṭ Ṣiḥḥat al-Bayʿ – `ikhtiyar.ms0208`–`ms0218`, Bd. 2, S. 3–11 (Kap. k0086–k0087)
  - al-Ikhtiyār, Kitāb al-Ijāra – `ikhtiyar.ms0270`–`ms0284`, Bd. 2, S. 50–62 (Kap. k0103)
  - Radd al-Muḥtār, Kitāb al-Buyūʿ – `radd_al_muhtar.ms4230`–`ms4855`, Bd. 4, S. 500 – Bd. 5, S. 281 (Kap. k1279)
  - Radd al-Muḥtār, Kitāb al-Ijāra – `radd_al_muhtar.ms5516`–`ms5654`, Bd. 6, S. 3–97 (Kap. k1625)

| Lektion | Titel | Kinder | Hinweis | Belegbasis (Grundtext) |
|---|---|---|---|---|
| `islam.aufbau.e08.l01` | Der Kaufvertrag: Zustandekommen | ja |  | Mukhtaṣar al-Qudūrī, Kitāb al-Buyūʿ (Anfang) – `quduri.ms0034`–`ms0036`, Bd. 1, S. 76–81<br>al-Ikhtiyār, mā yanʿaqidu bihi l-Bayʿ – `ikhtiyar.ms0208`–`ms0213`, Bd. 2, S. 3–7 (Kap. k0086) |
| `islam.aufbau.e08.l02` | Bedingungen und Optionsrechte (khiyār) | ja |  | Mukhtaṣar al-Qudūrī, Bāb Khiyār ash-Sharṭ; ar-Ruʾya; al-ʿAyb – `quduri.ms0036`–`ms0037`, Bd. 1, S. 80–83 (Kap. k0047–k0049)<br>al-Ikhtiyār, Shurūṭ Ṣiḥḥat al-Bayʿ – `ikhtiyar.ms0213`–`ms0220`, Bd. 2, S. 7–12 (Kap. k0087)<br>al-Ikhtiyār, Bāb al-Khiyārāt – `ikhtiyar.ms0220`–`ms0233`, Bd. 2, S. 12–22 (Kap. k0089) |
| `islam.aufbau.e08.l03` | Unwirksame Verkäufe (al-bayʿ al-fāsid) | ja |  | Mukhtaṣar al-Qudūrī, Bāb al-Bayʿ al-Fāsid – `quduri.ms0037`–`ms0039`, Bd. 1, S. 83–85 (Kap. k0050)<br>al-Hidāya, Bāb al-Bayʿ al-Fāsid – `hidaya.ms0549`–`ms0564`, Bd. 3, S. 42–54 (Kap. k0126)<br>al-Ikhtiyār, Bāb al-Bayʿ al-Fāsid – `ikhtiyar.ms0233`–`ms0240`, Bd. 2, S. 22–28 (Kap. k0093) |
| `islam.aufbau.e08.l04` | Das Zinsverbot (ribā) | ja |  | Mukhtaṣar al-Qudūrī, Bāb ar-Ribā – `quduri.ms0039`–`ms0040`, Bd. 1, S. 87–88 (Kap. k0053)<br>al-Hidāya, Bāb ar-Ribā – `hidaya.ms0572`–`ms0578`, Bd. 3, S. 61–66 (Kap. k0129)<br>al-Ikhtiyār, Bāb ar-Ribā – `ikhtiyar.ms0243`–`ms0246`, Bd. 2, S. 30–33 (Kap. k0095) |
| `islam.aufbau.e08.l05` | Geldwechsel (ṣarf) und Vorauskauf (salam) | ja |  | Mukhtaṣar al-Qudūrī, Bāb as-Salam; Bāb aṣ-Ṣarf – `quduri.ms0040`–`ms0042`, Bd. 1, S. 88–92 (Kap. k0054–k0055)<br>al-Hidāya, Bāb as-Salam; Kitāb aṣ-Ṣarf – `hidaya.ms0583`–`ms0602`, Bd. 3, S. 71–87 (Kap. k0132–k0133)<br>al-Ikhtiyār, Bāb as-Salam – `ikhtiyar.ms0246`–`ms0255`, Bd. 2, S. 33–39 (Kap. k0096)<br>al-Ikhtiyār, Bāb aṣ-Ṣarf – `ikhtiyar.ms0255`–`ms0258`, Bd. 2, S. 39–42 (Kap. k0098) |
| `islam.aufbau.e08.l06` | Miete und Lohn (ijāra) | ja |  | Mukhtaṣar al-Qudūrī, Kitāb al-Ijāra – `quduri.ms0049`–`ms0053`, Bd. 1, S. 101–106 (Kap. k0059)<br>al-Hidāya, Bāb al-Ajr matā yustaḥaqq; mā yajūzu min al-Ijāra; al-Ijāra al-Fāsida – `hidaya.ms0772`–`ms0786`, Bd. 3, S. 232–244 (Kap. k0169–k0171) |

### 4.9 `islam.aufbau.e09` – Erlaubtes und Verbotenes III: Ehe und Familie – Grundlagen

- **Bereich:** `halal_haram` · **Ablage:** `web/inhalte/lernapp/islam/halal_haram/islam.aufbau.e09.json` · **Belegbasis:** belegbar
- **Lernziele:** Lernende
  - kann die Bedingungen einer gültigen Eheschließung nach hanefitischer Lehre nennen
  - kennt Grundbegriffe zu Vormundschaft, Ebenbürtigkeit, Brautgabe, Milchverwandtschaft und Unterhalt
  - kann die Grundbegriffe der Scheidung, der Rücknahme und der Wartezeit erklären (allgemeine Lehrfälle, keine Einzelfallauskunft)
- **Belegbasis der Einheit (Begründung, Vergleich, Fatwa-Meinung):**
  - Mukhtaṣar al-Qudūrī, Kitāb an-Nikāḥ; ar-Raḍāʿ; aṭ-Ṭalāq; Bāb ar-Rajʿa – `quduri.ms0075`–`ms0086`, Bd. 1, S. 145–161 (Kap. k0080–k0083)
  - Mukhtaṣar al-Qudūrī, Bāb al-ʿIdda; Kitāb an-Nafaqāt – `quduri.ms0090`–`ms0095`, Bd. 1, S. 169–175 (Kap. k0088–k0089)
  - al-Hidāya, Kitāb an-Nikāḥ (Anfang) – `hidaya.ms0214`–`ms0221`, Bd. 1, S. 189–196
  - al-Hidāya, Bāb fī l-Awliyāʾ wa-l-Akfāʾ; Bāb al-Mahr – `hidaya.ms0221`–`ms0244`, Bd. 1, S. 196–215 (Kap. k0054–k0055)
  - al-Ikhtiyār, mā yushtaraṭu fī sh-Shuhūd fī n-Nikāḥ – `ikhtiyar.ms0536`–`ms0581`, Bd. 3, S. 83–117 (Kap. k0166)
  - al-Ikhtiyār, Kitāb ar-Raḍāʿ – `ikhtiyar.ms0581`–`ms0586`, Bd. 3, S. 117–121 (Kap. k0178)
  - Radd al-Muḥtār, Kitāb an-Nikāḥ (Anfang) – `radd_al_muhtar.ms2024`–`ms2115`, Bd. 2, S. 628 – Bd. 3, S. 54
  - Radd al-Muḥtār, Bāb al-Walī; al-Kafāʾa; al-Mahr – `radd_al_muhtar.ms2115`–`ms2299`, Bd. 3, S. 54–162 (Kap. k0485–k0491)
  - Radd al-Muḥtār, Bāb ar-Raḍāʿ – `radd_al_muhtar.ms2379`–`ms2408`, Bd. 3, S. 209–226 (Kap. k0522)

| Lektion | Titel | Kinder | Hinweis | Belegbasis (Grundtext) |
|---|---|---|---|---|
| `islam.aufbau.e09.l01` | Eheschließung: Begriff, Zustimmung und Zeugen | nein (Vorschlag) |  | Mukhtaṣar al-Qudūrī, Kitāb an-Nikāḥ – `quduri.ms0075`–`ms0080`, Bd. 1, S. 145–152 (Kap. k0080)<br>al-Ikhtiyār, mā yushtaraṭu fī sh-Shuhūd fī n-Nikāḥ – `ikhtiyar.ms0536`–`ms0581`, Bd. 3, S. 83–117 (Kap. k0166) |
| `islam.aufbau.e09.l02` | Vormund (walī) und Ebenbürtigkeit (kafāʾa) | nein (Vorschlag) |  | al-Hidāya, Bāb fī l-Awliyāʾ wa-l-Akfāʾ – `hidaya.ms0221`–`ms0230`, Bd. 1, S. 196–204 (Kap. k0054)<br>Radd al-Muḥtār, Bāb al-Walī – `radd_al_muhtar.ms2115`–`ms2168`, Bd. 3, S. 54–84 (Kap. k0485)<br>Radd al-Muḥtār, Bāb al-Kafāʾa – `radd_al_muhtar.ms2168`–`ms2196`, Bd. 3, S. 84–100 (Kap. k0489) |
| `islam.aufbau.e09.l03` | Die Brautgabe (mahr) | nein (Vorschlag) |  | al-Hidāya, Bāb al-Mahr – `hidaya.ms0230`–`ms0244`, Bd. 1, S. 204–215 (Kap. k0055)<br>Radd al-Muḥtār, Bāb al-Mahr – `radd_al_muhtar.ms2196`–`ms2299`, Bd. 3, S. 100–162 (Kap. k0491) |
| `islam.aufbau.e09.l04` | Milchverwandtschaft (raḍāʿ) | ja |  | Mukhtaṣar al-Qudūrī, Kitāb ar-Raḍāʿ – `quduri.ms0080`–`ms0081`, Bd. 1, S. 152–154 (Kap. k0081)<br>al-Hidāya, Kitāb ar-Raḍāʿ – `hidaya.ms0253`–`ms0257`, Bd. 1, S. 223–226 (Kap. k0059)<br>al-Ikhtiyār, Kitāb ar-Raḍāʿ – `ikhtiyar.ms0581`–`ms0586`, Bd. 3, S. 117–121 (Kap. k0178) |
| `islam.aufbau.e09.l05` | Unterhalt der Ehefrau (nafaqa) | nein (Vorschlag) |  | Mukhtaṣar al-Qudūrī, Kitāb an-Nafaqāt – `quduri.ms0092`–`ms0095`, Bd. 1, S. 172–175 (Kap. k0089)<br>al-Hidāya, Bāb an-Nafaqa – `hidaya.ms0333`–`ms0344`, Bd. 2, S. 39–49 (Kap. k0075) |
| `islam.aufbau.e09.l06` | Scheidung: Grundbegriffe, Rücknahme und Wartezeit | nein (Vorschlag) | strittig | Mukhtaṣar al-Qudūrī, Kitāb aṭ-Ṭalāq; Bāb ar-Rajʿa – `quduri.ms0081`–`ms0086`, Bd. 1, S. 154–161 (Kap. k0082–k0083)<br>Mukhtaṣar al-Qudūrī, Bāb al-ʿIdda – `quduri.ms0090`–`ms0092`, Bd. 1, S. 169–172 (Kap. k0088)<br>al-Hidāya, Bāb Ṭalāq as-Sunna – `hidaya.ms0257`–`ms0262`, Bd. 1, S. 226–230 (Kap. k0061) |

## 5. Vertiefung – Anstand, Geschichte, Grundwissen

### 5.1 `islam.vertiefung.e01` – Anstand I: Kleidung, Schmuck und Gebrauchsgegenstände

- **Bereich:** `akhlaq` · **Ablage:** `web/inhalte/lernapp/islam/akhlaq/islam.vertiefung.e01.json` · **Belegbasis:** belegbar
- **Lernziele:** Lernende
  - kann die Grundregeln der Werke zu Kleidung und Seide für Männer und Frauen wiedergeben
  - kennt die Regeln zu Gold, Silber, Schmuck und Gefäßen
- **Belegbasis der Einheit (Begründung, Vergleich, Fatwa-Meinung):**
  - Mukhtaṣar al-Qudūrī, Kitāb al-Ḥaẓr wa-l-Ibāḥa – `quduri.ms0136`–`ms0137`, Bd. 1, S. 240–242 (Kap. k0115)
  - al-Hidāya, Kitāb al-Karāhiya – `hidaya.ms0924`–`ms0948`, Bd. 4, S. 78–98 (Kap. k0199)
  - al-Ikhtiyār, Kitāb al-Karāhiya – `ikhtiyar.ms0866`–`ms0904`, Bd. 4, S. 153 – Bd. 5, S. 3 (Kap. k0246)
  - Radd al-Muḥtār, Kitāb al-Ḥaẓr wa-l-Ibāḥa – `radd_al_muhtar.ms6026`–`ms6179`, Bd. 6, S. 336–431 (Kap. k1726)

| Lektion | Titel | Kinder | Hinweis | Belegbasis (Grundtext) |
|---|---|---|---|---|
| `islam.vertiefung.e01.l01` | Kleidung: Erlaubtes und Verpöntes | ja |  | al-Ikhtiyār, Faṣl fī l-Kiswa – `ikhtiyar.ms0897`–`ms0899`, Bd. 4, S. 177–178 (Kap. k0254)<br>Radd al-Muḥtār, Faṣl fī l-Lubs – `radd_al_muhtar.ms6050`–`ms6072`, Bd. 6, S. 351–364 (Kap. k1728) |
| `islam.vertiefung.e01.l02` | Seide und Gold für Männer und Frauen | ja |  | al-Ikhtiyār, Faṣl Istiʿmāl al-Ḥarīr wa-dh-Dhahab – `ikhtiyar.ms0872`–`ms0875`, Bd. 4, S. 157–160 (Kap. k0248)<br>Radd al-Muḥtār, Faṣl fī l-Lubs – `radd_al_muhtar.ms6050`–`ms6072`, Bd. 6, S. 351–364 (Kap. k1728) |
| `islam.vertiefung.e01.l03` | Silber, Schmuck und Gefäße | ja |  | al-Ikhtiyār, Faṣl Istiʿmāl al-Ḥarīr wa-dh-Dhahab – `ikhtiyar.ms0872`–`ms0875`, Bd. 4, S. 157–160 (Kap. k0248)<br>Mukhtaṣar al-Qudūrī, Kitāb al-Ḥaẓr wa-l-Ibāḥa – `quduri.ms0136`–`ms0137`, Bd. 1, S. 240–242 (Kap. k0115) |
| `islam.vertiefung.e01.l04` | Verschiedene Fragen des Alltags | ja |  | al-Ikhtiyār, Faṣl fī Masāʾil mukhtalifa – `ikhtiyar.ms0879`–`ms0884`, Bd. 4, S. 163–167 (Kap. k0250) |

### 5.2 `islam.vertiefung.e02` – Anstand II: Blick, Rede und Anstand im Gottesdienst

- **Bereich:** `akhlaq` · **Ablage:** `web/inhalte/lernapp/islam/akhlaq/islam.vertiefung.e02.json` · **Belegbasis:** belegbar
- **Lernziele:** Lernende
  - kennt die Regeln der Werke zu Blick und Berührung
  - kann Regeln zur Rede und zum Anstand des Gläubigen wiedergeben
  - kann den Anstand bei Reinigung, Gebet und in der Moschee beschreiben
- **Belegbasis der Einheit (Begründung, Vergleich, Fatwa-Meinung):**
  - al-Ikhtiyār, Kitāb al-Karāhiya – `ikhtiyar.ms0866`–`ms0904`, Bd. 4, S. 153 – Bd. 5, S. 3 (Kap. k0246)
  - Radd al-Muḥtār, Kitāb al-Ḥaẓr wa-l-Ibāḥa – `radd_al_muhtar.ms6026`–`ms6179`, Bd. 6, S. 336–431 (Kap. k1726)

| Lektion | Titel | Kinder | Hinweis | Belegbasis (Grundtext) |
|---|---|---|---|---|
| `islam.vertiefung.e02.l01` | Blick und Berührung; die ʿawra | nein (Vorschlag) |  | al-Ikhtiyār, Faṣl an-Naẓar ilā l-ʿAwra – `ikhtiyar.ms0866`–`ms0872`, Bd. 4, S. 154–157 (Kap. k0247)<br>Radd al-Muḥtār, Faṣl fī n-Naẓar wa-l-Mass – `radd_al_muhtar.ms6072`–`ms6088`, Bd. 6, S. 364–374 (Kap. k1730) |
| `islam.vertiefung.e02.l02` | Die Rede: Erlaubtes und Verbotenes | ja |  | al-Ikhtiyār, Faṣl fī l-Kalām – `ikhtiyar.ms0899`–`ms0904`, Bd. 4, S. 178 – Bd. 5, S. 3 (Kap. k0255) |
| `islam.vertiefung.e02.l03` | Anstand des Gläubigen | ja |  | al-Ikhtiyār, Faṣl fī Ādāb li-l-Muʾmin – `ikhtiyar.ms0884`–`ms0886`, Bd. 4, S. 167–168 (Kap. k0251) |
| `islam.vertiefung.e02.l04` | Anstand bei Reinigung und Gebet | ja |  | Nūr al-Īḍāḥ, Ādāb Qaḍāʾ al-Ḥāja – `nur_al_idah.ms0003`, Bd. 1, S. 16–17 (Kap. k0018)<br>Nūr al-Īḍāḥ, Ādāb al-Wuḍūʾ – `nur_al_idah.ms0004`–`ms0005`, Bd. 1, S. 19–20 (Kap. k0026)<br>Nūr al-Īḍāḥ, Ādāb al-Ightisāl – `nur_al_idah.ms0007`, Bd. 1, S. 24–25 (Kap. k0035)<br>Nūr al-Īḍāḥ, Ādāb aṣ-Ṣalāh – `nur_al_idah.ms0016`–`ms0017`, Bd. 1, S. 47–48 (Kap. k0108) |
| `islam.vertiefung.e02.l05` | Moschee und Gemeinschaft | ja |  | Nūr al-Īḍāḥ, Taḥiyyat al-Masjid – `nur_al_idah.ms0025`, Bd. 1, S. 63 (Kap. k0142)<br>Nūr al-Īḍāḥ, al-Jamāʿa wa-Faḍluhā – `nur_al_idah.ms0030`, Bd. 1, S. 76 (Kap. k0181) |

### 5.3 `islam.vertiefung.e03` – Anstand III: Erwerb, Fürsorge und Wettkampf

- **Bereich:** `akhlaq` · **Ablage:** `web/inhalte/lernapp/islam/akhlaq/islam.vertiefung.e03.json` · **Belegbasis:** belegbar
- **Lernziele:** Lernende
  - kann die Haltung der Werke zu Erwerb und Arbeit wiedergeben
  - kennt das Verbot des Hortens und Grundsätze fairen Handels
  - kennt die Regeln zu Unterhalt und Fürsorge für Eltern und Verwandte sowie zu Wettkampf und Sport
- **Belegbasis der Einheit (Begründung, Vergleich, Fatwa-Meinung):**
  - al-Ikhtiyār, Kitāb al-Karāhiya – `ikhtiyar.ms0866`–`ms0904`, Bd. 4, S. 153 – Bd. 5, S. 3 (Kap. k0246)
  - Radd al-Muḥtār, Faṣl fī l-Bayʿ (Kitāb al-Ḥaẓr wa-l-Ibāḥa) – `radd_al_muhtar.ms6105`–`ms6179`, Bd. 6, S. 385–431 (Kap. k1733)

| Lektion | Titel | Kinder | Hinweis | Belegbasis (Grundtext) |
|---|---|---|---|---|
| `islam.vertiefung.e03.l01` | Erwerb und Arbeit | ja |  | al-Ikhtiyār, Faṣl fī l-Kasb – `ikhtiyar.ms0888`–`ms0897`, Bd. 4, S. 170–177 (Kap. k0253) |
| `islam.vertiefung.e03.l02` | Horten und fairer Handel | ja |  | al-Ikhtiyār, Faṣl fī l-Iḥtikār – `ikhtiyar.ms0875`–`ms0879`, Bd. 4, S. 160–163 (Kap. k0249)<br>Radd al-Muḥtār, Faṣl fī l-Bayʿ – `radd_al_muhtar.ms6105`–`ms6179`, Bd. 6, S. 385–431 (Kap. k1733) |
| `islam.vertiefung.e03.l03` | Unterhalt und Fürsorge für Eltern und Verwandte | ja |  | Mukhtaṣar al-Qudūrī, Kitāb an-Nafaqāt – `quduri.ms0092`–`ms0095`, Bd. 1, S. 172–175 (Kap. k0089)<br>al-Hidāya, Bāb an-Nafaqa – `hidaya.ms0333`–`ms0344`, Bd. 2, S. 39–49 (Kap. k0075) |
| `islam.vertiefung.e03.l04` | Wettkampf, Sport und Bogenschießen | ja |  | al-Ikhtiyār, Faṣl fī s-Sabq wa-r-Ramy – `ikhtiyar.ms0886`–`ms0888`, Bd. 4, S. 168–170 (Kap. k0252) |

### 5.4 `islam.vertiefung.e04` – Geschichte I: Das Leben des Propheten (Grundlagen)

- **Bereich:** `siyar` · **Ablage:** `web/inhalte/lernapp/islam/siyar/islam.vertiefung.e04.json` · **Belegbasis:** zurückgestellt
- **Lernziele:** Lernende
  - kann die Lebensstationen des Propheten in Mekka und Medina in eigenen Worten wiedergeben
- **Belegbasis:** keine im Quellenregister (S8 §3.5). Zurückgestellt bis Menschen ein Werk benennen (LM-04);
  kein Entwurf aus dem Gedächtnis (KERN §2.2 Nr. 5).

| Lektion | Titel | Kinder | Hinweis | Belegbasis (Grundtext) |
|---|---|---|---|---|
| `islam.vertiefung.e04.l01` | Herkunft und Jugend | ja | zurückgestellt | – |
| `islam.vertiefung.e04.l02` | Die erste Offenbarung und die Zeit in Mekka | ja | zurückgestellt | – |
| `islam.vertiefung.e04.l03` | Die Auswanderung (hijra) | ja | zurückgestellt | – |
| `islam.vertiefung.e04.l04` | Medina: Gemeinde und Moschee | ja | zurückgestellt | – |
| `islam.vertiefung.e04.l05` | Die letzten Jahre und der Abschied | ja | zurückgestellt | – |

### 5.5 `islam.vertiefung.e05` – Geschichte II: Die Gefährten und die ersten Kalifen

- **Bereich:** `siyar` · **Ablage:** `web/inhalte/lernapp/islam/siyar/islam.vertiefung.e05.json` · **Belegbasis:** zurückgestellt
- **Lernziele:** Lernende
  - kennt die bekanntesten Gefährten und die Reihenfolge der ersten Kalifen
- **Belegbasis:** keine im Quellenregister (S8 §3.5). Zurückgestellt bis Menschen ein Werk benennen (LM-04);
  kein Entwurf aus dem Gedächtnis (KERN §2.2 Nr. 5).

| Lektion | Titel | Kinder | Hinweis | Belegbasis (Grundtext) |
|---|---|---|---|---|
| `islam.vertiefung.e05.l01` | Wer die Gefährten sind | ja | zurückgestellt | – |
| `islam.vertiefung.e05.l02` | Abū Bakr | ja | zurückgestellt | – |
| `islam.vertiefung.e05.l03` | ʿUmar | ja | zurückgestellt | – |
| `islam.vertiefung.e05.l04` | ʿUthmān | ja | zurückgestellt | – |
| `islam.vertiefung.e05.l05` | ʿAlī | ja | zurückgestellt | – |

### 5.6 `islam.vertiefung.e06` – Geschichte III: Abū Ḥanīfa, seine Schüler und die hanefitische Schule

- **Bereich:** `siyar` · **Ablage:** `web/inhalte/lernapp/islam/siyar/islam.vertiefung.e06.json` · **Belegbasis:** zurückgestellt
- **Lernziele:** Lernende
  - kann Abū Ḥanīfa, Abū Yūsuf und Muḥammad ash-Shaybānī einordnen und die Entstehung der Schule beschreiben
- **Belegbasis:** keine im Quellenregister (S8 §3.5). Zurückgestellt bis Menschen ein Werk benennen (LM-04);
  kein Entwurf aus dem Gedächtnis (KERN §2.2 Nr. 5).

| Lektion | Titel | Kinder | Hinweis | Belegbasis (Grundtext) |
|---|---|---|---|---|
| `islam.vertiefung.e06.l01` | Abū Ḥanīfa | ja | zurückgestellt | – |
| `islam.vertiefung.e06.l02` | Abū Yūsuf und Muḥammad ash-Shaybānī | ja | zurückgestellt | – |
| `islam.vertiefung.e06.l03` | Die großen Werke der Schule | ja | zurückgestellt | – |
| `islam.vertiefung.e06.l04` | Die Ausbreitung der Schule | ja | zurückgestellt | – |
| `islam.vertiefung.e06.l05` | Die Schule heute | ja | zurückgestellt | – |

### 5.7 `islam.vertiefung.e07` – Grundwissen I: Fiqh – Urteilsarten, Meinungen der Schule und Fatwa

- **Bereich:** `grundwissen` · **Ablage:** `web/inhalte/lernapp/islam/grundwissen/islam.vertiefung.e07.json` · **Belegbasis:** teilweise belegbar
- **Lernziele:** Lernende
  - unterscheidet die Urteilsarten (farḍ, wājib, sunna, mandūb, mubāḥ, makrūh, ḥarām) anhand der Begriffserklärungen der Werke
  - kann erklären, wie die Werke Meinungen innerhalb der Schule und die Meinung, nach der Fatwa gegeben wird, kennzeichnen
  - kennt die Bedingungen des Ijtihād und die Aufgabe des Muftī (ohne Fatwa-Funktion in der App)
- **Belegbasis der Einheit (Begründung, Vergleich, Fatwa-Meinung):**
  - Radd al-Muḥtār, Kitāb aṭ-Ṭahāra (Begriffs-Maṭālib) – `radd_al_muhtar.ms0001`–`ms0164`, Bd. 1, S. 1–179
  - Radd al-Muḥtār, Kitāb al-Qaḍāʾ (Maṭālib zum Muftī) – `radd_al_muhtar.ms4975`–`ms5159`, Bd. 5, S. 351–461 (Kap. k1479)

| Lektion | Titel | Kinder | Hinweis | Belegbasis (Grundtext) |
|---|---|---|---|---|
| `islam.vertiefung.e07.l01` | Urteilsarten: Pflicht, notwendig, Sunna, empfohlen, verpönt | ja |  | Radd al-Muḥtār, Maṭlab Kalimat lā baʾs; Maṭlab al-Jāʾiz – `radd_al_muhtar.ms0067`–`ms0069`, Bd. 1, S. 119–120 (Kap. k0018–k0019)<br>Radd al-Muḥtār, Maṭlab al-Mandūb wa-l-Mustaḥabb; Tark al-Mandūb – `radd_al_muhtar.ms0073`–`ms0075`, Bd. 1, S. 123–124 (Kap. k0021–k0022)<br>Radd al-Muḥtār, Maṭlab fī Taʿrīf al-Makrūh – `radd_al_muhtar.ms0086`–`ms0087`, Bd. 1, S. 131–132 (Kap. k0030) |
| `islam.vertiefung.e07.l02` | Meinungen innerhalb der Schule und Rücksicht auf Meinungsverschiedenheit | ja |  | Radd al-Muḥtār, Maṭlab fī Nadb Murāʿāt al-Khilāf – `radd_al_muhtar.ms0112`–`ms0119`, Bd. 1, S. 147–151 (Kap. k0038) |
| `islam.vertiefung.e07.l03` | Ijtihād und seine Bedingungen | ja |  | Radd al-Muḥtār, Maṭlab fī l-Ijtihād wa-Shurūṭihi – `radd_al_muhtar.ms4997`–`ms4999`, Bd. 5, S. 365–366 (Kap. k1489)<br>Radd al-Muḥtār, Maṭlab mā yasūghu fīhi l-Ijtihād – `radd_al_muhtar.ms2809`–`ms2813`, Bd. 3, S. 466–469 (Kap. k0622) |
| `islam.vertiefung.e07.l04` | Der Muftī und die Meinung, nach der Fatwa gegeben wird | ja |  | Radd al-Muḥtār, Maṭlab fī Ḥukm al-Hadiyya li-l-Muftī – `radd_al_muhtar.ms5011`–`ms5017`, Bd. 5, S. 373–376 (Kap. k1498)<br>Radd al-Muḥtār, Maṭlab: al-Muftī fī l-Waqāʾiʿ – `radd_al_muhtar.ms1631`, Bd. 2, S. 398–399 (Kap. k0397)<br>Radd al-Muḥtār, Maṭlab: ʿalā l-Muftī an yanẓura fī Khuṣūṣ al-Waqāʾiʿ – `radd_al_muhtar.ms2921`–`ms2928`, Bd. 3, S. 535–540 (Kap. k0648) |

### 5.8 `islam.vertiefung.e08` – Grundwissen II: Umgang mit Koran und Hadith

- **Bereich:** `grundwissen` · **Ablage:** `web/inhalte/lernapp/islam/grundwissen/islam.vertiefung.e08.json` · **Belegbasis:** teilweise belegbar
- **Lernziele:** Lernende
  - kennt die Reinheitsregeln für das Berühren und Rezitieren des Korans
  - kann die Rolle der Rezitation im Gebet nach den Werken beschreiben (Verse nur als Verweis)
  - Hadith- und Koranwissenschaften: zurückgestellt bis ein Werk benannt ist (LM-04)
- **Belegbasis der Einheit (Begründung, Vergleich, Fatwa-Meinung):**
  - Nūr al-Īḍāḥ, Mā yaḥrumu bi-l-Ḥayḍ …; bi-l-Janāba; ʿalā l-Muḥdith – `nur_al_idah.ms0010`, Bd. 1, S. 32 (Kap. k0064–k0068)
  - al-Ikhtiyār, Mā yaḥrumu ʿalā l-Muḥdith wa-l-Junub wa-l-Ḥāʾiḍ – `ikhtiyar.ms0009`–`ms0010`, Bd. 1, S. 13 (Kap. k0008)
  - al-Ikhtiyār, Bāb al-Qirāʾa fī ṣ-Ṣalāh – `ikhtiyar.ms0060`–`ms0062`, Bd. 1, S. 56–57 (Kap. k0031)

| Lektion | Titel | Kinder | Hinweis | Belegbasis (Grundtext) |
|---|---|---|---|---|
| `islam.vertiefung.e08.l01` | Den Koran berühren und rezitieren: Reinheitsregeln | ja |  | Nūr al-Īḍāḥ, Mā yaḥrumu bi-l-Janāba; Mā yaḥrumu ʿalā l-Muḥdith – `nur_al_idah.ms0010`, Bd. 1, S. 32 (Kap. k0067–k0068) |
| `islam.vertiefung.e08.l02` | Rezitation im Gebet | ja |  | Nūr al-Īḍāḥ, Arkān aṣ-Ṣalāh – `nur_al_idah.ms0014`, Bd. 1, S. 42 (Kap. k0096)<br>Nūr al-Īḍāḥ, Faṣl fī Wājib aṣ-Ṣalāh – `nur_al_idah.ms0015`–`ms0016`, Bd. 1, S. 45–46 (Kap. k0106)<br>al-Ikhtiyār, Bāb al-Qirāʾa fī ṣ-Ṣalāh – `ikhtiyar.ms0060`–`ms0062`, Bd. 1, S. 56–57 (Kap. k0031) |
| `islam.vertiefung.e08.l03` | Was ein Hadith ist und wie er überliefert wird | ja | zurückgestellt | – |
| `islam.vertiefung.e08.l04` | Offenbarung, Suren und Anordnung des Korans | ja | zurückgestellt | – |

## 6. Abdeckung und Lücken

- Belegbar aus den Werken des Registers: 23 Einheiten (Reinheit 3, Gebet 5, Glaube 3, Fasten 2,
  Zakat 2, Hadsch 2, Erlaubtes und Verbotenes 3, Anstand 3).
- Teilweise belegbar: Grundwissen (2). Fiqh-Grundbegriffe, Ijtihād und Muftī aus den Maṭālib in Radd al-Muḥtār Bd. 1–6;
  Umgang mit dem Koran aus den Reinheits- und Gebetskapiteln. Hadith- und Koranwissenschaften fehlen im Register.
- Zurückgestellt: Geschichte (3). Keines der benannten Werke hat ein Sīra- oder Geschichtskapitel („as-siyar“ ist dort
  Kriegsrecht). Glaubenssätze über den Propheten und die Gefährten stehen in `islam.grund.e10` und `islam.grund.e11`.
- Anstand (Akhlāq/Adab) stützt sich nach S8 §4 Nr. 6 auf Kitāb al-Karāhiya bzw. al-Ḥaẓr wa-l-Ibāḥa und die
  Ādāb-Abschnitte der ʿIbādāt; ein eigenes Adab-Werk nur nach LM-04.
- al-Hidāya: Druckvorlage ohne Jahr (LM-33); Belege tragen die Ausgabe laut `QUELLE.md`, Prüfende prüfen über Kitāb/Bāb.
- Lektionen gesamt 155 (PLAN §5.2: ≈ 170), davon 17 zurückgestellt; 402 Fundstellen.

## 7. Arbeitsweise für die Entwürfe (L6-04 Teil 2)

1. Passagen nur aus der lokalen Arbeitskopie (Scratchpad `l6/openiti`, Index `l6/index`), z. B.
   `node _lernapp/werkzeuge/quellen/openiti-passagen.mjs text <index>/nur_al_idah.passagen.json nur_al_idah.ms0003`.
   Der Text bleibt lokal (CC BY-NC-SA 4.0); ins Repository kommen nur Kennungen.
2. Beleg je Aussage (Schema `IslamBelegSchema`): `werk` (Registerschlüssel), `kapitel` (Umschrift wie oben), `ausgabe`
   (Zitierform aus `QUELLE.md`), `band`/`seite` der Vorlage, `passage` (`<werk>.msNNNN`), `fundstelle`
   (`<Version-URI>#ms<N>`), `passageSha256Text` aus dem Index, `art: sinngemaess`.
3. Ohne gelieferte Passage keine Aussage; Unsicheres wird nicht entworfen, sondern als offene Frage notiert.
4. Danach Belegprüfung durch einen frischen Agenten und zwei menschliche Freigaben (PLAN §6.7 Nr. 5–6).

## 8. Offene Punkte für Menschen

- **LM-04:** Werk für Geschichte (Sīra, Gefährten, Rechtsschule) und für Hadith-/Koranwissenschaften benennen; Zuschnitt der
  Stufen bestätigen.
- **LM-17:** `kinderGeeignet` je Lektion bestätigen (Vorschläge oben).
- **LM-33:** Ausgabe der Hidāya; Marāqī al-Falāḥ als Beleg zulassen oder nicht; Zuordnung des Vorspanns Bd. 7 in Radd al-Muḥtār.
- **Strittige Lektionen:** Darstellung von Monatsbeginn, Besuch der Prophetenmoschee und Scheidung (Abschnitt 1 Nr. 9).

