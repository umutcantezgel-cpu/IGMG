# ADR 0015 – Seeds, Beispielinhalte und Personennamen

- Status: angenommen · 2026-10-11 · P1 · Bezug: G-04, G-05, K-05, Abschnitt 9 („Seeds übernehmen alle Inhalte aus bestand/ mit Quellenvermerk; Beispielwerte werden als Platzhalter markiert“), E-005c

## Ziel
Die App startet mit allen Inhalten aus Bestand und Design, ohne erfundene Fakten zu verbreiten und ohne Personennamen, deren Echtheit ungeklärt ist; Ehrenamtliche sehen sofort, was noch geprüft werden muss.

## Wege
1. **Bestandsinhalte unverändert** als normale Inhalte seeden.
2. **Bestandsinhalte mit Kennzeichnung** `ist_beispiel = true` + `quelle` (Datei:Zeile); öffentlich mit Hinweis „Beispielinhalt“ (wie im Design), in der Verwaltung mit Filter „noch zu prüfen“; Personennamen durch `[Name – Funktion]` ersetzt.
3. **Leere Datenbank**, nur Platzhalter.

## Bewertung
Weg 1 verbreitet Beispieltermine aus 2024 und Beispielnamen als Fakten (G-05). Weg 3 verwirft die vorhandenen Texte (Abschnitt 9). **Weg 2 gewählt.**

## Festlegungen
- Jede Inhaltstabelle hat `ist_beispiel boolean default false` und `quelle text null`.
- Seeds unter `web/drizzle/seeds/` (TypeScript), Daten aus `_lauf/blaetter/` bzw. maschinell aus dem Bestand; jede Zeile mit `quelle`.
- Personennamen (Vorstand, Imame, Referenten, Zitatgeber, „Experten“) → `[Name – Funktion]`; Funktionen (z. B. „Vorsitzender“) bleiben. Kontaktdaten aus dem Bestand: Beispielwerte nur dort, wo das Design sie zeigt (z. B. `info@igmg-wetzlar.de` mit Kennzeichnung), sonst Platzhalter `[Telefonnummer]`, `[Adresse]`.
- Beispieltermine bekommen ihr Originaldatum (meist 2024/2025) → erscheinen als vergangen; wiederkehrende Termine („Jeden Samstag“) als rrule ab heute, gekennzeichnet.
- Religiöse Texte nie in Seeds außer nach ADR 0009.
- Seed-Lauf ist idempotent (`pnpm db:seed`), Testdaten getrennt (`tests/fixtures`, „Testperson Eins“).

## Umkehrprobe
Falsch, wenn die Gemeinde die Bestandsinhalte bereits bestätigt hat – dann `ist_beispiel` per Verwaltung abschalten (ein Klick je Inhalt).

## Folgen zweiter Ordnung
- Startseite zeigt anfangs vergangene Beispieltermine kaum → Leerzustände müssen gut aussehen (Design-Zustände 07/08).
