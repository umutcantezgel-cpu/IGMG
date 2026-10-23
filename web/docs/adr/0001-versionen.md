# ADR 0001 – Versionen und Verträglichkeit der Bausteine

- Status: angenommen · Datum: 2026-10-11 · Phase P0.3 · Kern 1.0
- Grundlage: `npm view` (Registry, 2026-10-11), GitHub-Advisories (`gh api /advisories`), Next.js-Blog/Doku, Lichtungen (a) und (b). Rohberichte der Erkundung: npm-Versionen, Verträglichkeit/Sicherheit, Next-16-Doku (Workflow wf_ddb8a36f-a50).

## Ziel
Ein Satz aktueller, stabiler, untereinander verträglicher Pakete mit Lizenzen aus G-09, ohne offene hohe oder kritische Sicherheitsmeldungen, der jahrelang mit wenig Pflege läuft.

## Wege
1. **Jeweils neueste Major-Version** jedes Pakets (TypeScript 7, ESLint 10, drizzle v1-RC …).
2. **Vorgaben von create-next-app 16.4.0 als Anker**, sonst neueste *stabile* Version, die mit den Peers verträglich ist.
3. **Konservativ eine Linie zurück** (Next 16.3, React 19.2, …) für mehr Reife.

## Bewertung
- Weg 1 scheitert an echten Peer-Konflikten: `typescript-eslint` 8.71 verlangt `typescript <6.1.0`; `eslint-plugin-jsx-a11y` 6.10.2 verlangt `eslint ^3–^9`; drizzle v1 ist nur RC/Beta.
- Weg 3 verfehlt K-13 („immer die neueste Next.js-Patchversion“) und hat bekannte Advisories (16.3.x < 16.3.8).
- **Weg 2 gewählt:** create-next-app 16.4.0 liefert selbst TypeScript 5.9.3 und ESLint 9.39.5 – genau die verträgliche Kombination. Lichtung (a) und (b) haben die Kombination gebaut und laufen lassen.

## Umkehrprobe
Falsch wäre die Wahl, wenn (a) das Sicherheitsupdate vom 14.10.2026 eine neue Minor-Linie (16.5) erzwingt – dann ziehen wir nach (Sofortpaket, K-13); (b) jsx-a11y eine ESLint-10-Version veröffentlicht – dann heben wir ESLint an; (c) Better Auth 1.7.x eine kritische Lücke bekommt – dann Patch-Update, das Schema bleibt.

## Festgelegte Versionen (genaue Pins im Lockfile)
| Bereich | Paket | Version | Lizenz | Hinweis |
|---|---|---|---|---|
| Laufzeit | Node.js | 24 LTS (lokal 24.14.1) | MIT | `engines` ≥ 24 |
| Paketverwaltung | pnpm | 12.11.2 (corepack) | MIT | `packageManager` |
| Kern | next | 16.4.0 → neueste 16.x-Patch | MIT | Update 14.10.2026 sofort einspielen |
| | react, react-dom | 19.3.0 | MIT | |
| | typescript | 5.9.x | Apache-2.0 | nicht 7.x (typescript-eslint) |
| | @types/node | 24.x | MIT | passend zu Node 24 |
| | babel-plugin-react-compiler | 1.0.0 | MIT | `reactCompiler: true` |
| i18n | next-intl | 4.14.9 | MIT | ≥ 4.9.1 wegen Open-Redirect bei `as-needed` |
| Daten | drizzle-orm / drizzle-kit | 0.45.4 / 0.31.11 | Apache-2.0 / MIT | v1-RC nicht verwenden; ≥ 0.45.2 (CVE-2026-39356) |
| | pg (node-postgres) | 8.23.x | MIT | Treiber im Betrieb (`drizzle-orm/node-postgres`); **nicht** `postgres` (Unlicense, nicht in G-09) |
| | @electric-sql/pglite | 0.5.8 | Apache-2.0 | nur Entwicklung/Tests (Alpha, eine Verbindung) |
| Auth | better-auth | 1.7.7 | MIT | alle Advisories 2025–2026 < 1.7.7 behoben |
| | @better-auth/passkey | 1.7.7 | MIT | eigenes Paket |
| Validierung | zod | 4.6.x | MIT | |
| UI | tailwindcss / @tailwindcss/turbopack | 4.3.3 | MIT | Turbopack-Loader wie create-next-app |
| | shadcn (CLI), radix-ui | 4.21.x / 1.7.x | MIT | |
| | lucide-react | 1.55.x | ISC | |
| | class-variance-authority, clsx, tailwind-merge | 0.7.1 / 2.1.1 / 3.7.x | Apache-2.0 / MIT / MIT | |
| Rich-Text | @tiptap/core, react, pm, starter-kit, extension-link, extension-image, static-renderer | 3.31.4 (exakt gleich) | MIT | nur MIT-Teile, keine Pro-Erweiterungen; ≥ 3.30.5 |
| Fachlich | adhan | 4.4.6 | MIT | |
| | rrule | 2.8.1 | BSD-3-Clause | alt, aber stabil |
| | ical-generator | 11.1.x | MIT | |
| | date-fns + @date-fns/tz | 4.4.x / 1.5.x | MIT | |
| | papaparse | 5.7.x | MIT | CSV-Import Gebetszeiten |
| Mail | nodemailer | 10.1.x (≥ 10.0.5) | **MIT-0** | siehe Lizenz-Ausnahmen |
| | react-email | 6.11.x | MIT | `@react-email/components` ist deprecated |
| | @react-email/render | 2.1.x | MIT | `await render()` |
| Spam-Schutz | altcha (Widget) / altcha-lib | 3.3.x / 2.6.x | MIT | kein Obfuscation-Modus; Replay-Schutz selbst |
| Tests | vitest + @vitest/coverage-v8 | 5.0.3 | MIT | braucht `vite` ≥ 6.4 als Dev-Abhängigkeit |
| | @playwright/test | 1.64.0 | Apache-2.0 | Browser chromium-1248 vorhanden |
| | @axe-core/playwright | 4.13.0 | MPL-2.0 | |
| | otpauth | 9.5.x | MIT | nur Tests (TOTP aus Testgeheimnis) |
| Qualität | eslint / eslint-config-next | 9.39.x / 16.4.0 | MIT | |
| | eslint-plugin-jsx-a11y | 6.10.2 | MIT | |
| | prettier / prettier-plugin-tailwindcss | 3.9.x / 0.8.x | MIT | |
| | lint-staged / simple-git-hooks | 17.6.x / 2.14.0 | MIT | Hooks im Repo-Wurzel-.git |
| | server-only | 0.0.1 | MIT | |
| Messung | @lhci/cli | 0.15.1 | Apache-2.0 | |
| | @next/bundle-analyzer | 16.4.0 | MIT | |
| Werkzeug | next-devtools-mcp | 0.4.0 (über `npx` in `.mcp.json`) | MIT | keine Projektabhängigkeit |

