# QUELLE: Hanefitische Quellen (OpenITI) – nur Metadaten

In diesem Ordner liegt **kein Text**. Die Werke stehen unter CC BY-NC-SA 4.0 und werden nur lokal als Arbeitstext genutzt,
außerhalb des Repositorys (ADR 0045 Nr. 12, ADR 0040 Nr. 4). Ins Repository kommen nur die Angaben unten: Version-URI,
Ausgabe, Größe, SHA-256 und die Prüfwerte des lokalen Passagen-Index. Keine arabische Schrift, kein OpenITI-Markup.

| Feld | Angabe |
|---|---|
| Quelle | OpenITI – „OpenITI: a Machine-Readable Corpus of Islamicate Texts“, Release **2025.1.9** |
| Veröffentlicht | 30.12.2025, DOI `10.5281/zenodo.17767721` (Zenodo-Datensatz 17767721) |
| Archiv | `OpenITI_data_2025-1-9.zip` (5.936.029.637 Bytes); Metadaten `OpenITI_metadata_2025-1-9.tsv` |
| Lizenz | CC BY-NC-SA 4.0 – deshalb nur lokal, nie ausgeliefert, nie in `web/**` oder in Inhalten |
| Abruf | 16.10.2026 (Spike S8: nur die nötigen Einträge per HTTP-Range, CRC32 und Größe gegen das Zentralverzeichnis geprüft) |
| Übernahme | 21.10.2026 (Paket L6-01): lokale Arbeitskopie im Scratchpad `l6/openiti`, SHA-256 gleich dem Auszugsprotokoll von S8 (16/16 Dateien) |
| Bezug | ADR 0045 Nr. 12 und Fortschreibung S3/S8 Nr. 7; ADR 0040 Nr. 4 und Fortschreibung S8; PLAN §6.7; Beleg `_lernapp/belege/S8-quellen-lokal.md` |

## Werke des Quellenregisters

Schlüssel wie `ISLAM_WERKE` in `web/src/lib/lernapp/inhalt/schema.ts`. „Zitierform“ ist der Wert für `ausgabe` im Beleg.
Todesjahr nach der Hidschra aus der Version-URI.

| Schlüssel | Werk | Verfasser (gest.) | Version-URI | Status | Zitierform (`ausgabe`) | Als Beleg |
|---|---|---|---|---|---|---|
| `quduri` | Mukhtaṣar al-Qudūrī | Abū l-Ḥusayn al-Qudūrī (428/1037) | `0428AbuHusaynQuduri.Mukhtasar.Sham19Y0124336-ara1` | pri | Dār al-Kutub al-ʿIlmiyya, 1418/1997 | ja |
| `nur_al_idah` | Nūr al-Īḍāḥ | ash-Shurunbulālī (1069/1659) | `1069IbnCammarShurunbulali.NurIdah.JK000284-ara1` | pri | Dār al-Ḥikma, 1985 | ja |
| `maraqi_al_falah` | Marāqī al-Falāḥ | ash-Shurunbulālī (1069/1659) | `1069IbnCammarShurunbulali.MaraqiFalahSharhNurIdah.Shamela0000412-ara1` | pri | al-Maktaba al-ʿAṣriyya, 1425/2005 | nein – zurückgestellt (LM-33); nur lokaler Arbeitstext |
| `hidaya` | al-Hidāya fī Sharḥ Bidāyat al-Mubtadī | al-Marghīnānī (593/1197) | `0593BurhanDinFarghaniMarghinani.HidayaFiSharhBidaya.JK000242-ara1` | pri | al-Maktaba al-Islāmiyya, ohne Jahr (Ausgabe klären, LM-33) | ja |
| `ikhtiyar` | al-Ikhtiyār li-Taʿlīl al-Mukhtār | al-Mawṣilī (683) | `0683IbnMahmudMajdDinMawsili.IkhtiyarLiTaclil.Shamela0001066-ara1` | sec (bewusst: Ḥalabī-Fassung) | Maṭbaʿat al-Ḥalabī, Kairo 1356/1937 | ja |
| `radd_al_muhtar` | Radd al-Muḥtār ʿalā d-Durr al-Mukhtār | Ibn ʿĀbidīn (1252/1836) | `1252IbnCabidinDimashqi.RaddMukhtar.JK000170-ara1` | pri | Dār al-Fikr, 1421/2000, 8 Bände | ja, nur Passagen ms1–6764 (ab ms6765 Vorspann Bd. 7 und vermutlich Takmila, S8 §3.6) |
| `fiqh_akbar` | al-Fiqh al-Akbar | Abū Ḥanīfa zugeschrieben (150) | `0150AbuHanifa.FiqhAkbar.JK001085-ara1` (Datei mit Endung `.mARkdown`) | pri | Maktabat al-Furqān, 1419/1999 | ja (Glaube) |
| `tahawiyya` | al-ʿAqīda aṭ-Ṭaḥāwiyya (Matn) | aṭ-Ṭaḥāwī (321) | `0321Tahawi.MatnCaqida.JK000126-ara1` | pri | al-Maktab al-Islāmī, 1398/1978 (nur der Matn) | ja (Glaube) |
| `nasafiyya` | al-ʿAqāʾid an-Nasafiyya | Najm ad-Dīn an-Nasafī (537) | – | fehlt in OpenITI | – | nein – zurückgestellt bis ein alter Druck beschafft ist (L0-E15, LM-33) |

