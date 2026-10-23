# S-L2 – Sicherheitsprüfung Sync, Schreibabgaben, Rechte

| | |
|---|---|
| Datum | 23.10.2026 |
| Prüfer | frischer Sicherheits-Agent (Prüfstufe S, PLAN §14 L5-S, KERN 4.0 §5–§6, `_gemeinde/KERN.md`) |
| Gegenstand | Branch `claude/trusting-lovelace-6nfolz`, Hauptarbeitsbaum `/home/user/IGMG`, Stand `42b784bd` (Code gleich `93b9fe9d`: L5-03 Korrekturweg gemergt in `8a01d44b`, Next 16.4.2), nur gelesen |
| Umfang | (1) Abgleich `/api/lernapp/sync` (Idempotenz, Größen- und Ratengrenzen, fremde Konten, Einwilligung, Schalter, CSRF/Ursprung); (2) Schreibabgaben und Korrekturweg: `web/src/app/api/lernapp/schreiben/route.ts`, `web/src/lib/lernapp/schreiben/{abgabe,regeln,dienst}.ts`, `web/src/server/actions/lernapp-schreiben.ts`, Lehrkraft-Seite `web/src/app/[locale]/(konto)/mein-bereich/unterricht/[gruppe]/lern-app/page.tsx`, Inseln `Abgabe.tsx`/`EigeneAbgaben.tsx`, Export `web/src/server/queries/konto.ts`, Löschlauf `web/src/lib/loeschen/gemeinde.ts`; (3) Rechte-Matrix (`web/src/lib/rechte/{matrix,gruppen,gemeinde}.ts`) und Schalter in der Produktion (`web/src/lib/funktionen-regeln.ts`, Startklar) |
| Vorgehen | Verfahren wie S-L1/S-L3: Datenfluss je Prüfbereich vom Eingang bis Speicher bzw. Antwort verfolgt; nur ausnutzbare oder regelverletzende Befunde mit Pfad. Betroffene Tests ausgeführt (Node 24, PGlite); vier eigene Proben nur im Scratchpad (`/tmp/claude-0/-home-user-IGMG/5899b547-bfdb-5933-87a3-0b05226c4116/scratchpad/s-l2/proben/s-l2-proben.test.ts`, eigene Vitest-Konfiguration daneben). Live-Umgebung nur per GET/HEAD. Kein Next-Bau, kein E2E. Am Repository nichts geändert, keine Commits. |

## Ergebnis

**Keine kritischen, keine hohen Befunde.** 1 × mittel (latent), 2 × niedrig, 4 Hinweise. Das Torkriterium „S-L2 ohne
hoch/kritisch“ (PLAN §14, Tor L5) ist erfüllt. **Freigabe mit Auflagen:**

- **M-1** vor dem Einschalten von `lernapp_gruppen` in der Produktion beheben (Entscheidung D-L16 treffen **und** technisch
  umsetzen; bis dahin harte Sperre).
- **N-2** zusammen mit S-L3 N-2 (Lebenszyklus der Einwilligung `lernapp`) vor `lernapp_sync` bzw. `lernapp_gruppen` (LM-08).
- **N-1** bis zur Abnahme (L8-05) oder als AUSNAHME mit Grund.
- Hinweise H-1 bis H-4 bei Gelegenheit.

Heute in der Produktion nicht ausnutzbar: `konten`, `lernplattform`, `lernapp_sync` und `lernapp_gruppen` sind aus
(`MIT_PERSONENDATEN`, nicht in `IN_PRODUKTION_AN`), und die Einwilligung `lernapp` lässt sich noch nicht erteilen.

