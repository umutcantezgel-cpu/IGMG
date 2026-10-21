# Koran-Arabisch: Arbeitsliste der Wortbedeutungen (L6-05)

Erzeugt von `pnpm lernapp:koran-pfad` aus `web/inhalte/lernapp/koran/pfad.json` und dem gepinnten Tanzil-Text. Nicht von
Hand ändern; neu erzeugen. Bedeutungen schreibt **kein** Agent (KERN 4.0 §2.2 Nr. 2 und 6, ADR 0040 Nr. 5, MN-05).

- **Wer:** die Hoca (MN-05) schreibt je Wortform die Bedeutung auf Deutsch und Türkisch in der Verwaltung unter
  „Koran → Wörter“ (`/verwaltung/koran/woerter/<sure>/<form>`, Tabelle `quran_wortbedeutung`). Die Stelle führt zur Form.
- **Sichtbar** im Lern-App-Pfad erst mit **zwei** religiösen Freigaben zum aktuellen Stand (Rolle `religioese_pruefung`,
  zwei verschiedene Personen, keine davon Verfasserin; `/verwaltung/lernapp/religioes`, LM-13). Bis dahin zeigt der Pfad
  „Bedeutung folgt“, und die Übungen der Lektion bleiben verborgen.
- **Umschrift:** maschinell (DMG-Art, `src/lib/lernapp/koran/umschrift.ts`), nur zur Orientierung; maßgeblich ist die Stelle
  `Sure:Vers:Wort` (Wortzählung des Tanzil-Texts wie im Koran-Leser).
- **Vorkommen:** Anzahl gleicher Schreibungen im ganzen Text (`quran_wortform.vorkommen`).

Umfang: 40 Einheiten, 187 Lektionen, 936 Wortformen. Abdeckung der Wörter im Text: 53.4 % von 77433.

## koran.grund.e01 – Sure 1

| Nr. | Lektion | Stelle | Umschrift | Vorkommen | Bedeutung (de) | Bedeutung (tr) |
|---|---|---|---|---|---|---|
| 1 | l01 | 1:1:1 | bismi | 3 | | |
| 2 | l01 | 1:1:2 | al-lahi | 828 | | |
| 3 | l01 | 1:1:3 | ar-raḥmāni | 21 | | |
| 4 | l01 | 1:1:4 | ar-raḥīmi | 6 | | |
| 5 | l01 | 1:2:1 | al-ḥamdu | 26 | | |
| 6 | l02 | 1:2:2 | lillahi | 102 | | |
| 7 | l02 | 1:2:3 | rabbi | 81 | | |
| 8 | l02 | 1:2:4 | al-ʿālamīna | 61 | | |
| 9 | l02 | 1:4:1 | māliki | 1 | | |
| 10 | l02 | 1:4:2 | yawmi | 31 | | |
| 11 | l03 | 1:4:3 | ad-dīni | 27 | | |
| 12 | l03 | 1:5:1 | ʾiyyāka | 1 | | |
| 13 | l03 | 1:5:2 | naʿbudu | 3 | | |
| 14 | l03 | 1:5:3 | waʾiyyāka | 1 | | |
| 15 | l03 | 1:5:4 | nastaʿīnu | 1 | | |
| 16 | l04 | 1:6:1 | ahdinā | 1 | | |
| 17 | l04 | 1:6:2 | aṣ-ṣirāṭa | 3 | | |
| 18 | l04 | 1:6:3 | al-mustaqīma | 3 | | |
| 19 | l04 | 1:7:1 | ṣirāṭa | 1 | | |
| 20 | l04 | 1:7:2 | allaḏīna | 810 | | |
| 21 | l05 | 1:7:3 | ʾanʿamta | 4 | | |
| 22 | l05 | 1:7:4 | ʿalayhim | 141 | | |
| 23 | l05 | 1:7:5 | ġayri | 10 | | |
| 24 | l05 | 1:7:6 | al-maġḍūbi | 1 | | |
| 25 | l05 | 1:7:8 | walā | 605 | | |
| 26 | l05 | 1:7:9 | aḍ-ḍāllīna | 6 | | |

## koran.grund.e02 – Häufige Wortformen 1

| Nr. | Lektion | Stelle | Umschrift | Vorkommen | Bedeutung (de) | Bedeutung (tr) |
|---|---|---|---|---|---|---|
| 1 | l01 | 2:10:1 | fī | 1098 | | |
| 2 | l01 | 2:7:2 | al-lahu | 733 | | |
| 3 | l01 | 2:4:8 | min | 728 | | |
| 4 | l01 | 2:17:8 | mā | 714 | | |
| 5 | l01 | 2:2:3 | lā | 616 | | |
| 6 | l02 | 2:6:1 | ʾinna | 609 | | |
| 7 | l02 | 2:9:2 | al-laha | 592 | | |
| 8 | l02 | 2:26:38 | ʾillā | 562 | | |
| 9 | l02 | 2:8:9 | wamā | 512 | | |
| 10 | l02 | 2:26:5 | ʾan | 461 | | |
| 11 | l03 | 2:22:9 | mina | 412 | | |
| 12 | l03 | 2:30:2 | qāla | 412 | | |
| 13 | l03 | 2:5:4 | mmin | 372 | | |
| 14 | l03 | 2:5:2 | ʿalā | 347 | | |
| 15 | l03 | 2:28:7 | ṯumma | 337 | | |
| 16 | l04 | 2:75:6 | kāna | 323 | | |
| 17 | l04 | 2:19:3 | mmina | 281 | | |
| 18 | l04 | 2:2:1 | ḏālika | 279 | | |
| 19 | l04 | 2:29:1 | huwa | 265 | | |
| 20 | l04 | 2:19:1 | ʾaw | 263 | | |

## koran.grund.e03 – Häufige Wortformen 2

| Nr. | Lektion | Stelle | Umschrift | Vorkommen | Bedeutung (de) | Bedeutung (tr) |
|---|---|---|---|---|---|---|
| 1 | l01 | 2:22:13 | bihī | 258 | | |
| 2 | l01 | 2:10:10 | bimā | 253 | | |
| 3 | l01 | 2:23:18 | ʾin | 253 | | |
| 4 | l01 | 2:74:30 | min | 253 | | |
| 5 | l01 | 2:31:7 | ʿalā | 242 | | |
| 6 | l02 | 2:19:17 | walllahu | 239 | | |
| 7 | l02 | 2:8:3 | man | 223 | | |
| 8 | l02 | 2:11:7 | al-ʾarḍi | 219 | | |
| 9 | l02 | 2:80:8 | qul | 218 | | |
| 10 | l02 | 2:11:3 | lahum | 217 | | |
| 11 | l03 | 2:17:3 | allaḏī | 216 | | |
| 12 | l03 | 2:9:4 | ʾāmanū | 212 | | |
| 13 | l03 | 2:25:33 | fīhā | 212 | | |
| 14 | l03 | 2:14:9 | ʾilā | 211 | | |
| 15 | l03 | 2:10:11 | kānū | 210 | | |
| 16 | l04 | 2:108:11 | waman | 187 | | |
| 17 | l04 | 2:102:62 | lahū | 184 | | |
| 18 | l04 | 2:20:24 | šāʾin | 176 | | |
| 19 | l04 | 2:33:15 | as-samāwāti | 175 | | |
| 20 | l04 | 2:25:19 | qālū | 173 | | |

## koran.grund.e04 – Häufige Wortformen 3

| Nr. | Lektion | Stelle | Umschrift | Vorkommen | Bedeutung (de) | Bedeutung (tr) |
|---|---|---|---|---|---|---|
| 1 | l01 | 2:29:16 | wahuwa | 171 | | |
| 2 | l01 | 2:177:38 | ʾiḏā | 170 | | |
| 3 | l01 | 2:6:3 | kafarū | 166 | | |
| 4 | l01 | 2:58:17 | lakum | 166 | | |
| 5 | l01 | 2:4:1 | wallaḏīna | 163 | | |
| 6 | l02 | 2:26:8 | mmā | 162 | | |
| 7 | l02 | 2:25:20 | hāḏā | 156 | | |
| 8 | l02 | 2:131:1 | ʾiḏ | 153 | | |
| 9 | l02 | 2:23:2 | kuntum | 152 | | |
| 10 | l02 | 2:23:1 | waʾin | 149 | | |
| 11 | l03 | 2:49:3 | mmin | 149 | | |
| 12 | l03 | 2:22:18 | falā | 145 | | |
| 13 | l03 | 2:4:11 | hum | 144 | | |
| 14 | l03 | 2:37:7 | ʿalayhi | 143 | | |
| 15 | l03 | 2:21:1 | yāʾayyuhā | 142 | | |
| 16 | l04 | 2:37:8 | ʾinnahū | 141 | | |
| 17 | l04 | 2:29:11 | ʾilā | 140 | | |
| 18 | l04 | 2:8:6 | billlahi | 139 | | |
| 19 | l04 | 2:4:6 | wamā | 134 | | |
| 20 | l04 | 2:5:1 | ʾulāʾika | 133 | | |

## koran.grund.e05 – Häufige Wortformen 4

| Nr. | Lektion | Stelle | Umschrift | Vorkommen | Bedeutung (de) | Bedeutung (tr) |
|---|---|---|---|---|---|---|
| 1 | l01 | 2:12:6 | llā | 133 | | |
| 2 | l01 | 2:113:26 | yawma | 133 | | |
| 3 | l01 | 2:27:5 | min | 131 | | |
| 4 | l01 | 2:2:5 | fīhi | 126 | | |
| 5 | l01 | 2:20:23 | kulli | 123 | | |
| 6 | l02 | 2:65:1 | walaqad | 122 | | |
| 7 | l02 | 2:11:1 | waʾiḏā | 121 | | |
| 8 | l02 | 2:40:7 | ʿalaykum | 121 | | |
| 9 | l02 | 2:60:14 | qad | 119 | | |
| 10 | l02 | 2:27:9 | mā | 117 | | |
| 11 | l03 | 2:14:12 | ʾinnā | 115 | | |
| 12 | l03 | 2:48:6 | ʿan | 115 | | |
| 13 | l03 | 2:25:32 | wahum | 110 | | |
| 14 | l03 | 2:85:38 | ad-dunyā | 110 | | |
| 15 | l03 | 2:20:14 | walaw | 108 | | |
| 16 | l04 | 2:33:16 | walʾarḍi | 108 | | |
| 17 | l04 | 2:90:18 | yašāʾu | 108 | | |
| 18 | l04 | 2:6:7 | ʾam | 103 | | |
| 19 | l04 | 2:9:7 | ʾillā | 100 | | |
| 20 | l04 | 2:25:6 | ʾanna | 99 | | |

