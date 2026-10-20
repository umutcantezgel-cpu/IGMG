'use client';

import type { AufgabenProps } from '../typen';
import { HoerWahl } from './HoerWahl';

/**
 * Übungstyp `minimalpaare` (PLAN §4): ein Wort hören und unter fast gleichen Wörtern das gehörte wählen; Optionen groß, in
 * einer Spalte (die Unterschiede liegen in einzelnen Zeichen).
 */
export default function Minimalpaare(props: AufgabenProps<'minimalpaare'>) {
  const t = props.texte.minimalpaare;
  return <HoerWahl props={props} legende={t.optionen} tasten={t.tasten} gross />;
}
