'use client';

import { useMemo } from 'react';
import { beschreibe, harakatReihenfolge } from '@/lib/lernapp/aufgaben/auswertung/harakat';
import { richtung, type AufgabenProps } from '../typen';
import { Optionsgruppe } from './Optionsgruppe';

/** Bewertung dieses Typs (lädt mit der Komponente, `lader.ts`). */
export { bewerteHarakat as bewerte } from '@/lib/lernapp/aufgaben/auswertung/harakat';

/**
 * Übungstyp `harakat` (Arabisch, PLAN §4): Schreibungen mit gleichem Gerüst, verschieden vokalisiert, groß in der
 * Kursschrift (Harakat werden nie abgeschnitten); gewählt wird die richtige (Radiogruppe). Für Screenreader trägt jede
 * Option ihre Zeichen mit Namen („Kaf Kasra, Ta Fatha, Alif, Ba“), weil Vokalzeichen sonst oft nicht vorgelesen werden.
 */
export default function Harakat({
  aufgabe,
  texte,
  sprache,
  ziffern,
  gesperrt,
  auswertung,
  antwort,
  setzeAntwort,
}: AufgabenProps<'harakat'>) {
  const t = texte.harakat;
  const reihe = useMemo(() => harakatReihenfolge(aufgabe), [aufgabe]);
  const v = aufgabe.vorgabe;
  return (
    <Optionsgruppe
      legende={t.optionen}
      tasten={t.tasten}
      optionen={aufgabe.optionen}
      reihe={reihe}
      wahl={antwort?.wahl ?? null}
      setzeWahl={(wahl) => setzeAntwort({ typ: 'harakat', wahl })}
      gesperrt={gesperrt}
      richtig={auswertung ? aufgabe.richtig : null}
      ui={sprache}
      ziffern={ziffern}
      gross
      beschreibung={(i) => beschreibe(aufgabe.optionen[i]?.text ?? '', t.zeichen)}
      kopf={
        v ? (
          <p className="rounded-lg bg-sand px-4 py-4 text-20">
            {t.bedeutung}{' '}
            <bdi lang={v.sprache} dir={richtung(v.sprache)} className="font-bold">
              {v.text}
            </bdi>
          </p>
        ) : null
      }
    />
  );
}
