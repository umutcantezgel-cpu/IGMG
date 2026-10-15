import { z } from 'zod';
import type { Locale } from '@/i18n/routing';
import { hadithNummerAus, teilVon, type Ausschnitt } from '@/lib/hadith/anzeige';
import { sucheNormal } from '@/lib/quran/suche';

/**
 * Titel-Index der Suche ohne Laufzeit-Datenbank (Beispielmodus, ADR 0019; Endprüfung Stufe C: live zeigte die Suche
 * immer „Keine Treffer“). Beim Bau entsteht aus der Bau-Datenbank eine kompakte Datei mit den Titeln öffentlicher
 * Inhalte und der Zuordnung „Hadith-Nummer → Buch und Teil“ (`scripts/suchindex.ts`, `titelindex-bau.ts`). Die Seite
 * /suche liest sie nur, wenn keine Datenbank da ist; mit Datenbank sucht sie unverändert im Volltext (`suche.ts`).
 * Der Index enthält keine religiösen Texte: Surennamen und Buchtitel stammen aus den Quelldaten (web/daten), Hadithe
 * nur als Nummer mit Stelle. Reine Funktionen ohne Datenbank, vollständig unit-testbar.
 */
export const SUCHINDEX_VERSION = 1;
/** Dateiname im Projektstamm (gitignored); beim Bau geschrieben, in die Funktion der Suche mitgenommen (next.config.ts). */
export const SUCHINDEX_DATEI = '.suchindex.json';
/** Höchstens so viele Titel-Treffer (wie die Volltextsuche, `suche.ts`). */
export const TITEL_MAX = 30;

const mehrsprachig = z.object({ de: z.string().optional(), tr: z.string().optional(), en: z.string().optional() });
const slug = z.string().min(1).max(200);

const eintrag = z.discriminatedUnion('art', [
  z.object({ art: z.literal('nachricht'), slug, titel: mehrsprachig }),
  z.object({ art: z.literal('veranstaltung'), slug, titel: mehrsprachig }),
  z.object({ art: z.literal('wissen'), slug, titel: mehrsprachig }),
  z.object({
    art: z.literal('seite'),
    slugs: z.object({ de: slug, tr: slug.nullable(), en: slug.nullable() }),
    titel: mehrsprachig,
  }),
  z.object({
    art: z.literal('sure'),
    nr: z.number().int().min(1).max(114),
    umschrift: z.string(),
    nameAr: z.string(),
    name: mehrsprachig.nullable(),
  }),
  z.object({ art: z.literal('hadithBuch'), nr: z.number().int().min(1).max(999), titel: z.string() }),
]);
export type IndexEintrag = z.infer<typeof eintrag>;

/** Hadith-Nummern je Buch in der Reihenfolge der Quelle: [Buch, [[Nummer, Hadith im Buch (0 = ohne)], …]]. */
const hadithBuecher = z.array(z.tuple([z.number().int().min(1), z.array(z.tuple([z.string().min(1).max(12), z.number().int().min(0)]))]));

const suchIndex = z.object({
  version: z.literal(SUCHINDEX_VERSION),
  erzeugt: z.string(),
  eintraege: z.array(eintrag),
  hadith: z.object({ buecher: hadithBuecher }).nullable(),
});
export type SuchIndex = z.infer<typeof suchIndex>;

/** Gelesene Datei prüfen; ungültig oder alte Version → null (die Seite zeigt dann einen Hinweis statt Treffern). */
export function pruefeSuchIndex(roh: unknown): SuchIndex | null {
  const p = suchIndex.safeParse(roh);
  return p.success ? p.data : null;
}

/** Art eines Titel-Treffers; `seite` umfasst freie Seiten (CMS) und die festen Seiten aus dem Menü. */
export type TitelArt = 'seite' | 'sure' | 'hadithBuch' | 'nachricht' | 'veranstaltung' | 'wissen';
/** Reihenfolge der Gruppen in der Trefferliste. */
export const TITEL_ARTEN: readonly TitelArt[] = ['seite', 'sure', 'hadithBuch', 'nachricht', 'veranstaltung', 'wissen'];

/**
 * Titel-Treffer: `ziel` ist eine fertige Adresse (feste und freie Seiten) oder Art und Schlüssel, aus denen die Seite
 * die lokalisierte Adresse baut. `nebentitel`: Zusatz in der Karte (Arabischer Surenname aus den Daten, Sprache `ar`).
 */
export type TitelTreffer = {
  art: TitelArt;
  titel: string;
  titelSprache?: 'en';
  nebentitel?: string;
  nr?: number;
  slug?: string;
  href?: string;
};

