# ADR 0037 – Lern-App: eigener Bereich, Wurzel-Layout, Oberflächensprachen de/tr/ar und RTL

- Status: **angenommen im Tor L0 (20.10.2026)** mit den Abschnitten „Fortschreibung …“ (Orchestrator nach L3-E12; Gegenprüfung L0 ohne Mangel hoch/mittel) · vorher: angenommen im Kern (Nutzerentscheidungen vom 16.10.2026 „Platzierung“ und „Oberfläche“, L3-E05, L3-E08); Nr. 1–9 in der Ausgestaltung vorgeschlagen, Bestätigung durch Spike S1 im L0-Tor (Lauf Lern-App) · Bezug: Plan „Lern-App“ Kontext („Verfeinerung“, Adresse) und §2.1; `_lernapp/PLAN.md` §1 (Befunde 1–7), §3.1–3.5; Adresse L3-E11 · ändert das Website-Routing (ADR 0016, K-02) nicht

## Kontext

- Die Lern-App ist ein eigener Bereich der bestehenden Web-App, als PWA installierbar, mit den gleichen Konten. Die Oberfläche gibt es auf Deutsch, Türkisch und Arabisch, Arabisch vollständig von rechts nach links. Die übrige Website bleibt de/tr/en (Nutzerentscheidung).
- next-intl kennt nur de/tr/en (`web/src/i18n/routing.ts`, `as-needed`). `web/src/i18n/request.ts` antwortet bei unbekannter Sprache mit `notFound`. Der Proxy (`web/src/proxy.ts`) schreibt jede Adresse ohne Präfix auf `/de/…` um.
- Feste Muster `(tr|en)` stehen in Proxy, Sicherheitsheadern, Root-Service-Worker und `request.ts`. Die Website hat 1.887 vorgerenderte Seiten.
- Der Root-Service-Worker (`web/public/sw.js`, Scope `/`) löscht beim Aktivieren alle Caches außer `igmg-v1-*` und `igmg-koran-v1`. Das Manifest (`web/src/app/manifest.ts`) hat Scope `/`.
- Eine installierte iOS-PWA hat eine eigene Cookie-Ablage. Eine Anmeldung auf der Website gilt dort nicht.
- Der genehmigte Plan sah `/app/[ui]` vor. Der Ordner hieße dann `web/src/app/app/…`.

## Entscheidung

1. **Adresse** `/lern-app/[ui]` mit `ui` aus `de`, `tr`, `ar` (L3-E11). `ar` kommt **nicht** in `routing.locales`.

   | Adresse                                                                                                    | Art                                                                                   |
   | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
   | `/lern-app`                                                                                                | Proxy 308 → `/lern-app/de`                                                            |
   | `/(tr\|en)/lern-app/…`                                                                                     | Proxy 308 → `/lern-app/tr/…` bzw. `/lern-app/de/…` (Links aus der Website)            |
   | `/lern-app/[ui]`, `/lern-app/[ui]/[kurs]`, `…/fortschritt`, `…/wortschatz`, `…/einstellungen`, `…/quellen` | statisch                                                                              |
   | `/lern-app/[ui]/[kurs]/{ueben,wiederholen,einstufung,tipps}`                                               | statische Hülle, Lektion bzw. Einheit über den Suchparameter                          |
   | `/lern-app/[ui]/gruppe`                                                                                    | statische Hülle, Daten über die API: Zuweisungen, Gruppenziel, Bestenliste (ADR 0043) |
   | `/lern-app/[ui]/anmelden`                                                                                  | dynamisch, Nonce-CSP, `noindex`, `no-store`                                           |
   | `/lern-app/[ui]/manifest.webmanifest`                                                                      | Route, Manifest je Oberflächensprache                                                 |
   | `/lern-app/{pakete,audio,modelle}/…`                                                                       | Routen nach ADR 0039 und ADR 0042                                                     |

2. **Wurzel-Layout** `web/src/app/lern-app/[ui]/layout.tsx` außerhalb von `[locale]`:
   - `generateStaticParams` für de/tr/ar, `dynamicParams = false`
   - setzt `<html lang dir>`; `ar` ergibt `dir="rtl"`
   - lädt die Schriften (ADR 0044), meldet `/lern-app/sw.js` an und setzt das eigene Manifest
   - eigene `not-found.tsx` und `error.tsx`
   - Spike S1 belegt: Das statische Segment `lern-app` hat Vorrang vor `[locale]`; der Bau ist unter Cache Components grün; `app/manifest.ts` wird nicht zusätzlich verlinkt.
