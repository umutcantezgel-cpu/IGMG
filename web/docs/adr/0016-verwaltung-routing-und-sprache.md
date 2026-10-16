# ADR 0016 – Verwaltung: Routing, Sprache, Anmeldezustand

- Status: angenommen · 2026-10-11 · P1 · Bezug: K-01, K-02, K-03, K-06, K-18, Abschnitt 0 („Verwaltungsoberfläche: Deutsch“)
- Fortgeschrieben 16.10.2026 (Lauf „Lern-App“): Ausnahme nur für die Prüfoberfläche „Sprachprüfung“ der Lern-App (de/tr/ar) nach ADR 0041; die übrige Verwaltung bleibt Deutsch.

## Ziel

Die Verwaltung ist deutsch, liegt unter `/verwaltung/…` (K-03) im Baum `src/app/[locale]/verwaltung` (K-18) und beeinflusst die statischen öffentlichen Seiten nicht.

## Wege

1. Verwaltung unter `[locale]` mit allen drei Sprachen.
2. **Verwaltung unter `[locale]`, aber nur `de` erlaubt**; `/tr/verwaltung…`, `/en/verwaltung…` → Weiterleitung auf `/verwaltung…`.
3. Verwaltung außerhalb von `[locale]` (eigenes Root-Layout).

## Bewertung

Weg 1 verdreifacht Übersetzungsarbeit gegen die Vorgabe. Weg 3 widerspricht K-18. **Weg 2 gewählt.**

## Festlegungen

- `src/app/[locale]/verwaltung/layout.tsx` prüft `locale === 'de'`, sonst `redirect('/verwaltung…')`; der Proxy leitet `/(tr|en)/verwaltung/*` vorab um.
- Texte der Verwaltung stehen trotzdem in `messages/de.json` (Namensraum `verwaltung`, K-02: kein Text im Code); `tr.json`/`en.json` enthalten diesen Namensraum nicht – der Schlüsselabgleich (Z-03) nimmt ihn ausdrücklich aus.
- Öffentlicher Header: Schaltfläche „Anmelden“ führt zu `/verwaltung/anmelden`; kein angemeldeter Zustand auf öffentlichen Seiten (K-01). Die Konto-Funktionen des Designs (Kontomenü mit Dashboard, Styleguide, Meldung, Mein Konto, Einstellungen) liegen im Kopf der Verwaltung. Abweichung → ABWEICHUNGEN.md.
- `robots`: `/verwaltung` ist `noindex`, in `robots.ts` ausgeschlossen.

## Umkehrprobe

Falsch, wenn türkischsprachige Ehrenamtliche die Verwaltung nicht bedienen können – dann Namensraum `verwaltung` übersetzen und Sprachwahl im Konto ergänzen (kein Umbau nötig).

## Folgen zweiter Ordnung

- E2E der Verwaltung läuft nur auf Deutsch; Routenlauf (Z-01) umfasst öffentliche Routen × 3 Sprachen.
