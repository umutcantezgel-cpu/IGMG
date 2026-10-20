'use client';

import { type KeyboardEvent, useRef, useState } from 'react';
import { formatiere, type Ziffern } from '@/lib/lernapp/format';
import { naechsterIndex } from '../tastatur';
import type { TastaturTexte, UiSprache } from '../typen';

/**
 * Sonderzeichenleiste (PLAN §4 `frei`; de ä ö ü ß, tr ç ğ ı İ ö ş ü): Werkzeugleiste mit wanderndem Tabindex (Pfeile in
 * Schreibrichtung, Pos1/Ende), Enter oder Leertaste fügt das Zeichen an der Schreibmarke ein. Per Zeiger bleibt der Fokus
 * im Feld (kein Fokuswechsel beim Drücken), per Tastatur bleibt er auf der Leiste. Ziele 44 px.
 */
export function Sonderzeichen({
  zeichen,
  sprache,
  texte,
  ui,
  ziffern,
  feldId,
  gesperrt,
  onZeichen,
}: {
  zeichen: readonly string[];
  /** Sprache der Zeichen (lang) */
  sprache: UiSprache;
  texte: TastaturTexte;
  ui: UiSprache;
  ziffern: Ziffern;
  feldId: string;
  gesperrt: boolean;
  onZeichen: (z: string) => void;
}) {
  const [aktiv, setAktiv] = useState(0);
  const knoepfe = useRef<(HTMLButtonElement | null)[]>([]);

  function taste(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    const n = naechsterIndex(i, e.key, zeichen.length, ui === 'ar');
    if (n === null) return;
    e.preventDefault();
    setAktiv(n);
    knoepfe.current[n]?.focus();
  }

  return (
    <div role="toolbar" aria-label={texte.sonderzeichen} aria-controls={feldId} className="flex flex-wrap gap-2">
      {zeichen.map((z, i) => (
        <button
          key={z}
          ref={(el) => {
            knoepfe.current[i] = el;
          }}
          type="button"
          lang={sprache}
          disabled={gesperrt}
          tabIndex={i === aktiv ? 0 : -1}
          aria-label={formatiere(texte.einfuegen, { zeichen: z }, ui, ziffern)}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onZeichen(z)}
          onKeyDown={(e) => taste(e, i)}
          className="min-h-11 min-w-11 druck rounded-md border-2 border-rand bg-weiss px-2 text-20 hover:border-gruen-700 disabled:text-tinte-3"
        >
          {z}
        </button>
      ))}
    </div>
  );
}
