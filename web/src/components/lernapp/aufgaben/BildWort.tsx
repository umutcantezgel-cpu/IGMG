'use client';

import { useId, useMemo } from 'react';
import { bildWortReihenfolge, type SymbolElement } from '@/lib/lernapp/aufgaben/bild_wort';
import { formatiere } from '@/lib/lernapp/format';
import { richtung, type AufgabenProps } from '../typen';
import { Optionsgruppe } from './Optionsgruppe';

/** Ein Element der Bildkarte (nur Grundformen mit Zahlen bzw. geprüften Pfaddaten, kein HTML). */
function Element({ e }: { e: SymbolElement }) {
  switch (e.art) {
    case 'path':
      return <path d={e.d} />;
    case 'circle':
      return <circle cx={e.cx} cy={e.cy} r={e.r} />;
    case 'ellipse':
      return <ellipse cx={e.cx} cy={e.cy} rx={e.rx} ry={e.ry} />;
    case 'rect':
      return <rect x={e.x} y={e.y} width={e.width} height={e.height} rx={e.rx} ry={e.ry} />;
    case 'line':
      return <line x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} />;
    case 'polyline':
      return <polyline points={e.points} />;
    case 'polygon':
      return <polygon points={e.points} />;
  }
}

/**
 * Übungstyp `bild_wort` (PLAN §4, KERN 4.0 §5/§7): Bildkarte als Linien-Symbol im 24er Raster (wie die Symbole der
 * Oberfläche, ohne Füllung, runde Enden), darunter die Wörter als Radiogruppe. Vor der Antwort trägt das Bild nur den
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
        {aufgabe.bild.elemente.map((e, i) => (
          <Element key={i} e={e} />
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
