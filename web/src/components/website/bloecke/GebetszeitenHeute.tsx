'use client';

import { berlinerDatum } from '@/lib/gebetszeiten/naechstes';
import { GEBETE, type Gebet, type Tageszeiten } from '@/lib/gebetszeiten/typen';
import { useJetzt } from '@/lib/zeit/useJetzt';

/**
 * Gebetszeiten des Tages, kompakt (Baustein „Gebetszeiten heute“). Der Server rendert den Referenztag (statisch);
 * im Browser springt die Anzeige auf das heutige Datum in Europe/Berlin, falls der Cache älter ist. Gleiche Struktur vorher
 * und nachher – kein Verschieben des Layouts (CLS).
 */
export function GebetszeitenHeute({
  tage,
  referenz,
  namen,
  datumszeilen,
  uhrSuffix,
}: {
  tage: (Tageszeiten & { datum: string })[];
  referenz: string;
  namen: Record<Gebet, string>;
  datumszeilen: Record<string, string>;
  /** „Uhr“ hinter der Zeit (nur Deutsch) */
  uhrSuffix: string | null;
}) {
  const jetzt = useJetzt();
  const datum = jetzt ? berlinerDatum(jetzt) : referenz;
  const tag = tage.find((t) => t.datum === datum) ?? tage.find((t) => t.datum === referenz) ?? tage[0];
  if (!tag) return null;
  return (
    <div className="flex flex-col gap-3">
      <p className="text-16 font-bold text-gruen-800 tabular-nums">{datumszeilen[tag.datum] ?? tag.datum}</p>
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {GEBETE.map((g) => (
          <div key={g} className="flex flex-col gap-1 rounded-md border border-linie bg-weiss px-4 py-3">
            <dt className="text-16 text-tinte-2">{namen[g]}</dt>
            <dd className="text-24 leading-tight font-bold tabular-nums">
              {tag[g]}
              {uhrSuffix ? <span className="text-16 font-normal text-tinte-2"> {uhrSuffix}</span> : null}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
