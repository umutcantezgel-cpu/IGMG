# Netzprotokoll Sprechübung: Whisper nur nach Klick, Aufnahme und Erkennung · http://localhost:3322

Ergebnis: **erfüllt**.

- Worker: echt (transformers.js mit Lizenzkopf), 693 KB.
- Lektion l04 (de, tr-aus-de) bis zur Sprechaufgabe: 79 Anfragen (Playwright), davon unter /lern-app/modelle/: 0.
- Nach dem Klick „Sprachprüfung laden“: 11 Abrufe der Sprachprüfung am Draht (≈ 81.5 MB), „bereit“: ja, nach 17 s (Endzustand bereit).
- Download-Dateien (11) je genau einmal über das Netz: ja.
- Testaufnahme: Testbündel tr/tr.a1.test-abaf3a18538bf0c4.lpa (8 Clips, ffmpeg), 6.7 s. Erkennung: nichtVerstanden nach 6.6 s, Wörter unsicher, unsicher.
- Andere Methoden als GET: keine · fremde Ursprünge oder Hosts: keine.
- Cookies: im Kontext 0, Anfragen mit Cookie-Kopf 0, Antworten mit Set-Cookie 0.
- Mitschriften: Playwright 105 Anfragen (Seite/Worker 51, davon 25 vom Service Worker beantwortet; Service Worker 54); am Draht 65 Anfragen, 82.2 MB; der Proxy sah die Seite selbst: ja.
- Last: Beginn 1.17, Ende 1.83.

| Phase | Playwright | Quellen | vom SW beantwortet | am Draht | KB am Draht | Methoden | Ursprung | nicht GET | fremd |
|---|---|---|---|---|---|---|---|---|---|
| vor der Sprechaufgabe | 79 | Seite/Worker 37, Service Worker 42 | 12 | 52 | 721 | GET | eigener Ursprung | 0 | 0 |
| nach dem Klick | 23 | Seite/Worker 12, Service Worker 11 | 12 | 12 | 81486 | GET | eigener Ursprung | 0 | 0 |
| nach „bereit“ | 0 | – | 0 | 0 | 0 | – | – | 0 | 0 |
| Aufnahme | 2 | Seite/Worker 1, Service Worker 1 | 1 | 1 | 1 | GET | eigener Ursprung | 0 | 0 |
| Erkennung | 1 | Seite/Worker 1 | 0 | 0 | 0 | GET | blob | 0 | 0 |
| nach der Erkennung | 0 | – | 0 | 0 | 0 | – | – | 0 | 0 |

Konsole von Seite und Workern: leer.

| Download-Datei | Abrufe am Draht nach dem Klick | MB am Draht | Status |
|---|---|---|---|
| /lern-app/modelle/whisper-base-64da572/config.json | 1 | 0 | 200 |
| /lern-app/modelle/whisper-base-64da572/generation_config.json | 1 | 0 | 200 |
| /lern-app/modelle/whisper-base-64da572/preprocessor_config.json | 1 | 0 | 200 |
| /lern-app/modelle/whisper-base-64da572/tokenizer.json | 1 | 0.6 | 200 |
| /lern-app/modelle/whisper-base-64da572/tokenizer_config.json | 1 | 0 | 200 |
| /lern-app/modelle/whisper-base-64da572/onnx/encoder_model_quantized.onnx | 1 | 23.2 | 200 |
| /lern-app/modelle/whisper-base-64da572/onnx/decoder_model_merged_quantized.onnx | 1 | 53.7 | 200 |
| /lern-app/modelle/ort-1.31.0-dev.20260914-8d85527a0/ort-wasm-simd-threaded.mjs | 1 | 0 | 200 |
| /lern-app/modelle/ort-1.31.0-dev.20260914-8d85527a0/ort-wasm-simd-threaded.wasm | 1 | 3.7 | 200 |
| /lern-app/modelle/sprechen/whisper.worker.mjs | 1 | 0.2 | 200 |
| /lern-app/lizenzen/onnxruntime-ThirdPartyNotices.txt | 1 | 0 | 200 |

