import { routing, type Locale } from '@/i18n/routing';

/**
 * Adressen freier Seiten und Weiterleitungen (ADR 0032): reine Funktionen ohne Datenbank, vollständig unit-testbar.
 * Eine freie Seite hat je Sprache einen Slug (ein Pfadteil): Deutsch `/<slug>`, Türkisch `/tr/<slug>`, Englisch
 * `/en/<slug>`. Ohne eigenen türkischen oder englischen Slug gilt dort der deutsche (die Seite zeigt dann den deutschen
 * Text mit Rückfall-Hinweis).
 */
export const SLUG_MUSTER = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const SLUG_LAENGE = 80;

/** Pfadteile, die nie eine freie Seite sein dürfen: alle Routen der Website in allen Sprachen und technische Pfade. */
function reservierteSlugs(): ReadonlySet<string> {
  const menge = new Set<string>([
    'verwaltung',
    'api',
    'medien',
    'audio',
    'bilder',
    'symbole',
    'schriften',
    'push-texte',
    'offline',
    'opengraph-image',
    'sitemap-xml',
    'robots-txt',
    'favicon-ico',
    'manifest-webmanifest',
    'sw-js',
    'next',
    'vercel',
    ...routing.locales,
  ]);
  for (const wert of Object.values(routing.pathnames) as (string | Record<Locale, string>)[]) {
    const muster = typeof wert === 'string' ? [wert] : Object.values(wert);
    for (const m of muster) {
      const erster = m.split('/')[1];
      if (erster && !erster.startsWith('[')) menge.add(erster);
    }
  }
  return menge;
}

export const RESERVIERTE_SLUGS = reservierteSlugs();

/** Fehlerschlüssel eines Slugs oder null, wenn er gültig ist. Leere Slugs prüft der Aufrufer (Pflicht nur für Deutsch). */
export function slugFehler(slug: string): 'slug' | 'zuLang' | 'reserviert' | null {
  if (slug.length > SLUG_LAENGE) return 'zuLang';
  if (!SLUG_MUSTER.test(slug)) return 'slug';
  if (RESERVIERTE_SLUGS.has(slug)) return 'reserviert';
  return null;
}

export function istReservierterSlug(slug: string): boolean {
  return RESERVIERTE_SLUGS.has(slug);
}

/** Slug aus einem Titel (ä → ae, ş → s …), höchstens 80 Zeichen; ohne lateinische Buchstaben „seite“. */
export function slugAusTitel(titel: string): string {
  const slug = titel
    .toLowerCase()
    .replaceAll('ä', 'ae')
    .replaceAll('ö', 'oe')
    .replaceAll('ü', 'ue')
    .replaceAll('ß', 'ss')
    .replaceAll('ı', 'i')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, SLUG_LAENGE)
    .replace(/-+$/, '');
  if (!slug) return 'seite';
  return RESERVIERTE_SLUGS.has(slug) ? `${slug}-seite` : slug;
}

export type SeitenSlugs = { de: string; tr: string | null; en: string | null };

/** Wirksamer Slug je Sprache: eigener Slug oder der deutsche. */
export function wirksamerSlug(slugs: SeitenSlugs, sprache: Locale): string {
  return (sprache === 'de' ? slugs.de : slugs[sprache]) || slugs.de;
}

/** Öffentliche Adresse einer freien Seite in einer Sprache (Deutsch ohne Präfix, „as-needed“). */
export function seitenPfad(slugs: SeitenSlugs, sprache: Locale): string {
  const slug = wirksamerSlug(slugs, sprache);
  return sprache === routing.defaultLocale ? `/${slug}` : `/${sprache}/${slug}`;
}

/** Alle öffentlichen Adressen einer Seite. */
export function seitenAdressen(slugs: SeitenSlugs): Record<Locale, string> {
  return { de: seitenPfad(slugs, 'de'), tr: seitenPfad(slugs, 'tr'), en: seitenPfad(slugs, 'en') };
}