## koran.grund.e06 – Häufige Wortformen 5

| Nr. | Lektion | Stelle | Umschrift | Vorkommen | Bedeutung (de) | Bedeutung (tr) |
|---|---|---|---|---|---|---|
| 1 | l01 | 2:54:19 | ʿinda | 98 | | |
| 2 | l01 | 2:100:7 | bal | 97 | | |
| 3 | l01 | 2:55:7 | ḥattā | 95 | | |
| 4 | l01 | 2:8:2 | an-nāsi | 92 | | |
| 5 | l01 | 2:228:27 | ʾin | 91 | | |
| 6 | l02 | 2:6:8 | lam | 89 | | |
| 7 | l02 | 2:3:2 | yuʾminūna | 86 | | |
| 8 | l02 | 2:19:11 | fī | 86 | | |
| 9 | l02 | 2:11:9 | ʾinnamā | 85 | | |
| 10 | l02 | 2:118:1 | waqāla | 85 | | |
| 11 | l03 | 2:34:11 | wakāna | 84 | | |
| 12 | l03 | 2:23:16 | dūni | 83 | | |
| 13 | l03 | 2:73:4 | kaḏālika | 83 | | |
| 14 | l03 | 2:74:37 | taʿmalūna | 83 | | |
| 15 | l03 | 2:27:6 | baʿdi | 82 | | |
| 16 | l04 | 2:13:19 | yaʿlamūna | 81 | | |
| 17 | l04 | 2:19:4 | as-samāʾi | 81 | | |
| 18 | l04 | 2:30:5 | ʾinnī | 81 | | |
| 19 | l04 | 2:74:12 | waʾinna | 81 | | |
| 20 | l04 | 3:84:9 | ʿalā | 81 | | |

## koran.grund.e07 – Häufige Wortformen 6

| Nr. | Lektion | Stelle | Umschrift | Vorkommen | Bedeutung (de) | Bedeutung (tr) |
|---|---|---|---|---|---|---|
| 1 | l01 | 6:115:3 | rabbika | 81 | | |
| 2 | l01 | 2:5:7 | humu | 80 | | |
| 3 | l01 | 2:89:17 | falammā | 79 | | |
| 4 | l01 | 2:33:9 | ʾalam | 78 | | |
| 5 | l01 | 2:44:8 | al-kitāba | 78 | | |
| 6 | l02 | 2:54:17 | ḫayrun | 78 | | |
| 7 | l02 | 2:223:16 | al-muʾminīna | 78 | | |
| 8 | l02 | 2:7:11 | ʿaḏābun | 77 | | |
| 9 | l02 | 2:11:8 | qālū | 77 | | |
| 10 | l02 | 2:48:8 | šayʾ | 77 | | |
| 11 | l03 | 2:85:25 | al-kitābi | 77 | | |
| 12 | l03 | 2:28:12 | ʾilayhi | 76 | | |
| 13 | l03 | 2:200:1 | faʾiḏā | 76 | | |
| 14 | l03 | 2:4:5 | ʾilayka | 74 | | |
| 15 | l03 | 2:24:2 | llam | 74 | | |
| 16 | l04 | 2:71:20 | bilḥaqqi | 74 | | |
| 17 | l04 | 2:29:19 | ʿalīmun | 73 | | |
| 18 | l04 | 2:62:8 | man | 73 | | |
| 19 | l04 | 2:154:6 | sabīli | 72 | | |
| 20 | l04 | 2:16:6 | famā | 71 | | |

## koran.grund.e08 – Häufige Wortformen 7

| Nr. | Lektion | Stelle | Umschrift | Vorkommen | Bedeutung (de) | Bedeutung (tr) |
|---|---|---|---|---|---|---|
| 1 | l01 | 2:61:33 | faʾinna | 71 | | |
| 2 | l01 | 2:25:24 | qablu | 70 | | |
| 3 | l01 | 2:29:4 | lakum | 70 | | |
| 4 | l01 | 2:39:7 | an-nāri | 70 | | |
| 5 | l01 | 2:66:4 | bayna | 70 | | |
| 6 | l02 | 2:85:40 | al-qiyāmati | 70 | | |
| 7 | l02 | 2:189:2 | ʿani | 70 | | |
| 8 | l02 | 2:20:7 | lahum | 69 | | |
| 9 | l02 | 2:30:1 | waʾiḏ | 69 | | |
| 10 | l02 | 2:150:23 | minhum | 67 | | |
| 11 | l03 | 2:258:33 | bihā | 65 | | |
| 12 | l03 | 3:51:3 | rabbī | 65 | | |
| 13 | l03 | 2:24:1 | faʾin | 64 | | |
| 14 | l03 | 2:35:18 | aẓ-ẓālimīna | 64 | | |
| 15 | l03 | 2:210:1 | hal | 63 | | |
| 16 | l04 | 2:28:1 | kayfa | 62 | | |
| 17 | l04 | 2:77:5 | yaʿlamu | 62 | | |
| 18 | l04 | 4:97:11 | kunnā | 62 | | |
| 19 | l04 | 2:25:5 | aṣ-ṣāliḥāti | 59 | | |
| 20 | l04 | 2:30:22 | laka | 59 | | |

## koran.grund.e09 – Häufige Wortformen 8

| Nr. | Lektion | Stelle | Umschrift | Vorkommen | Bedeutung (de) | Bedeutung (tr) |
|---|---|---|---|---|---|---|
| 1 | l01 | 2:46:5 | rabbihim | 59 | | |
| 2 | l01 | 2:96:11 | law | 59 | | |
| 3 | l01 | 3:167:20 | yawmaʾiḏin | 59 | | |
| 4 | l01 | 2:25:15 | minhā | 58 | | |
| 5 | l01 | 2:29:3 | ḫalaqa | 58 | | |
| 6 | l02 | 2:61:10 | lanā | 58 | | |
| 7 | l02 | 2:65:5 | minkum | 58 | | |
| 8 | l02 | 2:54:3 | mūsā | 57 | | |
| 9 | l02 | 2:67:17 | ʾan | 57 | | |
| 10 | l02 | 2:120:19 | baʿda | 57 | | |
| 11 | l03 | 4:43:27 | ǧāʾa | 57 | | |
| 12 | l03 | 2:20:15 | šāʾa | 56 | | |
| 13 | l03 | 2:96:25 | yaʿmalūna | 56 | | |
| 14 | l03 | 2:143:45 | rraḥīmun | 56 | | |
| 15 | l03 | 2:252:5 | ʿalayka | 56 | | |
| 16 | l04 | 2:11:10 | naḥnu | 55 | | |
| 17 | l04 | 2:30:25 | ʾaʿlamu | 55 | | |
| 18 | l04 | 2:32:10 | ʾanta | 55 | | |
| 19 | l04 | 2:41:16 | qalīlan | 55 | | |
| 20 | l04 | 2:102:64 | al-ʾḫirati | 55 | | |

## koran.grund.e10 – Häufige Wortformen 9

| Nr. | Lektion | Stelle | Umschrift | Vorkommen | Bedeutung (de) | Bedeutung (tr) |
|---|---|---|---|---|---|---|
| 1 | l01 | 2:12:2 | ʾinnahum | 54 | | |
| 2 | l01 | 2:22:23 | taʿlamūna | 54 | | |
| 3 | l01 | 2:85:42 | ʾilā | 54 | | |
| 4 | l01 | 3:12:7 | ǧahannama | 54 | | |
| 5 | l01 | 2:25:4 | waʿamilū | 53 | | |
| 6 | l02 | 2:102:11 | walākinna | 53 | | |
| 7 | l02 | 2:262:13 | walā | 53 | | |
| 8 | l02 | 2:22:17 | llakum | 52 | | |
| 9 | l02 | 2:34:13 | al-kāfirīna | 52 | | |
| 10 | l02 | 2:60:10 | minhu | 52 | | |
| 11 | l03 | 2:61:11 | rabbaka | 52 | | |
| 12 | l03 | 2:185:3 | allaḏī | 52 | | |
| 13 | l03 | 2:12:5 | walākin | 51 | | |
| 14 | l03 | 2:36:5 | mimmā | 51 | | |
| 15 | l03 | 2:38:9 | faman | 51 | | |
| 16 | l04 | 2:79:7 | yaqūlūna | 51 | | |
| 17 | l04 | 2:173:24 | ġafūrun | 51 | | |
| 18 | l04 | 3:10:6 | ʿanhum | 51 | | |
| 19 | l04 | 2:21:10 | laʿallakum | 50 | | |
| 20 | l04 | 2:23:5 | mmimmā | 50 | | |

## koran.grund.e11 – Häufige Wortformen 10

| Nr. | Lektion | Stelle | Umschrift | Vorkommen | Bedeutung (de) | Bedeutung (tr) |
|---|---|---|---|---|---|---|
| 1 | l01 | 2:30:24 | ʾinnī | 50 | | |
| 2 | l01 | 2:75:8 | mminhum | 50 | | |
| 3 | l01 | 2:108:15 | faqad | 50 | | |
| 4 | l01 | 2:212:2 | lillaḏīna | 50 | | |
| 5 | l01 | 2:32:9 | ʾinnaka | 49 | | |
| 6 | l02 | 2:43:6 | maʿa | 49 | | |
| 7 | l02 | 2:80:1 | waqālū | 49 | | |
| 8 | l02 | 2:85:2 | ʾantum | 49 | | |
| 9 | l02 | 2:201:2 | mman | 49 | | |
| 10 | l02 | 2:276:9 | kulla | 49 | | |
| 11 | l03 | 2:25:9 | taǧrī | 48 | | |
| 12 | l03 | 2:26:17 | al-ḥaqqu | 48 | | |
| 13 | l03 | 2:29:8 | ǧamīʿan | 48 | | |
| 14 | l03 | 2:44:2 | an-nāsa | 48 | | |
| 15 | l03 | 2:49:5 | firʿawna | 48 | | |
| 16 | l04 | 2:255:2 | lā | 48 | | |
| 17 | l04 | 2:3:5 | aṣ-ṣalawāta | 47 | | |
| 18 | l04 | 2:4:4 | ʾunzila | 47 | | |
| 19 | l04 | 2:60:16 | kullu | 47 | | |
| 20 | l04 | 2:68:8 | hiʾa | 47 | | |

