# Spracherkennung der Lern-App – Modell und Laufzeit (gepinnt)

Herkunft, Prüfsummen und Lizenzen der Dateien, die die Sprechübung vom eigenen Ursprung lädt (ADR 0042 mit Fortschreibung
S2/S5 Nr. 4–8, KERN 4.0 §1 und §9, PLAN §4.2). Genau **10 Dateien** unter `/lern-app/modelle/`, zusammen ≈ 95 MB; sie
werden nur nach dem Knopf „Sprachprüfung laden“ geholt und bleiben im Vorrat `igmg-lernapp-modelle` des Lern-App-SW.

Der Bauschritt `web/scripts/lernapp-modelle.mjs` (`pnpm lernapp:modelle`, auch in `pnpm build` und `scripts/vercel-bau.mjs`)
liest die Tabelle unten, prüft jede Datei gegen ihre SHA-256 und bricht bei einer Abweichung ab:

- Modelldateien liegen im Repository (`web/public/lern-app/modelle/whisper-base-64da572/`) und werden nur geprüft.
- Die ORT-Dateien kommen aus dem exakt gepinnten `onnxruntime-web` in `node_modules` (Lockfile, Integrität sha512) und werden
  nach der Prüfung kopiert; sie stehen nicht im Repository (`.gitignore`). Nur die CPU-Fassung „plain“ (kein asyncify, jsep,
  jspi – WebGPU ist in der ersten Fassung aus, Fortschreibung Nr. 4).
- Der Worker wird aus `web/src/components/lernapp/sprechen/whisper.worker.ts` gebündelt (transformers.js 4.3.0,
  `dist/transformers.min.js`, wie im Spike S2 belegt) nach `public/lern-app/modelle/sprechen/whisper.worker.mjs`; seine
  Prüfsumme ändert sich mit dem Code und steht deshalb nicht hier.

## Dateien

| Datei                                              | Ziel unter `web/`                                                                       | Bytes    | SHA-256                                                            |
| -------------------------------------------------- | --------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------ |
| `config.json`                                      | `public/lern-app/modelle/whisper-base-64da572/config.json`                              | 2248     | `d1d347fdb422e6347c2f843a90d375aa67ea3f4b3e20d2c3075f9a9f6243685b` |
| `generation_config.json`                           | `public/lern-app/modelle/whisper-base-64da572/generation_config.json`                   | 3776     | `3bba359e33fdd6dc1c10f71846a477d339b0242f462f70ea1dd73274caa38d05` |
| `preprocessor_config.json`                         | `public/lern-app/modelle/whisper-base-64da572/preprocessor_config.json`                 | 339      | `a6a76d28c93edb273669eb9e0b0636a2bddbb1272c3261e47b7ca6dfdbac1b8d` |
| `tokenizer.json`                                   | `public/lern-app/modelle/whisper-base-64da572/tokenizer.json`                           | 2480466  | `27fc476bfe7f17299480be2273fc0608e4d5a99aba2ab5dec5374b4482d1a566` |
| `tokenizer_config.json`                            | `public/lern-app/modelle/whisper-base-64da572/tokenizer_config.json`                    | 282683   | `2a4c4281cf9f51ac6ccc406fdc711a087afe6530f671fa7b80953edc498275ce` |
| `onnx/encoder_model_quantized.onnx`                | `public/lern-app/modelle/whisper-base-64da572/onnx/encoder_model_quantized.onnx`        | 23200850 | `3e345e977b55620a37c0c2b2af0644e019afdfad562dcf71eb929bb7274285f9` |
| `onnx/decoder_model_merged_quantized.onnx`         | `public/lern-app/modelle/whisper-base-64da572/onnx/decoder_model_merged_quantized.onnx` | 53707539 | `a6beb6baabb66f00b6a686d828c95ffca6146d51900cbad0266cad38f64cf861` |
| `onnxruntime-web/dist/ort-wasm-simd-threaded.wasm` | `public/lern-app/modelle/ort-1.31.0-dev.20260914-8d85527a0/ort-wasm-simd-threaded.wasm` | 14264838 | `06ba057753da3847e4c24f02d91ab133455b0817c69a44993a9a53a2146df9e3` |
| `onnxruntime-web/dist/ort-wasm-simd-threaded.mjs`  | `public/lern-app/modelle/ort-1.31.0-dev.20260914-8d85527a0/ort-wasm-simd-threaded.mjs`  | 24381    | `c57ca56328877353a575e51bbca6f18450027d6c9bf2307a2cb2c41363b4de9f` |

Abgerufen am 20.10.2026 von
`https://huggingface.co/Xenova/whisper-base/resolve/64da57285918e20ea79ea5c88eed7197933abaa8/<datei>`; Größe, Git-Kennung
(JSON) bzw. LFS-SHA-256 (ONNX) gegen die Dateiliste dieses Commits geprüft
(`https://huggingface.co/api/models/Xenova/whisper-base/tree/64da57285918e20ea79ea5c88eed7197933abaa8`); Encoder und Decoder
gleich den Belegen S2 und S5. Nicht geladen und deshalb nicht übernommen: `vocab.json`, `merges.txt`, `normalizer.json`,
`special_tokens_map.json`, `added_tokens.json` und alle anderen Präzisionen (Beleg S2 §3.2).

## Herkunft und Lizenzen

| Teil                                  | Quelle                                                              | Stand                                                                                                                     | Lizenz                                                                                                                                                                                                                   |
| ------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Whisper-Gewichte                      | OpenAI, `https://github.com/openai/whisper`                         | Modell „base“                                                                                                             | MIT, Text: `LIZENZ-whisper-MIT.txt` (Copyright (c) 2022 OpenAI)                                                                                                                                                          |
| ONNX-Fassung mit q8                   | `Xenova/whisper-base`, `https://huggingface.co/Xenova/whisper-base` | Commit `64da57285918e20ea79ea5c88eed7197933abaa8`                                                                         | Apache-2.0 (Modellkarte), Text: `LIZENZ-Apache-2.0.txt`                                                                                                                                                                  |
| transformers.js (im Worker gebündelt) | `@huggingface/transformers`                                         | 4.3.0 (npm, exakt gepinnt)                                                                                                | Apache-2.0, Text: `LIZENZ-Apache-2.0.txt`                                                                                                                                                                                |
| ONNX Runtime Web (`.wasm`, `.mjs`)    | `onnxruntime-web`, Microsoft                                        | `1.31.0-dev.20260914-8d85527a0`, Commit `8d85527a010e294a26b274749f74294b2a32cec5` (von transformers.js 4.3.0 festgelegt) | MIT; Drittlizenzen (u. a. Eigen, MPL-2.0) in `ThirdPartyNotices.txt` des Repositorys `microsoft/onnxruntime` an diesem Commit – das npm-Paket enthält sie nicht; Übernahme ins Lizenzverzeichnis in L8 (ADR 0042 Nr. 10) |

Hinweise:

- Die Modellkarte von Whisper rät von Entscheidungen über Personen auf Grundlage der Erkennung ab; die Lern-App zeigt nur eine
  Markierung der Zielwörter („Verständlichkeit“), keine Note und nie die freie Abschrift (ADR 0042 Nr. 6, Fortschreibung S2
  Nr. 2; KI-Regel 2).
- `onnxruntime-node` und `sharp` laufen nie im Browser oder in einer Funktion; `onnxruntime-node` wird über
  `web/pnpm-workspace.yaml` (`overrides`) gar nicht installiert.
- whisper-small (Commit `2d67713`, Decoder > 100 MB) gehört nicht hierher; nur nach LM-27 über Blob und externen Rewrite.
