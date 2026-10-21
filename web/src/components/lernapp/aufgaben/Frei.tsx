'use client';

import { useId, useState } from 'react';
import { InhaltText } from '../InhaltText';
import type { AufgabenProps } from '../typen';
import { Texteingabe } from './Texteingabe';

/** Bewertung dieses Typs (lädt mit der Komponente, `lader.ts`). */
export { bewerteFrei as bewerte } from '@/lib/lernapp/aufgaben/auswertung/frei';

/**
 * Übungstyp `frei` (PLAN §4): Vorgabe in ihrer Sprache, darunter das Antwortfeld mit `lang`/`dir` der Antwortsprache und
 * der Zeichenhilfe (Sonderzeichen de/tr, arabische Bildschirmtastatur). Enter prüft; toleranter Abgleich.
 */
export default function Frei({
  aufgabe,
  texte,
  sprache,
  ziffern,
  gesperrt,
  auswertung,
  antwort,
  setzeAntwort,
  tastatur,
}: AufgabenProps<'frei'>) {
  const id = useId();
  const [wert, setWert] = useState(antwort?.text ?? '');
  const setze = (w: string) => {
    setWert(w);
    setzeAntwort(w.trim() ? { typ: 'frei', text: w } : null);
  };
  return (
    <div className="flex flex-col gap-5">
      <p className="rounded-lg bg-sand px-4 py-5 text-24">
        <InhaltText inhalt={aufgabe.vorgabe} />
      </p>
      <Texteingabe
        id={`${id}-antwort`}
        beschriftung={texte.frei.eingabe}
        wert={wert}
        setzeWert={setze}
        sprache={aufgabe.sprache}
        gesperrt={gesperrt}
        status={auswertung ? (auswertung.urteil === 'falsch' ? 'nicht' : 'angenommen') : null}
        tastatur={tastatur}
        namen={texte.harakat.zeichen}
        ui={sprache}
        ziffern={ziffern}
      />
    </div>
  );
}