| Nr. | Schwere | Kurzfassung | Ort |
|---|---|---|---|
| M-1 | mittel (latent) | Kommentar der Lehrkraft zur Abgabe eines Kindes ist ein unbeobachteter Freitext-Kanal Erwachsene/r → einzelnes Kind (ohne zweite erwachsene Person, ohne Eltern, ohne Meldeweg, ohne Zeitfenster), jederzeit spurlos überschreibbar; nur als offene Entscheidung D-L16 vermerkt, nicht gesperrt | `web/src/lib/lernapp/schreiben/dienst.ts:424-464`, `web/src/server/actions/lernapp-schreiben.ts:30-67`, `web/src/components/lernapp/inseln/EigeneAbgaben.tsx:162-166`, `web/src/lib/startklar/gemeinde.ts:60`, `web/docs/recht/entwuerfe/dsfa-lernapp.md:291` |
| N-1 | niedrig | NIE_PER_ADMINISTRATION nur in einer Richtung: Eine Lehrkraft mit Gruppenleitung bekommt nachträglich die Rolle Administration, behält die Leitung und liest als Konto mit Administration die Schreibabgaben (und Chats) ihrer Gruppe | `web/src/server/actions/benutzer.ts:161-180`, `web/src/lib/rechte/schutzrollen.ts:53-63`; Gegenstücke `web/src/server/actions/gemeinde-konten.ts:65-67`, `web/src/server/actions/gruppen.ts:150` |
| N-2 | niedrig | Abgaben überdauern Austritt und Widerruf; Wiedereintritt (gleiche Zeile, `bis = null`) und Wechsel der Lehrkraft machen alte Abgaben samt Kommentar der vorigen Lehrkraft wieder bzw. neu lesbar; bei ausgeschaltetem Schalter gibt es keinen Weg, eine Abgabe zu finden und zu löschen | `web/src/lib/lernapp/schreiben/dienst.ts:313-368`, `web/src/server/actions/gruppen.ts:123, 228, 251`, `web/src/server/actions/lernende.ts:77`, `web/src/app/api/lernapp/schreiben/route.ts:51, 65-75`, `web/src/lib/lernapp/schreiben/dienst.ts:467-497` |

---

## M-1 (mittel, latent) – Kommentar der Lehrkraft an Kinder: Freitext-Kanal ohne Schutzmechanismen

**Ort:** `web/src/lib/lernapp/schreiben/dienst.ts:424-464` (`gibZurueck`: Kommentar bis 4.000 Zeichen, ersetzt bei jedem
Aufruf den bisherigen, keine Historie), `web/src/server/actions/lernapp-schreiben.ts:30-67` (keine Bremse, kein Zeitfenster),
`web/src/components/lernapp/inseln/EigeneAbgaben.tsx:162-166` (das Kind liest den Kommentar), `web/src/lib/startklar/gemeinde.ts:60`
(Voraussetzung für `lernapp_gruppen` nennt nur LM-08, nicht D-L16), `web/docs/recht/entwuerfe/dsfa-lernapp.md:291` (D-L16 offen).

**Ausnutzungspfad (Ablauf aus Code und Tests, kein Angreifer von außen nötig):**
1. Ein Kind (unter 16, Einwilligung `lernapp` der Eltern) ist Mitglied einer Gruppe; die Lehrkraft weist eine Lektion mit
   Schreibaufgabe zu. Das Kind sendet bis zu 3 Texte je Aufgabe und Gruppe, insgesamt 200, je bis 8.000 Zeichen Freitext.
2. Die Lehrkraft schreibt je Abgabe einen Kommentar (bis 4.000 Zeichen); das Kind liest ihn unter „Meine Schreibabgaben“.
   Jede weitere Rückgabe ersetzt den Kommentar spurlos (Probe P2: zweiter Kommentar ersetzt den ersten, kein Rest in der
   Datenbank; das Audit nennt nur „zurückgegeben“ mit Kennung).
3. Niemand sonst sieht diesen Austausch: Aufsicht, Eltern, Rolle `kinderschutz` und Administration lesen nie (gewollt,
   `lehrkraftLiest`); es gibt keinen Melde-Knopf und kein Zeitfenster.

**Auswirkung:** Faktisch ein 1:1-Kanal zwischen einer erwachsenen Person und einem Kind, unbeobachtet, verschlüsselt und
nachträglich änderbar. Das widerspricht KERN 4.0 §5 („Keine Freitext-Kommunikation zwischen Personen“) und den
Kinderschutzregeln der Gemeinde-Plattform für Freitext mit Kindern (S-01 keine Direktnachrichten, S-02 zwei Erwachsene,
S-06 Zeitfenster, S-07/S-08 Melden an Lehrkräfte und `kinderschutz`, S-10 unveränderliches Protokoll). Die Spannung ist in
der Gegenprüfung L5-03 erkannt und als D-L16 in den DSFA-Entwurf übernommen, aber technisch nicht gesperrt: Startklar und
Schalter erlauben `lernapp_gruppen` mit LM-08 allein. Latent, weil `lernapp_gruppen` und `konten` in der Produktion aus sind.