## koran.grund.e12 – Häufige Wortformen 11

| Nr. | Lektion | Stelle | Umschrift | Vorkommen | Bedeutung (de) | Bedeutung (tr) |
|---|---|---|---|---|---|---|
| 1 | l01 | 2:90:8 | ʾanzala | 47 | | |
| 2 | l01 | 2:247:21 | walam | 47 | | |
| 3 | l01 | 3:152:8 | ḥattā | 47 | | |
| 4 | l01 | 2:26:31 | kaṯīran | 46 | | |
| 5 | l01 | 2:81:8 | faʾulāʾika | 46 | | |
| 6 | l02 | 2:114:1 | waman | 46 | | |
| 7 | l02 | 2:129:15 | al-ʿazīzu | 46 | | |
| 8 | l02 | 2:22:4 | al-ʾarḍa | 45 | | |
| 9 | l02 | 2:44:9 | ʾafalā | 45 | | |
| 10 | l02 | 2:142:12 | qul | 45 | | |
| 11 | l03 | 2:22:2 | ǧaʿala | 44 | | |
| 12 | l03 | 2:74:36 | ʿammā | 44 | | |
| 13 | l03 | 2:85:39 | wayawma | 44 | | |
| 14 | l03 | 2:108:6 | kamā | 44 | | |
| 15 | l03 | 2:168:16 | mmubīnun | 44 | | |
| 16 | l04 | 2:229:19 | ʾallā | 44 | | |
| 17 | l04 | 2:258:21 | ʾanā | 44 | | |
| 18 | l04 | 2:4:3 | bimā | 43 | | |
| 19 | l04 | 2:22:3 | lakumu | 43 | | |
| 20 | l04 | 2:24:8 | allatī | 43 | | |

## koran.grund.e13 – Häufige Wortformen 12

| Nr. | Lektion | Stelle | Umschrift | Vorkommen | Bedeutung (de) | Bedeutung (tr) |
|---|---|---|---|---|---|---|
| 1 | l01 | 2:109:20 | lahumu | 43 | | |
| 2 | l01 | 2:162:1 | ḫālidīna | 43 | | |
| 3 | l01 | 2:165:28 | waʾanna | 43 | | |
| 4 | l01 | 2:13:7 | an-nāsu | 42 | | |
| 5 | l01 | 2:30:3 | rabbuka | 42 | | |
| 6 | l02 | 2:85:12 | ʿalayhim | 42 | | |
| 7 | l02 | 2:113:25 | baynahum | 42 | | |
| 8 | l02 | 2:142:11 | ʿalayhā | 42 | | |
| 9 | l02 | 2:152:4 | lī | 42 | | |
| 10 | l02 | 2:31:12 | hāʾulāʾi | 41 | | |
| 11 | l03 | 2:39:6 | ʾaṣḥābu | 41 | | |
| 12 | l03 | 2:40:2 | ʾisrāʾīla | 41 | | |
| 13 | l03 | 2:61:53 | biġayri | 41 | | |
| 14 | l03 | 2:70:12 | ʿalaynā | 41 | | |
| 15 | l03 | 2:119:1 | ʾinnā | 41 | | |
| 16 | l04 | 2:127:8 | rabbanā | 41 | | |
| 17 | l04 | 2:151:2 | ʾarsalnā | 41 | | |
| 18 | l04 | 2:165:13 | ʾāmanū | 41 | | |
| 19 | l04 | 2:255:44 | walʾarḍa | 41 | | |
| 20 | l04 | 3:11:8 | biʾyātinā | 41 | | |

## koran.grund.e14 – Häufige Wortformen 13

| Nr. | Lektion | Stelle | Umschrift | Vorkommen | Bedeutung (de) | Bedeutung (tr) |
|---|---|---|---|---|---|---|
| 1 | l01 | 2:25:12 | al-ʾanhāru | 40 | | |
| 2 | l01 | 2:52:4 | mmin | 40 | | |
| 3 | l01 | 2:75:5 | waqad | 40 | | |
| 4 | l01 | 2:22:22 | waʾantum | 39 | | |
| 5 | l01 | 2:26:37 | bihī | 39 | | |
| 6 | l02 | 2:59:5 | ġayra | 39 | | |
| 7 | l02 | 2:190:12 | yuḥibbu | 39 | | |
| 8 | l02 | 2:7:10 | walahum | 38 | | |
| 9 | l02 | 2:8:1 | wamina | 38 | | |
| 10 | l02 | 2:48:1 | wattaqū | 38 | | |
| 11 | l03 | 2:54:5 | yāqawmi | 38 | | |
| 12 | l03 | 2:83:17 | lilnnāsi | 38 | | |
| 13 | l03 | 2:142:16 | yahdī | 38 | | |
| 14 | l03 | 2:143:1 | wakaḏālika | 38 | | |
| 15 | l03 | 2:185:28 | yurīdu | 38 | | |
| 16 | l04 | 2:198:1 | laysa | 38 | | |
| 17 | l04 | 2:249:40 | al-yawma | 38 | | |
| 18 | l04 | 3:33:7 | ʾibrāhīma | 38 | | |
| 19 | l04 | 3:56:5 | ʿaḏāban | 38 | | |
| 20 | l04 | 3:164:25 | mmubīnin | 38 | | |

## koran.aufbau.e01 – Häufige Wortformen 14

| Nr. | Lektion | Stelle | Umschrift | Vorkommen | Bedeutung (de) | Bedeutung (tr) |
|---|---|---|---|---|---|---|
| 1 | l01 | 2:25:8 | ǧannātin | 37 | | |
| 2 | l01 | 2:61:54 | al-ḥaqqi | 37 | | |
| 3 | l01 | 2:76:11 | baʿḍin | 37 | | |
| 4 | l01 | 2:85:37 | al-ḥayawāti | 37 | | |
| 5 | l01 | 2:158:20 | ḫayran | 37 | | |
| 6 | l02 | 2:163:5 | ʾilāha | 37 | | |
| 7 | l02 | 2:201:13 | ʿaḏāba | 37 | | |
| 8 | l02 | 3:11:7 | kaḏḏabū | 37 | | |
| 9 | l02 | 4:31:6 | ʿanhu | 37 | | |
| 10 | l02 | 2:8:10 | hum | 36 | | |
| 11 | l03 | 2:20:25 | qadīrun | 36 | | |
| 12 | l03 | 2:55:4 | lan | 36 | | |
| 13 | l03 | 2:62:14 | ṣāliḥan | 36 | | |
| 14 | l03 | 2:91:29 | kuntum | 36 | | |
| 15 | l03 | 2:164:42 | lliqawmin | 36 | | |
| 16 | l04 | 2:268:9 | mminhu | 36 | | |
| 17 | l04 | 5:13:5 | waǧaʿalnā | 36 | | |
| 18 | l04 | 2:8:4 | yaqūlu | 35 | | |
| 19 | l04 | 2:49:8 | al-ʿaḏābi | 35 | | |
| 20 | l04 | 2:104:12 | ʾalīmun | 35 | | |
| 21 | l05 | 2:134:5 | lahā | 35 | | |
| 22 | l05 | 2:143:17 | kunta | 35 | | |
| 23 | l05 | 2:147:3 | rrabbika | 35 | | |
| 24 | l05 | 2:209:12 | ḥakīmun | 35 | | |
| 25 | l05 | 2:260:10 | ʾawalam | 35 | | |

## koran.aufbau.e02 – Häufige Wortformen 15

| Nr. | Lektion | Stelle | Umschrift | Vorkommen | Bedeutung (de) | Bedeutung (tr) |
|---|---|---|---|---|---|---|
| 1 | l01 | 3:86:4 | qawman | 35 | | |
| 2 | l01 | 3:164:1 | laqad | 35 | | |
| 3 | l01 | 7:185:19 | fabiʾaʾi | 35 | | |
| 4 | l01 | 2:9:8 | ʾanfusahum | 34 | | |
| 5 | l01 | 2:11:2 | qīla | 34 | | |
| 6 | l02 | 2:25:11 | taḥtihā | 34 | | |
| 7 | l02 | 2:36:2 | aš-šayṭānu | 34 | | |
| 8 | l02 | 2:61:49 | biʾyāti | 34 | | |
| 9 | l02 | 2:119:8 | ʿan | 34 | | |
| 10 | l02 | 2:186:16 | laʿallahum | 34 | | |
| 11 | l03 | 5:110:60 | hāḏā | 34 | | |
| 12 | l03 | 2:18:4 | fahum | 33 | | |
| 13 | l03 | 2:29:17 | bikulli | 33 | | |
| 14 | l03 | 2:32:12 | al-ḥakīmu | 33 | | |
| 15 | l03 | 2:103:2 | ʾannahum | 33 | | |
| 16 | l04 | 2:116:7 | llahū | 33 | | |
| 17 | l04 | 3:77:20 | ʾilayhim | 32 | | |
| 18 | l04 | 53:55:2 | ʾālāʾi | 32 | | |
| 19 | l04 | 2:7:12 | ʿaẓīmun | 31 | | |
| 20 | l04 | 2:8:5 | ʾāmannā | 31 | | |
| 21 | l05 | 2:23:20 | ṣādiqīna | 31 | | |
| 22 | l05 | 2:61:38 | ʿalayhimu | 31 | | |
| 23 | l05 | 2:83:4 | banī | 31 | | |
| 24 | l05 | 2:101:14 | ʾūtū | 31 | | |
| 25 | l05 | 2:124:13 | wamin | 31 | | |

## koran.aufbau.e03 – Häufige Wortformen 16

