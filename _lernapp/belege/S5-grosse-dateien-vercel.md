# Beleg S5 – Auslieferung großer Dateien auf Vercel (Audio-Bündel und Whisper-Modelle)

- **Etappe:** L0, Paket L0-06 (Spike S5, Recherche; kein Code im Repository, kein Deployment)
- **Stand:** 16.10.2026
- **Bezug:** ADR 0039 Nr. 2, 4, 12; ADR 0042 Nr. 4, 5; KERN §6 („nur per GET vom eigenen Ursprung“), §9 (Speicher, Bau); PLAN §3.1
  (`/lern-app/audio/[...pfad]`, `/lern-app/modelle/[...pfad]`), §5.4; MENSCHEN LM-15 (Blob, Kosten), LM-27 (L0-E08: Modell und Ort);
  bestehendes Muster `web/src/app/audio/[...pfad]/route.ts` mit `liefereAudio` (`web/src/lib/audio/speicher.ts`, L2-E06)
- **Projektstand:** Next.js 16.4.0, `@vercel/blob` 2.8.0, `vercel.json` mit `regions: ["fra1"]`, Proxy-Matcher
  `/((?!api|_next|_vercel|medien|.*\..*).*)` (Pfade mit Dateiendung laufen nicht durch den Proxy). Tarif offen (ML-09, LM-15).

## 1. Ziel

Für zwei Arten großer Dateien den Auslieferungsweg wählen:

| Art | Menge | Größe je Datei |
|---|---|---|
| Audio-Bündel `.lpa` (ADR 0039) | 216 Bündel, ≈ 0,8 GB | A1 ≈ 1,5 MB … C1 ≈ 6 MB |
| Whisper-base q8 + ONNX-Runtime-WASM (ADR 0042) | ≈ 10 Dateien, ≈ 80 MB + 41 MB | bis 53,7 MB |

Verglichen werden: Route-Handler mit Strom aus Vercel Blob, statische Dateien aus `web/public`, externer Rewrite auf den Blob-Host
und die Blob-Adresse direkt – jeweils mit Funktionsdauer, Größengrenzen, Byte-Bereichen (Range), CDN-Cache mit `immutable` und
Kosten.

## 2. Vorgehen (Befehle)

Downloads nur im Scratchpad `…/scratchpad/l0/s5/dl/` (eigenes Verzeichnis, Python mit `-I`), Skripte in `…/l0/s5/skripte/`.