Nicht im Register und nicht lokal übernommen: Ḥāshiyat aṭ-Ṭaḥṭāwī (`1231IbnMuhammadHanafiTahtawi.HashiyaCalaMaraqi.JK000219-ara1`,
nur in S8 gemessen; enthält den Marāqī-Text nicht, S8 §3.7).

## Lokale Arbeitskopie (nicht im Repository)

Dateiname = Version-URI (Fiqh Akbar mit Endung `.mARkdown`), dazu je eine `.yml` von OpenITI.

| Schlüssel | Bytes | SHA-256 Text | SHA-256 `.yml` | Passagen |
|---|---|---|---|---|
| `quduri` | 408.768 | `263bf89306d88233e8c38cfd238bbc2047ef61cf1d4b8a9ac74a80a87aaa93e8` | `6d0354cb6f11a5a4a8f6810fae127820ee5200c5712f5db6b10aeaf240747ec0` | 143 |
| `nur_al_idah` | 198.756 | `8a131eceda3ab040af8b16a20c8bc79d280492762a86332a8f6a00d0e960070f` | `219d599bb451367b6ff539fe85ea2017f3b58b42a3b0bc83611440e9987676a9` | 67 |
| `maraqi_al_falah` | 1.027.342 | `f4391e8057de34a2afa0a5a481e828c256a08fd201187c735de4276be3bd2348` | `b27553e0d73ac16487e65c1cdce6aadd6a7d7aee1e2d181d28735651eeee23e3` | 343 |
| `hidaya` | 3.326.541 | `936f594767a0a889227015c6a5f497560c89de91ace09d0f542bbf295c3b98b1` | `42ab71756aad426be797bd9bbf8bc58b30a6b372a1d653ef487466a945bc5b72` | 1.153 |
| `ikhtiyar` | 3.232.733 | `08be11bf9499f2be8ea7939f07d842c929de95c0a652df54185eac4c09202319` | `7f86a9555b7e5df19fd684429de789c39bdb7ec6fb84b6ce42b3e178663a5d5d` | 1.069 |
| `radd_al_muhtar` | 23.991.043 | `8778f8d26e2be6de9d360a4152be088bc49e5259d0aa6cd0bb0f20c194e391dd` | `f512a0e183d451538c124fb5a2aa9befcbd6e2178c0e398b50b9efbd233ee6ee` | 8.443 |
| `fiqh_akbar` | 18.943 | `6ccc99e2b2cd387918fd151e595acb9ee167f2b64b5c4833960c060905267e79` | `3485bfb374f0532028d73f02c10ef29b6cd85aba86222abf3f9ca7387cca0f25` | 6 |
| `tahawiyya` | 23.374 | `e5ed82ab9cbcd22cc6f1b7a5c7dab52b6521f6a3955551100afde32a8e237633` | `c0ad290d0b0f4fe8f47a586886df490841fadf3576e522d68d801f9a440e6de7` | 8 |

Summe: 11.232 Passagen; `pruefe` meldet 0 abweichende Passagen (21.10.2026).

## Passagen-Index (lokal)