| Nr. | Lektion | Stelle | Umschrift | Vorkommen | Bedeutung (de) | Bedeutung (tr) |
|---|---|---|---|---|---|---|
| 1 | l01 | 2:154:3 | liman | 31 | | |
| 2 | l01 | 2:220:9 | llahum | 31 | | |
| 3 | l01 | 2:243:2 | tara | 31 | | |
| 4 | l01 | 2:250:14 | al-qawmi | 31 | | |
| 5 | l01 | 6:25:32 | al-ʾawwalīna | 31 | | |
| 6 | l02 | 6:31:23 | ʾalā | 31 | | |
| 7 | l02 | 55:13:3 | rabbikumā | 31 | | |
| 8 | l02 | 55:13:4 | tukaḏḏibāni | 31 | | |
| 9 | l02 | 2:49:17 | rrabbikum | 30 | | |
| 10 | l02 | 2:58:20 | al-muḥsinīna | 30 | | |
| 11 | l03 | 2:89:1 | walammā | 30 | | |
| 12 | l03 | 2:89:10 | wakānū | 30 | | |
| 13 | l03 | 2:164:7 | allayli | 30 | | |
| 14 | l03 | 2:206:3 | lahu | 30 | | |
| 15 | l03 | 2:219:18 | quli | 30 | | |
| 16 | l04 | 2:25:29 | fīhā | 29 | | |
| 17 | l04 | 2:35:10 | ḥayṯu | 29 | | |
| 18 | l04 | 2:79:2 | llillaḏīna | 29 | | |
| 19 | l04 | 2:149:1 | wamin | 29 | | |
| 20 | l04 | 2:164:25 | bihi | 29 | | |
| 21 | l05 | 2:164:41 | laʾyātin | 29 | | |
| 22 | l05 | 3:11:6 | qablihim | 29 | | |
| 23 | l05 | 5:60:15 | waǧaʿala | 29 | | |
| 24 | l05 | 2:4:9 | qablika | 28 | | |
| 25 | l05 | 2:32:11 | al-ʿalīmu | 28 | | |

## koran.aufbau.e04 – Häufige Wortformen 17

| Nr. | Lektion | Stelle | Umschrift | Vorkommen | Bedeutung (de) | Bedeutung (tr) |
|---|---|---|---|---|---|---|
| 1 | l01 | 2:37:11 | ar-raḥīmu | 28 | | |
| 2 | l01 | 2:59:3 | ẓalamū | 28 | | |
| 3 | l01 | 2:87:12 | maryama | 28 | | |
| 4 | l01 | 2:117:7 | faʾinnamā | 28 | | |
| 5 | l01 | 2:118:22 | al-ʾyāti | 28 | | |
| 6 | l02 | 2:125:2 | ǧaʿalnā | 28 | | |
| 7 | l02 | 2:165:23 | al-ʿaḏāba | 28 | | |
| 8 | l02 | 2:184:23 | fahuwa | 28 | | |
| 9 | l02 | 2:259:31 | yawmin | 28 | | |
| 10 | l02 | 3:75:31 | wayaqūlūna | 28 | | |
| 11 | l03 | 3:97:18 | sabīlan | 28 | | |
| 12 | l03 | 5:22:7 | waʾinnā | 28 | | |
| 13 | l03 | 6:156:3 | ʾinnamā | 28 | | |
| 14 | l03 | 2:2:6 | hudan | 27 | | |
| 15 | l03 | 2:31:9 | faqāla | 27 | | |
| 16 | l04 | 2:82:7 | al-ǧannati | 27 | | |
| 17 | l04 | 2:95:8 | ʿalīmun | 27 | | |
| 18 | l04 | 2:111:11 | tilka | 27 | | |
| 19 | l04 | 2:115:1 | walillahi | 27 | | |
| 20 | l04 | 2:176:12 | lafī | 27 | | |
| 21 | l05 | 2:200:15 | rabbanā | 27 | | |
| 22 | l05 | 2:282:120 | bikum | 27 | | |
| 23 | l05 | 3:28:5 | ʾawliyāʾa | 27 | | |
| 24 | l05 | 4:28:7 | al-ʾinsānu | 27 | | |
| 25 | l05 | 4:157:28 | ʿilmin | 27 | | |

## koran.aufbau.e05 – Häufige Wortformen 18

| Nr. | Lektion | Stelle | Umschrift | Vorkommen | Bedeutung (de) | Bedeutung (tr) |
|---|---|---|---|---|---|---|
| 1 | l01 | 10:12:3 | al-ʾinsāna | 27 | | |
| 2 | l01 | 2:13:6 | ʾāmana | 26 | | |
| 3 | l01 | 2:49:13 | wafī | 26 | | |
| 4 | l01 | 2:54:16 | ḏālikum | 26 | | |
| 5 | l01 | 2:83:27 | mminkum | 26 | | |
| 6 | l02 | 2:145:30 | ʾiḏan | 26 | | |
| 7 | l02 | 2:258:42 | al-qawma | 26 | | |
| 8 | l02 | 3:137:12 | ʿāqibatu | 26 | | |
| 9 | l02 | 4:30:6 | fasawfa | 26 | | |
| 10 | l02 | 4:57:13 | ʾabadan | 26 | | |
| 11 | l03 | 5:11:10 | qawmun | 26 | | |
| 12 | l03 | 2:5:6 | waʾulāʾika | 25 | | |
| 13 | l03 | 2:7:4 | qulūbihim | 25 | | |
| 14 | l03 | 2:15:3 | bihim | 25 | | |
| 15 | l03 | 2:26:20 | waʾammā | 25 | | |
| 16 | l04 | 2:51:3 | mūsā | 25 | | |
| 17 | l04 | 2:79:20 | ʾaydīhim | 25 | | |
| 18 | l04 | 2:91:30 | mmuʾminīna | 25 | | |
| 19 | l04 | 2:105:12 | ʿalaykum | 25 | | |
| 20 | l04 | 2:105:23 | ḏū | 25 | | |
| 21 | l05 | 2:156:2 | ʾiḏā | 25 | | |
| 22 | l05 | 2:237:4 | qabli | 25 | | |
| 23 | l05 | 2:243:25 | ʾakṯara | 25 | | |
| 24 | l05 | 3:27:2 | allayla | 25 | | |
| 25 | l05 | 3:55:8 | ʾilaʾa | 25 | | |

## koran.aufbau.e06 – Häufige Wortformen 19

| Nr. | Lektion | Stelle | Umschrift | Vorkommen | Bedeutung (de) | Bedeutung (tr) |
|---|---|---|---|---|---|---|
| 1 | l01 | 3:80:12 | ʾantum | 25 | | |
| 2 | l01 | 6:5:4 | lammā | 25 | | |
| 3 | l01 | 2:25:34 | ḫālidūna | 24 | | |
| 4 | l01 | 2:42:3 | al-ḥaqqa | 24 | | |
| 5 | l01 | 2:43:4 | az-zakawāta | 24 | | |
| 6 | l02 | 2:44:10 | taʿqilūna | 24 | | |
| 7 | l02 | 2:54:6 | ʾinnakum | 24 | | |
| 8 | l02 | 2:61:46 | biʾannahum | 24 | | |
| 9 | l02 | 2:92:4 | bilbayyināti | 24 | | |
| 10 | l02 | 2:105:9 | al-mušrikīna | 24 | | |
| 11 | l03 | 2:130:14 | waʾinnahū | 24 | | |
| 12 | l03 | 2:137:1 | faʾin | 24 | | |
| 13 | l03 | 2:229:46 | aẓ-ẓālimūna | 24 | | |
| 14 | l03 | 2:245:9 | lahū | 24 | | |
| 15 | l03 | 2:252:9 | al-mursalīna | 24 | | |
| 16 | l04 | 2:253:38 | mman | 24 | | |
| 17 | l04 | 3:164:24 | ḍalālin | 24 | | |
| 18 | l04 | 4:11:36 | yakun | 24 | | |
| 19 | l04 | 6:6:2 | yaraw | 24 | | |
| 20 | l04 | 2:8:8 | al-ʾḫiri | 23 | | |
| 21 | l05 | 2:12:1 | ʾalā | 23 | | |
| 22 | l05 | 2:22:11 | māʾan | 23 | | |
| 23 | l05 | 2:35:14 | hāḏihi | 23 | | |
| 24 | l05 | 2:61:16 | al-ʾarḍu | 23 | | |
| 25 | l05 | 2:94:3 | kānat | 23 | | |

## koran.aufbau.e07 – Häufige Wortformen 20

| Nr. | Lektion | Stelle | Umschrift | Vorkommen | Bedeutung (de) | Bedeutung (tr) |
|---|---|---|---|---|---|---|
| 1 | l01 | 2:97:10 | biʾiḏni | 23 | | |
| 2 | l01 | 2:105:6 | ʾahli | 23 | | |
| 3 | l01 | 2:126:30 | al-maṣīru | 23 | | |
| 4 | l01 | 2:161:13 | ʾaǧmaʿīna | 23 | | |
| 5 | l01 | 2:180:16 | al-muttaqīna | 23 | | |
| 6 | l02 | 2:184:14 | waʿalā | 23 | | |
| 7 | l02 | 2:209:11 | ʿazīzun | 23 | | |
| 8 | l02 | 2:221:26 | yadʿūna | 23 | | |
| 9 | l02 | 2:257:11 | kafarū | 23 | | |
| 10 | l02 | 2:265:10 | ʾanfusihim | 23 | | |
| 11 | l03 | 3:23:19 | wahum | 23 | | |
| 12 | l03 | 3:36:3 | qālat | 23 | | |
| 13 | l03 | 3:110:3 | ʾummatin | 23 | | |
| 14 | l03 | 4:13:7 | warasūlahū | 23 | | |
| 15 | l03 | 6:54:10 | rabbukum | 23 | | |
| 16 | l04 | 2:17:6 | falammā | 22 | | |
| 17 | l04 | 2:36:3 | ʿanhā | 22 | | |
| 18 | l04 | 2:86:10 | al-ʿaḏābu | 22 | | |
| 19 | l04 | 2:112:11 | rabbihī | 22 | | |
| 20 | l04 | 2:116:12 | kullun | 22 | | |
| 21 | l05 | 2:164:43 | yaʿqilūna | 22 | | |
| 22 | l05 | 2:201:1 | waminhum | 22 | | |
| 23 | l05 | 2:245:15 | waʾilayhi | 22 | | |
| 24 | l05 | 2:259:47 | ʾāyatan | 22 | | |
| 25 | l05 | 3:28:3 | al-muʾminūna | 22 | | |

## koran.aufbau.e08 – Häufige Wortformen 21