```bash
# 2.1 Vercel-Doku per WebFetch (Markdown-Fassung der Seiten, jeweils mit last_updated):
#     /docs/limits, /docs/functions/limitations, /kb/guide/how-to-bypass-vercel-body-size-limit-serverless-functions,
#     /docs/caching/cdn-cache, /docs/caching/cdn-cache/purge, /docs/routing/rewrites, /docs/vercel-blob,
#     /docs/vercel-blob/public-storage, /docs/vercel-blob/usage-and-pricing, /docs/manage-cdn-usage,
#     /docs/pricing/regional-pricing/fra1, /docs/plans/hobby, /docs/how-vercel-cdn-works/compression,
#     /docs/functions/streaming-functions; Next.js /docs/app/api-reference/config/next-config-js/headers

# 2.2 Verhalten am echten Vercel-CDN (nur lesende GET/OPTIONS-Anfragen):
U=https://7nyt0uhk7sse4zvn.public.blob.vercel-storage.com/front/docs/cdn/site-cdn-data-light.png   # öffentlicher Blob aus der Vercel-Doku
curl -sS -o /dev/null -D - -H 'Origin: https://example.org' "$U"
curl -sS -o /dev/null -D - -H 'Range: bytes=0-99' "$U"
curl -sS -o /dev/null -D - -H 'Range: bytes=999999999-' "$U"
curl -sS -o /dev/null -D - -X OPTIONS -H 'Origin: https://example.org' -H 'Access-Control-Request-Headers: range' "$U"
curl -sS -o /dev/null -D - -H 'Range: bytes=0-99' https://nextjs.org/_next/static/immutable/chunks/3nv58-vama1zo.js
curl -sS -o /dev/null -D - -H 'Range: bytes=0-9' https://nextjs.org/favicon.ico          # Datei aus public/ einer Vercel-Seite
# (Die eigene Vorschau igmg-five.vercel.app antwortet DEPLOYMENT_NOT_FOUND; ein Bautest am eigenen Projekt steht in §5.)

# 2.3 Dateigrößen und Komprimierbarkeit der Modelldateien (gepinnte Stände)
curl -sS -f -o dl/hf-tree.json "https://huggingface.co/api/models/Xenova/whisper-base/tree/64da572?recursive=true"
curl -sS -f -o dl/hf-tree-small.json "https://huggingface.co/api/models/Xenova/whisper-small/tree/2d67713?recursive=true"
curl -sS -f -L -o dl/tjs-pkg.json https://unpkg.com/@huggingface/transformers@4.3.0/package.json   # → onnxruntime-web 1.31.0-dev.20260914-8d85527a0
curl -sS -f -L -o dl/ort-meta.json "https://unpkg.com/onnxruntime-web@1.31.0-dev.20260914-8d85527a0/dist/?meta"
curl -sS -f -L -o dl/tjs-env.js https://unpkg.com/@huggingface/transformers@4.3.0/src/env.js         # cacheKey, fetch, useBrowserCache
curl -sS -f -L -o dl/bin/ort-wasm-simd-threaded.wasm …; curl … ort-wasm-simd-threaded.asyncify.wasm
curl -sS -f -L -o dl/bin/encoder_model_quantized.onnx https://huggingface.co/Xenova/whisper-base/resolve/64da572/onnx/encoder_model_quantized.onnx
gzip -6 -c <datei> | wc -c; sha256sum dl/bin/*

# 2.4 Kostenmodell (Annahmen in §3.7)
python3 -I skripte/kosten.py
```

## 3. Messwerte und Ergebnisse

### 3.1 Grenzen laut Vercel-Doku

| Grenze | Wert | Quelle (last_updated) |
|---|---|---|
| Funktionsdauer (Fluid Compute, Node.js) | Hobby 300 s (Standard = Maximum); Pro 300 s Standard, 800 s Maximum, 1.800 s Beta; zählt **einschließlich gestreamter Antwort** | functions/limitations (24.08.2026) |
| Speicher je Funktion | Hobby 2 GB / 1 vCPU; Pro bis 4 GB / 2 vCPU | dito |
| Größe einer Funktion | 250 MB unkomprimiert (Beta bis 5 GB) | dito |
| **Antwortkörper einer Funktion** | **4,5 MB** (sonst 413 `FUNCTION_PAYLOAD_TOO_LARGE`); **gilt nicht für gestreamte Antworten** | functions/limitations; KB „bypass 4.5MB“ (10.11.2025) |
| Streaming | für Node.js-Funktionen standardmäßig an | functions/streaming-functions (01.09.2026) |
| **CDN-Cache für Funktionsantworten** | nur mit `s-maxage` bzw. `CDN-Cache-Control`/`Vercel-CDN-Cache-Control`; `max-age` allein wirkt nur im Browser | caching/cdn-cache (14.09.2026) |
| Cachebar nur, wenn | GET/HEAD, **ohne `Range`**, ohne `Authorization`, Status 200/404/410/301/302/307/308, ≤ **10 MB** (≤ **20 MB** bei gestreamten Funktionsantworten), kein `set-cookie`, kein `private`/`no-store`, kein `Vary: *`/`Vary: Cookie` | dito |
| Cache-Dauer | höchstens 1 Jahr, „best effort“; selten abgerufene Objekte können früher fallen; Cache regional | dito |
| Cache-Schlüssel | Methode, URL, Host, **Deployment-URL**, Schema → jedes neue Deployment beginnt mit kaltem Cache | caching/cdn-cache/purge (03.09.2026) |
| Statische Dateien | automatisch im CDN gecacht, „for the lifetime of the deployment“; Cache-Umgehung für statische Dateien nicht möglich | caching/cdn-cache |
| Static File uploads | 100 MB Hobby / 1 GB Pro – laut Text **nur beim Upload über die CLI** („When using the CLI to deploy …“); für Git-Bauten keine Grenze je Datei dokumentiert | limits (16.09.2026) |
| Ausgabedateien eines Baus | für die Zahl der Ausgabedateien „no upper limit“, nur Bauzeit ≤ 45 min; Bauplatte 32 GB; eine Größengrenze je Datei nennt die Doku nicht | limits |
| Externer Rewrite | Antwortzeit des Ziels ≤ 120 s; Upstream-`Cache-Control` wird nur für Projekte ab 06.04.2026 standardmäßig beachtet, ältere brauchen `x-vercel-enable-rewrite-caching: 1` | limits; routing/rewrites (11.08.2026) |
| Blob: Dateigröße | bis 5 TB; ab 100 MB Mehrteil-Upload empfohlen | vercel-blob/usage-and-pricing (23.09.2026) |
| Blob: CDN-Cache | öffentliche Blobs im CDN und im Browser standardmäßig 1 Monat; einstellbar beim Upload (min. 60 s); **≤ 512 MB** je Blob cachebar | vercel-blob/public-storage (11.08.2026) |
| Blob: Hobby-Freimengen | Speicher **1 GB**, einfache Operationen 10.000, erweiterte 2.000, Blob Data Transfer **10 GB** je Monat; bei Überschreitung **kein Blob-Zugriff, bis 30 Tage vergangen sind** | vercel-blob/usage-and-pricing |
| Blob: einfache Operation | Metadaten-Abruf (`head()`) **oder** Abruf über die URL mit Cache-MISS | vercel-blob |
| Komprimierung | automatisch nur für Typen der Liste, u. a. `application/wasm`, JSON, JavaScript; nicht für `application/octet-stream` (ONNX, `.lpa`) | how-vercel-cdn-works/compression (05.03.2026) |
| Hobby-Tarif | nur „non-commercial, personal use“ | plans/hobby (14.09.2026) |

