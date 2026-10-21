'use client';

import { useId, useState } from 'react';
import type { AufgabenProps } from '../typen';
import { Abspieler } from './Abspieler';
import { Texteingabe } from './Texteingabe';

/** Bewertung dieses Typs (lädt mit der Komponente, `lader.ts`). */
export { bewerteHoerenSchreiben as bewerte } from '@/lib/lernapp/aufgaben/auswertung/hoeren_schreiben';

/**
 * Übungstyp `hoeren_schreiben` (Diktat, PLAN §4): Abspieler, darunter das Antwortfeld wie bei `frei`; nach der Antwort die
 * Abschrift. Ohne Clip oder ohne Wiedergabe nur „Weiter ohne Hören“.
 */
export default function HoerenSchreiben(props: AufgabenProps<'hoeren_schreiben'>) {
  const { aufgabe, texte, sprache, ziffern, gesperrt, auswertung, antwort, setzeAntwort, tastatur } = props;
  const id = useId();
  const [wert, setWert] = useState(antwort?.text ?? '');
  const abspieler = (
    <Abspieler
      hoeren={aufgabe.hoeren}
      texte={texte.hoeren}
      gesperrt={gesperrt}
      ausgewertet={auswertung !== null}
      ueberspringe={props.ueberspringe}
      nurUeberspringen={props.nurUeberspringen}
      melde={props.melde}
    />
  );
  if (!aufgabe.hoeren.audio) return abspieler;
  return (
    <div className="flex flex-col gap-5">
      {abspieler}
      <Texteingabe
        id={`${id}-antwort`}
        beschriftung={texte.hoeren_schreiben.eingabe}
        wert={wert}
        setzeWert={(w) => {
          setWert(w);
          setzeAntwort(w.trim() ? { typ: 'hoeren_schreiben', text: w } : null);
        }}
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