| Nr. | Lektion | Stelle | Umschrift | Vorkommen | Bedeutung (de) | Bedeutung (tr) |
|---|---|---|---|---|---|---|
| 1 | l01 | 3:90:9 | llan | 22 | | |
| 2 | l01 | 3:157:1 | walaʾin | 22 | | |
| 3 | l01 | 4:11:70 | ʿalīman | 22 | | |
| 4 | l01 | 4:40:14 | ʾaǧran | 22 | | |
| 5 | l01 | 4:82:3 | al-qurʾāna | 22 | | |
| 6 | l02 | 4:128:14 | baynahumā | 22 | | |
| 7 | l02 | 4:163:7 | nūḥin | 22 | | |
| 8 | l02 | 5:91:18 | fahal | 22 | | |
| 9 | l02 | 6:51:12 | dūnihī | 22 | | |
| 10 | l02 | 7:184:10 | naḏīrun | 22 | | |
| 11 | l03 | 2:9:10 | yašʿurūna | 21 | | |
| 12 | l03 | 2:24:4 | walan | 21 | | |
| 13 | l03 | 2:26:12 | faʾammā | 21 | | |
| 14 | l03 | 2:41:5 | llimā | 21 | | |
| 15 | l03 | 2:62:11 | walyawmi | 21 | | |
| 16 | l04 | 2:79:10 | ʿindi | 21 | | |
| 17 | l04 | 2:80:4 | an-nāru | 21 | | |
| 18 | l04 | 2:86:6 | bilʾḫirati | 21 | | |
| 19 | l04 | 2:130:17 | lamina | 21 | | |
| 20 | l04 | 2:163:8 | ar-raḥmānu | 21 | | |
| 21 | l05 | 2:231:23 | ʾāyāti | 21 | | |
| 22 | l05 | 2:248:22 | al-malāʾikatu | 21 | | |
| 23 | l05 | 2:279:8 | warasūlihī | 21 | | |
| 24 | l05 | 2:282:9 | mmusamman | 21 | | |
| 25 | l05 | 4:27:13 | ʿaẓīman | 21 | | |

## koran.aufbau.e09 – Häufige Wortformen 22

| Nr. | Lektion | Stelle | Umschrift | Vorkommen | Bedeutung (de) | Bedeutung (tr) |
|---|---|---|---|---|---|---|
| 1 | l01 | 6:21:9 | kaḏḏaba | 21 | | |
| 2 | l01 | 2:3:8 | yunfiqūna | 20 | | |
| 3 | l01 | 2:83:7 | taʿbudūna | 20 | | |
| 4 | l01 | 2:90:15 | faḍlihī | 20 | | |
| 5 | l01 | 2:108:18 | as-sabīli | 20 | | |
| 6 | l02 | 2:110:17 | baṣīrun | 20 | | |
| 7 | l02 | 2:142:21 | mmustaqīmin | 20 | | |
| 8 | l02 | 2:151:8 | ʾāyātinā | 20 | | |
| 9 | l02 | 2:178:22 | bilmaʿrūfi | 20 | | |
| 10 | l02 | 2:214:22 | maʿahū | 20 | | |
| 11 | l03 | 2:233:54 | mmā | 20 | | |
| 12 | l03 | 2:248:26 | laʾyatan | 20 | | |
| 13 | l03 | 2:281:10 | nafsin | 20 | | |
| 14 | l03 | 3:8:12 | raḥmatan | 20 | | |
| 15 | l03 | 3:54:5 | ḫayru | 20 | | |
| 16 | l04 | 3:117:14 | qawmin | 20 | | |
| 17 | l04 | 4:6:35 | wakafā | 20 | | |
| 18 | l04 | 4:23:53 | ġafūran | 20 | | |
| 19 | l04 | 4:66:5 | ʾani | 20 | | |
| 20 | l04 | 4:77:33 | lawlā | 20 | | |
| 21 | l05 | 4:95:6 | ġayru | 20 | | |
| 22 | l05 | 4:159:8 | qabla | 20 | | |
| 23 | l05 | 5:28:13 | ʾaḫāfu | 20 | | |
| 24 | l05 | 19:79:1 | kallā | 20 | | |
| 25 | l05 | 2:17:5 | nāran | 19 | | |

## koran.aufbau.e10 – Häufige Wortformen 23

| Nr. | Lektion | Stelle | Umschrift | Vorkommen | Bedeutung (de) | Bedeutung (tr) |
|---|---|---|---|---|---|---|
| 1 | l01 | 2:21:11 | tattaqūna | 19 | | |
| 2 | l01 | 2:28:13 | turǧaʿūna | 19 | | |
| 3 | l01 | 2:36:12 | ʿaduwwun | 19 | | |
| 4 | l01 | 2:52:8 | taškurūna | 19 | | |
| 5 | l01 | 2:57:16 | kānū | 19 | | |
| 6 | l02 | 2:73:9 | ʾāyātihī | 19 | | |
| 7 | l02 | 2:75:9 | yasmaʿūna | 19 | | |
| 8 | l02 | 2:76:9 | baʿḍuhum | 19 | | |
| 9 | l02 | 2:78:8 | waʾin | 19 | | |
| 10 | l02 | 2:80:13 | falan | 19 | | |
| 11 | l03 | 2:105:25 | al-ʿaẓīmi | 19 | | |
| 12 | l03 | 2:107:6 | mulku | 19 | | |
| 13 | l03 | 2:113:28 | fīmā | 19 | | |
| 14 | l03 | 2:127:13 | as-samīʿu | 19 | | |
| 15 | l03 | 2:130:18 | aṣ-ṣāliḥīna | 19 | | |
| 16 | l04 | 2:137:10 | tawallaw | 19 | | |
| 17 | l04 | 2:142:20 | ṣirāṭin | 19 | | |
| 18 | l04 | 2:148:9 | takūnū | 19 | | |
| 19 | l04 | 2:168:12 | aš-šayṭāni | 19 | | |
| 20 | l04 | 2:189:18 | mani | 19 | | |
| 21 | l05 | 2:210:2 | yanẓurūna | 19 | | |
| 22 | l05 | 2:272:25 | ʾilaykum | 19 | | |
| 23 | l05 | 3:44:4 | al-ġaybi | 19 | | |
| 24 | l05 | 4:36:14 | ḏī | 19 | | |
| 25 | l05 | 5:20:20 | ʾaḥadan | 19 | | |

## koran.aufbau.e11 – Häufige Wortformen 24

| Nr. | Lektion | Stelle | Umschrift | Vorkommen | Bedeutung (de) | Bedeutung (tr) |
|---|---|---|---|---|---|---|
| 1 | l01 | 6:54:7 | salāmun | 19 | | |
| 2 | l01 | 6:55:6 | al-muǧrimīna | 19 | | |
| 3 | l01 | 6:84:20 | naǧzī | 19 | | |
| 4 | l01 | 7:54:14 | al-ʿarši | 19 | | |
| 5 | l01 | 7:190:12 | yušrikūna | 19 | | |
| 6 | l02 | 2:26:25 | ʾarāda | 18 | | |
| 7 | l02 | 2:35:6 | al-ǧannata | 18 | | |
| 8 | l02 | 2:57:2 | ʿalaykumu | 18 | | |
| 9 | l02 | 2:59:4 | qawlan | 18 | | |
| 10 | l02 | 2:74:10 | ʾašaddu | 18 | | |
| 11 | l03 | 2:81:1 | balā | 18 | | |
| 12 | l03 | 2:101:3 | rasūlun | 18 | | |
| 13 | l03 | 2:102:9 | kafara | 18 | | |
| 14 | l03 | 2:103:10 | llaw | 18 | | |
| 15 | l03 | 2:108:16 | ḍalla | 18 | | |
| 16 | l04 | 2:163:2 | ʾilāhun | 18 | | |
| 17 | l04 | 2:184:12 | ʾayyāmin | 18 | | |
| 18 | l04 | 2:187:23 | ʿankum | 18 | | |
| 19 | l04 | 2:187:65 | yattaqūna | 18 | | |
| 20 | l04 | 2:194:18 | waʿlamū | 18 | | |
| 21 | l05 | 2:206:10 | ǧahannamu | 18 | | |
| 22 | l05 | 2:213:4 | wāḥidatan | 18 | | |
| 23 | l05 | 2:232:21 | yuʾminu | 18 | | |
| 24 | l05 | 2:237:30 | baynakum | 18 | | |
| 25 | l05 | 2:245:7 | ḥasanan | 18 | | |

## koran.aufbau.e12 – Häufige Wortformen 25

| Nr. | Lektion | Stelle | Umschrift | Vorkommen | Bedeutung (de) | Bedeutung (tr) |
|---|---|---|---|---|---|---|
| 1 | l01 | 2:247:13 | yakūnu | 18 | | |
| 2 | l01 | 2:259:5 | qaryatin | 18 | | |
| 3 | l01 | 3:103:27 | mminhā | 18 | | |
| 4 | l01 | 3:126:16 | al-ʿazīzi | 18 | | |
| 5 | l01 | 3:174:15 | ʿaẓīmin | 18 | | |
| 6 | l02 | 6:83:6 | qawmihī | 18 | | |
| 7 | l02 | 6:132:4 | ʿamilū | 18 | | |
| 8 | l02 | 6:164:7 | rabbu | 18 | | |
| 9 | l02 | 7:61:9 | rrabbi | 18 | | |
| 10 | l02 | 15:26:2 | ḫalaqnā | 18 | | |
| 11 | l03 | 2:21:3 | aʿbudū | 17 | | |
| 12 | l03 | 2:24:6 | fattaqū | 17 | | |
| 13 | l03 | 2:26:7 | maṯalan | 17 | | |
| 14 | l03 | 2:53:2 | ʾātaynā | 17 | | |
| 15 | l03 | 2:90:20 | ʿibādihī | 17 | | |
| 16 | l04 | 2:97:15 | yadayhi | 17 | | |
| 17 | l04 | 2:117:6 | ʾamran | 17 | | |
| 18 | l04 | 2:119:10 | al-ǧaḥīmi | 17 | | |
| 19 | l04 | 2:129:4 | rasūlan | 17 | | |
| 20 | l04 | 2:143:23 | ar-rasūla | 17 | | |
| 21 | l05 | 2:150:16 | yakūna | 17 | | |
| 22 | l05 | 2:167:16 | ʾaʿmālahum | 17 | | |
| 23 | l05 | 2:173:2 | ḥarrama | 17 | | |
| 24 | l05 | 2:180:14 | ḥaqqan | 17 | | |
| 25 | l05 | 2:210:14 | waʾilā | 17 | | |

