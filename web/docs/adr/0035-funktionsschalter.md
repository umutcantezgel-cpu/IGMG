# ADR 0035 – Funktionsschalter für riskante Bereiche

- Status: angenommen (umgesetzt 13.10.2026) (Lauf Gemeinde-Plattform) · Bezug: Plan „Gemeinde-Plattform“ Ziel, §2.8, §6 (Fast-Forward mit Produktionsschaltern), §7 (Z-20)

## Kontext

- Konten, Lernplattform, Chat, Echtzeit, Push, Hatim, Newsletter, Rezitationen und die Ramadan-Vorschau betreffen Personendaten oder Kinder. Sie dürfen in der Produktion erst laufen, wenn Menschen freigegeben haben (Ziel des Plans).
- Der Vorlauf wird über `main` ausgeliefert. Der riskante Code muss im Repository liegen, darf aber ausgeschaltet sein.
- Ein Fast-Forward nach `main` darf keine Funktion aktivieren, die noch nicht freigegeben ist.

## Entscheidung

1. **Modul** `src/lib/funktionen.ts`. Die Einstellung liegt in der Datenbank. In der Produktion übersteuert die Umgebungsvariable `FUNKTION_<NAME>=an|aus` die Datenbank.
2. **Schalter:** `konten`, `lernplattform`, `chat`, `echtzeit`, `push`, `push_gebet`, `hatim`, `newsletter`, `hadith_gesamt`, `rezitation_<id>`, `ramadan_vorschau`.
3. **Produktion:** Alle Schalter für Personendaten sind aus.
4. **Cockpit-Sperren:**
   - `chat` nur mit bestätigter DSFA, Schutzkonzept und mindestens zwei Erwachsenen je Gruppe
   - `push` nur mit VAPID
5. **Ausgeschaltet** heißt `notFound()`. Die Links verschwinden aus Menüs und Kopfzeile.
6. **Schalten** ist ein eigenes Recht (`funktion.schalten`, ADR 0026).
7. **Oberfläche:** Einstellungen mit den Bereichen Allgemein, Funktionen und Anzeige.
8. **Fast-Forward nach `main`** nur mit Produktionsschaltern, die `startklar` prüft (Plan §6).

## Alternativen

- Keine Schalter, Freigabe nur über den Branch: verworfen. Der Plan liefert über `main` aus und braucht die Schalter in der Produktion.
- Nur Datenbank-Schalter: nicht gewählt. Die Umgebung übersteuert die Datenbank in der Produktion (Plan §2.8).
- Hinweisseite statt `notFound`: nicht gewählt. Der Plan verlangt 404.
- Feature-Flag-Dienst eines Drittanbieters: verworfen („ohne Drittanbieter“).

## Folgen

- Tests: Schalter aus ergibt 404 (Integration). Links verschwinden. Die Umgebung übersteuert die Datenbank.
- Z-20: Produktionsschalter sind sicher. `startklar` prüft sie vor jedem Fast-Forward.
- Risiko: ein falsch gesetzter Schalter in der Produktion. Abwehr: Negativtests und die Sicherheitsprüfung S1 bis S3, die Befunde „hoch“ oder „kritisch“ blockieren den Fast-Forward.
- Die Rechte-Matrix (ADR 0026) und die Schalter greifen zusammen: Eine Funktion ohne Recht und ohne Schalter ist nicht erreichbar.