## Lizenz-Ausnahmen (mit Begründung, stehen in LIZENZEN.md und MENSCHEN.md M-060)
- **nodemailer – MIT-0:** MIT ohne Hinweispflicht, also freier als MIT; vom Auftrag ausdrücklich als bevorzugter Baustein genannt. Gewertet als MIT-gleichwertig.
- **sharp → @img/sharp-libvips-* – LGPL-3.0-or-later:** optionale Abhängigkeit von `next` für die Bildoptimierung (K-10 verlangt next/image). sharp selbst ist Apache-2.0; libvips wird als getrenntes, dynamisch geladenes Binärpaket unverändert genutzt. Gewertet als zulässig mit Hinweis; Alternative wäre `images.unoptimized` mit Vorab-Skalierung beim Upload.
- **Schriften (Atkinson Hyperlegible Next, Source Serif 4, Amiri) – SIL OFL 1.1:** keine npm-Pakete, sondern über next/font zur Buildzeit selbst gehostete Schriftdateien; OFL ist die übliche offene Schriftlizenz (ADR 0014).

## Folgen zweiter Ordnung
- Das Sicherheitsupdate vom 14.10.2026 (zwei kritische, eine hohe Lücke in Upstream-Abhängigkeiten) wird als Sofortpaket eingespielt; bis dahin gilt 16.4.0 als neueste Linie ohne bekannte offene Advisories.
- Mit TypeScript 5.9 statt 7 verzichten wir vorerst auf den schnelleren Go-Compiler; Wechsel, sobald typescript-eslint TS 7 unterstützt (Pflegehinweis in BETRIEB.md).
- `pg` statt `postgres` hält G-09 ein; Better Auth und Drizzle unterstützen beide.
- Drizzle v1 ist absehbar; Migration erst nach stabilem Release (Pflegehinweis).
- PGlite ist nur Entwicklungs-/Testdatenbank; Produktion und docker-compose nutzen PostgreSQL.

## Fortschreibung 23.10.2026 – Sicherheitsupdate Next.js 16.4.2
- `next`, `eslint-config-next` und `@next/bundle-analyzer` stehen auf **16.4.2** (veröffentlicht 15.10.2026). 16.4.0 ist von
  GHSA-2464-fhr4-w9xw (kritisch, Remote-Code-Ausführung in der Image Optimization API mit SVG), GHSA-673q-mjm6-r5xr (kritisch,
  Remote-Code-Ausführung in `use cache`-Funktionen mit Typed Arrays) und GHSA-p3m5-59mp-jv5r (hoch, Denial of Service bei Server
  Actions) betroffen; behoben ab 16.4.1. Das ist das oben angekündigte Sofortpaket.
- Die Mindestreife von 14 Tagen (L0-E10) gilt für Sicherheits-Fixes nicht (ENTSCHEIDUNGEN L3-E14).
- Der Patch gegen doppelte Kopfzeilen beim Cache-MISS (`patches/next@16.4.2.patch`, BETRIEB.md) ließ sich unverändert anwenden;
  der Fehler besteht in 16.4.2 fort.