## koran.aufbau.e13 – Häufige Wortformen 26

| Nr. | Lektion | Stelle | Umschrift | Vorkommen | Bedeutung (de) | Bedeutung (tr) |
|---|---|---|---|---|---|---|
| 1 | l01 | 2:251:14 | walawlā | 17 | | |
| 2 | l01 | 2:282:84 | kabīran | 17 | | |
| 3 | l01 | 3:18:3 | ʾannahū | 17 | | |
| 4 | l01 | 3:24:15 | yaftarūna | 17 | | |
| 5 | l01 | 3:62:3 | lahuwa | 17 | | |
| 6 | l02 | 3:68:8 | an-nabiʾu | 17 | | |
| 7 | l02 | 4:122:14 | waʿda | 17 | | |
| 8 | l02 | 4:151:3 | al-kāfirūna | 17 | | |
| 9 | l02 | 4:153:24 | attaḫaḏū | 17 | | |
| 10 | l02 | 5:119:6 | aṣ-ṣādiqīna | 17 | | |
| 11 | l03 | 6:152:35 | taḏakkarūna | 17 | | |
| 12 | l03 | 6:161:4 | rabbī | 17 | | |
| 13 | l03 | 7:123:2 | firʿawnu | 17 | | |
| 14 | l03 | 2:18:6 | yarǧiʿūna | 16 | | |
| 15 | l03 | 2:24:13 | lilkāfirīna | 16 | | |
| 16 | l04 | 2:39:4 | biʾyātinā | 16 | | |
| 17 | l04 | 2:41:9 | ʾawwala | 16 | | |
| 18 | l04 | 2:48:2 | yawman | 16 | | |
| 19 | l04 | 2:51:10 | baʿdihī | 16 | | |
| 20 | l04 | 2:88:4 | bal | 16 | | |
| 21 | l05 | 2:89:3 | kitābun | 16 | | |
| 22 | l05 | 2:93:13 | samiʿnā | 16 | | |
| 23 | l05 | 2:102:27 | ʾaḥadin | 16 | | |
| 24 | l05 | 2:133:23 | ʾilāhan | 16 | | |
| 25 | l05 | 2:134:7 | kasabat | 16 | | |

## koran.vertiefung.e01 – Teil 30: Suren 114–111

| Nr. | Lektion | Stelle | Umschrift | Vorkommen | Bedeutung (de) | Bedeutung (tr) |
|---|---|---|---|---|---|---|
| 1 | l01 | 114:1:2 | ʾaʿūḏu | 6 | | |
| 2 | l01 | 114:1:3 | birabbi | 8 | | |
| 3 | l01 | 114:2:1 | maliki | 1 | | |
| 4 | l01 | 114:3:1 | ʾilāhi | 3 | | |
| 5 | l01 | 114:4:2 | šarri | 5 | | |
| 6 | l02 | 114:4:3 | al-waswāsi | 1 | | |
| 7 | l02 | 114:4:4 | al-ḫannāsi | 1 | | |
| 8 | l02 | 114:5:2 | yuwaswisu | 1 | | |
| 9 | l02 | 114:5:4 | ṣudūri | 3 | | |
| 10 | l02 | 114:6:2 | al-ǧinnati | 4 | | |
| 11 | l03 | 114:6:3 | walnnāsi | 5 | | |
| 12 | l03 | 113:1:4 | al-falaqi | 1 | | |
| 13 | l03 | 113:3:3 | ġāsiqin | 1 | | |
| 14 | l03 | 113:3:5 | waqaba | 1 | | |
| 15 | l03 | 113:4:3 | an-naffāṯāti | 1 | | |
| 16 | l04 | 113:4:5 | al-ʿuqadi | 1 | | |
| 17 | l04 | 113:5:3 | ḥāsidin | 1 | | |
| 18 | l04 | 113:5:5 | ḥasada | 1 | | |
| 19 | l04 | 112:1:4 | ʾaḥadun | 12 | | |
| 20 | l04 | 112:2:2 | aṣ-ṣamadu | 1 | | |
| 21 | l05 | 112:3:2 | yalid | 1 | | |
| 22 | l05 | 112:3:4 | yūlad | 1 | | |
| 23 | l05 | 112:4:4 | kufuwan | 1 | | |
| 24 | l05 | 112:4:5 | ʾaḥadun | 1 | | |
| 25 | l05 | 111:1:1 | tabbat | 1 | | |

## koran.vertiefung.e02 – Teil 30: Suren 111–110

| Nr. | Lektion | Stelle | Umschrift | Vorkommen | Bedeutung (de) | Bedeutung (tr) |
|---|---|---|---|---|---|---|
| 1 | l01 | 111:1:2 | yadā | 1 | | |
| 2 | l01 | 111:1:3 | ʾabī | 3 | | |
| 3 | l01 | 111:1:4 | lahabin | 2 | | |
| 4 | l01 | 111:1:5 | watabba | 1 | | |
| 5 | l01 | 111:2:2 | ʾaġnā | 9 | | |
| 6 | l02 | 111:2:4 | māluhū | 2 | | |
| 7 | l02 | 111:2:6 | kasaba | 3 | | |
| 8 | l02 | 111:3:1 | sayaṣlā | 1 | | |
| 9 | l02 | 111:3:3 | ḏāta | 6 | | |
| 10 | l02 | 111:4:1 | wamraʾatuhū | 2 | | |
| 11 | l03 | 111:4:2 | ḥammālata | 1 | | |
| 12 | l03 | 111:4:3 | al-ḥaṭabi | 1 | | |
| 13 | l03 | 111:5:2 | ǧīdihā | 1 | | |
| 14 | l03 | 111:5:3 | ḥablun | 1 | | |
| 15 | l03 | 111:5:5 | mmasadin | 1 | | |
| 16 | l04 | 110:1:3 | naṣru | 3 | | |
| 17 | l04 | 110:1:5 | walfatḥu | 1 | | |
| 18 | l04 | 110:2:1 | waraʾayta | 1 | | |
| 19 | l04 | 110:2:3 | yadḫulūna | 6 | | |
| 20 | l04 | 110:2:5 | dīni | 5 | | |
| 21 | l05 | 110:2:7 | ʾafwāǧan | 2 | | |
| 22 | l05 | 110:3:1 | fasabbiḥ | 6 | | |
| 23 | l05 | 110:3:2 | biḥamdi | 10 | | |
| 24 | l05 | 110:3:4 | wastaġfirhu | 1 | | |
| 25 | l05 | 110:3:7 | tawwāban | 1 | | |

## koran.vertiefung.e03 – Teil 30: Suren 109–107

| Nr. | Lektion | Stelle | Umschrift | Vorkommen | Bedeutung (de) | Bedeutung (tr) |
|---|---|---|---|---|---|---|
| 1 | l01 | 109:2:2 | ʾaʿbudu | 8 | | |
| 2 | l01 | 109:3:3 | ʿābidūna | 4 | | |
| 3 | l01 | 109:4:3 | ʿābidun | 1 | | |
| 4 | l01 | 109:4:5 | ʿabadttum | 1 | | |
| 5 | l01 | 109:6:2 | dīnukum | 1 | | |
| 6 | l02 | 109:6:3 | waliʾa | 3 | | |
| 7 | l02 | 108:1:2 | ʾaʿṭaynāka | 1 | | |
| 8 | l02 | 108:1:3 | al-kawṯara | 1 | | |
| 9 | l02 | 108:2:1 | faṣalli | 1 | | |
| 10 | l02 | 108:2:2 | lirabbika | 1 | | |
| 11 | l03 | 108:2:3 | wanḥar | 1 | | |
| 12 | l03 | 108:3:2 | šāniʾaka | 1 | | |
| 13 | l03 | 108:3:4 | al-ʾabtaru | 1 | | |
| 14 | l03 | 107:1:1 | ʾaraʾayta | 6 | | |
| 15 | l03 | 107:1:3 | yukaḏḏibu | 5 | | |
| 16 | l04 | 107:1:4 | bilddīni | 3 | | |
| 17 | l04 | 107:2:1 | faḏālika | 3 | | |
| 18 | l04 | 107:2:3 | yaduʿʿu | 1 | | |
| 19 | l04 | 107:2:4 | al-yatīma | 3 | | |
| 20 | l04 | 107:3:2 | yaḥuḍḍu | 2 | | |
| 21 | l05 | 107:3:4 | ṭaʿāmi | 3 | | |
| 22 | l05 | 107:3:5 | al-miskīni | 3 | | |
| 23 | l05 | 107:4:1 | fawaylun | 9 | | |
| 24 | l05 | 107:4:2 | llilmuṣallīna | 1 | | |
| 25 | l05 | 107:5:4 | ṣalātihim | 5 | | |

## koran.vertiefung.e04 – Teil 30: Suren 107–105

| Nr. | Lektion | Stelle | Umschrift | Vorkommen | Bedeutung (de) | Bedeutung (tr) |
|---|---|---|---|---|---|---|
| 1 | l01 | 107:5:5 | sāhūna | 2 | | |
| 2 | l01 | 107:6:3 | yurāʾūna | 2 | | |
| 3 | l01 | 107:7:1 | wayamnaʿūna | 1 | | |
| 4 | l01 | 107:7:2 | al-māʿūna | 1 | | |
| 5 | l01 | 106:1:1 | liʾīlāfi | 1 | | |
| 6 | l02 | 106:1:2 | qurayšin | 1 | | |
| 7 | l02 | 106:2:1 | ʾīlāfihim | 1 | | |
| 8 | l02 | 106:2:2 | riḥlata | 1 | | |
| 9 | l02 | 106:2:3 | aš-šitāʾi | 1 | | |
| 10 | l02 | 106:2:4 | walṣṣayfi | 1 | | |
| 11 | l03 | 106:3:1 | falyaʿbudū | 1 | | |
| 12 | l03 | 106:3:2 | rabba | 5 | | |
| 13 | l03 | 106:3:4 | al-bayti | 8 | | |
| 14 | l03 | 106:4:2 | ʾaṭʿamahum | 1 | | |
| 15 | l03 | 106:4:4 | ǧūʿin | 2 | | |
| 16 | l04 | 106:4:5 | waʾāmanahum | 1 | | |
| 17 | l04 | 106:4:7 | ḫawfin | 1 | | |
| 18 | l04 | 105:1:4 | faʿala | 7 | | |
| 19 | l04 | 105:1:6 | biʾaṣḥābi | 1 | | |
| 20 | l04 | 105:1:7 | al-fīli | 1 | | |
| 21 | l05 | 105:2:2 | yaǧʿal | 2 | | |
| 22 | l05 | 105:2:3 | kaydahum | 1 | | |
| 23 | l05 | 105:2:5 | taḍlīlin | 1 | | |
| 24 | l05 | 105:3:1 | waʾarsala | 1 | | |
| 25 | l05 | 105:3:3 | ṭayran | 1 | | |

