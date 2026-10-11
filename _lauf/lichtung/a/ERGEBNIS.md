# Lichtung (a) – next-intl mit Cache Components rendert statisch · ERGEBNIS: GELUNGEN (2026-10-11)

**Frage:** Rendert next-intl 4 mit `cacheComponents`, `partialPrefetching` und `ensureStatic = 'navigation'` die Seiten `/`, `/tr`, `/en` statisch – mit lokalisierten Pfaden, ohne Cookies?

**Aufbau (Spike):** create-next-app 16.4.0 (`--yes --ts --tailwind --eslint --app --src-dir --use-pnpm --no-agent-feedback`), next-intl 4.14.9.
- `src/i18n/routing.ts`: `locales ['de','tr','en']`, `defaultLocale 'de'`, `localePrefix 'as-needed'`, `localeDetection false`, `localeCookie false`, `alternateLinks false`, `pathnames` mit `/gebetszeiten` → tr `/namaz-vakitleri`, en `/prayer-times`.
- `src/i18n/request.ts`: Locale über `next/root-params` (`rootParams.locale()`), `hasLocale`, Nachrichten per dynamischem Import.
- `src/proxy.ts`: `createMiddleware(routing)`.
- `src/app/[locale]/layout.tsx`: `<html lang={await locale()}>`, `generateStaticParams` über alle Locales, `NextIntlClientProvider`.
- Seite mit `'use cache'` + `cacheLife('max')` + `cacheTag('veranstaltungen')`, `getTranslations`, `Link` aus `createNavigation`, `export const ensureStatic = 'navigation'`.

**Ergebnis `next build`:** `○ /de`, `○ /tr`, `○ /en`, `○ /de/gebetszeiten`, `○ /tr/gebetszeiten`, `○ /en/gebetszeiten` – alles statisch, `ensureStatic` bestätigt.
**Laufzeit (`next start`):** `/` 200, `/tr` 200 (`<html lang="tr">`), `/gebetszeiten` 200, `/tr/namaz-vakitleri` 200, `/de/gebetszeiten` → 307 `/gebetszeiten`, `/en/gebetszeiten` → 307 `/en/prayer-times`. **Kein `Set-Cookie`** auf allen Routen. Links: de `/gebetszeiten`, tr `/tr/namaz-vakitleri`, en `/en/prayer-times`.

**Lehren für das Fundament (gehen in MUSTER.md):**
1. Der `Link` von next-intl ist eine Client-Komponente mit `useLocale()` → `NextIntlClientProvider` im Layout ist Pflicht, sonst bricht das Prerendering ohne lesbare Meldung ab.
2. `Link` **ohne** `locale`-Prop verwenden; die Angabe von `locale` erzwingt das Präfix (`/de/...`) auch für die Standardsprache. Nur der Sprachumschalter setzt `locale`.
3. Locale über `next/root-params` (ab 16.3 stabil) – kein `setRequestLocale` nötig.
4. `alternateLinks: false`: hreflang setzen wir selbst über `generateMetadata` (`alternates.languages` inkl. `x-default`), damit der Proxy keine `Link`-Header erzeugt und statische Seiten unverändert bleiben.
5. `NextIntlClientProvider` bekommt nur die Nachrichten, die Client-Komponenten brauchen (Budget K-12: 180 kB JS).