- Werkzeug `_lernapp/werkzeuge/quellen/openiti-passagen.mjs` **1.2.0**
  (SHA-256 `89fbfb7c2ba488f4cb9454d631de06fc2a3406fba801ffe775ef6552bd372d48`), Unit-Probe
  `openiti-passagen.test.mjs` (SHA-256 `502a5febd9234e50a2fb009a50f39716efe1d0ae8fd61ab3e9779bd135364d8b`, 29/29 grün).
  Neu in 1.2.0: Werk-Kennungen mit Unterstrich, damit die Passagen-Kennung des Index der Kennung im Beleg gleicht
  (`nur_al_idah.ms0003`; Schema: `<werk>.msNNNN` mit Registerschlüssel). Sonst unverändert gegenüber 1.1.0.
- Aufruf je Werk: `node openiti-passagen.mjs index <datei> --werk <schlüssel> --aus <index-verz> --sha256 <SHA-256 Text>`,
  Fiqh Akbar und Ṭaḥāwiyya zusätzlich `--standard-thema aqaid`; danach `node openiti-passagen.mjs pruefe <index.json>`.
- **Prüfwerte** (deterministisch für Datei und Werkzeugversion; das JSON enthält Zeitstempel und Pfad und ist kein Prüfwert).
  Für `quduri`, `hidaya`, `ikhtiyar` und `tahawiyya` sind die Werte byte-gleich mit S8 (1.1.0); bei den übrigen Werken
  unterscheidet sich nur die Kennung (`-` → `_`).

| Schlüssel | SHA-256 `<schlüssel>.passagen.tsv` | SHA-256 `<schlüssel>.zuordnung.tsv` |
|---|---|---|
| `quduri` | `617a03440e2ea5a7917e50ee5d55b799ff87567184cf3f240c362ec26e2f85e5` | `eaa5b9a4bf11f2cec8e760c7dc8da39ff5999ed37b880000a17aa9d8e318791f` |
| `nur_al_idah` | `c700746e8a6a90e0114ccc36600cfec78b67a6d0674e4d1625f64f58c4e2820b` | `a7946cb9a944e62abd4762ab9f50f7048080a854d8654d6bc34638304590073a` |
| `maraqi_al_falah` | `29e6243267ebca0a3980ac1e6396deee490fd6a22ec1a43ea374254158c5d242` | `41d011cef805fc2c73e21a32c1ff207f4ebbb84b24048c7b73198c922d001657` |
| `hidaya` | `100167b8e55597f7da4422e005ce67e9f6fc3c3f3a20eaff7cb6c428fda8ec23` | `e153cb0fbd675a0b24f61679861ee6b7923947b78394475bc63123150048f962` |
| `ikhtiyar` | `0bf919fd29943f60dd67c1316944ebe35b96167a085b986493b4c3d080196857` | `5b6a7d6aa11bc4002df7e40dea075cf951e702c89c506c99fb895fed50e9de38` |
| `radd_al_muhtar` | `532ca7b84bceb5e9fa083f75f1c577485483e17293914350b170e8304968e5c9` | `fb69cd87c08ba4562468979513a904ac1f07384c6eb14e00a506adfc3f6df786` |
| `fiqh_akbar` | `63e25220d0e591d287b21067da5910e1fed59e5ea06cddaefc8ea9ce60adf3c6` | `e2832c3fcde145859274a47b22b708e658cfa790ca46dda902689e023605a28f` |
| `tahawiyya` | `12a421aefabda512fa4cf9e85d619efd3e665d2d3cb2d2fe41002a04eee62064` | `bdf90266740d7d295b4a844e50b79c607902ee9407aeb441c5bc908943535e54` |

## Beleg im Inhalt (ADR 0040 Nr. 4, Fortschreibung S8 Nr. 1)

- `werk` = Schlüssel oben; `ausgabe` = Zitierform oben; `band`/`seite` = Band und Seite der Vorlage aus dem Index (±1, am
  Druck prüfen); `passage` = Kennung aus dem Index (`<schlüssel>.msNNNN`).
- `fundstelle` = Version-URI + `#ms` + Meilenstein ohne führende Nullen, z. B. `1069IbnCammarShurunbulali.NurIdah.JK000284-ara1#ms3`.
- `passageSha256Text` = `sha256Text` der Passage im Index; `zitatVon`/`zitatBis` beziehen sich auf den bereinigten
  Passagentext (UTF-16). Ob Passage und Bereich existieren, prüft das Werkzeug lokal; im CI laufen nur die Formalien.
