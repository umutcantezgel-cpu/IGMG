import type { Inhalte } from './dateien';
import { istKinderStufe } from './texte';
import { Befunde } from './typen';

/**
 * Prüfer „kindgeeignet“ (Leitfaden `kinder.kennzeichnung`, KERN 4.0 §5; blockierend): In A1–B1 ist jede Einheit für Kinder
 * geeignet – im Rahmenplan und im Inhalt steht `kinderGeeignet: true` (Pflicht), keine Lektion ist ausgenommen. B2–C1 sind
 * standardmäßig nicht kindgeeignet; wie Kinderkonten sie sehen, entscheidet L7 (OF-15).
 */
export function pruefeKinder(inhalte: Inhalte): Befunde {
  const b = new Befunde('kinder');
  for (const [, { pfad, daten: r }] of inhalte.rahmen)
    for (const st of r.stufen)
      if (istKinderStufe(st.stufe))
        for (const e of st.einheiten)
          if (!e.kinderGeeignet) b.blockierend(pfad, `${st.stufe.toUpperCase()}: kinderGeeignet muss true sein`, e.schluessel);
  for (const { pfad, daten: d } of inhalte.sprache) {
    if (!istKinderStufe(d.stufe)) continue;
    if (d.einheit.kinderGeeignet !== true)
      b.blockierend(pfad, `${d.stufe.toUpperCase()}: einheit.kinderGeeignet: true ist Pflicht`, d.einheit.schluessel);
    for (const l of d.lektionen)
      if (l.kinderGeeignet === false) b.blockierend(pfad, `${d.stufe.toUpperCase()}: Lektion darf nicht ausgenommen sein`, l.schluessel);
  }
  return b;
}
