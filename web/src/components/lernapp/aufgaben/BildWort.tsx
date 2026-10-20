'use client';

import { useId, useMemo } from 'react';
import { bildWortReihenfolge } from '@/lib/lernapp/aufgaben/auswertung/bild_wort';
import { formatiere } from '@/lib/lernapp/format';
import { richtung, type AufgabenProps } from '../typen';
import { Optionsgruppe } from './Optionsgruppe';

/** Bewertung dieses Typs (lädt mit der Komponente, `lader.ts`). */
export { bewerteBildWort as bewerte } from '@/lib/lernapp/aufgaben/auswertung/bild_wort';

/**
 * Übungstyp `bild_wort` (PLAN §4, KERN 4.0 §5/§7): Bildkarte als Linien-Symbol im 24er Raster (wie die Symbole der
 * Oberfläche, ohne Füllung, runde Enden; nur geprüfte Pfaddaten, kein HTML), darunter die Wörter als Radiogruppe. Vor der Antwort trägt das Bild nur den
 * Hinweis „Bildübung“, danach die Beschreibung (Übersetzung) – sichtbar und vorgelesen.
 */
export default function BildWort({
  aufgabe,
  texte,
  sprache,
  ziffern,
  gesperrt,
  auswertung,
  antwort,
  setzeAntwort,
}: AufgabenProps<'bild_wort'>) {
  const id = useId();
  const reihe = useMemo(() => bildWortReihenfolge(aufgabe), [aufgabe]);
  const t = texte.bild_wort;
  const b = aufgabe.beschreibung;
  const [vor, nach] = formatiere(t.beschreibung, { text: '\u0000' }, sprache, ziffern).split('\u0000');
  const bild = (
    <figure aria-labelledby={`${id}-bild`} className="flex flex-col items-center gap-3 rounded-lg bg-sand px-4 py-6">
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-32 text-tinte"
      >
        {aufgabe.bild.pfade.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </svg>
      <figcaption id={`${id}-bild`} className={auswertung && b ? 'text-20' : 'sr-only'}>
        {auswertung && b ? (
          <>
            {vor}
            <bdi lang={b.sprache} dir={richtung(b.sprache)} className="font-bold">
              {b.text}
            </bdi>
            {nach}
          </>
        ) : (
          t.bild
        )}
      </figcaption>
    </figure>
  );
  return (
    <Optionsgruppe
      legende={t.optionen}
      tasten={t.tasten}
      optionen={aufgabe.optionen}
      reihe={reihe}
      wahl={antwort?.wahl ?? null}
      setzeWahl={(wahl) => setzeAntwort({ typ: 'bild_wort', wahl })}
      gesperrt={gesperrt}
      richtig={auswertung ? aufgabe.richtig : null}
      ui={sprache}
      ziffern={ziffern}
      kopf={bild}
    />
  );
}