## koran.vertiefung.e05 – Teil 30: Suren 105–104

| Nr. | Lektion | Stelle | Umschrift | Vorkommen | Bedeutung (de) | Bedeutung (tr) |
|---|---|---|---|---|---|---|
| 1 | l01 | 105:3:4 | ʾabābīla | 1 | | |
| 2 | l01 | 105:4:1 | tarmīhim | 1 | | |
| 3 | l01 | 105:4:2 | biḥiǧāratin | 1 | | |
| 4 | l01 | 105:4:4 | siǧǧīlin | 3 | | |
| 5 | l01 | 105:5:1 | faǧaʿalahum | 2 | | |
| 6 | l02 | 105:5:2 | kaʿaṣfin | 1 | | |
| 7 | l02 | 105:5:3 | mmaʾkūlin | 1 | | |
| 8 | l02 | 104:1:1 | waylun | 14 | | |
| 9 | l02 | 104:1:2 | llikulli | 13 | | |
| 10 | l02 | 104:1:3 | humazatin | 1 | | |
| 11 | l03 | 104:1:4 | llumazatin | 1 | | |
| 12 | l03 | 104:2:2 | ǧamaʿa | 1 | | |
| 13 | l03 | 104:2:3 | mālan | 7 | | |
| 14 | l03 | 104:2:4 | waʿaddadahū | 1 | | |
| 15 | l03 | 104:3:1 | yaḥsabu | 1 | | |
| 16 | l04 | 104:3:3 | mālahū | 1 | | |
| 17 | l04 | 104:3:4 | ʾaḫladahū | 1 | | |
| 18 | l04 | 104:4:2 | layunbaḏanna | 1 | | |
| 19 | l04 | 104:4:4 | al-ḥuṭamati | 1 | | |
| 20 | l04 | 104:5:2 | ʾadrāka | 13 | | |
| 21 | l05 | 104:5:4 | al-ḥuṭamatu | 1 | | |
| 22 | l05 | 104:6:1 | nāru | 3 | | |
| 23 | l05 | 104:6:3 | al-mūqadatu | 1 | | |
| 24 | l05 | 104:7:2 | taṭṭaliʿu | 2 | | |
| 25 | l05 | 104:7:4 | al-ʾafʾdati | 1 | | |

## koran.vertiefung.e06 – Teil 30: Suren 104–101

| Nr. | Lektion | Stelle | Umschrift | Vorkommen | Bedeutung (de) | Bedeutung (tr) |
|---|---|---|---|---|---|---|
| 1 | l01 | 104:8:1 | ʾinnahā | 14 | | |
| 2 | l01 | 104:8:3 | mmuʾṣadatun | 1 | | |
| 3 | l01 | 104:9:2 | ʿamadin | 3 | | |
| 4 | l01 | 104:9:3 | mmumaddadatin | 1 | | |
| 5 | l01 | 103:1:1 | walʿaṣri | 1 | | |
| 6 | l02 | 103:2:4 | ḫusrin | 1 | | |
| 7 | l02 | 103:3:6 | watawāṣaw | 4 | | |
| 8 | l02 | 103:3:9 | bilṣṣabri | 4 | | |
| 9 | l02 | 102:1:1 | ʾalhākumu | 1 | | |
| 10 | l02 | 102:1:2 | at-takāṯuru | 1 | | |
| 11 | l03 | 102:2:2 | zurtumu | 1 | | |
| 12 | l03 | 102:2:3 | al-maqābira | 1 | | |
| 13 | l03 | 102:3:2 | sawfa | 7 | | |
| 14 | l03 | 102:5:4 | ʿilma | 3 | | |
| 15 | l03 | 102:5:5 | al-yaqīni | 4 | | |
| 16 | l04 | 102:6:1 | latarawunna | 1 | | |
| 17 | l04 | 102:6:2 | al-ǧaḥīma | 3 | | |
| 18 | l04 | 102:7:2 | latarawunnahā | 1 | | |
| 19 | l04 | 102:7:3 | ʿayna | 2 | | |
| 20 | l04 | 102:8:2 | latusʾlunna | 2 | | |
| 21 | l05 | 102:8:5 | an-naʿīmi | 10 | | |
| 22 | l05 | 101:1:1 | al-qāriʿatu | 3 | | |
| 23 | l05 | 101:4:4 | kalfarāši | 1 | | |
| 24 | l05 | 101:4:5 | al-mabṯūṯi | 1 | | |
| 25 | l05 | 101:5:1 | watakūnu | 2 | | |

## koran.vertiefung.e07 – Teil 30: Suren 101–100

| Nr. | Lektion | Stelle | Umschrift | Vorkommen | Bedeutung (de) | Bedeutung (tr) |
|---|---|---|---|---|---|---|
| 1 | l01 | 101:5:2 | al-ǧibālu | 11 | | |
| 2 | l01 | 101:5:3 | kalʿihni | 2 | | |
| 3 | l01 | 101:5:4 | al-manfūši | 1 | | |
| 4 | l01 | 101:6:3 | ṯaqulat | 4 | | |
| 5 | l01 | 101:6:4 | mawāzīnuhū | 6 | | |
| 6 | l02 | 101:7:3 | ʿīšatin | 2 | | |
| 7 | l02 | 101:7:4 | rrāḍiyatin | 2 | | |
| 8 | l02 | 101:8:3 | ḫaffat | 3 | | |
| 9 | l02 | 101:9:1 | faʾummuhū | 1 | | |
| 10 | l02 | 101:9:2 | hāwiyatun | 1 | | |
| 11 | l03 | 101:10:4 | hiyah | 1 | | |
| 12 | l03 | 101:11:1 | nārun | 4 | | |
| 13 | l03 | 101:11:2 | ḥāmiyatun | 1 | | |
| 14 | l03 | 100:1:1 | walʿādiyāti | 1 | | |
| 15 | l03 | 100:1:2 | ḍabḥan | 1 | | |
| 16 | l04 | 100:2:1 | falmūriyāti | 1 | | |
| 17 | l04 | 100:2:2 | qadḥan | 1 | | |
| 18 | l04 | 100:3:1 | falmuġīrāti | 1 | | |
| 19 | l04 | 100:3:2 | ṣubḥan | 1 | | |
| 20 | l04 | 100:4:1 | faʾaṯarna | 1 | | |
| 21 | l05 | 100:4:3 | naqʿan | 1 | | |
| 22 | l05 | 100:5:1 | fawasaṭna | 1 | | |
| 23 | l05 | 100:5:3 | ǧamʿan | 3 | | |
| 24 | l05 | 100:6:3 | lirabbihī | 2 | | |
| 25 | l05 | 100:6:4 | lakanūdun | 1 | | |

## koran.vertiefung.e08 – Teil 30: Suren 100–99

| Nr. | Lektion | Stelle | Umschrift | Vorkommen | Bedeutung (de) | Bedeutung (tr) |
|---|---|---|---|---|---|---|
| 1 | l01 | 100:7:4 | lašahīdun | 1 | | |
| 2 | l01 | 100:8:2 | liḥubbi | 1 | | |
| 3 | l01 | 100:8:3 | al-ḫayri | 6 | | |
| 4 | l01 | 100:8:4 | lašadīdun | 3 | | |
| 5 | l01 | 100:9:4 | buʿṯira | 1 | | |
| 6 | l02 | 100:9:7 | al-qubūri | 4 | | |
| 7 | l02 | 100:10:1 | waḥuṣṣila | 1 | | |
| 8 | l02 | 100:10:4 | aṣ-ṣudūri | 15 | | |
| 9 | l02 | 100:11:2 | rabbahum | 8 | | |
| 10 | l02 | 100:11:5 | llaḫabīrun | 1 | | |
| 11 | l03 | 99:1:2 | zulzilati | 1 | | |
| 12 | l03 | 99:1:4 | zilzālahā | 1 | | |
| 13 | l03 | 99:2:1 | waʾaḫraǧati | 1 | | |
| 14 | l03 | 99:2:3 | ʾaṯqālahā | 1 | | |
| 15 | l03 | 99:4:2 | tuḥaddiṯu | 1 | | |
| 16 | l04 | 99:4:3 | ʾaḫbārahā | 1 | | |
| 17 | l04 | 99:5:1 | biʾanna | 14 | | |
| 18 | l04 | 99:5:3 | ʾawḥā | 2 | | |
| 19 | l04 | 99:6:2 | yaṣduru | 1 | | |
| 20 | l04 | 99:6:4 | ʾaštātan | 2 | | |
| 21 | l05 | 99:6:5 | lliyuraw | 1 | | |
| 22 | l05 | 99:7:2 | yaʿmal | 7 | | |
| 23 | l05 | 99:7:3 | miṯqāla | 6 | | |
| 24 | l05 | 99:7:4 | ḏarratin | 6 | | |
| 25 | l05 | 99:7:6 | yarahū | 2 | | |

## koran.vertiefung.e09 – Teil 30: Suren 99–98