3. **Proxy** (gemeinsame Datei, nur der Orchestrator ändert sie): Die Regeln aus Nr. 1 stehen vor `sprachRouting`. Alle übrigen Adressen unter `/lern-app/` laufen ohne next-intl durch.
4. **Seiten ohne Cookies:** Die Lern-App-Seiten sind statisch und setzen keine Cookies. Den Kontostand holt der Client über `/api/lernapp/sitzung`. Die Anmeldung liegt im Scope der PWA unter `/lern-app/[ui]/anmelden` (E-Mail, Benutzername für Kinder, Passkey, TOTP; O-7).
5. **Texte der Oberfläche:**
   - Dateien `web/messages/lernapp/{de,tr,ar}.json`, Namensraum `lernapp`. Sie liegen nicht in `messages/bereiche`, denn dort gilt de/tr/en. K-02 gilt: kein Text im Code.
   - Server: `createTranslator` aus next-intl mit ausdrücklichem `locale`, ohne `getRequestConfig`.
   - Client: kein next-intl. Ein kleiner ICU-Teilformatierer (`web/src/lib/lernapp/format.ts`) kann `{name}` und `{n, plural, …}` mit `Intl.PluralRules`; Arabisch hat sechs Pluralkategorien. Ein Unit-Test vergleicht ihn mit `createTranslator`.
   - `web/scripts/sprachen-pruefen.mjs` prüft zusätzlich: Schlüssel von de sind in tr und ar enthalten, Platzhalter gleich; ar darf mehr Pluralkategorien haben.
