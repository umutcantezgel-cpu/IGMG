# Vercel per MCP (nur lesend) · 2026-10-12 06:46 UTC · Z-11

Projekt `igmg` (prj_texCeXPLaac0TJIJguJJxEpMo7Dx), Team team_2CbCrbfjCqDwpPhWm0nOWRT0, Preset `services`.
Werkzeuge: `list_deployments`, `get_deployment`, `get_runtime_errors` (keine schreibenden Aufrufe, keine Abrufe geschützter URLs).

## Deployments (letzte 12)

| Deployment | Ziel | Commit | Zustand | Region |
|---|---|---|---|---|
| dpl_5RDkcAe97uNMjxwesxHAcGm4pZjc | Vorschau (Branch `claude/blissful-edison-x3j16w`) | e0c8e9f (Perf III) | READY, Bau 79 s | fra1 |
| dpl_G486qJ6Jfxr6RoJtqT3Jn5Rz7dkp | Vorschau | b702c7c | READY | – |
| dpl_5Tvd5XVW2BYimH1u2Bos6MeHBMa3 | **Produktion** (`main`) | 71e263f (Merge PR #3) | READY, Rollback-Kandidat | fra1 (früher gelesen) |
| weitere 9 Vorschauen | Vorschau | ZWISCHENSTAND-/Arbeitsstände | 7 READY, 2 CANCELED (von neueren Pushes überholt) | – |

Kein Deployment im Zustand ERROR.

## Laufzeitfehler (24 h, gruppiert)

- **Seit 11.10. 19:28 UTC keine Ausnahmefehler mehr.** Die Gruppen „DATABASE_URL fehlt“ (1037) und „BETTER_AUTH_SECRET fehlt“ (36 + 15) enden mit dem Beispielmodus ohne Datenbank (Commit vom 11.10. abends, `BERICHT.md`), ebenso „APP_URL fehlt“ (11.10. 12:15).
- **Erwartete Meldungen der Startprüfung** (`web/src/lib/umgebung.ts`), je 5× zwischen 12.10. 01:00 und 06:45 UTC auf der Produktion, bei jedem Kaltstart einmal: `[start] DATABASE_URL / BETTER_AUTH_SECRET / ALTCHA_GEHEIMNIS / RATE_GEHEIMNIS / EINGANG_SCHLUESSEL / WARTUNG_TOKEN / CRON_SECRET / MAIL_TRANSPORT / MAIL_ABSENDER / SMTP_HOST fehlt (Betriebsart produktion)` und `SPEICHER steht auf dateisystem`. Das sind genau die Werte, die laut `MENSCHEN.md` (Reihenfolge zum Livegang) Menschen eintragen; die Startprüfung meldet sie absichtlich laut. Auslöser sind die Cron-Aufrufe (`/api/wartung/loeschfristen`, `/api/wartung/mail-ausgang`) und die Middleware.
- Für die Vorschau dpl_5RDkcAe97uNMjxwesxHAcGm4pZjc ist keine Fehlergruppe verzeichnet.

## Einordnung für Z-11
- Vorschau des Arbeitsbranchs: Bau READY, Region fra1, ohne Laufzeitfehler-Gruppe.
- Produktion: READY in fra1; das Protokoll enthält nur die Meldungen der Startprüfung über noch fehlende Menschen-Werte.
- Die Hauptansichten der Vorschau sind über Vercel Authentication geschützt (V-09). Sie werden nicht abgerufen (G3: kein `web_fetch_vercel_url`/`get_access_to_vercel_url`). Ersatz: `vercel build` preview + production im Archiv (Stufe C Schritt 10, `protokolle/C-vercel-build-*.log`) und der Abruf der Produktion `igmg-five.vercel.app` durch den Haiku-Prüfer nach jedem Fast-Forward.
