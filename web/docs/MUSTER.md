# MUSTER – Bauweisen aus dem Durchstich (P3)

Verbindlich für alle Pakete ab Welle A. Jedes Muster nennt eine Beispieldatei, die genau so gebaut ist.
Vor Next.js-Code die passende Seite in `node_modules/next/dist/docs/` lesen (Next.js 16.4, Cache Components).

## 1 Öffentliche Seite

Beispiel: `src/app/[locale]/(website)/veranstaltungen/page.tsx`, Detail: `…/veranstaltungen/[slug]/page.tsx`

- `export const ensureStatic = 'navigation';` – die Seite ist vollständig statisch (K-01). Keine `cookies()`, `headers()`, `searchParams`, kein `Date.now()`/`new Date()` im Render (Zeit über `heuteBerlin()` aus `src/lib/zeit/heute.ts` oder im Browser über `useJetzt()`).
- Dynamisches Segment: `generateStaticParams()` liefert alle Werte (mindestens einen, sonst Platzhalter `'_'`); `params` nur **innerhalb** von `<Suspense>` lesen (Muster: `VeranstaltungSeite` → `<Suspense><Veranstaltung params={params} /></Suspense>`). Unbekannter Wert → `notFound()` (liefert in Produktion HTTP 404).
- Rahmen: `<Seitenrahmen bereich=… seite=… sprachZiel=… pfad=[…]>` (Kopf, Gebetszeitenleiste, Brotkrumen, Fußzeile, Konzept-Hinweis). `sprachZiel` ist das Linkziel derselben Seite (bei Parametern `{ pathname, params }`).
- Metadaten: `generateMetadata` → `metadatenFuer({ pfad, titel, beschreibung })` (hreflang + x-default, K-16).
- Texte: nur `getTranslations('<namensraum>')`; neue Schlüssel in `messages/de.json` **und** tr/en (neue Übersetzungen in `messages/neu-uebersetzt.json` eintragen). `pnpm sprachen:pruefen` muss grün sein.
- Datenbankinhalte: `Text`/`textMitSprache` (sichtbarer Rückfall auf Deutsch mit `lang="de"`), Rich-Text mit `RichText` (Tiptap-JSON, ADR 0006).
- Platzhalter für fehlende Fakten in eckigen Klammern (G-05) und in `_lauf/MENSCHEN.md` melden.

## 2 Daten lesen (Queries)

Beispiel: `src/server/queries/veranstaltungen.ts`

- Öffentlich: Funktion mit `'use cache'`, `cacheLife(...)` und **nur** Tags aus `src/lib/cache/tags.ts` (`TAG.…`). Rückgabe serialisierbar (Zeiten als ISO-Text).
- Nur sichtbare Inhalte: `status = 'veroeffentlicht'` und `imPapierkorbSeit IS NULL`.
- Verwaltung: eigene Datei unter `src/server/queries/verwaltung/<modul>.ts`, **ohne** Cache (Seiten sind dynamisch); Aufrufer prüfen vorher das Recht.

## 3 Links und Adressen

Beispiele: `src/i18n/link.tsx`, `src/i18n/navigation.ts`, `src/components/website/Header.tsx`

- Server-Komponenten: `import { Link } from '@/i18n/link'` mit `href="/pfad"` oder `{ pathname: '/veranstaltungen/[slug]', params: { slug }, hash? }`.
- Client-Komponenten: **kein** next-intl. Adresse auf dem Server mit `pfadFuer(ziel, sprache)` berechnen und als Zeichenkette übergeben, dann `next/link`.
- Nie `createNavigation`/`Link` von next-intl importieren: zieht `use-intl` in jede Route (K-12, F-002-Umfeld, E-026).

## 4 Komponente

Beispiele: Server `src/components/website/EventCard.tsx`, Client-Insel `src/components/website/veranstaltungen/VeranstaltungsFilter.tsx`, `TeilenKnopf.tsx`