### 3.2 Preise fra1 (Pro, on-demand, USD ohne Steuer) und Hobby-Freimengen

| Posten | fra1 | Hobby frei |
|---|---|---|
| Fast Data Transfer (CDN → Gerät) | 0,15 $/GB | 100 GB |
| Fast Origin Transfer (CDN ↔ Funktion, Blob bei MISS) | 0,06 $/GB | 10 GB |
| CDN Requests | 2,60 $/Mio. | 1 Mio. |
| Blob Data Transfer (jeder Abruf öffentlicher Blobs, auch Funktion → Blob) | 0,05 $/GB | 10 GB |
| Blob Speicher | 0,025 $/GB-Monat | 1 GB |
| Blob einfache / erweiterte Operationen | 0,43 $ / 5,40 $ je Mio. | 10.000 / 2.000 |
| Fluid Active CPU / Provisioned Memory | 0,184 $/h / 0,0152 $/GB-h | 4 CPU-h / 360 GB-h |

### 3.3 Verhalten am Vercel-CDN (gemessen 16.10.2026)

| Anfrage | Antwort |
|---|---|
| öffentlicher Blob, GET | 200, `accept-ranges: bytes`, `cache-control: public, max-age=2592000`, `access-control-allow-origin: *`, `content-disposition: inline`, `etag`, `x-content-type-options: nosniff`, `x-vercel-cache: MISS` |
| öffentlicher Blob, `Range: bytes=0-99` | **206**, `content-range: bytes 0-99/104848`, `x-vercel-cache: HIT` |
| öffentlicher Blob, Bereich hinter dem Ende | **416**, `content-range: bytes */104848` |
| öffentlicher Blob, CORS-Vorabanfrage (`OPTIONS`, `range`) | **405**, erlaubt nur `content-type` → fremder Ursprung mit `Range`-Kopf nicht verlässlich |
| statische Datei einer Vercel-Seite (`/_next/static/immutable/…`), Range | 206, `x-vercel-cache: HIT`, `public,max-age=31536000,immutable` |
| Datei aus `public/` einer Vercel-Seite (`/favicon.ico`), Range | 206, `x-vercel-cache: HIT`, Standardkopf `public, max-age=0, must-revalidate` |

