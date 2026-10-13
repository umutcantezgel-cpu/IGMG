import 'server-only';
import { and, asc, eq, gte, inArray, lte, or } from 'drizzle-orm';
import type { AnzeigeSprache } from '@/lib/anzeige/folien';
import { db, schema } from '@/lib/db';
import { BUKHARI } from '@/lib/hadith/anzeige';
import { ausgabeFuer } from '@/lib/quran/ausgaben';
import { ladeAusgaben } from './quran';

/**
 * Verweise auf religiöse Inhalte auflösen (Anzeige-Folien, Vers/Hadith des Tages; AUFTRAG 3.7/3.10, ADR 0030):
 * Verstext nur aus dem Tanzil-Import, Übersetzung nur aus der **freigegebenen** Ausgabe der jeweiligen Sprache,
 * Hadith-Übersetzung nur mit Freigabe „geprueft“. Nie eigener religiöser Text. Ohne eigenen Cache – Aufrufer sind
 * `'use cache'`-Funktionen mit den Tags `quran`/`hadith`.
 */
const SPRACHEN: readonly AnzeigeSprache[] = ['de', 'tr', 'en'];

export type VersVerweis = { sure: number; von: number; bis: number };
export type AufgeloesterVers = {
  sure: number;
  sureName: string;
  sureNameAr: string;
  verse: { nr: number; textAr: string }[];
  uebersetzung: Partial<Record<AnzeigeSprache, { text: string; quelle: string }>>;
};

export const versSchluessel = (v: VersVerweis) => `${v.sure}:${v.von}-${v.bis}`;

/** Übersetzung mehrerer Verse in einem Text; bei mehr als einem Vers mit Versnummer in Klammern davor. */
function verbinde(teile: { nr: number; text: string }[]): string {
  return teile.length === 1 ? teile[0].text : teile.map((t) => `(${t.nr}) ${t.text}`).join(' ');
}

/** Verse auflösen; ein Verweis fehlt im Ergebnis, wenn nicht alle seine Verse importiert sind. */
export async function loeseVerse(verweise: readonly VersVerweis[]): Promise<Map<string, AufgeloesterVers>> {
  const ergebnis = new Map<string, AufgeloesterVers>();
  if (!verweise.length) return ergebnis;
  const v = schema.quranVers;
  const suren = [...new Set(verweise.map((r) => r.sure))];
  const sichtbar = await ladeAusgaben(false);
  const ausgaben = SPRACHEN.map((s) => ({ sprache: s, ausgabe: ausgabeFuer(sichtbar, s) })).filter((a) => a.ausgabe);
  const u = schema.quranUebersetzung;
  const [verse, namen, uebersetzungen] = await Promise.all([
    db
      .select({ sure: v.sure, vers: v.vers, textAr: v.textAr })
      .from(v)
      .where(or(...verweise.map((r) => and(eq(v.sure, r.sure), gte(v.vers, r.von), lte(v.vers, r.bis)))))
      .orderBy(asc(v.sure), asc(v.vers)),
    db
      .select({ nr: schema.quranSure.nr, nameAr: schema.quranSure.nameAr, umschrift: schema.quranSure.nameUmschrift })
      .from(schema.quranSure)
      .where(inArray(schema.quranSure.nr, suren)),
    ausgaben.length
      ? db
          .select({ ausgabeId: u.ausgabeId, sure: u.sure, vers: u.vers, text: u.text })
          .from(u)
          .where(
            and(
              inArray(
                u.ausgabeId,
                ausgaben.map((a) => a.ausgabe!.id),
              ),
              or(...verweise.map((r) => and(eq(u.sure, r.sure), gte(u.vers, r.von), lte(u.vers, r.bis)))),
            ),
          )
      : Promise.resolve([]),
  ]);
  const name = new Map(namen.map((n) => [n.nr, n]));
  for (const r of verweise) {
    const eigene = verse.filter((z) => z.sure === r.sure && z.vers >= r.von && z.vers <= r.bis);
    const sure = name.get(r.sure);
    if (!sure || eigene.length !== r.bis - r.von + 1) continue;
    const uebersetzung: AufgeloesterVers['uebersetzung'] = {};
    for (const { sprache, ausgabe } of ausgaben) {
      const teile = eigene.map((z) => ({
        nr: z.vers,
        text: uebersetzungen.find((t) => t.ausgabeId === ausgabe!.id && t.sure === z.sure && t.vers === z.vers)?.text,
      }));
      if (teile.every((t) => t.text))
        uebersetzung[sprache] = { text: verbinde(teile as { nr: number; text: string }[]), quelle: ausgabe!.uebersetzer };
    }
    ergebnis.set(versSchluessel(r), {
      sure: r.sure,
      sureName: sure.umschrift || sure.nameAr,
      sureNameAr: sure.nameAr,
      verse: eigene.map((z) => ({ nr: z.vers, textAr: z.textAr })),
      uebersetzung,
    });
  }
  return ergebnis;
}

export type AufgeloesterHadith = {
  nummer: string;
  textAr: string;
  uebersetzung: Partial<Record<AnzeigeSprache, { text: string; quelle: string }>>;
};

/** Hadithe aus Sahih al-Bukhari (Import) mit geprüften Übersetzungen; unbekannte Nummern fehlen im Ergebnis. */
export async function loeseHadithe(nummern: readonly string[]): Promise<Map<string, AufgeloesterHadith>> {
  const ergebnis = new Map<string, AufgeloesterHadith>();
  const eindeutig = [...new Set(nummern)];
  if (!eindeutig.length) return ergebnis;
  const u = schema.hadithUebersetzung;
  const [hadithe, uebersetzungen] = await Promise.all([
    db
      .select({ nummer: schema.hadith.nummer, textAr: schema.hadith.textAr })
      .from(schema.hadith)
      .where(and(eq(schema.hadith.sammlungId, BUKHARI), inArray(schema.hadith.nummer, eindeutig))),
    db
      .select({ nummer: u.nummer, sprache: u.sprache, text: u.text, uebersetzer: u.uebersetzer })
      .from(u)
      .where(and(eq(u.sammlungId, BUKHARI), eq(u.freigabe, 'geprueft'), inArray(u.nummer, eindeutig))),
  ]);
  for (const h of hadithe) {
    const uebersetzung: AufgeloesterHadith['uebersetzung'] = {};
    for (const z of uebersetzungen)
      if (z.nummer === h.nummer && (SPRACHEN as readonly string[]).includes(z.sprache))
        uebersetzung[z.sprache as AnzeigeSprache] = { text: z.text, quelle: z.uebersetzer };
    ergebnis.set(h.nummer, { nummer: h.nummer, textAr: h.textAr, uebersetzung });
  }
  return ergebnis;
}