/**
 * Kollisionen der wirksamen Slugs mit anderen Seiten: je Sprache darf ein Slug nur einmal vorkommen (sonst wäre die
 * Adresse doppelt belegt). Ergebnis: Sprachen mit Kollision (`de`, `tr`, `en`).
 */
export function slugKollisionen(neu: SeitenSlugs, andere: readonly SeitenSlugs[]): Locale[] {
  const kollision: Locale[] = [];
  for (const sprache of routing.locales) {
    const eigen = wirksamerSlug(neu, sprache);
    if (andere.some((a) => wirksamerSlug(a, sprache) === eigen)) kollision.push(sprache);
  }
  return kollision;
}

/* ---------------------------------------------------------------------------------------------------------------- */
/* Weiterleitungen                                                                                                     */
/* ---------------------------------------------------------------------------------------------------------------- */

/** Pfad einer Weiterleitung: mit „/“ beginnend, Teile aus Buchstaben, Ziffern, `-`, `_`, `~` und %-Kodierung. */
const PFAD_MUSTER = /^\/(?:[A-Za-z0-9_~%-]+(?:\/[A-Za-z0-9_~%-]+)*)?$/;

/** Eingabe vereinheitlichen: Leerraum weg, führender Schrägstrich, kein Schrägstrich am Ende. */
export function normalisierePfad(eingabe: string): string {
  let p = eingabe.trim();
  if (!p.startsWith('/')) p = `/${p}`;
  if (p.length > 1) p = p.replace(/\/+$/, '');
  return p;
}

/** Sprache und Rest eines öffentlichen Pfads („/tr/camimiz“ → tr, „/camimiz“). */
export function zerlegePfad(pfad: string): { sprache: Locale; rest: string } {
  const treffer = /^\/(tr|en)(\/.*)?$/.exec(pfad);
  if (treffer) return { sprache: treffer[1] as Locale, rest: treffer[2] ?? '/' };
  return { sprache: 'de', rest: pfad };
}

/**
 * Fehlerschlüssel für die Quelle einer Weiterleitung oder null. Die Quelle darf keine bestehende Route treffen (sie
 * würde nie greifen): weder die Startseite noch ein reservierter erster Pfadteil.
 */
export function weiterleitungVonFehler(von: string): 'pfad' | 'zuLang' | 'reserviert' | null {
  if (von.length > 300) return 'zuLang';
  if (!PFAD_MUSTER.test(von) || von === '/') return 'pfad';
  const { rest } = zerlegePfad(von);
  const erster = rest.split('/')[1] ?? '';
  if (!erster || RESERVIERTE_SLUGS.has(erster.toLowerCase())) return 'reserviert';
  return null;
}

/** Fehlerschlüssel für das Ziel einer Weiterleitung (Format) oder null. Ob das Ziel existiert, prüft die Action. */
export function weiterleitungNachFehler(nach: string): 'pfad' | 'zuLang' | null {
  if (nach.length > 300) return 'zuLang';
  if (!PFAD_MUSTER.test(nach)) return 'pfad';
  return null;
}

export type Regel = { von: string; nach: string };

/**
 * Führt die neue Regel (zusammen mit den bestehenden) in eine Schleife? Die neue Regel ersetzt eine bestehende mit
 * derselben Quelle. Ketten werden bis zu 20 Schritte verfolgt; längere Ketten gelten ebenfalls als Schleife.
 */
export function fuehrtZuSchleife(bestehend: readonly Regel[], neu: Regel): boolean {
  if (neu.von === neu.nach) return true;
  const karte = new Map(bestehend.filter((r) => r.von !== neu.von).map((r) => [r.von, r.nach]));
  karte.set(neu.von, neu.nach);
  let aktuell = neu.nach;
  const besucht = new Set<string>([neu.von]);
  for (let schritt = 0; schritt < 20; schritt++) {
    const weiter = karte.get(aktuell);
    if (weiter === undefined) return false;
    if (besucht.has(weiter) || weiter === neu.von) return true;
    besucht.add(aktuell);
    aktuell = weiter;
  }
  return true;
}
