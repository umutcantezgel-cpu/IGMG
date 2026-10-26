# QUELLE: Drittlizenzen von ONNX Runtime (ThirdPartyNotices.txt)

Drittlizenzen der Laufzeit der Spracherkennung (ADR 0042 Nr. 10: „MIT und `ThirdPartyNotices.txt` für onnxruntime-web (aus
dem Repository, das npm-Paket enthält sie nicht), Quellenangabe für Eigen (MPL-2.0)“; Paket L8-03, Z-L17). Die Datei gehört
zum ausgelieferten `onnxruntime-web` (`web/daten/lernapp-modelle/QUELLE.md`, Tabelle „Herkunft und Lizenzen“).

| Feld             | Angabe                                                                                                                                                                                                                                                                          |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Quelle           | `https://raw.githubusercontent.com/microsoft/onnxruntime/8d85527a010e294a26b274749f74294b2a32cec5/ThirdPartyNotices.txt`                                                                                                                                                        |
| Stand            | Commit `8d85527a010e294a26b274749f74294b2a32cec5` von `microsoft/onnxruntime` (= Fassung `1.31.0-dev.20260914-8d85527a0` von onnxruntime-web)                                                                                                                                   |
| Abrufdatum (UTC) | 2026-10-21 (ETag `"58cb4a9079273001722444739fef37e88c8c37f0208378649760b1bbc1e9d391"`)                                                                                                                                                                                          |
| Lizenz           | Die Datei sammelt die Lizenztexte und Urheberhinweise der von ONNX Runtime übernommenen Teile (u. a. Eigen MPL-2.0, protobuf BSD-3-Clause, abseil-cpp Apache-2.0, flatbuffers Apache-2.0, emsdk MIT); ONNX Runtime selbst steht unter MIT (Copyright (c) Microsoft Corporation) |
| Änderungen       | keine (byte-gleich, UTF-8, LF, ohne arabische Schrift)                                                                                                                                                                                                                          |
| Bezug            | ADR 0025 Nr. 1–2, ADR 0042 Nr. 10 mit Fortschreibung Nr. 11, ADR 0045 Nr. 15; `ABNAHME.md` Z-L17                                                                                                                                                                                |

## Dateien

| Datei                               | ausgeliefert unter `web/`                                    | Bytes  | SHA-256                                                            |
| ----------------------------------- | ------------------------------------------------------------ | ------ | ------------------------------------------------------------------ |
| `onnxruntime-ThirdPartyNotices.txt` | `public/lern-app/lizenzen/onnxruntime-ThirdPartyNotices.txt` | 338088 | `143764b952fdb1a7c69ce653bfba74a7744d6a8a573bfb73e235fba356c83de3` |

- Ausgeliefert als statische Datei `/lern-app/lizenzen/onnxruntime-ThirdPartyNotices.txt` (gleicher Inhalt, Git speichert ihn
  einmal). Verlinkt von `/lern-app/[ui]/quellen` (Abschnitt „Spracherkennung“) und `/quellen` (Abschnitt „Spracherkennung der
  Lern-App“), jeweils mit der Fassung im Suchteil: `?v=` und die ersten 12 Zeichen der SHA-256 (`ORT_HINWEISE.adresse`).
- Der Unit-Test `tests/unit/lernapp/quellen.test.ts` prüft beide Dateien gegen die SHA-256 dieser Tabelle.
- Die Datei liegt nicht unter `/lern-app/modelle/` (dort genau 12 Dateien, `scripts/lernapp-modelle.mjs`). Offline
  (Stufe C, Z-L17): Der Download der Sprachprüfung legt sie neben die ORT-`.wasm` in den Vorrat `igmg-lernapp-modelle`
  (`ORT_HINWEISE` in `src/lib/lernapp/sprechen/modell.ts`, `fuelleVorrat`), der Lern-App-SW liefert sie von dort – wer ORT
  offline hat, hat auch diese Hinweise offline. Schlüssel ist die Adresse mit Fassung: Ein neuer Text hat eine neue Adresse,
  der SW gibt eine alte Kopie dafür nie aus, und `fuelleVorrat` holt beim nächsten Start mit Netz die neue und räumt ältere
  Fassungen weg (ADR 0042 Fortschreibung Nr. 25). Ohne Sprachprüfung nennt die Seite „Quellen“ der Lern-App ONNX Runtime Web mit
  MIT-Text und Eigen (MPL-2.0) mit Bezugsquelle des Quellcodes.
- Erneuern: mit jeder neuen Fassung von onnxruntime-web (Commit aus der Fassungskennung) neu abrufen und die Tabelle anpassen,
  dazu `ORT_HINWEISE` (SHA-256 und Bytes; daraus die Fassung der Adresse) und `ORT_DRITTLIZENZEN.stand`.
