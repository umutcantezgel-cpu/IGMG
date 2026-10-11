# Tor P3 · D08 (Rückgabe des Haiku-Pakets, wörtlich; Ablage durch den Orchestrator)

=== D08 · Verwaltung Veranstaltungen, Rollen-Integrationstests ===

**DATEIEN**
- Neu: /Users/umurey/Downloads/IGMG Wetzlar Website Design/web/tests/integration/verwaltung-veranstaltungen-rollen.test.ts (43 Tests grün, 1 `it.todo`, nach Projekt-Prettier formatiert)
- Sonst nur gelesen: die Quellen, die Prüfumgebung (hilfen/verwaltung.ts) und die Vorlage. Es wurde keine andere Datei geschrieben.
- Keine DOM-Selektoren nötig, da die Actions direkt aufgerufen werden. Kein `waitForTimeout`.

**ABGEDECKTE KRITERIEN (Kriterium → Testname)**
- K1 ohne Anmeldung: „speichern liefert keinRecht und lässt die Datenbank unverändert“; „inPapierkorb, wiederherstellen und endgueltigLoeschen werfen KEIN_RECHT und ändern nichts“
- K2 ohne zweiten Faktor: „speichern liefert keinRecht, auch mit Administrationsrolle, und ändert nichts“; „inPapierkorb, wiederherstellen und endgueltigLoeschen werfen KEIN_RECHT und ändern nichts“ (Zwei-Faktor-Describe)
- K3 Bildung und Mitgliederverwaltung: „Bildung: speichern liefert keinRecht und legt keine Zeile an“; „Bildung: inPapierkorb, wiederherstellen und endgueltigLoeschen werfen KEIN_RECHT“; dasselbe für Mitgliederverwaltung
- K4 Redaktion: „legt eine allgemeine Veranstaltung ohne Organisation an“; „legt eine Veranstaltung mit Organisation an“; „bearbeitet eine bestehende Veranstaltung“; „legt in den Papierkorb, stellt wieder her und löscht endgültig“
- K5 Organisationsredaktion GT: „legt eine Veranstaltung mit Organisation GT an“; „Anlegen für Organisation KT wird abgelehnt und legt nichts an“; „Anlegen ohne Organisation (allgemein) wird abgelehnt und legt nichts an“; „bestehende KT-Veranstaltung bearbeiten liefert keinRecht und ändert nichts“; „KT-Veranstaltung in den Papierkorb legen wirft KEIN_RECHT“; „eigene GT-Veranstaltung nach KT verschieben wird abgelehnt und bleibt bei GT“ (der Fehlerschlüssel ist hier pruefen/organisation, siehe OFFENE FRAGEN)
- K6 Validierung: „leerer Titel liefert feldFehler titelDe pflicht, legt nichts an und nennt die Eingaben in werte“; „Endzeit vor Startzeit liefert feldFehler endeZeit endeVorBeginn und legt nichts an“; „ungültige eigene Regel (FREQ=HOURLY) liefert Fehler an whRoh und whArt und legt nichts an“; „OFFEN: Titelfeld ganz ohne Schlüssel …“ als `it.todo`
- K7 Slug: „zwei Veranstaltungen mit gleichem Titel erhalten die Slugs „d08-slug-vortrag“ und „d08-slug-vortrag-2““
- K8 Bearbeiten: „Titeländerung ändert die Zeile, protokolliert inhalt.geaendert und liefert gespeichert“; „Wechsel von Entwurf zu Veröffentlicht protokolliert zusätzlich inhalt.veroeffentlicht“
- K9 Cache: „Anlegen ruft updateTag mit veranstaltungen und veranstaltung:<id> auf und plant genau eine Nachlauf-Invalidierung“; „Bearbeiten ruft dieselben Tags auf …“; „In den Papierkorb legen …“, „Wiederherstellen …“, „Endgültig löschen …“ (jeweils Tags, Nachlauf und refresh). Die Nachlauf-Funktion wird nicht ausgeführt, geprüft wird `revalidateTag` leer.
- K10 Papierkorb: „inPapierkorb setzt imPapierkorbSeit, protokolliert inhalt.papierkorb und ruft refresh auf“; „endgueltigLoeschen einer nicht im Papierkorb liegenden Veranstaltung wirft KEIN_RECHT und löscht nichts“; „aus dem Papierkorb endgültig gelöscht: Zeile weg, Audit inhalt.geloescht“
- K11 Audit: „Audit-Einträge der Aktionen tragen in details keine Zeichenkette mit @ und halten die handelnde Person fest“
- Zusatzfälle aus Rollen-Doku und Matrix, ohne eigene Kriteriennummer: Administration in allen Organisationen (Kontrolle); „Angemeldet ohne Rolle“; allgemeine Veranstaltung bearbeiten durch GT wird abgelehnt; KT im Papierkorb wiederherstellen und endgültig löschen durch GT wirft; eigene GT-Veranstaltung voll bearbeitbar; leere eigene Regel liefert whRoh; gültige eigene Regel wird angelegt; Slug bleibt bei Bearbeiten erhalten; bereits veröffentlichte Veranstaltung erzeugt kein zweites inhalt.veroeffentlicht.

