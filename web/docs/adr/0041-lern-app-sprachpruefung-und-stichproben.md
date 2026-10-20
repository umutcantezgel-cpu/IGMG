# ADR 0041 – Lern-App: Sprachprüfung und Stichproben (Rolle `sprachpruefung`, Annahmeregel)

- Status: **angenommen im Tor L0 (20.10.2026)** mit den Abschnitten „Fortschreibung …“ (Orchestrator nach L3-E12; Gegenprüfung L0 ohne Mangel hoch/mittel) · vorher: vorgeschlagen (16.10.2026) (Lauf Lern-App); der Grundsatz „Muttersprachler prüfen stichprobenweise“ ist Nutzerentscheidung „Sprachinhalte“ (L3-E03) · Bezug: Plan „Lern-App“ Kontext („Verfeinerung“ Freigabe, Rolle), §2.7, §3.2, §6 (ML-02, ML-03); `_lernapp/PLAN.md` §3.9, §6.3–6.6, §7.1–7.2, §18 (O-1, O-3); `_lernapp/AUFTRAG.md` §5.4 · schreibt ADR 0016 für ein Modul fort (Prüfoberfläche dreisprachig)

## Kontext

- Je Zielsprache entstehen ≈ 26.000 Sätze und ≈ 6.500 Lemmata, je Richtung dazu Übersetzungen, angenommene Alternativen und Tipps. Eine vollständige Prüfung durch Menschen ist nicht leistbar.
- Die Inhalte entstehen als KI-Entwurf (ADR 0040) und durchlaufen automatische Prüfer, eine KI-Gegenprüfung und eine Rückübersetzung (`_lernapp/PLAN.md` §6.3–6.4).
- Eine Rolle für Sprachprüfung gibt es nicht. Die bestehende Freigabe ist für religiöse Inhalte gebaut (ADR 0030).
- Die Verwaltung ist deutsch (ADR 0016). Prüfende mit arabischer Muttersprache bedienen eine deutsche Oberfläche womöglich nicht sicher; das ist die Umkehrprobe von ADR 0016.
- Der genehmigte Plan (§6 ML-02) sieht bis zur Prüfung durch Muttersprachler den Hinweis „noch nicht von Muttersprachlern geprüft“ vor. Der Entwurf des zweiten Planungs-Agenten (O-1) schlug stattdessen vor, solche Einheiten in der Produktion nicht zu zeigen. `_lernapp/AUFTRAG.md` §5.4 und `_lernapp/PLAN.md` O-1 folgen dem genehmigten Plan.

## Entscheidung

1. **Rolle `sprachpruefung`** (neu):
   - Enum-Wert in einer **eigenen** Migration, die nur `ALTER TYPE rolle ADD VALUE 'sprachpruefung'` enthält (PostgreSQL 16, `web/tests/e2e/LIESMICH.md` Abschnitt 1a).
   - Sprachen je Person in `lernapp_pruefer_sprache` (sprache, ebene `muttersprache` oder `sehr_gut`). Das Recht `lernapp.sprache.pruefen` gilt nur für die eigenen Sprachen.
   - Konten mit Zwei-Faktor; je Sprache mindestens zwei Personen (LM-01).
2. **Status je Eintrag** (reine Funktionen in `web/src/lib/lernapp/freigabe.ts`):

   | Status                 | Bedingung                                                                                    | Sichtbar                                                      |
   | ---------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
   | `entwurf`              | importiert                                                                                   | nur Vorschau der Verwaltung                                   |
   | `automatisch_geprueft` | alle blockierenden Prüfer grün, Befunde der Gegenprüfung erledigt oder an Menschen übergeben | mit Hinweis „noch nicht von Muttersprachlern geprüft“ (Nr. 8) |
   | `veroeffentlicht`      | Stichprobe der Einheit bestanden, keine Prüfung zum aktuellen Hash mit Urteil „abgelehnt“    | ohne Hinweis                                                  |

   Abgelehnte Einträge und Einträge mit kritischem Fehler zum aktuellen Hash sind nie sichtbar, bis eine Korrektur geprüft ist; Aufgaben, die sie nutzen, fallen aus dem Paket. Einträge mit `religionsbezug` sind unabhängig von diesem Status erst nach zwei religiösen Freigaben sichtbar (Nr. 11).

3. **Stichprobe** je Einheit und Art (Zieltext, Übersetzung je Richtung, Audio):
   - Text: n = max(20, 10 %)
   - Audio: 10 %, für Arabisch 20 %
   - Einlauf: Die ersten 3 Einheiten je Sprache werden zu 30 % geprüft. Nach 3 bestandenen Einheiten in Folge gilt die Grundquote.
   - Gemeldete Einträge (Nr. 9) werden immer geprüft.
   - Startwert und Auswahl sind reproduzierbar in `lernapp_stichprobe` gespeichert.
4. **Urteil je Eintrag** (`lernapp_pruefung.urteil`): `ok`, `korrektur` (Korrektur direkt im Feld) oder `abgelehnt`. Fehler tragen eine Kategorie: **kritisch** (Bedeutung, Grammatik, anstößig, falsche Aussprache) oder **leicht** (Natürlichkeit, Zeichensetzung).
5. **Annahmeregel:** 0 kritische und höchstens 2 leichte Fehler je 20 geprüfte Einträge (anteilig) → Einheit `bestanden`.
   - Sonst `nachbessern`: Die Befunde gehen zurück in die Nachbesserung, mit Suche nach demselben Muster in der ganzen Einheit. Danach folgt eine neue Stichprobe mit neuem Startwert.
