'use client';

import type { AufgabenProps } from '../typen';
import { HoerWahl } from './HoerWahl';

/** Übungstyp `hoeren_waehlen` (PLAN §4): hören, dann das Gehörte bzw. seine Bedeutung wählen (Radiogruppe). */
export default function HoerenWaehlen(props: AufgabenProps<'hoeren_waehlen'>) {
  const t = props.texte.hoeren_waehlen;
  return <HoerWahl props={props} legende={t.optionen} tasten={t.tasten} gross={false} />;
}
