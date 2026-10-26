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

## Fortschreibung Lern-App (L1-01, 20.10.2026; KERN 4.0 §6, ADR 0038, 0041, 0042, 0043)

1. **Nr. 2, neue Schalter:** `lernapp`, `lernapp_ungeprueft`, `lernapp_sprechen`, `lernapp_meldungen`, `lernapp_sync`, `lernapp_gruppen`, `lernapp_rangliste`, `lernapp_statistik`, `push_lernapp` (`src/lib/funktionen-regeln.ts`, Einstellung `funktionen`, Umgebung `FUNKTION_<NAME>`).
2. **Nr. 3, Produktion:** `lernapp` bleibt aus bis zur Abnahme der Lern-App _(fortgeschrieben durch L3-E12b: in der Produktion an seit 21.10.2026 – „Fortschreibung Lern-App 2“ Nr. 1)_. `lernapp_ungeprueft` (Hinweis statt Sperre, ADR 0041 Nr. 8) und `lernapp_meldungen` (anonym, nur Kategorien) stehen in `IN_PRODUKTION_AN`; sie wirken erst mit `lernapp`. `lernapp_sync`, `lernapp_gruppen`, `lernapp_rangliste`, `lernapp_statistik` und `push_lernapp` zählen zu `MIT_PERSONENDATEN`.
3. **Nr. 4, Sperren:** `VORAUSSETZUNGEN` je Schalter; `funktionAn` fragt `entscheideWirksam` (selbst an und alle Voraussetzungen wirksam). Jeder Lern-App-Schalter braucht `lernapp`; dazu `lernapp_sync` → `konten`, `lernapp_gruppen` → `lernplattform`, `lernapp_rangliste` → `lernapp_gruppen`, `push_lernapp` → `push` (VAPID wie `push`). Das Cockpit meldet ausdrücklich eingeschaltete, aber gesperrte Schalter („Gesperrte Schalter“, in der Produktion als Warnung).
4. **Nr. 5:** Ausgeschaltet heißt auch in der Lern-App 404. Entscheidet die Umgebung (`FUNKTION_LERNAPP=aus`), antwortet schon der Proxy mit der 404-Seite der Lern-App; sonst entscheiden die Seiten. _(Ausnahme S-L3 N-4 für statische Dateien unter `/lern-app/` – „Fortschreibung Lern-App 2“ Nr. 2.)_

## Fortschreibung Lern-App 2 (26.10.2026, nach der Endabnahme Stufe C; `_lernapp/ENTSCHEIDUNGEN.md` L3-E12b, `_lernapp/GO-LIVE.md` „Ausnahme N-4“)

1. **Nr. 3 der Fortschreibung Lern-App, fortgeschrieben durch L3-E12b (Nutzer, 21.10.2026):** `lernapp`, `lernapp_ungeprueft` (mit dem Hinweis „noch nicht von Muttersprachlern geprüft“, ADR 0041 Nr. 8) und `lernapp_meldungen` sind in der Produktion standardmäßig an (`IN_PRODUKTION_AN` in `src/lib/funktionen-regeln.ts`, seit `a023cf1`). Der Satz „`lernapp` bleibt aus bis zur Abnahme der Lern-App“ gilt nicht mehr. Die Schalter mit Personendaten (`lernapp_sync`, `lernapp_gruppen`, `lernapp_rangliste`, `lernapp_statistik`, `push_lernapp`; `MIT_PERSONENDATEN`) bleiben in der Produktion aus, `lernapp_sprechen` bis zum Gerätetest (LM-07). Abschalten jederzeit mit `FUNKTION_LERNAPP=aus` in der Umgebung.
2. **Nr. 5, Ausnahme S-L3 N-4:** Statische Dateien unter `/lern-app/` (`public/lern-app/`: Modelle ≈ 95 MB, App-Symbole) liefert Next vor jeder Route aus; bei `lernapp` aus bleiben sie mit 200 abrufbar. Grund: `lernapp` ist an (Nr. 1); die Dateien enthalten keine Personendaten und keine Inhalte außer Modellgewichten (Lizenz ADR 0042), Programmcode und Symbolen. Ersatz: Unter `/lern-app/sw.js` liefert der Proxy bei `FUNKTION_LERNAPP=aus` den Abmelde-Worker (`public/lern-app/sw-abmelden.js`, `src/proxy.ts`): Er löscht die Vorräte der Lern-App außer den Modellen, meldet sich ab und lädt offene Seiten neu. Abschalten nur über die Einstellung im Cockpit (ohne Umgebung) ersetzt den Worker nicht. Vor dem Einschalten von `lernapp_sprechen` eine Ratenregel der Vercel-Firewall oder eine Modell-Route mit Schalterprüfung; Kosten nach LM-15 beobachten (`_lernapp/GO-LIVE.md`).