- Standard ist die Server-Komponente. Client-Komponenten (`'use client'`) nur für Interaktion; sie bekommen **Texte und Adressen als Props** (kein `useTranslations` auf öffentlichen Seiten) und keine Funktionen als Props aus Server-Komponenten.
- Farben, Abstände, Schriftgrößen nur über Tokens (`src/app/globals.css`): z. B. `text-gruen-700`, `bg-sand`, `text-16`, `rounded-lg`, `shadow-s1`. Keine Hex-Werte.
- Barrierefreiheit (K-11): Klickziele `min-h-12` (48 px), sichtbarer Fokus (global), Icons `aria-hidden`, Linknamen mit Kontext per `aria-label="Sichtbarer Text: Titel"` (sichtbarer Text vorn, WCAG 2.5.3), Live-Regionen für Rückmeldungen (`role="status"`).
- Layout darf sich nach der Hydrierung nicht verschieben (CLS): Was erst im Browser bekannt ist (Uhrzeit, Restzeit), bekommt reservierten Platz oder eine eigene Zeile (Beispiel: `LeisteLive.tsx`, Telefonzeile).
- Scroll-Container (`overflow-x-auto`) immer mit `relative`: Sonst entkommen absolut positionierte Kinder (z. B. `sr-only`-Texte) dem Ausschnitt und verbreitern die ganze Seite.
- Dialoge: natives `<dialog>`; Aktionen in Menüs/Dialogen nie als Formular **im** Menüinhalt (wird beim Schließen entfernt) – Formular außerhalb, Menüpunkt ruft `requestSubmit()` (Beispiel: `src/components/verwaltung/shell/KontoMenue.tsx`).

## 5 Server Action (Verwaltung)

Beispiel: `src/server/actions/veranstaltungen.ts`

Feste Reihenfolge:

1. `verlangeRecht('<modul>.lesen')` als erste Anweisung (Sitzung + zweiter Faktor + Rolle, wirft `KeinRecht`). Lesen ist für die Organisationsredaktion auf die eigene Organisation begrenzt (`organisationsFilter`).
2. Eingabe mit dem Zod-Schema aus `src/lib/validierung/<formular>.ts` prüfen (`ausFormular(fd)` → `safeParse`); Fehler als Schlüssel zurück (`{ fehler: 'pruefen', feldFehler, werte }`).
3. Organisationsrecht am **alten und neuen** Ziel prüfen (`darf(rollen, '<modul>.bearbeiten', { organisation })`).
4. Speichern in einer Transaktion; nur Spalten aus dem Schema-Ergebnis setzen (keine Formularfelder durchreichen).
5. `protokolliere(...)` im selben `tx` – `details` ohne Personendaten.
6. `inhaltGeaendert(TAG.…)` aus `src/lib/cache/aktualisieren.ts` (nie `updateTag` direkt; zweistufig wegen F-002).
7. Anlegen → `redirect('/verwaltung/<modul>/<id>?angelegt=1')`; Ändern → `{ gespeichert: Date.now() }`; Listenaktionen → `refresh()`.

## 6 Formular

Beispiel Verwaltung: `src/components/verwaltung/veranstaltungen/VeranstaltungsFormular.tsx` + `src/lib/validierung/veranstaltung.ts`

- Ein Schema für Client und Server (ADR 0005); Feldnamen = Schlüssel des Schemas; Fehlertexte als Schlüssel unter `<namensraum>.fehler`.
- `useActionState(action, {})`; ungesteuerte Felder mit `defaultValue` aus `zustand.werte ?? startwerte` (React setzt das Formular nach jeder Aktion zurück); gesteuert nur, was live wirkt (Vorschau).
- Fehler am Feld (`aria-invalid`, `aria-describedby`), Zusammenfassung oben mit Sprungverweisen, Fokus auf die Rückmeldung (`ref.focus()` nach Zustandswechsel).
- Mehrsprachige Felder: Deutsch Pflicht, Türkisch/Englisch im Abschnitt „Übersetzungen“; Listen (Zeilen/Kommas) brauchen in tr/en dieselbe Anzahl.
- Öffentlich erreichbare Actions begrenzen **selbst** (`pruefeRate`, IP über `clientAdresse()` aus `src/lib/sicherheit/ip.ts`): Aufrufe über `auth.api` umgehen die Begrenzung von Better Auth (Tor P3, H2).
- Öffentliche Formulare (Welle B) zusätzlich: Ratenbegrenzung → Honigtopf → ALTCHA → Zod → Speichern (`eingang` + `einwilligung`) → Mail-Ausgang (ADR 0005).