## Alle Anfragen in Playwright (105: Seite mit ihren Workern und Service Worker)

| # | Phase | Quelle | Methode | URL | Status | vom SW |
|---|---|---|---|---|---|---|
| 1 | vor der Sprechaufgabe | Seite/Worker | GET | /lern-app/de/tr-aus-de/ueben?l=tr-aus-de.a1.test.l04 | 200 |  |
| 2 | vor der Sprechaufgabe | Seite/Worker | GET | /_next/static/media/atkinson_hyperlegible_next_latin_400_normal-s.p.2f5b3iexnrrmc.woff2 | 200 |  |
| 3 | vor der Sprechaufgabe | Seite/Worker | GET | /_next/static/media/atkinson_hyperlegible_next_latin_700_normal-s.p.19r-lfq-yh-yi.woff2 | 200 |  |
| 4 | vor der Sprechaufgabe | Seite/Worker | GET | /_next/static/media/igmg_wetzlar_titel_latin_600_opsz-s.p.3pmrmf79ke7rh.woff2 | 200 |  |
| 5 | vor der Sprechaufgabe | Seite/Worker | GET | /_next/static/chunks/3jxppf3e6vjlg.css | 200 |  |
| 6 | vor der Sprechaufgabe | Seite/Worker | GET | /_next/static/chunks/14droarl7stzk.css | 200 |  |
| 7 | vor der Sprechaufgabe | Seite/Worker | GET | /_next/static/chunks/0u7lrd3j62gy3.js | 200 |  |
| 8 | vor der Sprechaufgabe | Seite/Worker | GET | /_next/static/chunks/12fbtng5h4hrs.js | 200 |  |
| 9 | vor der Sprechaufgabe | Seite/Worker | GET | /_next/static/chunks/0p6c2ce_tjn7t.js | 200 |  |
| 10 | vor der Sprechaufgabe | Seite/Worker | GET | /_next/static/chunks/1rxuisn7pmx0c.js | 200 |  |
| 11 | vor der Sprechaufgabe | Seite/Worker | GET | /_next/static/chunks/2itrcedr95n7k.js | 200 |  |
| 12 | vor der Sprechaufgabe | Seite/Worker | GET | /_next/static/chunks/turbopack-2c3mg3r-05n1w.js | 200 |  |
| 13 | vor der Sprechaufgabe | Seite/Worker | GET | /_next/static/chunks/3rt-k3i5qmfql.js | 200 |  |
| 14 | vor der Sprechaufgabe | Seite/Worker | GET | /_next/static/chunks/2x03b2t2fa9hc.js | 200 |  |
| 15 | vor der Sprechaufgabe | Seite/Worker | GET | /_next/static/chunks/0r_e7bri8fq70.js | 200 |  |
| 16 | vor der Sprechaufgabe | Seite/Worker | GET | /_next/static/chunks/3dnaixw00lx5z.js | 200 |  |
| 17 | vor der Sprechaufgabe | Seite/Worker | GET | /_next/static/chunks/1595ndtm_lxe4.js | 200 |  |
| 18 | vor der Sprechaufgabe | Seite/Worker | GET | /_next/static/chunks/2go9h_6fxw60e.js | 200 |  |
| 19 | vor der Sprechaufgabe | Seite/Worker | GET | /_next/static/media/noto_sans_arabic_arabic_700_normal-s.1fvw6w90d4f53.woff2 | 200 |  |
| 20 | vor der Sprechaufgabe | Service Worker | GET | /lern-app/sw.js?v=b02b369f86bc | 200 |  |
| 21 | vor der Sprechaufgabe | Seite/Worker | GET | /_next/static/chunks/3fdr1kaamcjvk.js | 200 |  |
| 22 | vor der Sprechaufgabe | Seite/Worker | GET | /_next/static/chunks/3tjrt5lu4186f.js | 200 |  |
| 23 | vor der Sprechaufgabe | Seite/Worker | GET | /_next/static/chunks/3ubxz0hnolte4.js | 200 |  |
| 24 | vor der Sprechaufgabe | Seite/Worker | GET | /_next/static/chunks/09magku08385n.js | 200 |  |
| 25 | vor der Sprechaufgabe | Seite/Worker | GET | /_next/static/chunks/3ro_ozf7it00-.js | 200 |  |
| 26 | vor der Sprechaufgabe | Seite/Worker | GET | /lern-app/pakete/tr-aus-de | 200 |  |
| 27 | vor der Sprechaufgabe | Service Worker | GET | /lern-app/de | 200 |  |
| 28 | vor der Sprechaufgabe | Service Worker | GET | /lern-app/de/fortschritt | 200 |  |
| 29 | vor der Sprechaufgabe | Service Worker | GET | /lern-app/de/wortschatz | 200 |  |
| 30 | vor der Sprechaufgabe | Service Worker | GET | /lern-app/de/einstellungen | 200 |  |
| 31 | vor der Sprechaufgabe | Service Worker | GET | /lern-app/de/quellen | 200 |  |
| 32 | vor der Sprechaufgabe | Seite/Worker | GET | /lern-app/pakete/tr-aus-de/tr.a1.test/8a28746d018185ad1e545a103fa6feb710887565798cc6b23404ebb4006025a4 | 200 | ja |
| 33 | vor der Sprechaufgabe | Service Worker | GET | /lern-app/pakete/tr-aus-de/tr.a1.test/8a28746d018185ad1e545a103fa6feb710887565798cc6b23404ebb4006025a4 | 200 |  |
| 34 | vor der Sprechaufgabe | Seite/Worker | GET | /_next/static/chunks/1oez142fqgxqb.js | 200 | ja |
| 35 | vor der Sprechaufgabe | Service Worker | GET | /_next/static/chunks/1oez142fqgxqb.js | 200 |  |
| 36 | vor der Sprechaufgabe | Seite/Worker | GET | /lern-app/pakete/tr-aus-de/tr.a1.e01/7f428832c2f1f54846e581e4b2bfebb162b5be1d15e42c7bafac426e2a3bf1c9 | 200 | ja |
| 37 | vor der Sprechaufgabe | Service Worker | GET | /lern-app/pakete/tr-aus-de/tr.a1.e01/7f428832c2f1f54846e581e4b2bfebb162b5be1d15e42c7bafac426e2a3bf1c9 | 200 |  |
| 38 | vor der Sprechaufgabe | Service Worker | GET | /_next/static/chunks/3jxppf3e6vjlg.css | 200 |  |
| 39 | vor der Sprechaufgabe | Service Worker | GET | /_next/static/chunks/14droarl7stzk.css | 200 |  |
| 40 | vor der Sprechaufgabe | Service Worker | GET | /_next/static/chunks/0u7lrd3j62gy3.js | 200 |  |
| 41 | vor der Sprechaufgabe | Service Worker | GET | /_next/static/chunks/12fbtng5h4hrs.js | 200 |  |
| 42 | vor der Sprechaufgabe | Service Worker | GET | /_next/static/chunks/0p6c2ce_tjn7t.js | 200 |  |
| 43 | vor der Sprechaufgabe | Service Worker | GET | /_next/static/chunks/1rxuisn7pmx0c.js | 200 |  |
| 44 | vor der Sprechaufgabe | Service Worker | GET | /_next/static/chunks/2itrcedr95n7k.js | 200 |  |
| 45 | vor der Sprechaufgabe | Service Worker | GET | /_next/static/chunks/turbopack-2c3mg3r-05n1w.js | 200 |  |
| 46 | vor der Sprechaufgabe | Service Worker | GET | /_next/static/chunks/3rt-k3i5qmfql.js | 200 |  |
| 47 | vor der Sprechaufgabe | Service Worker | GET | /_next/static/chunks/2x03b2t2fa9hc.js | 200 |  |
| 48 | vor der Sprechaufgabe | Service Worker | GET | /_next/static/chunks/0r_e7bri8fq70.js | 200 |  |
| 49 | vor der Sprechaufgabe | Service Worker | GET | /_next/static/chunks/3dnaixw00lx5z.js | 200 |  |
| 50 | vor der Sprechaufgabe | Service Worker | GET | /_next/static/chunks/2el76onnalch7.js | 200 |  |
| 51 | vor der Sprechaufgabe | Service Worker | GET | /_next/static/chunks/3hhvlxkfejwva.js | 200 |  |
| 52 | vor der Sprechaufgabe | Service Worker | GET | /_next/static/chunks/0cz1d0mv5g_q7.js | 200 |  |
| 53 | vor der Sprechaufgabe | Service Worker | GET | /_next/static/media/atkinson_hyperlegible_next_latin_400_normal-s.p.2f5b3iexnrrmc.woff2 | 200 |  |
| 54 | vor der Sprechaufgabe | Service Worker | GET | /_next/static/media/atkinson_hyperlegible_next_latin_700_normal-s.p.19r-lfq-yh-yi.woff2 | 200 |  |
| 55 | vor der Sprechaufgabe | Service Worker | GET | /_next/static/media/igmg_wetzlar_titel_latin_600_opsz-s.p.3pmrmf79ke7rh.woff2 | 200 |  |
| 56 | vor der Sprechaufgabe | Service Worker | GET | /_next/static/chunks/2-tfusuegg5al.js | 200 |  |
| 57 | vor der Sprechaufgabe | Service Worker | GET | /_next/static/chunks/0-xmplyzwmc7r.js | 200 |  |
| 58 | vor der Sprechaufgabe | Service Worker | GET | /_next/static/chunks/23xwnruus72-g.js | 200 |  |
| 59 | vor der Sprechaufgabe | Service Worker | GET | /_next/static/chunks/2kjsaokiwre-v.js | 200 |  |
| 60 | vor der Sprechaufgabe | Service Worker | GET | /_next/static/chunks/1iyhtpr8u8a4_.js | 200 |  |
| 61 | vor der Sprechaufgabe | Service Worker | GET | /_next/static/chunks/0pj6ysi1-koju.js | 200 |  |
| 62 | vor der Sprechaufgabe | Service Worker | GET | /_next/static/media/atkinson_hyperlegible_next_latin_ext_400_normal.2vdpo2k7-ytp3.woff2 | 200 |  |
| 63 | vor der Sprechaufgabe | Seite/Worker | GET | /_next/static/media/atkinson_hyperlegible_next_latin_ext_400_normal.2vdpo2k7-ytp3.woff2 | 200 | ja |
| 64 | vor der Sprechaufgabe | Service Worker | GET | /_next/static/chunks/1x4il2oldxoqf.js | 200 |  |
| 65 | vor der Sprechaufgabe | Service Worker | GET | /_next/static/chunks/2db0v8t5a7pbs.js | 200 |  |
| 66 | vor der Sprechaufgabe | Seite/Worker | GET | /_next/static/chunks/1x4il2oldxoqf.js | 200 | ja |
| 67 | vor der Sprechaufgabe | Seite/Worker | GET | /_next/static/chunks/2db0v8t5a7pbs.js | 200 | ja |
| 68 | vor der Sprechaufgabe | Seite/Worker | GET | /_next/static/chunks/0lcrb7y7wlna_.js | 200 | ja |
| 69 | vor der Sprechaufgabe | Service Worker | GET | /_next/static/chunks/0lcrb7y7wlna_.js | 200 |  |
| 70 | vor der Sprechaufgabe | Seite/Worker | GET | /_next/static/chunks/15beo--f6evbe.js | 200 | ja |
| 71 | vor der Sprechaufgabe | Service Worker | GET | /_next/static/chunks/15beo--f6evbe.js | 200 |  |
| 72 | vor der Sprechaufgabe | Seite/Worker | GET | /_next/static/chunks/34tqo5_oxogba.js | 200 | ja |
| 73 | vor der Sprechaufgabe | Service Worker | GET | /_next/static/chunks/34tqo5_oxogba.js | 200 |  |
| 74 | vor der Sprechaufgabe | Seite/Worker | GET | /_next/static/chunks/44fsu767s5_la.js | 200 | ja |
| 75 | vor der Sprechaufgabe | Service Worker | GET | /_next/static/chunks/44fsu767s5_la.js | 200 |  |
| 76 | vor der Sprechaufgabe | Service Worker | GET | /_next/static/media/atkinson_hyperlegible_next_latin_ext_700_normal.2r_gxogca5o4b.woff2 | 200 |  |
| 77 | vor der Sprechaufgabe | Seite/Worker | GET | /_next/static/media/atkinson_hyperlegible_next_latin_ext_700_normal.2r_gxogca5o4b.woff2 | 200 | ja |
| 78 | vor der Sprechaufgabe | Seite/Worker | GET | /_next/static/chunks/353phe4zplcvq.js | 200 | ja |
| 79 | vor der Sprechaufgabe | Service Worker | GET | /_next/static/chunks/353phe4zplcvq.js | 200 |  |
| 80 | nach dem Klick | Seite/Worker | GET | /lern-app/modelle/sprechen/whisper.worker.mjs?v=b02b369f86bc | 200 | ja |
| 81 | nach dem Klick | Service Worker | GET | /lern-app/modelle/sprechen/whisper.worker.mjs?v=b02b369f86bc | 200 |  |
| 82 | nach dem Klick | Seite/Worker | GET | /lern-app/modelle/whisper-base-64da572/config.json | 200 | ja |
| 83 | nach dem Klick | Seite/Worker | GET | /lern-app/modelle/whisper-base-64da572/generation_config.json | 200 | ja |
| 84 | nach dem Klick | Seite/Worker | GET | /lern-app/modelle/whisper-base-64da572/preprocessor_config.json | 200 | ja |
| 85 | nach dem Klick | Seite/Worker | GET | /lern-app/modelle/whisper-base-64da572/tokenizer.json | 200 | ja |
| 86 | nach dem Klick | Seite/Worker | GET | /lern-app/modelle/whisper-base-64da572/tokenizer_config.json | 200 | ja |
| 87 | nach dem Klick | Seite/Worker | GET | /lern-app/modelle/whisper-base-64da572/onnx/encoder_model_quantized.onnx | 200 | ja |
| 88 | nach dem Klick | Seite/Worker | GET | /lern-app/modelle/whisper-base-64da572/onnx/decoder_model_merged_quantized.onnx | 200 | ja |
| 89 | nach dem Klick | Seite/Worker | GET | /lern-app/modelle/ort-1.31.0-dev.20260914-8d85527a0/ort-wasm-simd-threaded.wasm | 200 | ja |
| 90 | nach dem Klick | Seite/Worker | GET | /lern-app/lizenzen/onnxruntime-ThirdPartyNotices.txt?v=143764b952fd | 200 | ja |
| 91 | nach dem Klick | Service Worker | GET | /lern-app/modelle/whisper-base-64da572/config.json | 200 |  |
| 92 | nach dem Klick | Service Worker | GET | /lern-app/modelle/whisper-base-64da572/generation_config.json | 200 |  |
| 93 | nach dem Klick | Service Worker | GET | /lern-app/modelle/whisper-base-64da572/preprocessor_config.json | 200 |  |
| 94 | nach dem Klick | Service Worker | GET | /lern-app/modelle/whisper-base-64da572/tokenizer.json | 200 |  |
| 95 | nach dem Klick | Service Worker | GET | /lern-app/modelle/whisper-base-64da572/tokenizer_config.json | 200 |  |
| 96 | nach dem Klick | Service Worker | GET | /lern-app/modelle/whisper-base-64da572/onnx/encoder_model_quantized.onnx | 200 |  |
| 97 | nach dem Klick | Service Worker | GET | /lern-app/modelle/whisper-base-64da572/onnx/decoder_model_merged_quantized.onnx | 200 |  |
| 98 | nach dem Klick | Service Worker | GET | /lern-app/modelle/ort-1.31.0-dev.20260914-8d85527a0/ort-wasm-simd-threaded.wasm | 200 |  |
| 99 | nach dem Klick | Service Worker | GET | /lern-app/lizenzen/onnxruntime-ThirdPartyNotices.txt?v=143764b952fd | 200 |  |
| 100 | nach dem Klick | Seite/Worker | GET | /lern-app/modelle/ort-1.31.0-dev.20260914-8d85527a0/ort-wasm-simd-threaded.mjs | 200 | ja |
| 101 | nach dem Klick | Service Worker | GET | /lern-app/modelle/ort-1.31.0-dev.20260914-8d85527a0/ort-wasm-simd-threaded.mjs | 200 |  |
| 102 | nach dem Klick | Seite/Worker | GET | /lern-app/modelle/ort-1.31.0-dev.20260914-8d85527a0/ort-wasm-simd-threaded.mjs | 200 | ja |
| 103 | Aufnahme | Seite/Worker | GET | /_next/static/chunks/2rlad42ixyo4i.js | 200 | ja |
| 104 | Aufnahme | Service Worker | GET | /_next/static/chunks/2rlad42ixyo4i.js | 200 |  |
| 105 | Erkennung | Seite/Worker | GET | blob: (im Browser, kein Netz) | 206 |  |

