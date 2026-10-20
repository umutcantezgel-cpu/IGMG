'use client';

import { type KeyboardEvent, useId, useMemo, useRef } from 'react';
import { auswahlReihenfolge } from '@/lib/lernapp/aufgaben/auswahl';
import { formatiere, zahl } from '@/lib/lernapp/format';
import { InhaltText } from '../InhaltText';
import type { AufgabenProps } from '../typen';

/**
 * Übungstyp `auswahl` (PLAN §4): Radiogruppe aus echten Optionsfeldern – Pfeiltasten wählen (der Browser folgt der
 * Schreibrichtung), Ziffern 1–n wählen direkt, Enter prüft. Nach dem Prüfen: richtige Option grün, die gewählte falsche
 * in Fehlerfarbe; die Lösung steht zusätzlich als Text im Rückmeldeblatt.
 */
export default function Auswahl({
  aufgabe,
  texte,
  sprache,
  ziffern,
  gesperrt,
  auswertung,
  antwort,
  setzeAntwort,
}: AufgabenProps<'auswahl'>) {
  const id = useId();
  const reihe = useMemo(() => auswahlReihenfolge(aufgabe), [aufgabe]);
  const gruppe = useRef<HTMLDivElement>(null);

  function taste(e: KeyboardEvent<HTMLDivElement>) {
    if (gesperrt) return;
    const n = Number(e.key);
    if (Number.isInteger(n) && n >= 1 && n <= reihe.length) {
      e.preventDefault();
      setzeAntwort({ typ: 'auswahl', wahl: reihe[n - 1] as number });
      gruppe.current?.querySelectorAll<HTMLInputElement>('input[type="radio"]')[n - 1]?.focus();
    } else if (e.key === 'Enter' && antwort) {
      e.preventDefault();
      e.currentTarget.closest('form')?.requestSubmit();
    }
  }

  return (
    <fieldset className="flex flex-col gap-5" disabled={gesperrt} aria-describedby={`${id}-tasten`}>
      <legend className="sr-only">{texte.auswahl.optionen}</legend>
      {aufgabe.vorgabe ? (
        <p className="rounded-lg bg-sand px-4 py-6 text-center text-30 font-bold">
          <InhaltText inhalt={aufgabe.vorgabe} gross />
        </p>
      ) : null}
      <p id={`${id}-tasten`} className="sr-only">
        {formatiere(texte.auswahl.tasten, { n: reihe.length }, sprache, ziffern)}
      </p>
      <div ref={gruppe} className="grid gap-3 sm:grid-cols-2" onKeyDown={taste}>
        {reihe.map((i, pos) => {
          const option = aufgabe.optionen[i];
          if (!option) return null;
          const gewaehlt = antwort?.wahl === i;
          const loest = auswertung !== null && i === aufgabe.richtig;
          const daneben = auswertung !== null && gewaehlt && !loest;
          const zustand = loest
            ? 'border-gruen-700 bg-gruen-50 text-gruen-800'
            : daneben
              ? 'border-fehler bg-fehler-toenung text-fehler'
              : auswertung
                ? 'border-linie bg-weiss text-tinte-3'
                : gewaehlt
                  ? 'border-gruen-700 bg-gruen-50'
                  : 'border-rand bg-weiss hover:border-gruen-700';
          return (
            <label key={i} className="block cursor-pointer">
              <input
                type="radio"
                name={`${id}-wahl`}
                value={i}
                checked={gewaehlt}
                onChange={() => setzeAntwort({ typ: 'auswahl', wahl: i })}
                className="peer sr-only"
              />
              <span
                className={`flex min-h-14 items-center gap-3 rounded-lg border-2 px-4 py-2 text-20 transition-colors duration-(--dauer-rueckmeldung) peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gruen-950 ${zustand}`}
              >
                <span
                  aria-hidden
                  className="inline-flex size-7 shrink-0 items-center justify-center rounded-sm border border-rand text-16 font-bold"
                >
                  {zahl(pos + 1, sprache, ziffern)}
                </span>
                <InhaltText inhalt={option} />
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
