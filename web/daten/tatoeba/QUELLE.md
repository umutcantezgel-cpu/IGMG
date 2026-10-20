# QUELLE: Tatoeba – Satzpaare Deutsch/Türkisch/Arabisch (Auszug)

| Feld | Angabe |
|---|---|
| Quelle | https://tatoeba.org/de/downloads (Wochenexport, Ordner `https://downloads.tatoeba.org/exports/per_language/`) |
| Version | Wochenexport vom 10.10.2026 (Last-Modified Sa 10.10.2026 06:10–06:41 UTC, je Datei unten) |
| Abrufdatum (UTC) | 2026-10-16 (Spike S7, Beleg `_lernapp/belege/S7-sprachdaten.md`) |
| Übernahme ins Repository | 2026-10-20 (Paket L3-04), Dateien byte-gleich mit dem Spike-Auszug |
| Lizenz | Sätze: CC BY 2.0 FR (https://creativecommons.org/licenses/by/2.0/fr/); Teilmenge CC0 1.0 laut `*_sentences_CC0` (in diesem Auszug: 0 Sätze) |
| Nutzungsbedingungen | https://tatoeba.org/de/terms_of_use (in Kraft seit 24.04.2022), Nr. 6.2 |
| Bezug | ADR 0025 Nr. 1–2, ADR 0045 Nr. 3–4 und „Fortschreibung durch Spike S7“ Nr. 1–3, 7 |

## Ausgangsdateien (nicht gespeichert, im Strom gefiltert)

Adresse = `https://downloads.tatoeba.org/exports/` + Pfad. SHA-256 und Bytes über den Strom gemessen (`hashtee.py`); Bytes = `content-length`.

| Pfad | Bytes | Last-Modified (UTC) | ETag | SHA-256 |
|---|---|---|---|---|
| `per_language/deu/deu_sentences_detailed.tsv.bz2` | 17664205 | 10.10.2026 06:29:32 | `"6ac9db4c-10d88cd"` | `8f0dbeff78db97bbcd97eb1fd9e127431972a278cf3fb0335e8bdcc1335e8d19` |
| `per_language/tur/tur_sentences_detailed.tsv.bz2` | 13449435 | 10.10.2026 06:29:32 | `"6ac9db4c-cd38db"` | `5a00066f3eb1be4f664249e7c4d244d03952ba3a4242e85ea54faed6727b776a` |
| `per_language/ara/ara_sentences_detailed.tsv.bz2` | 1210165 | 10.10.2026 06:29:32 | `"6ac9db4c-127735"` | `d7f20eb866273737a3339d541526e030c5a4af36ca074e6caa8f6fe25d6b916c` |
| `per_language/deu/deu-tur_links.tsv.bz2` | 149639 | 10.10.2026 06:40:18 | `"6ac9ddd2-24887"` | `bf46e505500ab5e2b77de02a1999342da29f0d31e9698fdf3f0a3c35f5ddc3f6` |
| `per_language/deu/deu-ara_links.tsv.bz2` | 18845 | 10.10.2026 06:40:18 | `"6ac9ddd2-499d"` | `4da77af5d7c11cc943cb89bfb7d7ac92651241edbe43c9934489ad75e2d8e2a7` |
| `per_language/tur/tur-ara_links.tsv.bz2` | 15813 | 10.10.2026 06:40:18 | `"6ac9ddd2-3dc5"` | `eb56f4b77148a7cbcfdf149b18f751008d8ce3dc9456d59cf096acad08414092` |
| `per_language/deu/deu_sentences_CC0.tsv.bz2` | 1852 | 10.10.2026 06:30:51 | `"6ac9db9b-73c"` | `df8c16713e5715a0e1343bc1195004463e7facee08863d3cd709cbf123a74587` |
| `per_language/ara/ara_sentences_CC0.tsv.bz2` | 151 | 10.10.2026 06:30:51 | `"6ac9db9b-97"` | `8537d5cce4e878b588d9124f9bf26582c98002681accbcaf69c3927ed43c8364` |
| `per_language/tur/tur_sentences_CC0.tsv.bz2` | – | – | – | HTTP 404 (keine türkischen CC0-Sätze) |
| `per_language/deu/deu_tags.tsv.bz2` | 277598 | 10.10.2026 06:41:28 | `"6ac9de18-43c5e"` | `425c2cfe08d71ad978d85076a1539938cdf1d27d952c07a00b358eaf15080d92` |
| `per_language/tur/tur_tags.tsv.bz2` | 51166 | 10.10.2026 06:41:28 | `"6ac9de18-c7de"` | `f4df621228141cfca5cd53bde76ab503f6fd8a09c3de6eddbc8ea9732bec3b96` |
| `per_language/ara/ara_tags.tsv.bz2` | 4404 | 10.10.2026 06:41:28 | `"6ac9de18-1134"` | `17b186a6c7892e32b456675eefa267d098ef2ee10d920bd2a0a40f4d3e4cff0e` |
| `users_sentences.csv` (Bewertungen, unkomprimiert) | 98729963 | 10.10.2026 06:10:58 | `"6ac9d6f2-5e27feb"` | `bb463864bc96270eab6f874ff5c1fc36f5e730c19fb44f53674f2a46082c674f` |

Die Links `per_language/<l>/<l>-eng_links.tsv.bz2` wurden im Spike nur gezählt (indirekte Paare über Englisch); sie fließen
nicht in den Auszug ein (ADR 0045 Fortschreibung S7 Nr. 3).

## Filterskripte

Ablage `_lernapp/werkzeuge/sprachdaten/`, byte-gleich mit den Skripten, die den Auszug erzeugt haben. Python immer mit `-I`.

| Skript | Rolle | SHA-256 |
|---|---|---|
| `tatoeba_laden.sh` | lädt die Ausgangsdateien im Strom, schreibt Kopfzeilen und Hashes | `e9b9e51935ac50be2e46b3b9458708752a438b858466e80d4dce8ac4c6428eef` |
| `hashtee.py` | reicht den Strom durch, misst SHA-256 und Bytes | `ab3729e9ed18cacd5fdc29b12e999e6b0045eabc8aa3aa0d5374b95684e631a9` |
| `tatoeba_filter.py` | behält nur Satz-IDs aus den direkten Paaren (Sätze, CC0, Tags, Bewertungen) | `1d798b2153dc29296fb5f27a20f853b9634689ce16c53143d7c6c0060ccd126d` |
| `tatoeba_auswerten.py` | leitet die Lizenzspalte ab, ergänzt Bewertungen und Tags, schreibt `saetze_*` und `paare_*` | `d889e927007d395f3b399cb7e35a8dafc846b7cee13bbac458ed6775bcaa16af` |
| `tatoeba_api_stichprobe.py` | Prüfung: Stichprobe gegen `https://api.tatoeba.org/v1/sentences/{id}` | `444877db03c267407c034e05b2159bedba9556cc8b60fce8a7d2e985fa632630` |
| `ngramm_pruefung.py` | Prüfung: Koran- und Hadith-N-Gramm gegen `web/daten/tanzil` und `web/daten/hadith` (gibt nur IDs aus) | `d3f304f44e58cccf741e1bc703c8e704a7c66576db8b26650429b86c96b69014` |
| `tatoeba_standardfilter.py` | Prüfung: zählt Paare nach Standardfilter (S7-E3) | `c75686d60e6c987981602edb4d2d3ea6cc251ddc59ee3cf5a01431fc3d952d84` |
| `vokalisierung.py` | Prüfung: Harakat-Anteil der arabischen Sätze | `784e674b228ea2238dfd09d7a079f72d954a6fd8e926ddb5280f5e9a7d4d0c5b` |

Aufruf laut Beleg S7 §2.1. `tatoeba_laden.sh` enthält als `S=` den Arbeitsordner des Spikes; für eine Erneuerung `S` anpassen.
Die Skripte enthalten keine arabische Schrift (Muster nur als `\u`-Codepunkte).

## Dateien (Auszug)

| Datei | Bytes | Zeilen (mit Kopf) | SHA-256 |
|---|---|---|---|
| `saetze_deu.tsv` | 2753815 | 23107 | `2291ba95d2056ca295690ed6e106e70952722daf10c9157be9dd0f67b7debe98` |
| `saetze_tur.tsv` | 2556961 | 22587 | `450f4f45e1afb4fff49a4f095844b0a7ef013c958c0d1e1ff8f8068e2a8aef4b` |
| `saetze_ara.tsv` | 557651 | 4650 | `ea39acdf9a853768d4e9b24c9a01cb338af165a15083c93788aa0e2b84f1f91b` |
| `paare_deu-tur.tsv` | 363517 | 22317 | `866aa73ea35d58c579091096498f9216656a7f27706d5e5b5a8c853b232ed1b1` |
| `paare_deu-ara.tsv` | 46563 | 2975 | `5c99a6724a75e6987c98801e1cb9ca183a1d7966aeebf618c883548fc5e171ea` |
| `paare_tur-ara.tsv` | 39303 | 2409 | `4a7080a994baa55f582189223a611f02a46e5af00e942b3e16f93e0ec62464e4` |

- Format: UTF-8, LF, ohne BOM, nach Satz-ID sortiert.
- Spalten `saetze_*`: `id, sprache, text, benutzer, lizenz, angelegt, geaendert, bew_pos, bew_neg, tags`. Bewertungen nur als
  Anzahl, ohne Namen der Bewertenden. `\N` = kein Wert (z. B. kein Benutzername).
- Spalten `paare_<a>-<b>`: `<a>_id, <b>_id`. Nur direkte Übersetzungslinks; beide Sätze sind im Export enthalten
  (Export-Filter von Tatoeba: `correctness > -1`, Lizenz nicht leer).
- Lizenzspalte: CC0 1.0, wenn die ID in `<l>_sentences_CC0` steht, sonst CC BY 2.0 FR.

## Lizenz und Namensnennung

- Namensnennung je Satz, auch offline im Paket: „Satz #{id} von {benutzer}, Tatoeba (https://tatoeba.org/de/sentences/show/{id}),
  CC BY 2.0 FR (https://creativecommons.org/licenses/by/2.0/fr/)“; ohne Benutzername (`\N`): „Tatoeba-Mitwirkende“.
- Felder je Eintrag im Paket: `quelle: "tatoeba:<id>"`, `lizenz: "CC BY 2.0 FR"` (bzw. „CC0 1.0“),
  `namensnennung: "Satz #<id> von <benutzer>"`.
- Bei Paaren beide Sätze nennen. Veränderungen kenntlich machen („bearbeitet“, z. B. Lückentext; arabische Sätze nach
  Vokalisierung „bearbeitet (vokalisiert)“).

## Pflichten

- CC BY 2.0 FR hat kein ShareAlike. Lerninhalte, die Sätze zusammenstellen, stehen unter CC BY-SA 4.0 (ADR 0045 Nr. 2); das Feld
  `lizenz` bleibt je Satz erhalten.
- Standardfilter des Imports (ADR 0045 Fortschreibung S7 Nr. 3): Ausschluss bei negativer Bewertung, Wartungs-Tag `@…`, Koran-
  oder Hadith-4-Gramm, Inhaltsindikator, Religion (Standard Ausschluss, sonst `religionsbezug` mit zwei Freigaben) und mehr als
  12 Wörtern auf einer Seite. Keine indirekten Paare über Englisch.
- Kein Tatoeba-Audio aus diesem Auszug (Audio-Lizenzen je Sprecher, ADR 0045 Nr. 5).
- Erneuern je Etappe (L3, L4, L5), nicht wöchentlich. Der Prüfer vergleicht ID, Text und Benutzer der verwendeten Sätze und meldet
  Abweichungen statt still zu übernehmen.
- Bau und Vorschau brauchen diesen Ordner nicht (`.vercelignore`); er dient nur `lernapp:pruefen` (Prüfstufe A) und der lokalen Inhaltserzeugung. Der Bau-Import liest `web/inhalte/lernapp/**` (Beleg S7, S7-E9).

## Prüfung

Stand 2026-10-16 (Spike S7), nachgeprüft am Repository-Stand 2026-10-20:

1. SHA-256 aller sechs Dateien = Spalte oben (2026-10-20, gegen `SHA256SUMS` des Spikes).
2. Paare gültig: de–tr 22316 (10 Links ohne Satz verworfen), de–ar 2974, tr–ar 2408.
3. Lizenz: 50341 Sätze CC BY 2.0 FR, 0 CC0 (deu 23106, tur 22586, ara 4649). API-Stichprobe 60/60 (Lizenz, Text, Besitzer gleich;
   `is_unapproved` false). Ohne Benutzername: deu 25, tur 51, ara 76.
4. Koran- und Hadith-4-Gramm (`ngramm_pruefung.py`, Normalisierung nach Beleg S7 §3.3): 38 arabische Sätze (Koran 30, Hadith 19,
   vereinigt 38), betroffen 16 Paare de–ar und 36 Paare tr–ar. Am Repository-Stand 2026-10-20 identisch nachgerechnet. Die Sätze
   stehen im Auszug; der Import schließt sie aus. IDs (auch Positivproben für den Unit-Test des Wächters, S7-E7):
   `372061 433388 528234 1845468 1870688 1870712 1870735 1875947 1894844 3521805 4378843 4385414 8386223 8392676 8414725 9571789
   9837334 10065956 10093410 10097109 10133584 10133586 10133589 10133618 10135759 10140311 10148021 10150500 10278230 10278235
   10278237 10303180 10462080 10470035 10473490 10739670 12493897 12943584`
5. Inhaltsindikator und Religionsbezug: Beleg S7 §3.3; Standardfilter S7-E3.
