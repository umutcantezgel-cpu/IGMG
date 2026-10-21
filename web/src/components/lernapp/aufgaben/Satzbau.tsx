'use client';

import type { AufgabeVon } from '@/lib/lernapp/aufgaben/schema';
import type { AufgabenProps } from '../typen';
import Wortbank from './Wortbank';

/** Bewertung dieses Typs (lädt mit der Komponente, `lader.ts`). */
export { bewerteSatzbau as bewerte } from '@/lib/lernapp/aufgaben/auswertung/satzbau';

/**
 * Übungstyp `satzbau` (Satz ordnen, PLAN §4): Bedienung wie `wortbank` (Werkzeugleiste mit wanderndem Tabindex,
 * Antwortzeile als Liste, Alt + Pfeil verschiebt; B-31), nur ohne Ablenker – alle Wörter gehören in den Satz. Die
 * Übersetzung steht als Hilfe darüber.
 */
export default function Satzbau(props: AufgabenProps<'satzbau'>) {
  const { aufgabe, antwort, setzeAntwort, gibAb } = props;
  const alsWortbank = {
    typ: 'wortbank',
    schluessel: aufgabe.schluessel,
    anweisung: 'uebersetze',
    vorgabe: aufgabe.vorgabe,
    sprache: aufgabe.sprache,
    loesungen: aufgabe.loesungen,
    kacheln: aufgabe.kacheln,
  } as AufgabeVon<'wortbank'>;
  return (
    <Wortbank
      {...props}
      aufgabe={alsWortbank}
      antwort={antwort ? { typ: 'wortbank', kacheln: antwort.kacheln } : null}
      setzeAntwort={(a) => setzeAntwort(a ? { typ: 'satzbau', kacheln: a.kacheln } : null)}
      gibAb={(a) => gibAb({ typ: 'satzbau', kacheln: a.kacheln })}
    />
  );
}
