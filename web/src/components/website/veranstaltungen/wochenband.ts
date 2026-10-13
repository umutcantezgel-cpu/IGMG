import { TZDate } from '@date-fns/tz';
import type { Mehrsprachig } from '@/lib/db/schema/typen';
import { tagPlus } from '@/lib/kalender/raster';
import { lokalesDatum, vorkommen, ZEITZONE } from '@/lib/termine';

/** Was das Wochenband von einer Veranstaltung braucht (Teil von `VeranstaltungsDaten`, Zeiten als ISO). */
export type WochenQuelle = {
  id: string;
  slug: string;
  titel: Mehrsprachig;
  beginn: string;
  ende: string | null;
  ganztaegig: boolean;
  regel: string | null;
  ausnahmen: string[];
  ersterBeginn: string;
};

export type WochenTermin = { id: string; slug: string; titel: Mehrsprachig; beginn: string; ganztaegig: boolean };
export type WochenTag = { datum: string; termine: WochenTermin[] };

/** Mitternacht eines Kalendertags (JJJJ-MM-TT) in Europe/Berlin als Zeitpunkt. */
function mitternacht(datum: string): Date {
  const [j, m, t] = datum.split('-').map(Number);
  return new Date(new TZDate(j, m - 1, t, 0, 0, 0, ZEITZONE).getTime());
}

/**
 * Wochenband der Veranstaltungsseite (AUFTRAG 4, Arbeitsansicht): die sieben Kalendertage ab `heute` (Europe/Berlin) mit
 * allen Vorkommen, die an diesem Tag beginnen – auch wöchentliche und tägliche Serien (anders als das Monatsraster des
 * Kalenders). Ausnahmen der Serie fallen aus; ein Termin, der vor dem ersten Tag begann und noch läuft, zählt nicht.
 * Rein: Das Datum kommt von außen (`heuteBerlin`), damit statische Seiten keine Uhrzeit lesen.
 */
export function wochenband(liste: readonly WochenQuelle[], heute: string, anzahl = 7): WochenTag[] {
  const tage: WochenTag[] = Array.from({ length: anzahl }, (_, i) => ({ datum: tagPlus(heute, i), termine: [] }));
  const jeDatum = new Map(tage.map((t) => [t.datum, t.termine]));
  const von = mitternacht(heute);
  const bis = new Date(mitternacht(tagPlus(heute, anzahl)).getTime() - 1);
  for (const v of liste) {
    // Serien rechnen vom ersten Beginn aus (wie das Monatsraster des Kalenders); die Dauer bleibt die des Vorkommens
    const beginn = new Date(v.regel ? v.ersterBeginn : v.beginn);
    const dauer = v.ende ? Date.parse(v.ende) - Date.parse(v.beginn) : null;
    const regel = {
      beginn,
      ende: dauer !== null ? new Date(beginn.getTime() + dauer) : null,
      wiederholung: v.regel,
      ausnahmen: v.ausnahmen,
    };
    for (const vk of vorkommen(regel, von, bis, anzahl * 2)) {
      jeDatum.get(lokalesDatum(vk.beginn))?.push({
        id: v.id,
        slug: v.slug,
        titel: v.titel,
        beginn: vk.beginn.toISOString(),
        ganztaegig: v.ganztaegig,
      });
    }
  }
  for (const t of tage) t.termine.sort((a, b) => a.beginn.localeCompare(b.beginn));
  return tage;
}