## 7 Verwaltungsmodul

Beispiel: Veranstaltungen (`src/app/[locale]/verwaltung/(geschuetzt)/veranstaltungen/**`)

- In `src/components/verwaltung/shell/module.ts` eintragen (Schlüssel, Pfad, Leserecht, Icon) und Icon in `Seitenleiste.tsx` zuordnen; Texte unter `verwaltung.module.*` (nur `de.json`, ADR 0016).
- Seiten: Liste (`page.tsx`, `verlangeSeitenRecht('<modul>.lesen')`, Ansicht „Papierkorb“ über `?ansicht=papierkorb`), `neu/page.tsx`, `[id]/page.tsx` (ohne Bearbeitungsrecht nur lesen: `nurLesen`).
- Tabelle: `<th scope="row">` für den Titel, Aktionsknöpfe mit `aria-label` „Aktion: Titel“, endgültiges Löschen nur aus dem Papierkorb mit Rückfrage (`LoeschenBestaetigen`).
- Aktionen, Queries, Schema wie Muster 2, 5, 6; Abweichungen vom Design in `docs/ABWEICHUNGEN.md`.

## 8 Route Handler

Beispiele: `src/app/api/ical/[sprache]/veranstaltungen/route.ts` (statisch mit `generateStaticParams`), `src/app/api/wartung/cache-erneuern/route.ts` (POST, Bearer), `src/app/api/health/route.ts` (je Anfrage)

- Muss eine Route je Anfrage antworten, ruft sie zuerst `await connection()` (sonst friert der Bau das Ergebnis ein, FEHLERSTATISTIK F-001).
- Wartungsrouten nur mit `wartungErlaubt(anfrage)` (`src/lib/wartung/zugang.ts`).

## 9 Tests

- Unit (`tests/unit/*.test.ts`): reine Funktionen, Grenzfälle aus Kriterien (Beispiele: `termine-grenzfaelle.test.ts`, `navigation.test.ts`, `rechte/matrix-negativ.test.ts`).
- Integration (`tests/integration/*.test.ts`): Server Actions mit `tests/integration/hilfen/verwaltung.ts` – `verwaltungsUmgebung()`, `angemeldetAls(rollen)`, `formular({...})`, Actions per `await import(...)` danach laden (Beispiel: `verwaltung-veranstaltungen-grundlage.test.ts`).
- E2E (`tests/e2e/*.spec.ts`): eigene Datenbank `igmg_e2e` (frisch je Lauf, E-019); Selektoren über Rollen/Beschriftungen (`exact: true`, sichtbare Elemente: Next hält vorige Seiten versteckt im DOM); Texte aus `messages/*.json` importieren; Konzept-Hinweis per `addInitScript` als gesehen markieren; Verwaltungsabläufe nur im Projekt `desktop`; öffentliche Sichtbarkeit nach Änderungen mit `oeffentlichBis(...)` (Beispiel: `verwaltung-veranstaltungen.spec.ts`).
- Barrierefreiheit und Datenschutz: neue Routen in die Routentabellen von `tests/e2e/barrierefreiheit.spec.ts` und `tests/e2e/datenschutz.spec.ts` eintragen.
- Leistung: neue Messrouten laufen automatisch über `pnpm messen` (PLAN L8).

## 10 Vor dem Abschluss eines Pakets

`pnpm check` · `pnpm test:integration` · `pnpm sprachen:pruefen` · betroffene E2E-Specs · bei Seiten: Bildschirmfotos 390/1440 (`_lauf/werkzeuge/app-bilder.mjs`) gegen `_lauf/belege/referenz/`.