Folgerungen: Blob und statische Dateien beherrschen Byte-Bereiche am CDN. Dateien aus `public/` bekommen ohne eigene Regel nur
`max-age=0` (Browser fragt jedes Mal nach); eine Header-Regel in `next.config.ts` ist möglich („Headers are checked before the
filesystem which includes pages and /public files“; nur Next-eigene gehashte Dateien sind ausgenommen).

### 3.4 Größen der Modelldateien (gepinnte Stände)

| Datei | Größe | gzip -6 | Bemerkung |
|---|---|---|---|
| whisper-base `onnx/encoder_model_quantized.onnx` (64da572) | 23.200.850 B | 65,3 % | SHA-256 `3e345e97…85f9`; > 20 MB |
| whisper-base `onnx/decoder_model_merged_quantized.onnx` | 53.707.539 B | – | LFS-OID `a6beb6ba…`; > 50 MB (GitHub-Warnschwelle) |
| whisper-base `tokenizer.json` / `tokenizer_config.json` / `vocab.json` / `merges.txt` | 2,48 / 0,28 / 1,04 / 0,49 MB | JSON, wird komprimiert | |
| whisper-base `config.json`, `generation_config.json`, `preprocessor_config.json` u. a. | je < 10 KB | | |
| ORT `ort-wasm-simd-threaded.wasm` (1.31.0-dev.20260914) | 14.264.838 B | **25,8 %** (3,7 MB) | WASM-Weg |
| ORT `ort-wasm-simd-threaded.asyncify.wasm` | 26.861.777 B | **24,9 %** (6,7 MB) | WebGPU-Weg (welche Variante 4.3.x lädt, belegt S2) |
| ORT `….jsep.wasm` / `….jspi.wasm` | 28,35 / 16,81 MB | | voraussichtlich nicht nötig |
| whisper-small q8 Decoder / Encoder (2d67713) | **156,8 MB** / 92,3 MB | | über der GitHub-Grenze von 100 MB je Datei |

Erstes Laden des Sprechmoduls (base, q8, WASM-Weg, wasm komprimiert): ≈ 23,2 + 53,7 + 3,7 + ≈ 1 (JSON komprimiert) ≈ **81 MB**.

transformers.js 4.3.0 (`src/env.js`) bietet `env.cacheKey` (Standard `transformers-cache`, „for storing models and WASM binaries“),
`env.useBrowserCache` und `env.fetch`. Der Root-SW löscht beim Aktivieren alle Caches außer seiner Liste (PLAN §1 Befund 4) – ein
Cache `transformers-cache` ginge dabei verloren.

### 3.5 Bewertung der Wege für Audio-Bündel (`/lern-app/audio/…`)

| Weg | Eigener Ursprung (KERN §6) | Größe | Range | CDN-Cache | Kosten je GB an Lernende (Pro, fra1) | Hobby-Risiko |
|---|---|---|---|---|---|---|
| **A1 Route + Strom aus Blob, heutiger Kopf `public, max-age=…, immutable`** (Muster `liefereAudio`) | ja | ok (Strom) | ja (206/416 durchgereicht) | **nein** – Funktionsantworten brauchen `s-maxage`/`CDN-Cache-Control` | ≈ 0,26 $ (FDT + FOT + BDT) + `head()` je Anfrage | FOT und BDT je 10 GB, `head()` 10.000/Monat → Sperre des Blob-Zugriffs |
| **A2 Route + Strom + `Vercel-CDN-Cache-Control`** | ja | ok bis 20 MB je Bündel | ja; Range-Anfragen selbst werden nicht gecacht | **ja**, regional, bis 1 Jahr; kalt nach jedem Deployment | HIT 0,15 $; MISS ≈ 0,26 $ | gering |
| A3 externer Rewrite auf Blob-Host | ja (für den Browser) | ok (≤ 10 MB gecacht) | ja (Blob) | ja, mit `x-vercel-enable-rewrite-caching: 1` (Projekt vor 06.04.2026) | wie A2 | gering |
| A4 Blob-URL direkt | **nein** (fremder Host, `connect-src`/`media-src` nötig) | ok | ja; CORS-Vorabanfrage 405 | Blob-CDN, unabhängig von Deployments | 0,05 $ (+ FOT bei MISS) | BDT 10 GB → Sperre des Blob-Zugriffs (alle Speicher) |
| A5 statisch in `web/public` | ja | – | ja | ja | 0,15 $ | – |

