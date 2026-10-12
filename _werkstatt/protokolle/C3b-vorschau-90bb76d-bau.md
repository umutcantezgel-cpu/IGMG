# Vorschau 90bb76d · Build-Protokoll per Vercel-MCP (Z-11, V-13)

Gelesen am 12.10. gegen 22:55 UTC, nur lesend (`list_deployments`, `get_deployment`, `list_deployment_events`).

- Deployment dpl_8vANSWLECM3FSWVr3g2gexoduq8U, Branch `claude/blissful-edison-x3j16w`, Commit 90bb76d: **READY**, Funktionsregion fra1, Bau in iad1 (4 Kerne, 8 GB), `Build Completed in /vercel/output [58s]`.
- Voriger Stand f9f7016 (dpl_ES6Sh6Mxo3Y7wTdMahL5EwYswdCG) und ff92cad (dpl_EPkjcqVFmknGqrZ1Ye9wtGn6C5Ww): READY.

Wörtlicher Ausschnitt `list_deployment_events` (builds=1) von „Creating an optimized production build“ bis „Running onBuildComplete“. In diesem Fenster stehen nur diese Ereignisse, also keine Turbopack-Warnung „Dynamic filesystem access“ und kein `Aborted`:

```
  Creating an optimized production build ...
✓ Compiled successfully in 20.8s
  Running TypeScript ...
  Finished TypeScript in 5.6s ...
  Collecting page data using 3 workers ...
  Generating static pages using 3 workers (0/466) ...
  Generating static pages using 3 workers (116/466)
  Generating static pages using 3 workers (232/466)
  Generating static pages using 3 workers (349/466)
✓ Generating static pages using 3 workers (466/466) in 11.3s
  Finalizing page optimization ...
  Running onBuildComplete from Vercel
```

Davor stehen (gekürzt) die Bauwarnungen von `scripts/vercel-bau.mjs`: `[bau] WARNUNG: DATABASE_URL fehlt – Bau mit Beispielinhalten aus einer PGlite-Bau-Datenbank (ADR 0017).` Sie sind gewollt, weil das Projekt heute ohne Datenbank läuft (ML-01). Danach kommen die Routentabelle und `Deployment completed`.

## Alle ERROR-Vorschauen des Laufs (`list_deployments state=ERROR`: 8, keine Produktion)

| Deployment | Commit | Fehlercode (`get_deployment`) | Ursache |
|---|---|---|---|
| dpl_5n3hnMohi4496ddhFoPuEVMpGvPM | 39c76b1 | BUILD_UTILS_SPAWN_1 | PGlite `RuntimeError: Aborted()` beim Sammeln der Seitendaten (3 Prozesse auf derselben Datei). Behoben in f9f7016/90bb76d |
| dpl_BAzbesiiuCYWQbXVRhyztVdu1FEH | ffc2cf6 | BUILD_UTILS_SPAWN_1 | Dieselbe Ursache, wörtlich: `Failed to collect page data for /[locale]/nachrichten/[slug]`, `[cause]: RuntimeError: Aborted(). Build with -sASSERTIONS for more info.` Behoben in f9f7016/90bb76d |
| dpl_Dm3m9rqPaFFxcCiYtpx6EHoaxr56 | 466ddfb | git_info_fail | Vercel konnte die Git-Angaben nicht lesen (nach 5 s, ohne Bauschritt). Kein Codefehler |
| dpl_5dY9LXRNkSL3PKvhJvDc4tXo151v | 830ab9f | git_info_fail | Wie oben |
| dpl_FfeizT9AnkKtZiJpev8CpJX6pz7o, dpl_2ZMMTTtMZpr6K8WM7uoQ4wxhvbq1, dpl_AaTbbcMwjqbqjGmhfYHfRcAS6dpu, dpl_JAGfyhu4nxq9Pe72w7JxCFZJhdZV | 13a4bb7, a659d42, 1934632, 4e19742 | lint_or_type_error | ZWISCHENSTAND-Commits mit halbfertigen Paketen innerhalb von 3 Minuten am 11.10. Nie auf `main` (L-E01: FF nur nach grünem Vorab) |

Seit der Behebung (f9f7016, ff92cad, 90bb76d) sind alle Vorschauen READY. Kein ERROR-Deployment war ein Produktions-Deployment. Berichtigung nach Endprüfung Lauf 4: Der Commit 39c76b1 kam trotz seiner fehlgeschlagenen Vorschau auf `main`. Der lokale Vorab war grün, die Vorschau hatte ich nicht abgewartet. Seine Produktion baute READY (dpl_8jbdVAyopENkp7qZXT8qfP71vBrU).
