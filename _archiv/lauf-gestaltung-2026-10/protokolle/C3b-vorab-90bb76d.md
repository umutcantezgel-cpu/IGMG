# Vorab-Prüfung für den Fast-Forward auf main (L-E01) · 90bb76d (Bau ohne Datenbank verlässlich, Speicherprobe ohne Bauwarnung)

Anlass: Endprüfung Lauf 3 zu Z-11. Die Vorschau 39c76b1 brach mit `RuntimeError: Aborted()` ab, weil drei Bau-Prozesse dieselbe PGlite-Datei lasen. Außerdem stand im Bau die Turbopack-Warnung „Dynamic filesystem access“ (speicher-probe.ts).
Behebung in f9f7016 und 90bb76d (`web/src/lib/db/index.ts` `pgliteVerzeichnis()`, `web/scripts/vercel-bau.mjs`, `web/src/lib/startklar/speicher-probe.ts`):
- Jeder Bau-Prozess öffnet eine eigene Kopie unter `tmpdir()/igmg-pglite-bau/<pid>`.
- Kopien beendeter Prozesse werden beim Öffnen entfernt, der Ordner nach dem Bau.
- Der Pfad der Speicherprobe trägt `/*turbopackIgnore: true*/`.

```
== 22:48:17 vercel build --prod
[vc:service:web] ✓ Compiled successfully in 39.6s
[vc:service:web]   Collecting page data using 3 workers ...
[vc:service:web] ✓ Generating static pages using 3 workers (466/466) in 16.4s
BAU_RC=0
== 22:50:16 Datei-Verfolgung OG-Bilder (K-05)
NFT symbol-512.png in 3 OG-Spuren
NFT source-serif-4-latin-600-normal.woff in 3 OG-Spuren
NFT atkinson-hyperlegible-next-latin-700-normal.woff in 3 OG-Spuren
== 22:50:16 pnpm check
 Test Files  48 passed (48)
      Tests  818 passed | 3 expected fail (821)
CHECK_RC=0
== 22:51:33 geheimnisse:pruefen
GEHEIM_RC=0
== 22:51:34 fertig
```

Zusatzmessung während des Baus (Abtastung von `${TMPDIR:-/tmp}/igmg-pglite-bau/*`; danach `grep -c` im Bauprotokoll):

```
REV 90bb76d · max gleichzeitige Kopien: 3 · danach übrig: 0
Warnung Dateisystem: 0 · Aborted: 0
```

Vorlauf f9f7016 (nur eine Kopie je Prozess, noch ohne Aufräumen nach PID): BAU_RC=0, Tests 818, GEHEIM_RC=0, Warnung 0, Aborted 0, höchstens 3 Kopien, danach 3 übrig. Das führte zu 90bb76d.

Danach Fast-Forward `main` 39c76b1 → 90bb76d.
