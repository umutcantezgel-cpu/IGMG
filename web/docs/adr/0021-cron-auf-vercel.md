# ADR 0021 – Wiederkehrende Aufgaben als Vercel Cron Jobs

- Status: angenommen · 2026-10-11 · Letzter Lauf (Kern K-013, AUFTRAG V-06) · Bezug: ADR 0011, ADR 0017

## Ziel

Löschfristen und der erneute Versand des Mail-Ausgangs müssen auf Vercel ohne eigenen Server laufen – auch im Hobby-Tarif (höchstens täglich, Zeitpunkt nur auf die Stunde genau) und robust gegen ausgelassene oder doppelte Läufe.

## Wege

1. **Vercel Cron** (`crons` in `vercel.json`) ruft die Wartungsrouten per GET mit `Authorization: Bearer <CRON_SECRET>`; Sperre über `pg_try_advisory_xact_lock`, idempotente Aufgaben.
2. **Externer Taktgeber** (z. B. ein Dienst, der die POST-Routen mit WARTUNG_TOKEN aufruft).
3. **Nur `after()`** nach Anfragen (wie bisher für den Mail-Ausgang).

## Bewertung

Weg 2 bringt einen neuen Dritten (Leitplanke Datenschutz). Weg 3 versendet hängengebliebene Mails nur, wenn zufällig jemand ein Formular nutzt. **Weg 1 gewählt.**

## Festlegungen

- Routen: `/api/wartung/loeschfristen` und `/api/wartung/mail-ausgang`; GET mit `CRON_SECRET` (≥ 32 Zeichen, Vergleich in konstanter Zeit), POST mit `WARTUNG_TOKEN` bleibt für Docker/Handbetrieb.
- Zeitplan täglich nachts (UTC-Angabe in `vercel.json`), je Aufgabe eine Sperre; bei belegter Sperre `200 { uebersprungen: true }`.
- Aufgaben sind idempotent (Löschen nach Frist, Versand mit Status in der Datenbank).

## Umkehrprobe

Falsch, wenn ein täglicher Lauf zu selten ist (z. B. Mail-Ausgang). Dann auf Pro stündlich stellen (nur `vercel.json`), der Code bleibt gleich.

## Folgen zweiter Ordnung

- Vercel ruft Crons nur in der Produktion auf; Vorschauen haben keine Crons (gewollt).
