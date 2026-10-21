'use client';

import { type KeyboardEvent, type ReactNode, useId, useRef } from 'react';
import { formatiere, type Ziffern, zahl } from '@/lib/lernapp/format';
import type { UiSprache } from '../typen';

export type WahlOption = { index: number; inhalt: ReactNode };

/**
 * Radiogruppe der Übungstypen aus L2-02 (Gesprächsantwort, Fragen zu Geschichte und Lesetext, Schrift-Vorkurse) wie
 * `Auswahl.tsx`: echte Optionsfelder – Pfeiltasten wählen (der Browser folgt der Schreibrichtung), Ziffern 1–n wählen
 * direkt, Enter prüft (Formular des Spielers) bzw. löst `beiEnter` aus. Nach der Prüfung: richtige Option grün, die gewählte falsche in Fehlerfarbe, beides
 * zusätzlich als Text (`markeRichtig`/`markeFalsch`, KERN 4.0 §8: Fehler nie nur als Farbe). Ist die Legende Inhalt (Frage
 * zum Text), kommt sie als Knoten mit `lang`/`dir` (z. B. `InhaltText`), damit sie mit der richtigen Stimme gelesen wird.
 */
export function Wahlgruppe({
  legende,
  tasten,
  optionen,
  gewaehlt,
  richtig,
  gesperrt,
  setze,
  beiEnter,
  sprache,
  ziffern,
  markeRichtig,
  markeFalsch,
  zweispaltig = true,
  gross = false,
}: {
  /** Name der Gruppe; Inhalt in fremder Sprache als Knoten mit `lang`/`dir` */
  legende: ReactNode;
  /** Hinweis zur Bedienung mit `{n}` (Zahl der Optionen) */
  tasten: string;
  /** Optionen in Anzeigereihenfolge; `index` ist die Stelle im Inhalt */
  optionen: readonly WahlOption[];
  gewaehlt: number | null;
  /** nach der Prüfung: Index der richtigen Option, sonst null */
  richtig: number | null;
  gesperrt: boolean;
  setze: (index: number) => void;
  /** Enter mit gewählter Option; ohne Angabe wird das Formular des Spielers abgeschickt („Prüfen“) */
  beiEnter?: () => void;
  sprache: UiSprache;
  ziffern: Ziffern;
  markeRichtig: string;
  markeFalsch: string;
  zweispaltig?: boolean;
  gross?: boolean;
}) {
  const id = useId();
  const gruppe = useRef<HTMLDivElement>(null);

  function taste(e: KeyboardEvent<HTMLDivElement>) {
    if (gesperrt) return;
    const n = Number(e.key);
    if (Number.isInteger(n) && n >= 1 && n <= optionen.length) {
      e.preventDefault();
      setze(optionen[n - 1]!.index);
      gruppe.current?.querySelectorAll<HTMLInputElement>('input[type="radio"]')[n - 1]?.focus();
    } else if (e.key === 'Enter' && gewaehlt !== null) {
      e.preventDefault();
      if (beiEnter) beiEnter();
      else e.currentTarget.closest('form')?.requestSubmit();
    }
  }

  return (
    <fieldset className="flex flex-col gap-3" disabled={gesperrt} aria-describedby={`${id}-tasten`}>
      <legend className="sr-only">{legende}</legend>
      <p id={`${id}-tasten`} className="sr-only">
        {formatiere(tasten, { n: optionen.length }, sprache, ziffern)}
      </p>
      <div ref={gruppe} className={`grid gap-3 ${zweispaltig ? 'sm:grid-cols-2' : ''}`} onKeyDown={taste}>
        {optionen.map(({ index, inhalt }, pos) => {
          const ist = gewaehlt === index;
          const loest = richtig !== null && index === richtig;
          const daneben = richtig !== null && ist && !loest;
          const zustand = loest
            ? 'border-gruen-700 bg-gruen-50 text-gruen-800'
            : daneben
              ? 'border-fehler bg-fehler-toenung text-fehler'
              : richtig !== null
                ? 'border-linie bg-weiss text-tinte-3'
                : ist
                  ? 'border-gruen-700 bg-gruen-50'
                  : 'border-rand bg-weiss hover:border-gruen-700';
          return (
            <label key={index} className="block cursor-pointer">
              <input type="radio" name={`${id}-wahl`} value={index} checked={ist} onChange={() => setze(index)} className="peer sr-only" />
              <span
                className={`flex min-h-14 items-center gap-3 rounded-lg border-2 px-4 py-2 transition-colors duration-(--dauer-rueckmeldung) peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gruen-950 ${gross ? 'text-30' : 'text-20'} ${zustand}`}
              >
                <span
                  aria-hidden
                  className="inline-flex size-8 shrink-0 items-center justify-center rounded-sm border border-rand text-16 font-bold"
                >
                  {zahl(pos + 1, sprache, ziffern)}
                </span>
                <span className="min-w-0 flex-1">{inhalt}</span>
                {loest ? <span className="text-16 font-bold">{markeRichtig}</span> : null}
                {daneben ? <span className="text-16 font-bold">{markeFalsch}</span> : null}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
