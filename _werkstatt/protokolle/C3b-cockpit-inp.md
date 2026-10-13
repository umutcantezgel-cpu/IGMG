# C3b · Cockpit: Reaktion auf Eingaben (Befund und Behebung)

## Befund (Stand 325c38a, Endleistung)
- **INP** mit `inp.mjs --zustand` am Telefon (390 px), CPU 4×, 3 Läufe: 408 · 568 · 552 ms (Median 552, Ziel ≤ 200).
  - Längste Eingabe: Kontomenü öffnen.
  - Das Verwaltungsmenü lag bei 112–224 ms.
- **Ursache** (Long Animation Frames, `$S/cockpit-inp/loaf.mjs`): Radix öffnet das Dropdown im `pointerdown` und baut Inhalt, Positionierung, Scroll- und Zeigersperre synchron auf.
  - Skript 379 ms beim ersten Öffnen, 224 ms danach.
  - Davon 160 bzw. 122 ms erzwungene Stil- und Layoutarbeit.

## Behebung (66965d0)
- **`KontoMenue.tsx`:** Das Menü öffnet erst nach dem nächsten Bild (`requestAnimationFrame` → `setTimeout`, gleiches Muster wie das Telefonmenü der Website, 6e1b46a). Der Knopf gibt sofort Rückmeldung.
  - `modal={false}`: keine Scroll-Sperre und keine Zeigersperre auf dem ganzen Dokument.
  - Escape, ein Klick daneben und Fokus außerhalb schließen weiterhin.
- **`Seitenleiste.tsx`:** Die Navigation erscheint per `useDeferredValue` im nächsten, unterbrechbaren Durchlauf. Der Knopf zeigt den neuen Zustand sofort (gleiches Muster wie die Reiter, de91dcd).
- **Wirkung nur in der Verwaltung:** Beide Dateien bindet nur `src/app/[locale]/verwaltung/(geschuetzt)/layout.tsx` ein. Öffentliche Seiten sind unverändert; die Messungen am Endstand 325c38a gelten weiter.

## Nachmessung (66965d0, 3500 neu gebaut)
- **INP:** 5 Läufe 112 · 96 · 112 · 104 · 104 ms, Median 104 ms ≤ 200 (`C3b-inp-cockpit.md`).
- **Tastatur und Maus** (`$S/cockpit-inp/tastatur.mjs`, 390 und 1440):
  - Enter öffnet, der Fokus liegt im Menü, Pfeil abwärts geht zu „Abmelden“.
  - Escape schließt und gibt den Fokus an den Knopf zurück.
  - Ein Klick daneben schließt.
  - Das Verwaltungsmenü öffnet (`aria-expanded=true`, Navigation sichtbar) und schließt mit Escape.
- **Lighthouse** (3 Läufe, angemeldet; `C3b-lh-cockpit.md`):
  - Performance 83 (81–90), LCP 1,96 s, CLS 0, Barrierefreiheit und Best Practices 100.
  - SEO 66 nur durch das gewollte `noindex, nofollow` der Verwaltung (Audit `is-crawlable`; die Verwaltung darf nicht in Suchmaschinen).
  - JavaScript 253 kB gz: Das Budget „JavaScript beim ersten Laden einer öffentlichen Seite“ (AUFTRAG BUDGETS) gilt für öffentliche Seiten, das Cockpit liegt hinter der Anmeldung.
- **E2E** der betroffenen Abläufe (Abmelden über das Kontomenü, Benutzer, Seiteninhalte): siehe unten.

**E2E am neuen Build** (`$S/e2e/verwaltung-menue.sh`, bau-head 66965d0, Port 3700, ohne Wiederholung, 20:57 UTC):
- `verwaltung-anmeldung.spec.ts`: 5/5 grün, darunter Abmelden über das Kontomenü.
- `verwaltung-benutzer.spec.ts`: 2/2 grün, darunter das Kontomenü von der Übersicht aus.
- `verwaltung-seiteninhalte-organisationen.spec.ts`: 3/3 grün.
- Zusammen 10 grün, 0 rot. Die 10 Telefon-Läufe sind wie vorgesehen übersprungen (Verwaltungsabläufe nur am Desktop).