**Behebung:**
1. D-L16 durch Kinderschutz, DSB und Bildung entscheiden lassen. Bis dahin für Abgaben von Konten mit Lage „eltern“
   (Kinder, `lernappEinwilligung`) nur Prüfliste und Einstufung zulassen, kein Freitext (Action und Dienst lehnen
   `kommentar` ab; Formular blendet das Feld aus).
2. Wird der Kommentar für Kinder zugelassen: Kommentar und Prüfliste auch den sorgeberechtigten Eltern (bestätigter Bezug)
   zeigen **oder** einen Knopf „Kommentar melden“ an Lehrkräfte und `kinderschutz` (wie S-07/S-08, Meldekontext nur diese
   Abgabe, Audit); Kommentare nur anhängen statt ersetzen (Fassungen mit Zeitpunkt, Löschfrist wie die Abgabe); Bremse für
   Rückgaben (z. B. 60 je Stunde und Lehrkraft); Zeitfenster wie S-06 erwägen.
3. Harte Sperre: `startklar` meldet Rot, solange `lernapp_gruppen` an ist und D-L16 nicht entschieden ist (Eintrag in
   `VORAUSSETZUNG` und Prüfung); Integrationstest „Kinderabgabe: Kommentar abgelehnt bzw. für Eltern sichtbar/meldbar“.

## N-1 (niedrig) – Administration nachträglich an eine Lehrkraft mit Gruppenleitung

**Ort:** `web/src/server/actions/benutzer.ts:161-180` (`rollenSpeichern` prüft mit `schutzrollenRegel` nur Leitung und
Kinderschutz gegen Administration), `web/src/lib/rechte/schutzrollen.ts:53-63`. Die Gegenrichtung ist gesperrt:
`web/src/server/actions/gemeinde-konten.ts:65-67` (keine Kontoart mit Gruppenzugang für Konten mit Administration),
`web/src/server/actions/gruppen.ts:150` (keine Leitung für Konten mit Administration), `web/src/lib/konto/einladung.ts:155`.

**Nachweis (Probe P1, PGlite):** Lehrkraft L mit Leitung der Gruppe G und einer lesbaren Abgabe; Administration ruft
`rollenSpeichern({ id: L, rollen: ['administration'] })` → `{ ok: true }`. Danach: Rollen von L = `administration`,
Gruppenleitung bleibt (1), `darfInGruppe(…, 'aufgabe.bearbeiten', G)` = true, `abgabenDerGruppe` liefert 1 Abgabe.

**Auswirkung:** Ein Konto mit Administration liest Schreibabgaben (und Gruppen- und Elternkanal) – genau der Zustand, den
NIE_PER_ADMINISTRATION (S2/S3) ausschließen soll; als Konto mit Administration kann es zudem Mitgliedschaften der eigenen
Gruppe ändern (vgl. N-2: Wiedereintritt macht alte Abgaben lesbar). Keine Rechteausweitung für die vergebende Person, daher
niedrig. Ursache liegt im Code der Gemeinde-Plattform (`web/src/server/actions/benutzer.ts`, nicht im abgeschlossenen
Ordner `_gemeinde/`).

**Behebung:** In `rollenSpeichern` (und jedem anderen Weg zur Rolle `administration`, z. B. Einladung mit Verwaltungsrolle
an ein bestehendes Konto) ablehnen, wenn das Konto Gemeinde-Rollen außer `gemeinde` oder eine Gruppenleitung hat (neuer
Fehler, z. B. `administrationGruppenzugang`); zusätzlich in `ladeGruppenKontext` Leitung, Lerndatensatz und Kinder für
Konten mit Administration leer lassen (Verteidigung in der Tiefe). Regressionstest in `sicherheit-s2-konten.test.ts`.

## N-2 (niedrig) – Abgaben überdauern Austritt und Widerruf; Wiedereintritt macht sie wieder lesbar