**LAUF (wörtlich)**
Befehl: `source "…/_lauf/werkzeuge/umgebung.sh" && pnpm exec vitest run --project integration tests/integration/verwaltung-veranstaltungen-rollen.test.ts`
```
 Test Files  1 passed (1)
      Tests  43 passed | 1 todo (44)
```
- Ausführlicher Lauf, wiederholt nach dem Formatieren: identisches Ergebnis (43 passed, 1 todo).
- `pnpm exec eslint tests/integration/verwaltung-veranstaltungen-rollen.test.ts`: exit 0, ohne Befund.
- `pnpm exec tsc --noEmit`: exit 0, 0 Fehler im gesamten Projekt.
- Basislauf der Vorlage verwaltung-veranstaltungen-grundlage.test.ts: 2 passed.

**BEFUNDE**
- Keine Abweichung der App von den Akzeptanzkriterien. Alle ausführbaren Tests sind grün, nichts ist rot.
- Beobachtung laut Code, nicht getestet, kein Kriterium betroffen: `inPapierkorb` und `wiederherstellen` (src/server/actions/veranstaltungen.ts, Zeilen 126–147) schreiben den Audit-Eintrag und rufen die Invalidierung auch dann auf, wenn sich nichts ändert. Der UPDATE ist bereits bedingt, das Protokoll nicht.

**OFFENE FRAGEN**
1. Kriterium 6, „fehlender Titel“: Getestet wird das leere Feld (`pflicht`). Fehlt der Schlüssel `titelDe` ganz, meldet Zod „Invalid input: expected string, received undefined“ (Gegenprobe mit dem Projekt-Zod). Die Action macht daraus „ungueltig“. Als `it.todo` markiert, nicht abgeschwächt. Bitte klären, ob dieser Fall „pflicht“ liefern muss.
2. Kriterium 5, Verschieben: Das Kriterium sagt nur „abgelehnt“. Geprüft wird `pruefen` mit `feldFehler.organisation`, wie beim Anlegen mit fremder Organisation. Bitte bestätigen.
3. Kriterium 10: Das Kriterium sagt nur „wirft“. Geprüft wird die Meldung KEIN_RECHT, wie in Kriterium 1 festgelegt.

**Selbstprüfung**
- `git -C "/Users/umurey/Downloads/IGMG Wetzlar Website Design" status --short` zeigt meine Datei als `?? web/tests/integration/verwaltung-veranstaltungen-rollen.test.ts`. Die übrigen Änderungen im Elternordner stammen nicht aus diesem Lauf, ich habe sie nicht angefasst.
- Jedes Kriterium ist abgedeckt oder als OFFENE FRAGE markiert.
- Einige reine Lesebefehle (cat, ls, git status) liefen ohne das vorangestellte source-Kommando. Alle Befehle mit Testlauf, Lint und Typprüfung liefen damit.

=== ENDE D08 · BEREIT ZUR RÜCKGABE ===