/** Feste Seite aus dem Menü (Header): Beschriftung und fertige Adresse in der Sprache der Seite. */
export type FesteSeite = { titel: string; href: string };

function inSprache(t: z.infer<typeof mehrsprachig> | null, sprache: Locale): string {
  return t?.[sprache] || t?.de || '';
}

/** Suchbegriff → Vergleichsform; Anführungszeichen und Ausschluss der Volltextsuche zählen hier nicht. */
function vergleich(begriff: string): string {
  return sucheNormal(begriff.replace(/["„“”]/g, ' ').replace(/(^|\s)-\S+/g, ' '));
}

/**
 * Titel, die den Begriff enthalten (vereinfacht wie die Surensuche: ohne Groß/klein, Akzente, Satzzeichen und
 * Vokalzeichen; „Fatiha“ findet „Al-Faatiha“). Titel, die mit dem Begriff beginnen, stehen vorn. Ab zwei Zeichen.
 */
export function sucheTitel(index: SuchIndex, begriff: string, sprache: Locale, feste: readonly FesteSeite[] = []): TitelTreffer[] {
  const q = vergleich(begriff);
  if (q.length < 2) return [];
  const kandidaten: { t: TitelTreffer; schluessel: string[] }[] = [];
  const gesehen = new Set<string>();
  for (const s of feste) {
    if (gesehen.has(s.href)) continue;
    gesehen.add(s.href);
    kandidaten.push({ t: { art: 'seite', titel: s.titel, href: s.href }, schluessel: [s.titel] });
  }
  for (const e of index.eintraege) {
    switch (e.art) {
      case 'nachricht':
      case 'veranstaltung':
      case 'wissen': {
        const titel = inSprache(e.titel, sprache);
        kandidaten.push({ t: { art: e.art, titel, slug: e.slug }, schluessel: [titel] });
        break;
      }
      case 'seite': {
        const titel = inSprache(e.titel, sprache);
        const slugEigen = (sprache === 'de' ? e.slugs.de : e.slugs[sprache]) || e.slugs.de;
        const href = sprache === 'de' ? `/${slugEigen}` : `/${sprache}/${slugEigen}`;
        if (gesehen.has(href)) break;
        gesehen.add(href);
        kandidaten.push({ t: { art: 'seite', titel, href }, schluessel: [titel] });
        break;
      }
      case 'sure': {
        const name = inSprache(e.name, sprache);
        kandidaten.push({
          t: { art: 'sure', titel: e.umschrift, nebentitel: e.nameAr, nr: e.nr },
          schluessel: [e.umschrift, e.nameAr, name],
        });
        break;
      }
      case 'hadithBuch':
        kandidaten.push({ t: { art: 'hadithBuch', titel: e.titel, titelSprache: 'en', nr: e.nr }, schluessel: [e.titel] });
        break;
    }
  }
  const treffer: { t: TitelTreffer; vorn: boolean }[] = [];
  for (const k of kandidaten) {
    const formen = k.schluessel.filter(Boolean).map(sucheNormal);
    if (!formen.some((f) => f.includes(q))) continue;
    treffer.push({ t: k.t, vorn: formen.some((f) => f.startsWith(q)) });
  }
  return treffer
    .sort((a, b) => Number(b.vorn) - Number(a.vorn) || TITEL_ARTEN.indexOf(a.t.art) - TITEL_ARTEN.indexOf(b.t.art) || a.t.titel.localeCompare(b.t.titel, sprache))
    .slice(0, TITEL_MAX)
    .map((x) => x.t);
}

/** Treffer der Nummernsuche wie `HadithTreffer` aus `suche.ts` (ohne Ausschnitt: der Index enthält keinen Hadithtext). */
export type NummernTreffer = { nummer: string; buchNr: number; imBuchNr: number | null; teil: number; ausschnitt: Ausschnitt; rang: number };

/** „Bukhari 7“, „402.2“ … (dieselbe Erkennung wie die Volltextsuche, `hadithNummerAus`) → Buch und Teil aus dem Index. */
export function sucheHadithNummer(index: SuchIndex, begriff: string): NummernTreffer[] {
  const nummer = hadithNummerAus(begriff);
  if (!nummer || !index.hadith) return [];
  for (const [buchNr, liste] of index.hadith.buecher) {
    const position = liste.findIndex(([n]) => n === nummer);
    if (position < 0) continue;
    const imBuch = liste[position][1];
    return [
      {
        nummer,
        buchNr,
        imBuchNr: imBuch > 0 ? imBuch : null,
        teil: teilVon(position),
        ausschnitt: { teile: [], vorn: false, hinten: false },
        rang: 1,
      },
    ];
  }
  return [];
}