**Ort:** `web/src/lib/lernapp/schreiben/dienst.ts:313-368` (`lesbare`: nur „laufendes Mitglied“, ohne Bezug zum Zeitraum
der Mitgliedschaft und zur Lehrkraft, an die gesendet wurde), `web/src/server/actions/gruppen.ts:228` (Wiedereintritt =
`ON CONFLICT … SET bis = null`, `seit` bleibt), `:123, :251` und `web/src/server/actions/lernende.ts:77` (Austritt setzt nur
`bis`), `web/src/app/api/lernapp/schreiben/route.ts:51, 65-75` (Liste der eigenen Abgaben nur mit Schalter),
`web/src/lib/lernapp/schreiben/dienst.ts:467-497` (Export ohne Kennung der Abgabe).

**Nachweis (Probe P2 und P4, PGlite):**
- Austritt → Liste der Lehrkraft leer (richtig). Wiedereintritt und Wechsel der Lehrkraft (A raus, B rein) → B sieht die
  alte Abgabe (1) mit dem Kommentar von A.
- `FUNKTION_LERNAPP_GRUPPEN=aus` → `GET ?ui=de` 404, die Insel zeigt nichts; der Export enthält
  `kurs, aufgabe, gruppe, eingereichtAm, loeschenAb, text, selbsteinschaetzung, rueckmeldung`, aber keine `id` – `DELETE`
  geht zwar ohne Schalter, die Person kann die Kennung aber nirgends erfahren.
- Widerruf der Einwilligung: sofort unlesbar (Test grün), die Abgaben bleiben bis zu 12 Monate gespeichert; ein erneutes
  Erteilen macht sie wieder lesbar.

**Auswirkung:** Zweckbindung und Datenminimierung (Art. 5 Abs. 1 lit. b, c DSGVO): Texte (bei Kindern mit
Elterneinwilligung) bleiben nach Ende des Zwecks gespeichert und werden bei Rückkehr bzw. neuer Lehrkraft wieder sichtbar;
nach Widerruf fehlt die Löschung (Art. 17 Abs. 1 lit. b); „Löschen jederzeit“ (Kommentar `route.ts`, Handbuch) gilt bei
ausgeschaltetem Schalter praktisch nicht. Niemand Unbefugtes liest mit; Frist 12 Monate begrenzt.

**Behebung:** Beim Austritt (alle drei Stellen, die `bis` setzen, und beim Archivieren) die Abgaben dieser Person an diese
Gruppe löschen oder `gruppe_id = null` setzen (dann nie mehr lesbar); beim Widerruf `lernapp` die Abgaben zusammen mit dem
Lernstand löschen (S-L3 N-2); Wechsel der Lehrkraft als Entscheidung festhalten (gruppengebunden lassen oder nur
offene Abgaben übergeben). `GET ?ui=` (eigene Liste) wie `DELETE` ohne Schalter erlauben oder die Löschung in „Mein Bereich“
anbieten; `id` in den Export aufnehmen. Integrationstests für Wiedereintritt, Widerruf und Schalter aus.

---

## Hinweise (kein Befund)

- **H-1 Körper ohne Content-Length:** `web/src/app/api/lernapp/schreiben/route.ts:100` liest `anfrage.text()` ganz und prüft
  die 64 KB erst danach. Probe P3: ein Strom ohne Längenangabe wurde mit 8 MiB vollständig gelesen, dann 413. Bremse
  20 Sendungen je Stunde und Konto und die Plattformgrenze dämpfen das; wie im Abgleich (`leseJson`, `sync/route.ts:35-62`)
  als Strom mit Grenze lesen (schreibt S-L3 H-1 für `meldung` und `gruppe` fort).
- **H-2 Schalter `konten`:** `VORAUSSETZUNGEN` (`web/src/lib/funktionen-regeln.ts:95`) führt `lernapp_gruppen` ohne
  `konten`, `lernplattform` hat keine Voraussetzung. `/api/lernapp/schreiben` und `/api/lernapp/gruppe` prüfen `konten` nicht
  (die Action und die Lehrkraft-Seite schon). Mit `konten` aus und bestehenden Sitzungen blieben die Routen erreichbar;
  `lernplattform: ['konten']` ergänzen.
- **H-3 Unbestätigter Elternbezug:** `lernappEinwilligung` (`web/src/lib/lernapp/sync/server.ts:91-101`) zählt die
  Einwilligung jedes sorgeberechtigten Elternteils, auch ohne `bestaetigtAm` (N4); Lernwoche und Familie in
  `web/src/lib/lernapp/gruppe/dienst.ts:662, 702, 835` verlangen den bestätigten Bezug. Heute ohne Wirkung (kein Weg zum
  Erteilen); beim Bau des Erteilens (S-L3 N-2) den bestätigten Bezug verlangen.