| Nr. | Lektion | Stelle | Umschrift | Vorkommen | Bedeutung (de) | Bedeutung (tr) |
|---|---|---|---|---|---|---|
| 1 | l01 | 99:8:5 | šarran | 2 | | |
| 2 | l01 | 98:1:2 | yakuni | 4 | | |
| 3 | l01 | 98:1:8 | walmušrikīna | 4 | | |
| 4 | l01 | 98:1:9 | munfakkīna | 1 | | |
| 5 | l01 | 98:1:11 | taʾtiyahumu | 5 | | |
| 6 | l02 | 98:1:12 | al-bayyinatu | 2 | | |
| 7 | l02 | 98:2:4 | yatlū | 7 | | |
| 8 | l02 | 98:2:5 | ṣuḥufan | 2 | | |
| 9 | l02 | 98:2:6 | mmuṭahharatan | 1 | | |
| 10 | l02 | 98:3:2 | kutubun | 1 | | |
| 11 | l03 | 98:3:3 | qayyimatun | 1 | | |
| 12 | l03 | 98:4:2 | tafarraqa | 1 | | |
| 13 | l03 | 98:4:10 | ǧāʾathumu | 7 | | |
| 14 | l03 | 98:5:2 | ʾumirū | 3 | | |
| 15 | l03 | 98:5:4 | liyaʿbudū | 1 | | |
| 16 | l04 | 98:5:6 | muḫliṣīna | 7 | | |
| 17 | l04 | 98:5:8 | ad-dīna | 13 | | |
| 18 | l04 | 98:5:9 | ḥunafāʾa | 2 | | |
| 19 | l04 | 98:5:10 | wayuqīmū | 1 | | |
| 20 | l04 | 98:5:12 | wayuʾtū | 1 | | |
| 21 | l05 | 98:5:14 | waḏālika | 13 | | |
| 22 | l05 | 98:5:15 | dīnu | 1 | | |
| 23 | l05 | 98:5:16 | al-qayyimati | 1 | | |
| 24 | l05 | 98:6:9 | nāri | 4 | | |
| 25 | l05 | 98:6:15 | šarru | 1 | | |

## koran.vertiefung.e10 – Teil 30: Suren 98–96

| Nr. | Lektion | Stelle | Umschrift | Vorkommen | Bedeutung (de) | Bedeutung (tr) |
|---|---|---|---|---|---|---|
| 1 | l01 | 98:6:16 | al-bariyyati | 2 | | |
| 2 | l01 | 98:8:1 | ǧazāʾuhum | 3 | | |
| 3 | l01 | 98:8:4 | ǧannātu | 9 | | |
| 4 | l01 | 98:8:5 | ʿadnin | 11 | | |
| 5 | l01 | 98:8:13 | rraḍiʾa | 3 | | |
| 6 | l02 | 98:8:16 | waraḍū | 5 | | |
| 7 | l02 | 98:8:19 | liman | 11 | | |
| 8 | l02 | 98:8:20 | ḫašiʾa | 3 | | |
| 9 | l02 | 98:8:21 | rabbahū | 13 | | |
| 10 | l02 | 97:1:2 | ʾanzalnāhu | 14 | | |
| 11 | l03 | 97:1:4 | laylati | 1 | | |
| 12 | l03 | 97:1:5 | al-qadri | 3 | | |
| 13 | l03 | 97:2:4 | laylatu | 2 | | |
| 14 | l03 | 97:3:5 | ʾalfi | 1 | | |
| 15 | l03 | 97:3:6 | šahrin | 1 | | |
| 16 | l04 | 97:4:1 | tanazzalu | 3 | | |
| 17 | l04 | 97:4:3 | walrrūḥu | 2 | | |
| 18 | l04 | 97:4:6 | rabbihim | 5 | | |
| 19 | l04 | 97:4:9 | ʾamrin | 7 | | |
| 20 | l04 | 97:5:4 | maṭlaʿi | 1 | | |
| 21 | l05 | 97:5:5 | al-faǧri | 5 | | |
| 22 | l05 | 96:1:1 | aqraʾ | 3 | | |
| 23 | l05 | 96:1:2 | bismi | 4 | | |
| 24 | l05 | 96:2:4 | ʿalaqin | 1 | | |
| 25 | l05 | 96:3:2 | warabbuka | 9 | | |

## koran.vertiefung.e11 – Teil 30: Sure 96

| Nr. | Lektion | Stelle | Umschrift | Vorkommen | Bedeutung (de) | Bedeutung (tr) |
|---|---|---|---|---|---|---|
| 1 | l01 | 96:3:3 | al-ʾakramu | 1 | | |
| 2 | l01 | 96:4:2 | ʿallama | 3 | | |
| 3 | l01 | 96:4:3 | bilqalami | 1 | | |
| 4 | l01 | 96:5:5 | yaʿlam | 2 | | |
| 5 | l01 | 96:6:1 | kallā | 13 | | |
| 6 | l02 | 96:6:4 | layaṭġā | 1 | | |
| 7 | l02 | 96:7:2 | rraʾāhu | 1 | | |
| 8 | l02 | 96:7:3 | astaġnā | 1 | | |
| 9 | l02 | 96:8:4 | ar-ruǧʿā | 1 | | |
| 10 | l02 | 96:9:3 | yanhā | 1 | | |
| 11 | l03 | 96:10:1 | ʿabdan | 6 | | |
| 12 | l03 | 96:10:3 | ṣallā | 1 | | |
| 13 | l03 | 96:11:5 | al-hudā | 5 | | |
| 14 | l03 | 96:12:2 | ʾamara | 7 | | |
| 15 | l03 | 96:12:3 | bilttaqwā | 1 | | |
| 16 | l04 | 96:13:4 | watawallā | 2 | | |
| 17 | l04 | 96:14:2 | yaʿlam | 1 | | |
| 18 | l04 | 96:14:5 | yarā | 3 | | |
| 19 | l04 | 96:15:2 | laʾin | 12 | | |
| 20 | l04 | 96:15:4 | yantahi | 2 | | |
| 21 | l05 | 96:15:5 | lanasfaʿan | 1 | | |
| 22 | l05 | 96:15:6 | bilnnāṣiyati | 1 | | |
| 23 | l05 | 96:16:1 | nāṣiyatin | 1 | | |
| 24 | l05 | 96:16:2 | kāḏibatin | 1 | | |
| 25 | l05 | 96:16:3 | ḫāṭiʾatin | 1 | | |

## koran.vertiefung.e12 – Teil 30: Suren 96–95

| Nr. | Lektion | Stelle | Umschrift | Vorkommen | Bedeutung (de) | Bedeutung (tr) |
|---|---|---|---|---|---|---|
| 1 | l01 | 96:17:1 | falyadʿu | 1 | | |
| 2 | l01 | 96:17:2 | nādiyahū | 1 | | |
| 3 | l01 | 96:18:1 | sanadʿu | 1 | | |
| 4 | l01 | 96:18:2 | az-zabāniyata | 1 | | |
| 5 | l01 | 96:19:3 | tuṭiʿhu | 1 | | |
| 6 | l02 | 96:19:4 | wasǧud | 1 | | |
| 7 | l02 | 96:19:5 | waqtarib | 1 | | |
| 8 | l02 | 95:1:1 | walttīni | 1 | | |
| 9 | l02 | 95:1:2 | walzzaytūni | 1 | | |
| 10 | l02 | 95:2:1 | waṭūri | 1 | | |
| 11 | l03 | 95:2:2 | sīnīna | 1 | | |
| 12 | l03 | 95:3:1 | wahāḏā | 14 | | |
| 13 | l03 | 95:3:2 | al-baladi | 3 | | |
| 14 | l03 | 95:3:3 | al-ʾamīni | 1 | | |
| 15 | l03 | 95:4:5 | ʾaḥsani | 1 | | |
| 16 | l04 | 95:4:6 | taqwīmin | 1 | | |
| 17 | l04 | 95:5:2 | radadnāhu | 1 | | |
| 18 | l04 | 95:5:3 | ʾasfala | 3 | | |
| 19 | l04 | 95:5:4 | sāfilīna | 1 | | |
| 20 | l04 | 95:6:6 | falahum | 6 | | |
| 21 | l05 | 95:6:7 | ʾaǧrun | 11 | | |
| 22 | l05 | 95:6:9 | mamnūnin | 3 | | |
| 23 | l05 | 95:7:2 | yukaḏḏibuka | 1 | | |
| 24 | l05 | 95:7:3 | baʿdu | 9 | | |
| 25 | l05 | 95:8:1 | ʾalaysa | 13 | | |

## koran.vertiefung.e13 – Teil 30: Suren 95–93

| Nr. | Lektion | Stelle | Umschrift | Vorkommen | Bedeutung (de) | Bedeutung (tr) |
|---|---|---|---|---|---|---|
| 1 | l01 | 95:8:3 | biʾaḥkami | 1 | | |
| 2 | l01 | 95:8:4 | al-ḥākimīna | 5 | | |
| 3 | l01 | 94:1:2 | našraḥ | 1 | | |
| 4 | l01 | 94:1:4 | ṣadraka | 1 | | |
| 5 | l01 | 94:2:1 | wawaḍaʿnā | 1 | | |
| 6 | l02 | 94:2:2 | ʿanka | 8 | | |
| 7 | l02 | 94:2:3 | wizraka | 1 | | |
| 8 | l02 | 94:3:2 | ʾanqaḍa | 1 | | |
| 9 | l02 | 94:3:3 | ẓahraka | 1 | | |
| 10 | l02 | 94:4:1 | warafaʿnā | 5 | | |
| 11 | l03 | 94:4:3 | ḏikraka | 1 | | |
| 12 | l03 | 94:5:3 | al-ʿusri | 2 | | |
| 13 | l03 | 94:5:4 | yusran | 6 | | |
| 14 | l03 | 94:7:2 | faraġta | 1 | | |
| 15 | l03 | 94:7:3 | fanṣab | 1 | | |
| 16 | l04 | 94:8:1 | waʾilā | 9 | | |
| 17 | l04 | 94:8:3 | farġab | 1 | | |
| 18 | l04 | 93:1:1 | walḍḍuḥā | 1 | | |
| 19 | l04 | 93:2:1 | wallayli | 7 | | |
| 20 | l04 | 93:2:3 | saǧā | 1 | | |
| 21 | l05 | 93:3:2 | waddaʿaka | 1 | | |
| 22 | l05 | 93:3:5 | qalā | 1 | | |
| 23 | l05 | 93:4:1 | walalʾḫiratu | 2 | | |
| 24 | l05 | 93:4:3 | llaka | 10 | | |
| 25 | l05 | 93:4:5 | al-ʾūlā | 13 | | |