A5 scheidet für Audio aus: ≈ 0,8 GB, ändert sich mit jeder Freigabe, gehört nicht ins Repository (ADR 0039 „Audio im Repository:
verworfen“).

### 3.6 Bewertung der Wege für Modelle (`/lern-app/modelle/…`)

| Weg | Befund |
|---|---|
| **M1 statisch in `web/public/lern-app/modelle/<version>/`** | Gleicher Ursprung, CDN-Cache und Range ohne Funktion, `.wasm` automatisch komprimiert, kein Blob-Verbrauch. Kosten nur FDT. Für Git-Bauten keine Dateigrenze dokumentiert → im Bautest bestätigen (§5). Nachteil: ≈ 80 MB Whisper-Dateien im Repository (heute `.git` 287 MB), Decoder 53,7 MB über der GitHub-Warnschwelle von 50 MB, unter der Grenze von 100 MB. |
| M2 Route + Strom aus Blob | Alle Modelldateien außer `ort-wasm-simd-threaded.wasm` liegen über 20 MB → **nie im CDN-Cache**; jeder Abruf ist ein Funktionsaufruf über die ganze Übertragung (Hobby-Grenze 300 s inkl. Strom; bei 1 Mbit/s dauern 53,7 MB ≈ 7 min), dazu FOT + BDT. Verworfen. |
| M3 externer Rewrite auf Blob-Host | Gleicher Ursprung, keine Funktion. Ob Antworten > 10 MB im Projekt-CDN gecacht werden, ist nicht dokumentiert (vermutlich nicht) → je Abruf BDT (+ FOT). Einzige Möglichkeit für whisper-small (> 100 MB je Datei). |
| M4 Blob-URL direkt | widerspricht KERN §6 und ADR 0042 Nr. 5 („vom eigenen Ursprung“); BDT-Sperre im Hobby-Tarif. Verworfen. |

### 3.7 Kostenmodell (Skript `l0/s5/skripte/kosten.py`)

Annahmen je Monat: 20 MB Audio und 1 MB Pakete je aktiver lernender Person; 10 % laden das Sprechmodul erstmals (81 MB);
20 Produktions-Deployments mit kaltem Cache, je 40 abgerufene Bündel à 3 MB (≈ 2,3 GB MISS-Volumen). Nur Lern-App-Verkehr; die
Hobby-Freimengen gelten für das ganze Konto.

| Szenario | Weg | FDT | FOT | BDT | Pro ≈ $/Monat | Hobby |
|---|---|---|---|---|---|---|
| M (600 Lernende) | Audio A1 (heutiger Kopf) | 11,7 GB | 11,7 GB | 11,7 GB | 3,05 | **FOT, BDT überschritten** |
| M | Audio A2 (Empfehlung) | 11,7 GB | 2,3 GB | 2,3 GB | 2,02 | 23 % |
| M | Audio A4 (Blob direkt) | – | – | 11,7 GB | 0,59 | **BDT überschritten** |
| M | Modell M1 (Empfehlung) | 4,7 GB | – | – | 0,71 | 5 % |
| M | Modell M2/M3 | 4,7 GB | 4,7 GB | 4,7 GB | 1,23 | 47 % |
| L (3.000 Lernende) | Audio A1 | 58,6 GB | 58,6 GB | 58,6 GB | 15,24 | **FOT, BDT, einfache Op. überschritten** |
| L | Audio A2 | 58,6 GB | 2,3 GB | 2,3 GB | 9,05 | 59 % |
| L | Modell M1 | 23,7 GB | – | – | 3,56 | 24 % |
| L | Modell M2/M3 | 23,7 GB | 23,7 GB | 23,7 GB | 6,17 | **FOT, BDT überschritten** |
| S (150 Lernende) | alle Wege | ≤ 2,9 GB | ≤ 2,9 GB | ≤ 2,9 GB | < 1 | ≤ 29 % |