- **H-4 Lesen ohne Spur:** Das Öffnen einer Abgabe durch die Lehrkraft steht nicht im Audit (nur Abgabe, Rückgabe,
  Löschen). Für den Kinderschutz (M-1) ein Leseeintrag nur mit Kennungen erwägen.

## Fortgeschrieben aus S-L1/S-L3

- **S-L3 N-2 (Einwilligung `lernapp`)** weiter offen: kein Erteilen/Widerrufen (`KIND_EINWILLIGUNGEN` ohne `lernapp`,
  `web/src/lib/lernen/ansicht.ts:14`); der Export enthält jetzt die Schreibabgaben, aber weiter keine Ereignisse, Karten,
  Lerntage, Zustimmungen und Familie. Der Widerruf muss nun auch die Abgaben löschen (N-2).
- **S-L3 N-3 (XP ohne Kappung)** weiter offen (keine Tageskappung in `gruppe/dienst.ts`); unverändert niedrig.
- **S-L3 M-1** im Code nachvollzogen (Tagessummen je Kurs in `erneuereTage`, `lernapp_tag_kurs`; Stand der Lehrkraft nur aus
  den Kursen der Zuweisungen), nicht erneut vollständig geprüft.

## Geprüft ohne Befund

- **Abgleich `/api/lernapp/sync`:** Reihenfolge unverändert: Schalter `lernapp_sync` (mit `lernapp`, `konten`) → Ursprung
  (`Sec-Fetch-Site`, sonst `Origin` = Host) → Sitzung mit Faktor und Rolle → Einwilligung (Kinder nur über sorgeberechtigte
  Eltern) → Bremse 30/min → JSON-Typ, Größe als Strom ≤ 256 KB auch ohne Content-Length → Zod strikt → Kontobindung 409 →
  Grenzen je Konto 429 ohne Schreiben. Idempotent über `(benutzer, geraet, seq)` mit `ON CONFLICT DO NOTHING`, Sperre je
  Konto, `statement_timeout`; Zeiger liefert nur eigene Ereignisse anderer Geräte; alle Abfragen mit `benutzerId` der
  Sitzung; Zuweisungen nur mit `lernapp_gruppen`. Cross-Site-POST scheitert zusätzlich am JSON-Preflight.
- **Schreibroute:** Schalter `lernapp_gruppen` (404 ohne Körper), Ursprung, Sitzung mit Faktor, Bremse (Lesen 60/min,
  Senden 20/h, datenbankgestützt, HMAC-Schlüssel), Typ und Größe (siehe H-1), Zod strikt (UUIDs, Richtung als Enum, Text
  1–8.000, Prüfliste 0–3). Dienst: Einwilligung, Schreibaufgabe nur aus dem ausgelieferten Kurspaket, Zuweisung an eine
  eigene aktive Gruppe (nur eigener Lerndatensatz, nie Kinder der Eltern), Grenzen 3 je Aufgabe und Gruppe bzw. 200 je Konto
  unter `FOR NO KEY UPDATE` der Kontozeile (gleichzeitige Abgaben getestet), fremde Kennung 409 ohne Auskunft, eigene
  Wiederholung 200. `DELETE` nur eigene Abgabe (Konto in der Bedingung), Preflight schützt vor Cross-Site. Antworten
  `private, no-store`, `noindex`, `nosniff`; der Service Worker hält `/api/**` nie vor.
- **Gruppenisolation:** `lesbare` verlangt Lehrkraft (nicht Aufsicht) der aktiven Gruppe, Abgabe an diese Gruppe, laufende
  Mitgliedschaft, geltende Einwilligung je Lesen (Kind: Eltern, `istKind` unbekannt gilt als Kind) und nicht abgelaufen;
  Kennung nur zusammen mit der Gruppe, Rückgabe-Update mit `id` und `gruppe_id`. Fremde Lehrkraft, Aufsicht, Eltern, Kind,
  andere Lernende und Administration: `KeinZugang` (Integrationstest). Eltern haben keinen Lesepfad; ein Elternteil kann
  nicht für das Kind abgeben.
