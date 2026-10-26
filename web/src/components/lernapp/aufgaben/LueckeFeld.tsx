'use client';

import { useId, useState } from 'react';
import { richtung, type AufgabenProps } from '../typen';
import { LueckeSatz } from './LueckeSatz';
import { feldKlasse, useSchreibmarke } from './schreibmarke';
import { Zeichenhilfe } from './Zeichenhilfe';

/**
 * Lücke ohne Optionen (`luecke`, Freitext): beschriftetes Feld im Satz (Beschreibung: der ganze Satz mit „…“), darunter die
 * Zeichenhilfe. Eigener Chunk, den `Luecke.tsx` nur für diese Form lädt (Stufe C N6: Beginnt eine Lektion mit einer Lücke
 * unter Optionen, zählen Feld und Zeichenhilfe nicht zum Spieler-Budget, KERN §9).
 */
export default function LueckeFeld({
  aufgabe,
  texte,
  sprache,
  ziffern,
  gesperrt,
  auswertung,
  antwort,
  setzeAntwort,
  tastatur,
}: AufgabenProps<'luecke'>) {
  const id = useId();
  const t = texte.luecke;
  const [wert, setWert] = useState(antwort && 'text' in antwort ? antwort.text : '');
  const setze = (w: string) => {
    setWert(w);
    setzeAntwort(w.trim() ? { typ: 'luecke', text: w } : null);
  };
  const m = useSchreibmarke(`${id}-feld`, wert, setze);
  const [offen, setOffen] = useState(false);
  const status = auswertung ? (auswertung.urteil === 'falsch' ? 'nicht' : 'angenommen') : null;

  return (
    <div className="flex flex-col gap-5">
      <LueckeSatz
        aufgabe={aufgabe}
        id={id}
        hilfe={t.hilfe}
        luecke={
          <>
            <label htmlFor={`${id}-feld`} className="sr-only">
              {t.luecke}
            </label>
            <input
              id={`${id}-feld`}
              type="text"
              lang={aufgabe.sprache}
              dir={richtung(aufgabe.sprache)}
              value={wert}
              disabled={gesperrt}
              maxLength={60}
              size={10}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              inputMode={offen ? 'none' : undefined}
              aria-describedby={`${id}-satz`}
              onChange={(e) => setze(e.target.value)}
              onSelect={m.merke}
              className={`mx-1 inline-block w-40 align-baseline ${feldKlasse(aufgabe.sprache, status, false)}`}
            />
          </>
        }
      />
      <Zeichenhilfe
        sprache={aufgabe.sprache}
        feldId={`${id}-feld`}
        gesperrt={gesperrt}
        tastatur={tastatur}
        namen={texte.harakat.zeichen}
        ui={sprache}
        ziffern={ziffern}
        onZeichen={m.zeichen}
        onLoeschen={m.loeschen}
        onOffen={setOffen}
      />
    </div>
  );
}