Die Beträge im Pro-Tarif sind klein. Entscheidend sind die **harten Hobby-Grenzen**: Wer sie überschreitet, verliert den
Blob-Zugriff bis zu 30 Tage – auch für den Rezitations-Speicher `audio`. Dazu reicht der Hobby-Blob-Speicher von 1 GB nicht für
`lernapp` (≈ 0,8 GB Audio, mit Modellen im Blob 1,1–1,3 GB) zusammen mit den Rezitationen.

## 4. Entscheidungsvorschlag für die offenen Punkte der ADRs

| Punkt | Vorschlag |
|---|---|
| **ADR 0039 Nr. 4 (Audio-Auslieferung), Spike S5** | **Weg A2:** Route `/lern-app/audio/[...pfad]` nach dem Muster `liefereAudio`, mit fünf Änderungen gegenüber dem Rezitations-Muster: (1) Kopf `Cache-Control: public, max-age=31536000, immutable` **plus** `Vercel-CDN-Cache-Control: max-age=31536000` und `Vercel-Cache-Tag: lernapp-audio,lernapp-audio-<sprache>`; (2) **kein `head()` je Anfrage** – die Adresse entsteht aus einer festen Basis (`LERNAPP_BLOB_BASIS`, öffentlicher Speicher) und dem geprüften Schlüssel `lernapp/audio/<sprache>/<einheit>-<sha16>.lpa`; Blob-404 → 404; (3) Antwortkörper als Strom durchreichen, nie puffern (sonst 4,5-MB-Grenze); (4) Bündel ≤ 16 MB als Regeltest in `buendel` (CDN-Grenze 20 MB); (5) keine Cookies, kein `Vary: Cookie`. Range bleibt unterstützt (200/206/416), der Client lädt Bündel aber **ganz und ohne `Range`** (Range-Anfragen umgehen den CDN-Cache, `Cache.put` nimmt keine 206 an, S4). Hochladen mit `cacheControlMaxAge: 31536000`, `addRandomSuffix: false`, `allowOverwrite: false`. Im Beispielmodus liefert dieselbe Route die synthetischen Testbündel aus dem Dateisystem. |
| ADR 0039 Nr. 4, Rückfall | Bei Kostenproblemen (LM-15) **A3 externer Rewrite** auf den Blob-Host mit `x-vercel-enable-rewrite-caching: 1` (nur Produktion; verliert Musterprüfung und Beispielmodus). Der Rückfall „Blob-Adresse in `media-src`“ (A4) entfällt: Er bräche KERN §6 und riskiert im Hobby-Tarif die Blob-Sperre. |
| **ADR 0039 Nr. 2 (Pakete)** | Dieselbe CDN-Regel für `/lern-app/pakete/[kurs]/[einheit]/[hash]` (`Vercel-CDN-Cache-Control`, Tag `lernapp-kurs-<id>` für Zurückziehen nach KERN §2.3). Pfade ohne Dateiendung laufen durch den Proxy (Matcher), was Vercel als doppelten Fast Origin Transfer beschreibt → Endung `.json` an die Hash-Adresse oder `lern-app/(pakete|audio|modelle)` in den Matcher-Ausschluss (gemeinsame Datei, Orchestrator). |
| **ADR 0042 Nr. 5, L0-E08, LM-27 (Ort der Modelle)** | **Weg M1, statisch vom eigenen Ursprung:** `web/public/lern-app/modelle/whisper-base-64da572/…` (Encoder, Decoder merged, Tokenizer- und Konfigurationsdateien; SHA-256 in `web/daten/lernapp-modelle/QUELLE.md`, Lizenztexte daneben) und `web/public/lern-app/modelle/ort-<version>/…`. Die ORT-Dateien kopiert ein Bauschritt aus dem exakt gepinnten `onnxruntime-web` in `node_modules` (SHA-Prüfung, nur die nötigen `.wasm`/`.mjs`), damit sie nicht ins Repository müssen. Header-Regel in `next.config.ts`: `/lern-app/modelle/:pfad*` → `public, max-age=31536000, immutable`, `X-Content-Type-Options: nosniff`. |
| ADR 0042 Nr. 5, Variante | Soll das Repository nicht um ≈ 80 MB wachsen, kopiert der Bau die Whisper-Dateien aus dem Blob (`lernapp/modelle/…`, SHA-Prüfung). Das kostet ≈ 80 MB Blob Data Transfer je Bau und braucht eine Fortschreibung von KERN §9 / PLAN §5.4 („Audio und Modelle nie im Bau“). Nicht als Standard. |
| ADR 0042 Nr. 3, whisper-small | Nur über Blob + externen Rewrite (Decoder 156,8 MB > 100 MB GitHub-Grenze); erst nach Praxistest (LM-27). |
| **ADR 0042 Nr. 4 (Vorrat)** | Genau ein Speicherort für ≈ 81 MB: Der Lern-App-SW hält `/lern-app/modelle/**` im Cache `igmg-lernapp-modelle` (Vorrat zuerst, auch die per `import()` geladenen `.mjs`), transformers.js läuft mit `env.useBrowserCache = false`. Wird doch der Bibliotheks-Cache genutzt, dann mit `env.cacheKey = 'igmg-lernapp-modelle'` – der Standardname `transformers-cache` fiele dem Root-SW zum Opfer. S2 bestätigt das Laden ohne Netz. |
| **LM-15 / ML-09 (Tarif)** | Lern-App-Audio und Blob `lernapp` erst in Produktion, wenn der Tarif entschieden ist; im Hobby-Tarif reichen 1 GB Blob-Speicher nicht, und Überschreitungen sperren den Blob-Zugriff bis zu 30 Tage. Im Pro-Tarif Spend Management mit Benachrichtigung einrichten; erwartete Kosten der Lern-App-Auslieferung ≈ 1–13 $/Monat (§3.7, Szenarien S bis L, Wege A2 + M1). Bis dahin gilt der Standard von LM-15 („Audio nur im Testkurs“). |
| KERN §9 „Speicher“ | Blob `lernapp` ≈ 0,8 GB (nur Audio), weil die Modelle statisch ausgeliefert werden; Repository + ≈ 80 MB. |

