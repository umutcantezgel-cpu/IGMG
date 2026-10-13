E0-K02 Muster: Bericht (Kundschafter)

Hinweis: Die Datei `/home/user/IGMG/_gemeinde/berichte/E0-K02-muster.md` habe ich nicht geschrieben, weil die Vorgabe lautet, Berichte als Antwort zurückzugeben. Der vollständige Inhalt steht hier.

**Kurzbefund:** Das Muster lässt sich am Referenzmodul Neuigkeiten belegen. Die Zentraldateien (Schritte 1 bis 6 und 9 unten) kommentieren sich selbst als „nur Orchestrator“. Baumeister können Seiten, Queries, Actions, Schema und Formulare nach Abschnitt 1 bis 3 bauen. Für Zentraldateien braucht es eine Entscheidung (Abschnitt 5, Punkt 1).

## 1. Neues Verwaltungsmodul `m` (Referenz: Neuigkeiten)

Zentraldateien (Orchestrator):
1. Rechte: `/home/user/IGMG/web/src/lib/rechte/matrix.ts`. Aktionen `m.lesen`, `m.bearbeiten`, `m.loeschen` in `AKTIONEN` (Z. 15–58). Rollen in `MATRIX` (Z. 85). Organisationsgebunden in `ORGANISATIONSGEBUNDEN` (Z. 62).
2. Modul: `/home/user/IGMG/web/src/components/verwaltung/shell/module.ts`. Schlüssel in `ModulSchluessel` (Z. 9–25), Eintrag in `MODULE` (Z. 44–144). `gebaut` setzt der Orchestrator (Z. 5).
3. Icon: `/home/user/IGMG/web/src/components/verwaltung/shell/Seitenleiste.tsx`, `ICONS` (Z. 30–47). Ohne Eintrag entsteht ein Typfehler.
4. Audit (falls neue Aktion): `/home/user/IGMG/web/src/lib/audit/index.ts`, Union `AuditAktion` (Z. 8–48).
5. Cache: `/home/user/IGMG/web/src/lib/cache/tags.ts`, `TAG` (Z. 5–22). Inhaltliche Tags zusätzlich in `START_TAGS` (Z. 25–37, ADR 0017).
6. Messages-Register: `/home/user/IGMG/web/messages/verwaltung/index.ts`, Import und Eintrag in `VERWALTUNG` (Z. 7–47).

Baumeister-Dateien:
7. Texte: `/home/user/IGMG/web/messages/verwaltung/<m>.json` mit oberstem Schlüssel `<m>`, nur Deutsch (Muster: `neuigkeiten.json`). Seitenleisten-Labels unter `verwaltung.module.<schluessel>` in `/home/user/IGMG/web/messages/de.json` (Z. 341).
8. Schema: `/home/user/IGMG/web/src/lib/validierung/<m>.ts` (Muster: `neuigkeit.ts`). `z.object`, Fehler als Schlüssel, `ausFormular(fd)` (Z. 93), Feldregeln per `superRefine` (Z. 73), Datensatzbau `zuDatensatz` (Z. 163).
9. Queries ohne Cache: `/home/user/IGMG/web/src/server/queries/verwaltung/<m>.ts`. `ladeVerwaltungsListe(papierkorb, filter)` (Z. 36), `ladeNachrichtFuerVerwaltung(id, filter)` (Z. 70, liefert `null`).
10. Actions: `/home/user/IGMG/web/src/server/actions/<m>.ts` (`'use server'`, Z. 1). Formular-Action `speichere<X>(vorher, fd)` (Z. 53). Listen-Aktionen `inPapierkorb`, `wiederherstellen`, `endgueltigLoeschen` (Z. 155–196) mit Hilfsfunktion `mitDatensatz` (Z. 141–152).
11. Formular: `/home/user/IGMG/web/src/components/verwaltung/<m>/<X>Formular.tsx` (`'use client'`). `useActionState` (Z. 77), Werte mit Fallback auf Startwerte (Z. 78), Fehlertext `t('fehler.…')` (Z. 80), Fokus nach Rückmeldung (Z. 88–89), `<form action>` (Z. 190), `<fieldset disabled>` für Nur-Lesen (Z. 213), Speichern-Knopf (Z. 330–334). Helfer: `formularwerte.ts` (`formularWerte(zeile)` Z. 12, Startwerte Z. 40) und `formular-optionen.ts` (`formularOptionen(a)` Z. 8).
12. Seiten unter `/home/user/IGMG/web/src/app/[locale]/verwaltung/(geschuetzt)/<m>/`:
    - `page.tsx`: `verlangeSeitenRecht` (Z. 21), Papierkorb über `searchParams.ansicht` (Z. 22), `organisationsFilter` (Z. 24).
    - `neu/page.tsx`: Umleitung bei fehlendem Recht (Z. 17).
    - `[id]/page.tsx`: `notFound` bei fremdem Datensatz (Z. 23–24), `nurLesen` (Z. 26).
