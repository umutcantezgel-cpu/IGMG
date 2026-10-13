# Vorab-Prüfung für den Fast-Forward auf main (L-E01) · 255179b

Skript `$S/ff/vorab.sh`: Archivkopie des Stands, `vercel build --prod` ohne Datenbank (wie das Projekt heute), Datei-Verfolgung der OG-Bilder, `pnpm check`, `geheimnisse:pruefen`. Auszug aus `$S/ff/vorab-255179b.log`:

```
== 20:58:48 vercel build --prod
BAU_RC=0
== 21:00:47 Datei-Verfolgung OG-Bilder (K-05)
NFT symbol-512.png in 3 OG-Spuren
NFT source-serif-4-latin-600-normal.woff in 3 OG-Spuren
NFT atkinson-hyperlegible-next-latin-700-normal.woff in 3 OG-Spuren
== 21:00:47 pnpm check
 Test Files  46 passed (46)
      Tests  814 passed | 3 expected fail (817)
CHECK_RC=0
== 21:01:57 geheimnisse:pruefen
GEHEIM_RC=0
== 21:01:57 fertig
```

Danach Fast-Forward `main` 2b930f7 → 255179b.
