import 'server-only';
import { and, asc, eq, gt, inArray, isNull, or, sql } from 'drizzle-orm';
import { cacheLife, cacheTag } from 'next/cache';
import { leseAnzeigeEinstellung, ANZEIGE_EINSTELLUNG } from '@/lib/anzeige/einstellung';
import { RELIGIOESE_FOLIEN, type AnzeigeDaten, type AnzeigeFolie, type FolienInhalt } from '@/lib/anzeige/folien';
import { TAG } from '@/lib/cache/tags';
import { db, schema } from '@/lib/db';
import { datenbankVerfuegbar } from '@/lib/db/verfuegbar';
import { ladeBilder } from '@/lib/medien/bild';
import { ladeGebetszeitenKennung } from './gebetszeiten';
import { loeseHadithe, loeseVerse, versSchluessel, type VersVerweis } from './religioese-verweise';

/**
 * Folien und Einstellung der Bildschirm-Anzeige (AUFTRAG 3.10, B-25) für `/gebetszeiten/anzeige` und `/api/anzeige`.
 * Öffentlich nur Folien mit Status „veroeffentlicht“, die noch nicht abgelaufen sind; Vers- und Hadith-Folien nur mit
 * religiöser Freigabe „geprueft“. Den Zeitplan (von/bis, Wochentage) wertet der Browser aus – so läuft die Anzeige
 * ohne Netz weiter. Gecacht mit Tag `anzeige` (plus `quran`, `hadith`, `medien` für die aufgelösten Verweise).
 * Dazu die Kennung der Gebetszeiten (Tags `gebetszeiten`, `einstellungen`, ADR 0048): ändert sie sich, lädt die Anzeige neu.
 * Beispielmodus ohne Datenbank (ADR 0019): keine Folien, Standard-Einstellung – nie ein Absturz.
 */
export async function ladeAnzeige(): Promise<AnzeigeDaten> {
  'use cache: remote';
  cacheLife('hours');
  cacheTag(TAG.anzeige, TAG.quran, TAG.hadith, TAG.medien, TAG.gebetszeiten, TAG.einstellungen);
  const gebetszeitenStand = await ladeGebetszeitenKennung();
  if (!datenbankVerfuegbar()) return { folien: [], einstellung: leseAnzeigeEinstellung({}), gebetszeitenStand };
  const f = schema.anzeigeFolie;
  const [[einstellung], zeilen] = await Promise.all([
    db
      .select({ wert: schema.einstellung.wert })
      .from(schema.einstellung)
      .where(eq(schema.einstellung.schluessel, ANZEIGE_EINSTELLUNG))
      .limit(1),
    db
      .select({
        id: f.id,
        art: f.art,
        inhalt: f.inhalt,
        mediumId: f.mediumId,
        von: f.von,
        bis: f.bis,
        wochentage: f.wochentage,
        reihenfolge: f.reihenfolge,
        freigabe: f.freigabe,
      })
      .from(f)
      .where(
        and(
          eq(f.status, 'veroeffentlicht'),
          or(isNull(f.bis), gt(f.bis, sql`now()`)),
          or(
            inArray(f.art, ['text', 'bild']),
            and(inArray(f.art, [...RELIGIOESE_FOLIEN] as ('vers' | 'hadith')[]), eq(f.freigabe, 'geprueft')),
          ),
        ),
      )
      .orderBy(asc(f.reihenfolge), asc(f.erstelltAm)),
  ]);
  return { folien: await loeseFolien(zeilen), einstellung: leseAnzeigeEinstellung(einstellung?.wert), gebetszeitenStand };
}

type FolienZeile = {
  id: string;
  art: string;
  inhalt: unknown;
  mediumId: string | null;
  von: Date | null;
  bis: Date | null;
  wochentage: number[];
  reihenfolge: number;
};

/** Verweise der Folien auflösen; Folien mit fehlendem Bild, Vers oder Hadith entfallen (nie eine leere Folie). */
export async function loeseFolien(zeilen: readonly FolienZeile[]): Promise<AnzeigeFolie[]> {
  const inhalt = (z: FolienZeile) => z.inhalt as FolienInhalt;
  const verse: VersVerweis[] = zeilen.filter((z) => z.art === 'vers').map((z) => inhalt(z) as VersVerweis);
  const nummern = zeilen.filter((z) => z.art === 'hadith').map((z) => (inhalt(z) as { nummer: string }).nummer);
  const [bilder, versKarte, hadithKarte] = await Promise.all([
    ladeBilder(zeilen.filter((z) => z.art === 'bild').map((z) => z.mediumId)),
    loeseVerse(verse),
    loeseHadithe(nummern),
  ]);
  const folien: AnzeigeFolie[] = [];
  for (const z of zeilen) {
    const plan = {
      id: z.id,
      von: z.von?.toISOString() ?? null,
      bis: z.bis?.toISOString() ?? null,
      wochentage: z.wochentage,
      reihenfolge: z.reihenfolge,
    };
    const i = inhalt(z);
    if (i.art === 'text' && z.art === 'text' && i.titel?.de) folien.push({ ...plan, art: 'text', titel: i.titel, text: i.text ?? null });
    else if (i.art === 'bild' && z.art === 'bild' && z.mediumId && bilder[z.mediumId]) {
      const b = bilder[z.mediumId];
      folien.push({ ...plan, art: 'bild', titel: i.titel ?? null, bild: { url: b.url, breite: b.breite, hoehe: b.hoehe, alt: b.alt } });
    } else if (i.art === 'vers' && z.art === 'vers') {
      const v = versKarte.get(versSchluessel(i));
      if (v) folien.push({ ...plan, art: 'vers', sure: v.sure, sureName: v.sureName, verse: v.verse, uebersetzung: v.uebersetzung });
    } else if (i.art === 'hadith' && z.art === 'hadith') {
      const h = hadithKarte.get(i.nummer);
      if (h) folien.push({ ...plan, art: 'hadith', nummer: h.nummer, textAr: h.textAr, uebersetzung: h.uebersetzung });
    }
  }
  return folien;
}
