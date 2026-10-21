'use client';

import type { AufgabenProps } from '../typen';
import { HoerWahl } from './HoerWahl';

/** Bewertung dieses Typs (lädt mit der Komponente, `lader.ts`). */
export { bewerteMinimalpaare as bewerte } from '@/lib/lernapp/aufgaben/auswertung/minimalpaare';

/**
 * Übungstyp `minimalpaare` (PLAN §4): ein Wort hören und unter fast gleichen Wörtern das gehörte wählen; Optionen groß, in
 * einer Spalte (die Unterschiede liegen in einzelnen Zeichen).
 */
export default function Minimalpaare(props: AufgabenProps<'minimalpaare'>) {
  const t = props.texte.minimalpaare;
  return <HoerWahl props={props} legende={t.optionen} tasten={t.tasten} gross />;
}
