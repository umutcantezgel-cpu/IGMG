# ADR 0022 – Umgebung und Betriebsart (SITE_MODE), eine gemeinsame Prüfung

- Status: angenommen · 2026-10-11 · Letzter Lauf (Kern K-013, AUFTRAG V-03, V-09, V-11) · Bezug: Kern 2.0 K-21/K-30

## Ziel

Dieselbe App läuft lokal, in Vorschauen und in Produktion. Fehlende oder falsche Variablen sollen beim Start, im Startklar-Cockpit und in `pnpm startklar` gleich verständlich gemeldet werden; Vorschauen dürfen nicht indexiert werden und brauchen eine eigene Adresse.

## Wege

1. **Eine typisierte Liste in `src/lib/umgebung.ts` (zod)** mit Zweck, Pflicht je Betriebsart, Bereich, Herkunft; reine Prüffunktion, genutzt von Startprüfung, Cockpit und CLI.
2. Prüfungen verteilt in den Modulen lassen (Status quo).
3. Externes Werkzeug zur Umgebungsprüfung.

## Bewertung

**Weg 1 gewählt:** eine Quelle, testbar (jede gelesene Variable muss in der Liste stehen), keine neue Abhängigkeit (zod ist vorhanden).

## Festlegungen

- Betriebsart: `SITE_MODE` (`entwicklung` | `vorschau` | `produktion`), sonst aus `VERCEL_ENV`, sonst aus `NODE_ENV`.
- Öffentliche Adresse: `APP_URL`; in `vorschau` ohne APP_URL `https://$VERCEL_BRANCH_URL` (Auth-baseURL und vertrauenswürdige Ursprünge folgen).
- Vorschau: `robots` mit `disallow: /` und Kopfzeile `X-Robots-Tag: noindex`; geschützt durch Vercel Authentication (Projekt-Einstellung, nur dokumentiert).
- Geheimnisse entstehen per `pnpm geheimnisse:erzeugen` (nie im Repo); `NEXT_PUBLIC_` trägt nur Öffentliches (Prüfung).
- `docs/deploy/VERCEL-ENV.md` wird aus derselben Liste gepflegt.

## Umkehrprobe

Falsch, wenn Vercel Variablen umbenennt (z. B. `VERCEL_BRANCH_URL`). Dann bricht nur die Vorschau-Adresse; Rückfall auf `VERCEL_URL` ist eingebaut.

## Folgen zweiter Ordnung

- Neue Variablen müssen in die Liste, sonst schlägt der Test fehl – gewollt.