## 5. Bautest-Plan für L1 (Vorschau-Deployment über `git push` eines Probe-Zweigs, kein Deploy von Hand)

| Nr. | Aufbau | Erwartung |
|---|---|---|
| B1 | `web/public/lern-app/modelle/bautest/zufall-60mb.bin` (Zufallsbytes, kein Modell) + Header-Regel | Bau grün; GET 200 mit `content-length` 62.914.560; Range 206; zweiter Abruf `x-vercel-cache: HIT`; `cache-control` mit `immutable` |
| B2 | Route `/lern-app/audio/test/…` mit 6-MB-Testbündel (synthetische Töne) aus einem Vorschau-Blob | erster Abruf MISS, zweiter HIT; kein 413; `content-length` vorhanden (sonst Ring aus den Größen im Kursverzeichnis) |
| B3 | Gegenprobe B2 ohne `Vercel-CDN-Cache-Control` | jeder Abruf MISS |
| B4 | Testbündel 18 MB und 22 MB | 18 MB HIT, 22 MB stets MISS (20-MB-Grenze) |
| B5 | B2 mit `Range: bytes=0-99` | 206, MISS (erwartet) |
| B6 | Proxy-Matcher: Paketpfad ohne Endung | `x-middleware-*`/Logs zeigen, ob der Proxy läuft |
| B7 | Nutzung nach 24 h im Vercel-Dashboard | FOT/BDT nur für MISS-Abrufe |

Danach Probedateien, Probe-Blob und Zweig löschen. Ergebnis als Nachtrag in diesen Beleg.

## 6. Risiken

