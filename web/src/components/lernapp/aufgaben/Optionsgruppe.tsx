'use client';

import { type KeyboardEvent, type ReactNode, useId, useRef } from 'react';
import type { Inhalt } from '@/lib/lernapp/aufgaben/grundlagen';
import { formatiere, zahl, type Ziffern } from '@/lib/lernapp/format';
import { InhaltText } from '../InhaltText';
import type { UiSprache } from '../typen';

/**
 * Radiogruppe der Übungstypen mit Wahl (PLAN §4: `bild_wort`, `hoeren_waehlen`, `minimalpaare`, `luecke`, `harakat`) nach
 * dem Muster von `Auswahl.tsx`: echte Optionsfelder (Pfeiltasten folgen der Schreibrichtung), Ziffern 1–n wählen direkt,
 * Enter prüft. Nach dem Prüfen: richtige Option grün, gewählte andere in Fehlerfarbe, Rest gedämpft – Farbe nie allein (das
 * Rückmeldeblatt sagt es in Worten).
 */
export function Optionsgruppe({
  legende,
  tasten,
  optionen,
  reihe,
  wahl,
  setzeWahl,
  gesperrt,
  richtig,
  ui,
  ziffern,
  gross = false,
  beschreibung,
  kopf,
}: {
  legende: string;
  /** Tastenhinweis mit `{n}` */
  tasten: string;
  optionen: readonly Inhalt[];
  /** Anzeigereihenfolge (Indizes in `optionen`) */
  reihe: readonly number[];
  wahl: number | null;
  setzeWahl: (i: number) => void;
  gesperrt: boolean;
  /** nach dem Prüfen: Index der richtigen Option; vorher null */
  richtig: number | null;
  ui: UiSprache;
  ziffern: Ziffern;
  gross?: boolean;
  /** zusätzliche Beschreibung je Option für Screenreader (z. B. Namen der Vokalzeichen) */
  beschreibung?: (i: number) => string;
  /** Inhalt über den Optionen (Vorgabe, Bild, Abspieler) */
  kopf?: ReactNode;
}) {
  const id = useId();
  const gruppe = useRef<HTMLDivElement>(null);

  function taste(e: KeyboardEvent<HTMLDivElement>) {
    if (gesperrt) return;
    const n = Number(e.key);
    if (Number.isInteger(n) && n >= 1 && n <= reihe.length) {
      e.preventDefault();
      setzeWahl(reihe[n - 1] as number);
      gruppe.current?.querySelectorAll<HTMLInputElement>('input[type="radio"]')[n - 1]?.focus();
    } else if (e.key === 'Enter' && wahl !== null) {
      e.preventDefault();
      e.currentTarget.closest('form')?.requestSubmit();
    }
  }

  return (
    <fieldset className="flex flex-col gap-5" disabled={gesperrt} aria-describedby={`${id}-tasten`}>
      <legend className="sr-only">{legende}</legend>
      {kopf}
      <p id={`${id}-tasten`} className="sr-only">
        {formatiere(tasten, { n: reihe.length }, ui, ziffern)}
      </p>
      <div ref={gruppe} className={`grid gap-3 ${gross ? '' : 'sm:grid-cols-2'}`} onKeyDown={taste}>
        {reihe.map((i, pos) => {
          const option = optionen[i];
          if (!option) return null;
          const gewaehlt = wahl === i;
          const loest = richtig !== null && i === richtig;
          const daneben = richtig !== null && gewaehlt && !loest;
          const zustand = loest
            ? 'border-gruen-700 bg-gruen-50 text-gruen-800'
            : daneben
              ? 'border-fehler bg-fehler-toenung text-fehler'
              : richtig !== null
                ? 'border-linie bg-weiss text-tinte-3'
                : gewaehlt
                  ? 'border-gruen-700 bg-gruen-50'
                  : 'border-rand bg-weiss hover:border-gruen-700';
          const text = beschreibung?.(i);
          return (
            <label key={i} className="block cursor-pointer">
              <input
                type="radio"
                name={`${id}-wahl`}
                value={i}
                checked={gewaehlt}
                aria-describedby={text ? `${id}-b${i}` : undefined}
                onChange={() => setzeWahl(i)}
                className="peer sr-only"
              />
              <span
                className={`flex min-h-14 items-center gap-3 rounded-lg border-2 px-4 py-2 transition-colors duration-(--dauer-rueckmeldung) peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gruen-950 ${gross ? 'text-30' : 'text-20'} ${zustand}`}
              >
                <span
                  aria-hidden
                  className="inline-flex size-8 shrink-0 items-center justify-center rounded-sm border border-rand bg-weiss text-16 font-bold"
                >
                  {zahl(pos + 1, ui, ziffern)}
                </span>
                <InhaltText inhalt={option} gross={gross} />
              </span>
              {text ? (
                <span id={`${id}-b${i}`} className="sr-only">
                  {text}
                </span>
              ) : null}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