13. Routing: Die Verwaltung steht nicht in `/home/user/IGMG/web/src/i18n/routing.ts` (Z. 7–8). Dort ist keine Änderung nötig.

Reihenfolge: Zentraldateien 1 bis 6, dann 7 bis 12, dann Tests (Abschnitt 4), dann `pnpm check`, `pnpm test:integration`, `pnpm sprachen:pruefen`.

## 2. Neue öffentliche Seite (Muster 1, Referenz: `nachrichten/[slug]`)

Datei: `/home/user/IGMG/web/src/app/[locale]/(website)/<seite>/[slug]/page.tsx`
- `export const ensureStatic = 'navigation'` (Z. 28). `generateStaticParams` mit Platzhalter `'_'` (Z. 31–34).
- `generateMetadata` ruft `metadatenFuer({ pfad, titel, beschreibung })` auf (Z. 36–49).
- Standard-Export nur mit `<Suspense>` um die Komponente, die `params` liest (Z. 59–65). Unbekannter Slug: `notFound()` (Z. 71).
- Rahmen `<Seitenrahmen bereich seite sprachZiel pfad>` (Z. 93–98). Der Typ `Bereich` steht in `/home/user/IGMG/web/src/components/website/navigation.ts` (Z. 12).
- Links: `import { Link } from '@/i18n/link'` (Z. 19). Adressen für Client-Komponenten mit `pfadFuer` (`/home/user/IGMG/web/src/i18n/navigation.ts` Z. 14).

Routing: Eintrag in `/home/user/IGMG/web/src/i18n/routing.ts`, `pathnames` (Z. 17–48), mit de/tr/en-Adressen (Muster: Z. 23–24).

Query: `/home/user/IGMG/web/src/server/queries/<x>.ts` mit `'use cache: remote'`, `cacheLife('hours')` und `cacheTag(TAG.…)` (Muster: `queries/nachrichten.ts` Z. 68–72). Sichtbarkeit über `sichtbarInListen()` (Z. 59–65). Slugs für `generateStaticParams` (Z. 92–98).

Texte: Bereichsdatei `/home/user/IGMG/web/messages/bereiche/<bereich>.json` mit `{ de, tr, en }` (Muster: `nachrichten.json`). Registrierung in `/home/user/IGMG/web/messages/bereiche/index.ts` (Import und Eintrag in `BEREICHE`).

## 3. Texte in drei Sprachen

- Öffentlich: `src/i18n/request.ts` führt die Bereiche zusammen (Z. 28–34). Fehlende Schlüssel fallen auf Deutsch zurück (Z. 11–12, 42). Vollständigkeit prüft `sprachen:pruefen`.
- Verwaltung: nur Deutsch, in `messages/verwaltung/<m>.json` (ADR 0016).
- Neue Übersetzungen: Schlüssel in `/home/user/IGMG/web/messages/neu-uebersetzt.json` eintragen (Listen `tr`, `en`, `de`). Kein Skript und kein Test liest diese Datei (geprüft in `scripts/`, `tests/`, `src/`). Die Pflege ist manuell.
- Prüfung: `pnpm sprachen:pruefen` (`/home/user/IGMG/web/scripts/sprachen-pruefen.mjs`). Prüft Schlüssel in tr und en, ICU-Platzhalter und Überschneidungen. Heutiger Lauf mit Node 24.21.0: grün (1202 Schlüssel in de/tr/en; 1921 Verwaltungsschlüssel nur de).

## 4. Rechte, Audit, Cache, Tests

Rechte (`/home/user/IGMG/web/src/lib/rechte/pruefe.ts`):
- Seite: `verlangeSeitenRecht('m.lesen')` (Z. 61) leitet bei fehlendem Recht um.
- Action: `verlangeRecht('m.lesen')` als erste Anweisung (Z. 71). Wirft `KeinRecht` (Z. 11).
- Organisation: `darf(rollen, aktion, { organisation })` am alten und am neuen Ziel (`matrix.ts` Z. 149; `actions/neuigkeiten.ts` Z. 94 und 104). Listen über `organisationsFilter` (`matrix.ts` Z. 161).