## Alle Anfragen am Draht (65, Proxy; nur hier verlässt eine Anfrage den Browser)

| # | Phase | Methode | URL | Status | KB | Cookie | Set-Cookie |
|---|---|---|---|---|---|---|---|
| 1 | vor der Sprechaufgabe | GET | /lern-app/de/tr-aus-de/ueben?l=tr-aus-de.a1.test.l04 | 200 | 14.9 |  |  |
| 2 | vor der Sprechaufgabe | GET | /_next/static/media/atkinson_hyperlegible_next_latin_400_normal-s.p.2f5b3iexnrrmc.woff2 | 200 | 12.1 |  |  |
| 3 | vor der Sprechaufgabe | GET | /_next/static/chunks/3jxppf3e6vjlg.css | 200 | 1 |  |  |
| 4 | vor der Sprechaufgabe | GET | /_next/static/chunks/14droarl7stzk.css | 200 | 25.9 |  |  |
| 5 | vor der Sprechaufgabe | GET | /_next/static/media/atkinson_hyperlegible_next_latin_700_normal-s.p.19r-lfq-yh-yi.woff2 | 200 | 12.7 |  |  |
| 6 | vor der Sprechaufgabe | GET | /_next/static/media/igmg_wetzlar_titel_latin_600_opsz-s.p.3pmrmf79ke7rh.woff2 | 200 | 50.5 |  |  |
| 7 | vor der Sprechaufgabe | GET | /_next/static/chunks/0u7lrd3j62gy3.js | 200 | 2.2 |  |  |
| 8 | vor der Sprechaufgabe | GET | /_next/static/chunks/12fbtng5h4hrs.js | 200 | 8.4 |  |  |
| 9 | vor der Sprechaufgabe | GET | /_next/static/chunks/0p6c2ce_tjn7t.js | 200 | 36.1 |  |  |
| 10 | vor der Sprechaufgabe | GET | /_next/static/chunks/1rxuisn7pmx0c.js | 200 | 73.6 |  |  |
| 11 | vor der Sprechaufgabe | GET | /_next/static/chunks/2itrcedr95n7k.js | 200 | 8.8 |  |  |
| 12 | vor der Sprechaufgabe | GET | /_next/static/chunks/turbopack-2c3mg3r-05n1w.js | 200 | 4.4 |  |  |
| 13 | vor der Sprechaufgabe | GET | /_next/static/chunks/3rt-k3i5qmfql.js | 200 | 3.6 |  |  |
| 14 | vor der Sprechaufgabe | GET | /_next/static/chunks/2x03b2t2fa9hc.js | 200 | 1.9 |  |  |
| 15 | vor der Sprechaufgabe | GET | /_next/static/chunks/0r_e7bri8fq70.js | 200 | 0.7 |  |  |
| 16 | vor der Sprechaufgabe | GET | /_next/static/chunks/3dnaixw00lx5z.js | 200 | 0.8 |  |  |
| 17 | vor der Sprechaufgabe | GET | /_next/static/chunks/1595ndtm_lxe4.js | 200 | 0.4 |  |  |
| 18 | vor der Sprechaufgabe | GET | /_next/static/chunks/2go9h_6fxw60e.js | 200 | 12.8 |  |  |
| 19 | vor der Sprechaufgabe | GET | /_next/static/media/noto_sans_arabic_arabic_700_normal-s.1fvw6w90d4f53.woff2 | 200 | 50.2 |  |  |
| 20 | vor der Sprechaufgabe | GET | /lern-app/sw.js?v=b02b369f86bc | 200 | 4.3 |  |  |
| 21 | vor der Sprechaufgabe | GET | /_next/static/chunks/3fdr1kaamcjvk.js | 200 | 9.9 |  |  |
| 22 | vor der Sprechaufgabe | GET | /_next/static/chunks/3tjrt5lu4186f.js | 200 | 2 |  |  |
| 23 | vor der Sprechaufgabe | GET | /_next/static/chunks/3ubxz0hnolte4.js | 200 | 4 |  |  |
| 24 | vor der Sprechaufgabe | GET | /_next/static/chunks/09magku08385n.js | 200 | 1.4 |  |  |
| 25 | vor der Sprechaufgabe | GET | /_next/static/chunks/3ro_ozf7it00-.js | 200 | 23.1 |  |  |
| 26 | vor der Sprechaufgabe | GET | /lern-app/pakete/tr-aus-de | 200 | 14.1 |  |  |
| 27 | vor der Sprechaufgabe | GET | /lern-app/de | 200 | 9.3 |  |  |
| 28 | vor der Sprechaufgabe | GET | /lern-app/de/fortschritt | 200 | 7.7 |  |  |
| 29 | vor der Sprechaufgabe | GET | /lern-app/de/wortschatz | 200 | 6.4 |  |  |
| 30 | vor der Sprechaufgabe | GET | /lern-app/de/einstellungen | 200 | 10.2 |  |  |
| 31 | vor der Sprechaufgabe | GET | /lern-app/de/quellen | 200 | 35 |  |  |
| 32 | vor der Sprechaufgabe | GET | /lern-app/pakete/tr-aus-de/tr.a1.test/8a28746d018185ad1e545a103fa6feb710887565798cc6b23404ebb4006025a4 | 200 | 16 |  |  |
| 33 | vor der Sprechaufgabe | GET | /_next/static/chunks/1oez142fqgxqb.js | 200 | 3.5 |  |  |
| 34 | vor der Sprechaufgabe | GET | /lern-app/pakete/tr-aus-de/tr.a1.e01/7f428832c2f1f54846e581e4b2bfebb162b5be1d15e42c7bafac426e2a3bf1c9 | 200 | 114.9 |  |  |
| 35 | vor der Sprechaufgabe | GET | /_next/static/chunks/2el76onnalch7.js | 200 | 0.7 |  |  |
| 36 | vor der Sprechaufgabe | GET | /_next/static/chunks/3hhvlxkfejwva.js | 200 | 12.7 |  |  |
| 37 | vor der Sprechaufgabe | GET | /_next/static/chunks/0cz1d0mv5g_q7.js | 200 | 39.6 |  |  |
| 38 | vor der Sprechaufgabe | GET | /_next/static/chunks/2-tfusuegg5al.js | 200 | 0.6 |  |  |
| 39 | vor der Sprechaufgabe | GET | /_next/static/chunks/0-xmplyzwmc7r.js | 200 | 16.7 |  |  |
| 40 | vor der Sprechaufgabe | GET | /_next/static/chunks/23xwnruus72-g.js | 200 | 1.2 |  |  |
| 41 | vor der Sprechaufgabe | GET | /_next/static/chunks/2kjsaokiwre-v.js | 200 | 1 |  |  |
| 42 | vor der Sprechaufgabe | GET | /_next/static/chunks/1iyhtpr8u8a4_.js | 200 | 13.2 |  |  |
| 43 | vor der Sprechaufgabe | GET | /_next/static/chunks/0pj6ysi1-koju.js | 200 | 8.3 |  |  |
| 44 | vor der Sprechaufgabe | GET | /_next/static/media/atkinson_hyperlegible_next_latin_ext_400_normal.2vdpo2k7-ytp3.woff2 | 200 | 7.4 |  |  |
| 45 | vor der Sprechaufgabe | GET | /_next/static/chunks/1x4il2oldxoqf.js | 200 | 3.8 |  |  |
| 46 | vor der Sprechaufgabe | GET | /_next/static/chunks/2db0v8t5a7pbs.js | 200 | 2.6 |  |  |
| 47 | vor der Sprechaufgabe | GET | /_next/static/chunks/0lcrb7y7wlna_.js | 200 | 5.6 |  |  |
| 48 | vor der Sprechaufgabe | GET | /_next/static/chunks/15beo--f6evbe.js | 200 | 1.1 |  |  |
| 49 | vor der Sprechaufgabe | GET | /_next/static/chunks/34tqo5_oxogba.js | 200 | 5.8 |  |  |
| 50 | vor der Sprechaufgabe | GET | /_next/static/chunks/44fsu767s5_la.js | 200 | 6.3 |  |  |
| 51 | vor der Sprechaufgabe | GET | /_next/static/media/atkinson_hyperlegible_next_latin_ext_700_normal.2r_gxogca5o4b.woff2 | 200 | 7.6 |  |  |
| 52 | vor der Sprechaufgabe | GET | /_next/static/chunks/353phe4zplcvq.js | 200 | 3.4 |  |  |
| 53 | nach dem Klick | GET | /lern-app/modelle/sprechen/whisper.worker.mjs?v=b02b369f86bc | 200 | 175.9 |  |  |
| 54 | nach dem Klick | GET | /lern-app/modelle/whisper-base-64da572/config.json | 200 | 0.8 |  |  |
| 55 | nach dem Klick | GET | /lern-app/modelle/whisper-base-64da572/generation_config.json | 200 | 1.1 |  |  |
| 56 | nach dem Klick | GET | /lern-app/modelle/whisper-base-64da572/preprocessor_config.json | 200 | 0.3 |  |  |
| 57 | nach dem Klick | GET | /lern-app/modelle/whisper-base-64da572/tokenizer.json | 200 | 642.3 |  |  |
| 58 | nach dem Klick | GET | /lern-app/modelle/whisper-base-64da572/tokenizer_config.json | 200 | 10.5 |  |  |
| 59 | nach dem Klick | GET | /lern-app/modelle/whisper-base-64da572/onnx/encoder_model_quantized.onnx | 200 | 23200.9 |  |  |
| 60 | nach dem Klick | GET | /lern-app/modelle/whisper-base-64da572/onnx/decoder_model_merged_quantized.onnx | 200 | 53707.5 |  |  |
| 61 | nach dem Klick | GET | /lern-app/modelle/ort-1.31.0-dev.20260914-8d85527a0/ort-wasm-simd-threaded.wasm | 200 | 3704.6 |  |  |
| 62 | nach dem Klick | GET | /lern-app/lizenzen/onnxruntime-ThirdPartyNotices.txt?v=143764b952fd | 200 | 32.7 |  |  |
| 63 | nach dem Klick | GET | /lern-app/sw.js?v=b02b369f86bc | 304 | 0 |  |  |
| 64 | nach dem Klick | GET | /lern-app/modelle/ort-1.31.0-dev.20260914-8d85527a0/ort-wasm-simd-threaded.mjs | 200 | 9.1 |  |  |
| 65 | Aufnahme | GET | /_next/static/chunks/2rlad42ixyo4i.js | 200 | 1 |  |  |