| Risiko | Gegenmaßnahme |
|---|---|
| Hobby-Grenzen (Blob 1 GB, FOT/BDT 10 GB, `head()` 10.000) sperren den Blob-Zugriff bis zu 30 Tage, auch für Rezitationen | Weg A2 ohne `head()`, Modelle statisch; Tarifentscheidung vor Produktion (LM-15/ML-09) |
| Jedes Deployment leert den CDN-Cache der Route (Cache-Schlüssel mit Deployment-URL) | im Modell enthalten (≈ 2,3 GB MISS/Monat); Bündel bleiben im Blob-CDN und im SW-Vorrat der Geräte |
| Statische Großdateien im Git-Bau doch begrenzt (nicht dokumentiert) | Bautest B1; sonst Variante „Kopie aus dem Blob beim Bau“ |
| Repository wächst um ≈ 80 MB je Modellstand | Modellwechsel selten; alte Stände nicht mehrfach einchecken |
| Langsame Geräte: 81 MB Erstladung | ADR 0042 Nr. 4: nur nach Klick mit Größenangabe; SW-Vorrat |
| Bündel > 20 MB fallen aus dem CDN-Cache | Regeltest ≤ 16 MB; C1 ≈ 6 MB |
| Zurückziehen eines Bündels (KERN §2.3) trotz `immutable` | Paket verweist auf neuen Hash; Blob löschen; `Vercel-Cache-Tag` im CDN invalidieren; Browser-Kopien alter Hashes werden nicht mehr angefragt |
| Doku-Stand ändert sich | Abrufdaten je Quelle unten; Werte vor L8 erneut prüfen |

## 7. Aufräumen

- Kein Server gestartet, kein Deployment ausgelöst; nur lesende Anfragen an fremde, öffentliche Adressen.
- Gelöscht: `l0/s5/dl/bin/` (Encoder 23,2 MB, ORT-WASM 14,3 MB und 26,9 MB). Behalten (< 100 KB): `l0/s5/dl/*.json`,
  `l0/s5/dl/tjs-env.js`, Skript `l0/s5/skripte/kosten.py`.
- Im Repository nur diese Datei geschrieben; nichts committet.

## 8. Quellen (abgerufen 16.10.2026; in Klammern last_updated der Seite)

- Vercel Limits (16.09.2026): https://vercel.com/docs/limits
- Vercel Functions Limits (24.08.2026): https://vercel.com/docs/functions/limitations
- KB „How do I bypass the 4.5MB body size limit“ (10.11.2025): https://vercel.com/kb/guide/how-to-bypass-vercel-body-size-limit-serverless-functions
- Streaming (01.09.2026): https://vercel.com/docs/functions/streaming-functions
- Vercel CDN Cache (14.09.2026): https://vercel.com/docs/caching/cdn-cache
- Purging Vercel CDN Cache (03.09.2026): https://vercel.com/docs/caching/cdn-cache/purge
- Rewrites (11.08.2026): https://vercel.com/docs/routing/rewrites
- Vercel Blob (26.08.2026): https://vercel.com/docs/vercel-blob
- Public Storage (11.08.2026): https://vercel.com/docs/vercel-blob/public-storage
- Vercel Blob Pricing (23.09.2026): https://vercel.com/docs/vercel-blob/usage-and-pricing
- CDN pricing and usage (14.09.2026): https://vercel.com/docs/manage-cdn-usage
- Frankfurt (fra1) pricing (14.09.2026): https://vercel.com/docs/pricing/regional-pricing/fra1
- Hobby Plan (14.09.2026): https://vercel.com/docs/plans/hobby
- CDN Compression (05.03.2026): https://vercel.com/docs/how-vercel-cdn-works/compression
- Next.js `headers` (30.06.2026): https://nextjs.org/docs/app/api-reference/config/next-config-js/headers
- Hugging Face API, Dateilisten: https://huggingface.co/api/models/Xenova/whisper-base/tree/64da572 ,
  https://huggingface.co/api/models/Xenova/whisper-small/tree/2d67713
- transformers.js 4.3.0 `src/env.js` und `package.json`: https://unpkg.com/@huggingface/transformers@4.3.0/src/env.js
- onnxruntime-web 1.31.0-dev.20260914-8d85527a0, `dist/`: https://unpkg.com/onnxruntime-web@1.31.0-dev.20260914-8d85527a0/dist/
- Service Workers (W3C), `Cache.put` (206 → TypeError): https://w3c.github.io/ServiceWorker/#cache-put
- Messobjekte: https://7nyt0uhk7sse4zvn.public.blob.vercel-storage.com/front/docs/cdn/site-cdn-data-light.png (öffentlicher Blob aus
  der Vercel-Doku), https://nextjs.org/favicon.ico und https://nextjs.org/_next/static/immutable/chunks/3nv58-vama1zo.js
