'use client';

import { useMemo } from 'react';
import { koranWortReihenfolge } from '@/lib/lernapp/aufgaben/auswertung/koran_wort';
import { formatiere } from '@/lib/lernapp/format';
import type { AufgabenProps } from '../typen';
import { Optionsgruppe } from './Optionsgruppe';

/** Bewertung dieses Typs (lädt mit der Komponente, `lader.ts`). */
export { bewerteKoranWort as bewerte } from '@/lib/lernapp/aufgaben/auswertung/koran_wort';

/**
 * Übungstyp `koran_wort` (Koran-Arabisch, PLAN §4): die Wortform groß in der Koranschrift (`--font-quran`, nur für den
 * Koran, KERN 4.0 §7) mit ihrer Stelle, darunter die freigegebenen Bedeutungen bzw. die Wurzeln als Radiogruppe. Text und
 * Optionen stammen aus dem Paket (gepinnte Daten und freigegebene Einträge); keine Sprachausgabe (KERN 4.0 §4).
 */
export default function KoranWort({
  aufgabe,
  texte,
  sprache,
  ziffern,
  gesperrt,
  auswertung,
  antwort,
  setzeAntwort,
}: AufgabenProps<'koran_wort'>) {
  const t = texte.koran_wort;
  const reihe = useMemo(() => koranWortReihenfolge(aufgabe), [aufgabe]);
  return (
    <Optionsgruppe
      legende={t.optionen}
      tasten={t.tasten}
      optionen={aufgabe.optionen}
      reihe={reihe}
      wahl={antwort?.wahl ?? null}
      setzeWahl={(wahl) => setzeAntwort({ typ: 'koran_wort', wahl })}
      gesperrt={gesperrt}
      richtig={auswertung ? aufgabe.richtig : null}
      ui={sprache}
      ziffern={ziffern}
      kopf={
        <figure className="flex flex-col items-center gap-2 rounded-lg bg-sand px-4 py-6">
          <figcaption className="sr-only">{t.wort}</figcaption>
          <p lang="ar" dir="rtl" className="font-quran text-arabisch-1">
            {aufgabe.wort.text}
          </p>
          <p className="text-16 text-tinte-2">{formatiere(t.stelle, { stelle: aufgabe.wort.stelle }, sprache, ziffern)}</p>
        </figure>
      }
    />
  );
}