6. **Menschliche Korrekturen** sind eingefroren (`menschlichGeprueft`). Ein neuer KI-Import überschreibt sie nicht, sondern legt einen Konflikteintrag an. `pnpm lernapp:export-korrekturen` schreibt sie nach `web/inhalte/lernapp/**` zurück.
7. **Änderung nach Bestehen:** Eine geänderte Einheit (neuer Hash) behält „bestanden“, wenn weniger als 10 % der Einträge geändert sind und jeder geänderte Eintrag einzeln geprüft ist. Sonst wird neu gezogen.
8. **Hinweis statt Sperre** (genehmigter Plan §6 ML-02, `_lernapp/AUFTRAG.md` §5.4): Einheiten mit Status `automatisch_geprueft` sind öffentlich und tragen den Hinweis „noch nicht von Muttersprachlern geprüft“. Der Schalter `lernapp_ungeprueft` steuert das; Standard in Vorschau **und** Produktion: an. Ausgeschaltet zeigt die Produktion nur `veroeffentlicht` (O-1, Entscheidung beim Vorstand, LM-11).
9. **Meldungen aus der App:** „Fehler melden“ und „Meine Antwort hätte stimmen sollen“ je Aufgabe, ohne Konto möglich, mit ALTCHA, nur Aufgabenschlüssel und Kategorie (genehmigter Plan §2.7). Die eigene Antwort können nur angemeldete Personen ab 16 optional mitschicken; ohne Konto und bei Kindern nie. Tabelle `lernapp_meldung` ohne Personenbezug, Schalter `lernapp_meldungen`. Meldungen ergänzen angenommene Alternativen oder sperren einen Eintrag (`/verwaltung/lernapp/meldungen`).
10. **Prüfoberfläche** `/verwaltung/lernapp/sprachpruefung` (Recht `lernapp.sprache.pruefen`):
    - Warteschlange je eigener Sprache, Eintrag für Eintrag mit Tastenkürzeln, Fehlerkategorie, Korrekturfeld, Audio abspielen.
    - Nur dieses Modul hat eine eigene Sprachwahl de/tr/ar (O-3). Dreisprachig ist nur die Bedienleiste; das Gerüst bleibt links-nach-rechts, Inhaltsblöcke tragen `lang` und `dir`. Texte in `messages/verwaltung/lernapp-pruefung.json` mit de, tr und ar; der Schlüsselabgleich nimmt die Datei als Ausnahme auf.
11. **Abgrenzung:** Einträge mit `religionsbezug` brauchen zwei Freigaben der religiösen Prüfung (ADR 0040 Nr. 5). Die Sprachstichprobe und der Schalter `lernapp_ungeprueft` ersetzen diese Freigaben nie.
12. **Rahmenpläne** je Sprache nimmt eine Prüfperson ab (LM-02). Bis dahin gilt der Entwurf.

## Fortschreibung nach der Sicherheitsprüfung S-L1 (20.10.2026, `_lernapp/berichte/s-l1.md` N-6)

1. Die Rolle `sprachpruefung` hat nur `verwaltung.betreten`, `lernapp.lesen` und `lernapp.sprache.pruefen` – keine Grundrechte
   der Verwaltung (Übersicht, Postfach, Tickets, Mediathek, Styleguide). Ihr Einstieg ist die Prüfoberfläche (L3-06); bis
   dahin führt `/verwaltung` auf „kein Zugriff“.

## Alternativen

- Vollprüfung aller Einträge durch Menschen: verworfen (nicht leistbar bei ≈ 78.000 Zielsätzen und ≈ 156.000 Übersetzungen).
- Gleiche Freigabe wie bei religiösen Inhalten (zwei Prüfungen je Eintrag): verworfen. Der Nutzer hat Stichproben entschieden.
- Nichts öffentlich vor bestandener Stichprobe (Entwurf des Planungs-Agenten, O-1): nicht als Standard gewählt. Der genehmigte Plan sieht den Hinweis vor, und ohne Muttersprachler bliebe die Produktion leer. Bleibt über den Schalter möglich.
- Feste Quote von 10 % ohne Mindestmenge: nicht gewählt. Bei kleinen Einheiten wären es zu wenige Einträge für ein Urteil.
- Verwaltung nur auf Deutsch auch für die Sprachprüfung (ADR 0016): nicht gewählt, weil die Umkehrprobe von ADR 0016 hier zutrifft.

## Folgen

- Rechte-Matrix: neue Rolle und Aktionen `lernapp.sprache.pruefen`, `lernapp.lesen`; generierte Matrix und Test erweitern.
- Tests: Unit `stichprobe` (Startwert, Quoten, Annahmeregel), Integration (Status, Sichtbarkeit, Sperre bei kritischem Befund, Schalter), E2E Sprach-Stichprobe einer Einheit.
- Aufwand für Menschen: ≈ 60 h je Zielsprache und ≈ 20 h je Richtung (LM-01).
- Cockpit (`web/src/lib/startklar/*`): Karte „Lern-App“ zeigt Prüfende je Sprache und Einheiten je Status.
- Abnahme: Z-L14 (`lernapp:pruefen` 0, Lizenzfeld 100 %); Stichproben laufen ab L3.
- Funktionsschalter (ADR 0035): `lernapp_ungeprueft` kommt wie `lernapp` in `IN_PRODUKTION_AN` (ohne Personendaten).
- OFFENE FRAGE: Standard für `lernapp_ungeprueft` in der Produktion (LM-11). Gewählt ist „an mit Hinweis“ nach dem genehmigten Plan (`_lernapp/PLAN.md` §11, O-1); der Vorstand kann „aus“ entscheiden.
