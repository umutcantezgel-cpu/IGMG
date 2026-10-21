'use client';

import { useMemo } from 'react';
import { fallfrageReihenfolge } from '@/lib/lernapp/aufgaben/auswertung/fallfrage';
import { richtung, type AufgabenProps } from '../typen';
import { Erklaerung } from './Erklaerung';
import { Optionsgruppe } from './Optionsgruppe';

/** Bewertung dieses Typs (lädt mit der Komponente, `lader.ts`). */
export { bewerteFallfrage as bewerte } from '@/lib/lernapp/aufgaben/auswertung/fallfrage';

/**
 * Übungstyp `fallfrage` (Wissenskurs, PLAN §4): Übungsfall, Frage und Optionen (Radiogruppe). Neben jedem Fall steht, dass
 * er ein Lernbeispiel ist und keine Auskunft für eigene Fälle gibt (KERN 4.0 §2.2 Nr. 3: keine Fatwa-Funktion). Nach der
 * Antwort Begründung und Quellenzeile.
 */
export default function Fallfrage({
  aufgabe,
  texte,
  sprache,
  ziffern,
  gesperrt,
  auswertung,
  antwort,
  setzeAntwort,
}: AufgabenProps<'fallfrage'>) {
  const t = texte.fallfrage;
  const reihe = useMemo(() => fallfrageReihenfolge(aufgabe), [aufgabe]);
  const optionen = useMemo(() => aufgabe.optionen.map((text) => ({ text, sprache: aufgabe.sprache })), [aufgabe]);
  const inhalt = { lang: aufgabe.sprache, dir: richtung(aufgabe.sprache) };
  return (
    <div className="flex flex-col gap-5">
      <Optionsgruppe
        legende={t.optionen}
        tasten={t.tasten}
        optionen={optionen}
        reihe={reihe}
        wahl={antwort?.wahl ?? null}
        setzeWahl={(wahl) => setzeAntwort({ typ: 'fallfrage', wahl })}
        gesperrt={gesperrt}
        richtig={auswertung ? aufgabe.richtig : null}
        ui={sprache}
        ziffern={ziffern}
        kopf={
          <div className="flex min-w-0 flex-col gap-3 rounded-lg bg-sand px-4 py-5">
            <p className="text-16 font-bold text-tinte-2">{t.fall}</p>
            <p {...inhalt} className="text-20">
              {aufgabe.fall}
            </p>
            <p {...inhalt} className="text-20 font-bold">
              {aufgabe.frage}
            </p>
            <p className="text-16 text-tinte-2">{t.hinweis}</p>
          </div>
        }
      />
      {auswertung ? (
        <Erklaerung begruendung={aufgabe.begruendung} quelle={aufgabe.quelle} sprache={aufgabe.sprache} texte={texte.wissen} />
      ) : null}
    </div>
  );
}
