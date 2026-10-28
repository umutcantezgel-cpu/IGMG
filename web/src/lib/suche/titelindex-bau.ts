import { and, asc, eq, inArray, isNull, lte, or } from 'drizzle-orm';
import type { Datenbank } from '@/lib/db';
import * as schema from '@/lib/db/schema';
import { BUKHARI } from '@/lib/hadith/anzeige';
import { istEntwurf, oeffentlicheFreigaben } from '@/lib/wissen/entwurf';
import { SUCHINDEX_VERSION, type IndexEintrag, type SuchIndex } from './titelindex';

/**
 * Baut den Titel-Index der Suche aus der Bau-Datenbank (`scripts/suchindex.ts`, Vercel-Bau ohne DATABASE_URL). Gleiche
 * Sichtbarkeit wie die öffentlichen Seiten bzw. die Volltextsuche (`suche.ts`): nur Veröffentlichtes, nicht im
 * Papierkorb, Wissensthemen nur religiös geprüft (mit `wissenEntwuerfe` – Schalter `website_wissen_vorschau`, ADR 0047 –
 * auch „zur Prüfung“, gekennzeichnet mit `entwurf` für die Marke „Entwurf“ der Trefferliste), Neuigkeiten und freie Seiten
 * nicht vor ihrem Datum. Hadith-Bücher und -Nummern nur mit eingeschalteter Gesamtsammlung (sonst antworten die Buchseiten
 * mit 404). Keine Texte – nur Titel, Nummern und Adressteile.
 */
export async function baueSuchIndex(
  db: Datenbank,
  optionen: { hadith: boolean; jetzt?: Date; wissenEntwuerfe?: boolean },
): Promise<SuchIndex> {
  const jetzt = optionen.jetzt ?? new Date();
  const sichtbar = <T extends typeof schema.nachricht | typeof schema.veranstaltung | typeof schema.wissenThema | typeof schema.seite>(
    t: T,
  ) => and(eq(t.status, 'veroeffentlicht'), isNull(t.imPapierkorbSeit));

  const [nachrichten, veranstaltungen, wissen, seiten, suren] = await Promise.all([
    db
      .select({ slug: schema.nachricht.slug, titel: schema.nachricht.titel })
      .from(schema.nachricht)
      .where(and(sichtbar(schema.nachricht), lte(schema.nachricht.veroeffentlichtAm, jetzt))),
    db
      .select({ slug: schema.veranstaltung.slug, titel: schema.veranstaltung.titel })
      .from(schema.veranstaltung)
      .where(sichtbar(schema.veranstaltung)),
    db
      .select({ slug: schema.wissenThema.slug, titel: schema.wissenThema.titel, freigabe: schema.wissenThema.freigabe })
      .from(schema.wissenThema)
      // Religiöse Freigabe (F-40, Migration 0015): öffentlich nur „geprüft“ – wie wissen.ts und die Volltextsuche; mit dem
      // Schalter `website_wissen_vorschau` auch die gekennzeichneten Entwürfe „zur Prüfung“ (ADR 0047)
      .where(
        and(sichtbar(schema.wissenThema), inArray(schema.wissenThema.freigabe, oeffentlicheFreigaben(optionen.wissenEntwuerfe ?? false))),
      ),
    db
      .select({ de: schema.seite.slugDe, tr: schema.seite.slugTr, en: schema.seite.slugEn, titel: schema.seite.titel })
      .from(schema.seite)
      .where(and(sichtbar(schema.seite), or(isNull(schema.seite.veroeffentlichenAm), lte(schema.seite.veroeffentlichenAm, jetzt)))),
    db
      .select({
        nr: schema.quranSure.nr,
        umschrift: schema.quranSure.nameUmschrift,
        nameAr: schema.quranSure.nameAr,
        name: schema.quranSure.name,
      })
      .from(schema.quranSure)
      .orderBy(asc(schema.quranSure.nr)),
  ]);

  const eintraege: IndexEintrag[] = [
    ...nachrichten.map((z) => ({ art: 'nachricht' as const, slug: z.slug, titel: z.titel })),
    ...veranstaltungen.map((z) => ({ art: 'veranstaltung' as const, slug: z.slug, titel: z.titel })),
    ...wissen.map((z) => ({ art: 'wissen' as const, slug: z.slug, titel: z.titel, entwurf: istEntwurf(z.freigabe) })),
    ...seiten.map((z) => ({ art: 'seite' as const, slugs: { de: z.de, tr: z.tr, en: z.en }, titel: z.titel })),
    ...suren.map((z) => ({ art: 'sure' as const, nr: z.nr, umschrift: z.umschrift ?? '', nameAr: z.nameAr, name: z.name ?? null })),
  ];

  let hadith: SuchIndex['hadith'] = null;
  if (optionen.hadith) {
    const [buecher, nummern] = await Promise.all([
      db
        .select({ nr: schema.hadithBuch.nr, titel: schema.hadithBuch.titel })
        .from(schema.hadithBuch)
        .where(eq(schema.hadithBuch.sammlungId, BUKHARI))
        .orderBy(asc(schema.hadithBuch.nr)),
      db
        .select({ nummer: schema.hadith.nummer, buchNr: schema.hadith.buchNr, imBuchNr: schema.hadith.imBuchNr })
        .from(schema.hadith)
        .where(eq(schema.hadith.sammlungId, BUKHARI))
        .orderBy(asc(schema.hadith.buchNr), asc(schema.hadith.sortierung)),
    ]);
    // Bücher ohne englischen Titel der Quelle erscheinen nur über ihre Nummer (wie auf den Buchseiten)
    for (const b of buecher) if (b.titel?.en) eintraege.push({ art: 'hadithBuch', nr: b.nr, titel: b.titel.en });
    // Reihenfolge der Quelle je Buch: die Position ergibt den Teil der Buchseite (je 100, wie `ladeHadithBuch`)
    const jeBuch = new Map<number, [string, number][]>();
    for (const h of nummern) {
      const liste = jeBuch.get(h.buchNr) ?? [];
      liste.push([h.nummer, h.imBuchNr ?? 0]);
      jeBuch.set(h.buchNr, liste);
    }
    hadith = { buecher: [...jeBuch.entries()] };
  }
  return { version: SUCHINDEX_VERSION, erzeugt: jetzt.toISOString(), eintraege, hadith };
}
