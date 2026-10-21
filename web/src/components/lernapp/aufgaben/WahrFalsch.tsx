'use client';

import { wahrIndex } from '@/lib/lernapp/aufgaben/auswertung/wahr_falsch';
import { richtung, type AufgabenProps } from '../typen';
import { Erklaerung } from './Erklaerung';
import { Optionsgruppe } from './Optionsgruppe';

/** Bewertung dieses Typs (lädt mit der Komponente, `lader.ts`). */
export { bewerteWahrFalsch as bewerte } from '@/lib/lernapp/aufgaben/auswertung/wahr_falsch';

const REIHE = [0, 1] as const;

/**
 * Übungstyp `wahr_falsch` (Wissenskurs, PLAN §4): die Aussage in ihrer Sprache, darunter „stimmt“ / „stimmt nicht“ als
 * Radiogruppe (Pfeiltasten, Ziffern, Enter prüft). Nach der Antwort in Worten, ob die Aussage stimmt, mit Begründung und
 * aufklappbarer Quellenzeile.
 */
export default function WahrFalsch({
  aufgabe,
  texte,
  sprache,
  ziffern,
  gesperrt,
  auswertung,
  antwort,
  setzeAntwort,
}: AufgabenProps<'wahr_falsch'>) {
  const t = texte.wahr_falsch;
  return (
    <div className="flex flex-col gap-5">
      <Optionsgruppe
        legende={t.optionen}
        tasten={t.tasten}
        optionen={[
          { text: t.stimmt, sprache },
          { text: t.stimmtNicht, sprache },
        ]}
        alsText
        reihe={REIHE}
        wahl={antwort ? wahrIndex(antwort.wahr) : null}
        setzeWahl={(i) => setzeAntwort({ typ: 'wahr_falsch', wahr: i === 0 })}
        gesperrt={gesperrt}
        richtig={auswertung ? wahrIndex(aufgabe.wahr) : null}
        ui={sprache}
        ziffern={ziffern}
        kopf={
          <div className="flex flex-col gap-2 rounded-lg bg-sand px-4 py-5">
            <p className="text-16 font-bold text-tinte-2">{t.aussage}</p>
            <p lang={aufgabe.sprache} dir={richtung(aufgabe.sprache)} className="text-24">
              {aufgabe.aussage}
            </p>
          </div>
        }
      />
      {auswertung ? (
        <Erklaerung
          kopf={<p className="text-18 font-bold">{aufgabe.wahr ? t.ergebnisWahr : t.ergebnisFalsch}</p>}
          begruendung={aufgabe.begruendung}
          quelle={aufgabe.quelle}
          sprache={aufgabe.sprache}
          texte={texte.wissen}
        />
      ) : null}
    </div>
  );
}