- **Lehrkraft-Seite und Action:** Seite 404 ohne `lernplattform`/`lernapp_gruppen` oder ohne Gruppenrecht, zweiter Faktor
  über `verlangeMeinBereich`; Liste ohne Texte, Text nur mit `?abgabe=<uuid>`; Ausgabe nur über React (keine HTML-Senken),
  Meldungsparameter auf eine feste Liste begrenzt. Action: `konten`, Schalter, Kontoart Lehrkraft mit Faktor, Zod
  (Kommentar ≤ 4.000, Einstufung aus fester Liste, Prüfliste 0–3), Gruppenrecht, Dienst prüft erneut; Ursprungsprüfung der
  Server Actions; Rechte-Matrix der Mitglieder-Actions enthält sie (grün). Rückgabe einer gerade gelöschten Abgabe ohne
  Audit-Eintrag (Test).
- **Verschlüsselung und Klartext:** Text und Kommentar AES-256-GCM (`web/src/lib/krypto/index.ts`, Schlüssel-ID für
  Rotation); `rubrik` ohne Freitext. Keine `console`-Ausgaben im Korrekturweg; Audit nur `{ abgabe: <id> }` mit Gruppe als
  Ziel; keine Push- oder Mail-Wege; Adressen tragen nur Schlüssel und Kennungen; bei Datenbankfehlern stünde nur Chiffrat
  in den Parametern. Der Text der Schreibübung bleibt sonst im Arbeitsspeicher (kein Ereignis, kein lokaler Speicher).
- **Löschfristen:** `loeschenAb` = Abgabe + 12 Monate; abgelaufene Abgaben liest niemand mehr; Löschlauf nach `loeschenAb`
  oder Abgabedatum (Test); Kaskade mit dem Konto; Gruppe gelöscht → `gruppe_id = null` (niemand liest); Lehrkraft gelöscht
  → `korrigiert_von = null`. Export (Art. 15/20) nur der eigenen Abgaben.
- **Rechte-Matrix:** Für Schreibabgaben gibt es kein Recht der Verwaltung und keine Verwaltungsseite; Administration ist nie
  Lehrkraft einer Gruppe (außer N-1). `NIE_PER_ADMINISTRATION` enthält weiter `lernapp.religioes.pruefen`; `sprachpruefung`
  nur `verwaltung.betreten`, `lernapp.lesen`, `lernapp.sprache.pruefen` (Unit grün).
- **Schalter in der Produktion:** `IN_PRODUKTION_AN` = `hadith_gesamt`, `lernapp`, `lernapp_ungeprueft`, `lernapp_meldungen`;
  Unit-Test sichert, dass kein Schalter aus `MIT_PERSONENDATEN` darin steht; Sperren über `VORAUSSETZUNGEN` (rekursiv);
  Startklar meldet eingeschaltete Schalter mit Personendaten. Live (`https://igmg-wetzlarer.vercel.app`, nur GET/HEAD,
  23.10.2026 ≈ 05:03 Uhr): `/api/lernapp/sync`, `/api/lernapp/sitzung`, `/api/lernapp/gruppe` und die Lehrkraft-Seite 404;
  `/api/lernapp/schreiben` 404 der Fangroute (`x-matched-path: /[locale]/[...rest]`, der ausgelieferte Bau enthält die
  Route noch nicht).

## Ausgeführte Prüfungen

- Integration (PGlite): `lernapp-schreiben`, `lernapp-sync` – 42 grün; `lernapp-schalter`, `lernapp-gruppe`,
  `loeschen-lernapp`, `rechte-matrix-mitglieder` – 491 grün.
- Unit: `tests/unit/rechte/*`, `funktionen`, `lernapp/schreibabgabe`, `lernapp/schreibabgabe-frage` – 70 grün.
- Proben P1–P4 (nur Scratchpad, 4 grün, Ausgaben oben). Kein E2E, kein Bau (paralleler Bau, Auftrag).

## KI-Regel 2

Dieser Bericht enthält keine arabische Schrift, keine religiösen Texte, Formeln, Übersetzungen oder Wortbedeutungen. Die
Proben nutzten nur neutrale Platzhaltertexte; ausgegeben wurden Zahlen und Statuscodes.