Audit: `protokolliere({…}, tx)` im selben `db.transaction` (`actions/neuigkeiten.ts` Z. 117 und 127; `lib/audit/index.ts` Z. 61). `details` nur mit IDs, Zählern und Feldnamen (Z. 50).

Cache: nie `updateTag` direkt. Nach der Transaktion `aktualisiereCaches(id)` aufrufen, das `inhaltGeaendert(TAG.…)` ruft (`actions/neuigkeiten.ts` Z. 133). `inhaltGeaendert` setzt `updateTag` sofort und `revalidateTag` nach 5 Sekunden (`lib/cache/aktualisieren.ts` Z. 15–21). Redirect nur beim Anlegen (Z. 134). Sonst `{ gespeichert: Date.now() }` (Z. 135).

Tests (Vorlage: Neuigkeiten):
- Unit: reine Funktionen und Grenzfälle (laut MUSTER §9). `tests/unit/rechte/matrix.test.ts` prüft alle `AKTIONEN` automatisch (Admin darf alles, Z. 5–7; ohne Rolle nichts, Z. 9–11).
- Integration: `/home/user/IGMG/web/tests/integration/verwaltung-neuigkeiten.test.ts`. Helfer aus `tests/integration/hilfen/verwaltung.ts`: `verwaltungsUmgebung()` (Z. 50), `angemeldetAls(rollen, zweiFaktor)` (Z. 60), `formular(werte)` (Z. 87). Pro Datei eine Datenbank mit Migrationen (`hilfen/db.ts` Z. 8–12). Actions per dynamischem Import laden.
- E2E: `/home/user/IGMG/web/tests/e2e/verwaltung-neuigkeiten.spec.ts`, nur im Projekt `desktop`. Konzepthinweis per `addInitScript` als gesehen markieren. Helfer `oeffentlichBis`. Neue Routen in die Routentabellen von `tests/e2e/barrierefreiheit.spec.ts` (Z. 42) und `tests/e2e/datenschutz.spec.ts` (Z. 21).

## 5. Widersprüche und OFFENE FRAGEN

1. **OFFENE FRAGE, Zentraldateien:** `matrix.ts` (Z. 14), `module.ts` (Z. 5–6) und `messages/verwaltung/index.ts` (Z. 4–5) sagen, nur der Orchestrator trage Module und Aktionen ein. MUSTER §7 verlangt dagegen „in module.ts eintragen“. Zu klären: Wer ergänzt Aktionen, Modulschlüssel, Icon, Audit-Aktion, Tags und das Messages-Register?
2. **Formular-Schema:** MUSTER §6 verlangt „ein Schema für Client und Server“. Das Referenzformular `components/verwaltung/neuigkeiten/NeuigkeitsFormular.tsx` (Z. 1–17) importiert kein Schema, geprüft wird nur auf dem Server. `VeranstaltungsFormular.tsx` importiert nur den Helfer `zeitpunkt` (Z. 13). Die Vorlage ist also uneinheitlich.
3. **Fehlerpfad:** `actions/neuigkeiten.ts` gibt bei fehlendem Recht `{ fehler: 'keinRecht' }` zurück (Z. 55–59). Die Papierkorb-Aktionen werfen `KeinRecht` (Z. 144, 150). MUSTER §5 nennt nur die Wurf-Variante.
4. **Veralteter Kommentar:** `tests/e2e/verwaltung-neuigkeiten.spec.ts` (Z. 19) sagt „gebaut: false“. `module.ts` (Z. 51) setzt `true`.
5. **Texte für öffentliche Seiten:** MUSTER §1 nennt `messages/de.json` und tr/en. E-027 (`messages/bereiche/index.ts` Z. 1–4) verlangt eine Bereichsdatei. Bitte bestätigen.
6. **Unklarer Block:** `messages/neu-uebersetzt.json` enthält zusätzlich einen Block `de` mit 71 Einträgen. Der Zweck ist nicht dokumentiert.
7. **Geteilte Komponente:** `LoeschenBestaetigen` liegt im Ordner `components/verwaltung/veranstaltungen/`, wird aber von Neuigkeiten genutzt (`neuigkeiten/page.tsx` Z. 7). Das Muster sollte den Ort nennen.