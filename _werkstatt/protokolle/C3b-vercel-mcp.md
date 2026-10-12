# Vercel per MCP (nur lesend) · 2026-10-12 19:12 UTC · Z-11 nach FF main → 2b930f7

Projekt `igmg` (prj_texCeXPLaac0TJIJguJJxEpMo7Dx), Team team_2CbCrbfjCqDwpPhWm0nOWRT0.
Werkzeuge: `list_deployments`, `get_deployment`, `get_runtime_errors`, `get_runtime_logs`. Es gab keine schreibenden Aufrufe und keine Abrufe geschützter URLs.

## Deployments
| Deployment | Ziel | Commit | Zustand | Region |
|---|---|---|---|---|
| dpl_CWTKhUJWKbQjBtC5w8fhwC9oNoSq | **Produktion** (`main`, Aliase igmg-five.vercel.app, igmg-codays-projects.vercel.app) | 2b930f7 | READY (Bau 104 s) | fra1 |
| dpl_EwaFAiwcinvXRueuyMyHHjC9hn2w | Vorschau (Branch `claude/blissful-edison-x3j16w`) | 3ac362e | READY | – |
| dpl_9zDEcnR9xujWev3hPQdBDeARCeu1, dpl_CrGtZ81euJj79KLR3VRQVTft4YYz, dpl_2QPkHCjbaNLTbpqA9borgV18AVTQ, dpl_FAiDAnCmQHDNLfLgZtfvNu6TWnee | Vorschau | 6e76848, 9214738, 8a397eb, 6464993 | READY | – |
| dpl_Epw2S6zkLgTGmfUiEKJBMn47XWyk | Vorschau | 325c38a | CANCELED (von 8a397eb überholt) | – |

Kein Deployment im Zustand ERROR.

## Laufzeitfehler (24 h, gruppiert)
- **Ausnahmefehler:** keine seit 08:14 UTC.
  - Die Gruppen „DATABASE_URL fehlt (Betrieb braucht PostgreSQL)“ (108), „BETTER_AUTH_SECRET fehlt“ (17 + 5 + 3 × 1) und „DYNAMIC_SERVER_USAGE /[locale]/opengraph-image“ (3 + 1) enden zwischen 07:00 und 08:14 UTC.
  - Alle stammen von Deployments vor der Behebung ce6e6a5 (dpl_6TbZ2EHSvjH1UZAPqNAAhQSbCC7Q, dpl_5Tvd5XVW2BYimH1u2Bos6MeHBMa3, dpl_DF7tpVcMG5zRthE6uAq6L2H2gEbU); siehe `protokolle/C-produktionsfehler.md`.
- **Gewollte Meldungen der Startprüfung** (je 47×, zuletzt 19:11:30 UTC auf dpl_CWTKhUJWKbQjBtC5w8fhwC9oNoSq):
  - `[start] DATABASE_URL`, `BETTER_AUTH_SECRET`, `RATE_GEHEIMNIS`, `ALTCHA_GEHEIMNIS`, `EINGANG_SCHLUESSEL`, `WARTUNG_TOKEN`, `CRON_SECRET`, `MAIL_TRANSPORT`, `MAIL_ABSENDER`, `SMTP_HOST`, `SPEICHER`.
  - Das sind die Menschen-Werte aus MENSCHEN ML-21 und GO-LIVE. Sie verschwinden, sobald die Werte eingetragen sind.
- **Laufzeitprotokoll der neuen Produktion (30 min):** Der erste Abruf (`GET /quran/2`, 19:11:31 UTC, fra1) zeigt nur diese Startmeldungen, keinen Fehler.

## Abruf der Hauptansichten
- Ein direkter Abruf von `https://igmg-five.vercel.app/…` aus dieser Umgebung ist nicht möglich: Die Netzwerkregel der Cloud-Umgebung verweigert die Verbindung (Proxy 403).
- Ersatz:
  - `vercel build --prod` des Stands in einer Archivkopie, grün (`$S/ff/vorab-2b930f7.log`), also derselbe Bau wie auf Vercel;
  - Stufe C am Build 325c38a (Hauptansichten und Stichprobe HTTP 200, unbekannte Adressen 404; `C-statuscodes.txt`, `C-lauf.log` Schritt 3b);
  - die Laufzeitfehler-Gruppen oben ohne Ausnahmefehler auf dem neuen Deployment.

## Einordnung für Z-11
- Produktion READY in fra1, ohne Ausnahmefehler; nur die gewollten Startmeldungen über Menschen-Werte.
- Vorschauen des Arbeitsbranchs READY.
- Die Vorschau ist über Vercel Authentication geschützt (V-09) und wird nicht abgerufen (G3).

## Nachtrag 21:08 UTC · FF main → 255179b (App 66965d0: Verwaltungs-Hülle mit INP-Behebung)
- **Vorab:** grün (`protokolle/C3b-vorab-255179b.md`): `vercel build --prod`, `pnpm check` (unit 814), `geheimnisse:pruefen`.
- **Produktion** dpl_FnfyEKRGwG5fsu8vhpGzFeyqXrHf: READY (Bau 92 s), Region fra1, Commit 255179b, Aliase igmg-five.vercel.app und igmg-codays-projects.vercel.app.
- **Laufzeitfehler (3 h):** keine Ausnahmefehler. Es gibt nur die 11 gewollten Startmeldungen (`[start] …` über die Menschen-Werte, ML-21), zuletzt 19:11:30 UTC.

## Nachtrag 22:20 UTC · FF main → 39c76b1 (V-05 Direkt-Upload großer PDF-Dateien, V-11 Speicherprobe)
- **Vorab:** grün (`protokolle/C3b-vorab-39c76b1.md`): `vercel build --prod`, `pnpm check` (unit 818), `geheimnisse:pruefen`.
- **Produktion** dpl_8jbdVAyopENkp7qZXT8qfP71vBrU: READY (Bau 102 s), Region fra1, Commit 39c76b1, Aliase igmg-five.vercel.app und igmg-codays-projects.vercel.app, Rollback-Kandidat.
- **Laufzeitfehler (2 h):** keine Fehlergruppe.
