import { getTranslations } from 'next-intl/server';
import { ladeQuranStand, ladeSure, SUREN_OHNE_QUELLE, type QuranQuelle, type SureDaten } from '@/server/queries/quran';

/**
 * Stand einer Quran-Seite (ADR 0009, G-06). Ohne importierte Quelle gibt es fünf Suren mit Namen aus den Sprachdateien
 * und keinen Verstext. Mit Import kommen Suren und Verse aus der Datenbank.
 * Namen 1 bis 5 stehen in den Sprachdateien. Die übrigen Suren zeigen ihren arabischen Namen aus der Quelle, weil
 * `ladeQuranStand` und `ladeSure` deutsche, türkische und englische Namen nicht liefern (offene Frage).
 */

/** Anzahl der Suren mit Namen in den Sprachdateien (Bestand: fünf Surennamen). */
const NAMEN_IM_BESTAND = SUREN_OHNE_QUELLE;

/** `verseAnzahl` nur mit importierter Quelle; ohne Import bleibt sie null und wird nicht angezeigt. */
export type SurenEintrag = { nr: number; name: string; arabisch: boolean; verseAnzahl: number | null };

export type SeitenStand = {
  nr: number;
  name: string;
  arabisch: boolean;
  liste: SurenEintrag[];
  quelle: QuranQuelle | null;
  sure: SureDaten | null;
  vorher: number | null;
  naechste: number | null;
};

async function baueListe(): Promise<{ liste: SurenEintrag[]; quelle: QuranQuelle | null }> {
  const t = await getTranslations('quranSeite');
  const stand = await ladeQuranStand();
  const zeilen: { nr: number; nameAr?: string; verseAnzahl: number | null }[] = stand.quelle
    ? stand.suren.map((s) => ({ nr: s.nr, nameAr: s.nameAr, verseAnzahl: s.verseAnzahl }))
    : Array.from({ length: SUREN_OHNE_QUELLE }, (_, i) => ({ nr: i + 1, verseAnzahl: null }));
  const liste = zeilen.map(({ nr, nameAr, verseAnzahl }): SurenEintrag =>
    nr <= NAMEN_IM_BESTAND
      ? { nr, name: t(`sura.${nr}`), arabisch: false, verseAnzahl }
      : { nr, name: nameAr ?? '', arabisch: true, verseAnzahl },
  );
  return { liste, quelle: stand.quelle };
}

/** Übersicht /quran: alle Suren (ohne Verstext) und die Quelle für den Stand-Hinweis. */
export async function ladeUebersicht(): Promise<{ liste: SurenEintrag[]; quelle: QuranQuelle | null }> {
  return baueListe();
}

/** Nummern aller Suren für `generateStaticParams`. */
export async function surenNummern(): Promise<number[]> {
  const { liste } = await baueListe();
  return liste.map((e) => e.nr);
}

/**
 * Stand der Sure `roh` (URL-Parameter, für /quran die Sure „1“). Nur die kanonische Schreibweise gilt: „2“ ja, „02“ nein.
 * Liefert null bei unbekannter Nummer, damit die Seite mit notFound() antwortet.
 */
export async function ladeSeitenStand(roh: string): Promise<SeitenStand | null> {
  const { liste, quelle } = await baueListe();
  const nr = /^[1-9]\d*$/.test(roh) ? Number(roh) : Number.NaN;
  const index = liste.findIndex((e) => e.nr === nr);
  if (index < 0) return null;
  const aktuell = liste[index];
  const sure = quelle ? await ladeSure(nr) : null;
  return {
    nr,
    name: aktuell.name,
    arabisch: aktuell.arabisch,
    liste,
    quelle,
    sure,
    vorher: index > 0 ? liste[index - 1].nr : null,
    naechste: index < liste.length - 1 ? liste[index + 1].nr : null,
  };
}