6. **Rechts nach links:**
   - In `web/src/components/lernapp/**` nur logische Eigenschaften und Klassen (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`, `text-start`); Spiegelung von Pfeilen und Fortschrittsrichtung über `rtl:`. Der Regeltest `tests/unit/lernapp/rtl-regeln.test.ts` verbietet physische Richtungen dort.
   - Jeder Inhalt in einer anderen Sprache trägt `lang` und `dir`. Gemischte Zeilen isolieren die Richtung (`<bdi>`, `unicode-bidi: isolate`).
   - Neue Strukturwerte nur als `@utility` in `globals.css` (Vorschlag: `auslauf-anfang`, `auslauf-ende`, `raster-wortbank`, `lern-leiste`); `freie-werte.mjs` meldet 0.
   - Die globale Regel für `[dir='rtl']` in `globals.css` wird eingegrenzt (ADR 0044).
   - Ziffern in der arabischen Oberfläche: östlich-arabisch, umschaltbar auf westliche (O-5).
7. **Sprachen und Kurse:**
   - Oberflächensprache und Ausgangssprache sind getrennte Einstellungen. Standard: Beide sind gleich.
   - Sprachkurse: `tr-aus-de`, `ar-aus-de`, `de-aus-tr`, `ar-aus-tr`, `de-aus-ar`, `tr-aus-ar`.
   - Wissen `islam`: Inhalt nur Deutsch, unter jeder Oberflächensprache erreichbar, mit dem Hinweis „auf Deutsch“.
   - Koran-Arabisch `koran`: Bedeutungen de oder tr je nach Oberfläche; in der arabischen Oberfläche ausgeblendet.
8. **PWA:**
   - Manifest je Oberflächensprache mit `lang`, `dir`, `id` und `scope` `/lern-app/`, eigenem Namen `[Name der App in de/tr/ar festlegen; Plan-Vorschlag „IGMG Lernen“]` und Symbolen aus dem Achtstern.
   - Eigener Service Worker `web/public/lern-app/sw.js` mit Scope `/lern-app/`. Der genauere Scope steuert die Lern-App-Seiten. Vorrat `igmg-lernapp-schale-v<N>` für die Hülle; die Caches für Pakete, Audio und Modelle regeln ADR 0039 und ADR 0042. Nie vorgehalten: `/api/**` und `/lern-app/*/anmelden`.
   - Der Root-Service-Worker behält beim Aktivieren alle Caches `igmg-lernapp-*` (gemeinsame Datei).
   - Push-Erinnerungen laufen über die bestehende Root-Registrierung (ADR 0043).
9. **Einstieg und Verwaltung:**
   - `/lernen` bekommt die Stationen „Sprachen lernen“ und „Wissen üben“ als einfache Links `<a href="/lern-app/…">`. `Link` aus `@/i18n/link` kennt nur Pfade aus `routing.pathnames`.
   - Die Verwaltung der Lern-App liegt unter `/verwaltung/lernapp/**` und bleibt deutsch (ADR 0016). Einzige Ausnahme ist die Prüfoberfläche Sprache (ADR 0041).

## Fortschreibung durch Spike S1 (16.10.2026, Beleg `_lernapp/belege/S1-S6-wurzel-layout-und-sw.md`)

Gilt vor Nr. 1–9, wo es abweicht.

1. **Nr. 2, statische Parameter:** `dynamicParams = false` bricht den Bau unter Cache Components. Stattdessen gilt `unstable_paramMatching = { ui: 'not-found' }` mit Prüfung im Layout, der Proxy-Weiche für unbekannte Oberflächensprachen und einer festen Fangroute `[ui]/[...rest]` (Suspense, `ensureStatic = 'navigation'`). Ohne Fangroute trifft `[locale]/[...rest]` unbekannte Lern-App-Adressen. Ein E2E-Test („`/lern-app/xx` und `/lern-app/de/xyz` → 404 mit `html[lang][dir]` der Lern-App“) macht eine Änderung der unstabilen API bei einem Next-Update sichtbar.
2. **Nr. 2, bestätigt:** Das statische Segment `lern-app` hat Vorrang vor `[locale]`; der Bau ist unter Cache Components grün; `app/manifest.ts` wird nicht zusätzlich verlinkt.
3. **Nr. 1/3, Proxy:** zusätzlich `/de/lern-app…` → 308 in einem Sprung (sonst zwei Sprünge über next-intl) und `/lern-app/en…` → `/lern-app/de…`. Eine Oberflächensprache im Rest bleibt erhalten (`/tr/lern-app/ar` → `/lern-app/ar`).
4. **Nr. 5, Texte:** In der Lern-App wird `next-intl/server` (`getTranslations`) nie genutzt: `request.ts` liest `locale()`, das unter `/lern-app` fehlt, und ruft dann `notFound()` (aus dem Code abgeleitet, nicht ausgeführt). Nur `createTranslator` mit ausdrücklicher Sprache; Regeltest.
5. **Nr. 8, Manifest:** **eine** `id` `/lern-app/` für alle drei Sprachen (eine installierte App); `start_url` ist die Sprache bei der Installation; statische Route mit `s-maxage=31536000`. Der Name bleibt beim Vorstand (Platzhalter `[IGMG Lernen]`, `[IGMG Öğren]`, für ar ein Platzhalter in eckigen Klammern); kein Agent setzt den arabischen Namen.
6. **Nr. 8, Root-Service-Worker:** Das Behalten von `igmg-lernapp-*` ist zwingend (die Gegenprobe löscht sonst alle Lern-App-Caches). Zusätzlich lässt der Root-SW `/lern-app/**` ganz durch (Entscheidung des Orchestrators; im Spike nur als Option benannt), damit beim ersten Besuch ohne Netz nicht die Offline-Seite der Website erscheint.
7. **Risiken für S-L1:** `ensureStatic = 'navigation'` speichert jede neue unbekannte Adresse (wie `[locale]/[...rest]` der Website); Pfade mit Punkt gehen am Proxy vorbei (gering). E2E-Tests für Offline schneiden Anfragen auf Kontext- oder Seitenebene ab oder beenden den Server – `context.setOffline` erfasst die Anfragen des Service Workers nicht.

## Alternativen

- `ar` als vierte Sprache in next-intl: verworfen. Das ändert Routing, Proxy, Header, Service Worker und 1.887 vorgerenderte Seiten, und die Website soll de/tr/en bleiben (Nutzerentscheidung).
- Adresse `/app/[ui]` (genehmigter Plan §2.1): verworfen zugunsten von `/lern-app/[ui]` (L3-E11). Ein Ordner `web/src/app/app/…` ist missverständlich, und `/lern-app` ist sprechender.
- Eigene Anwendung oder Subdomain: verworfen. Die Nutzerentscheidung verlangt einen Bereich der bestehenden Web-App mit gleichen Konten.
- Oberflächensprache fest an die Ausgangssprache gekoppelt: nicht gewählt. Wer Arabisch spricht und Deutsch lernt, will die Oberfläche eventuell auf Türkisch.
- Anmeldung nur über die Website: verworfen. In der installierten iOS-PWA käme die Sitzung nicht an (O-7).
- Ein gemeinsamer Service Worker für Website und Lern-App: verworfen. Die Lern-App braucht eigene Caches und einen eigenen Scope für die Installation.

## Folgen

- Gemeinsame Dateien ändert nur der Orchestrator: `proxy.ts`, `header.ts`, `next.config.ts`, `public/sw.js`, `globals.css`, `sprachen-pruefen.mjs`.
- Tests:
  - Unit: `rtl-regeln`, `format` (Teilformatierer gleich `createTranslator`, arabische Plurale), `bundle-regeln` (kein next-intl im Client der Lern-App).
  - E2E: Rauchtest je Oberflächensprache (Start, Pfad, Lektion); in `ar` gilt `html[dir=rtl]` und kein Überlauf bei 390 px; axe auf allen Lern-App-Routen × 3 Sprachen × 2 Breiten.
  - E2E: Ein Update des Root-Service-Workers behält den Vorrat der Lern-App.
  - Website unverändert: Routenlauf und Anzahl vorgerenderter Seiten wie vor der Lern-App.
- Risiko iOS: Speicher kann geräumt werden. Gegenmittel in ADR 0038 (Installation empfehlen, Abgleich, Datei-Export).
- OFFENE FRAGE: Name der App in de/tr/ar für Manifest und Startbildschirm (Vorstand).
