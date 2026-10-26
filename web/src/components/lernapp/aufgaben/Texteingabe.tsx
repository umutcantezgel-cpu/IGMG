'use client';

import { useState } from 'react';
import { ANTWORT_MAX } from '@/lib/lernapp/aufgaben/hilfen';
import type { Ziffern } from '@/lib/lernapp/format';
import type { Sprache } from '@/lib/lernapp/kurse';
import { richtung, type TastaturTexte, type UiSprache } from '../typen';
import { feldKlasse, useSchreibmarke } from './schreibmarke';
import { Zeichenhilfe } from './Zeichenhilfe';

export { feldKlasse, useSchreibmarke };

/**
 * Antwortfeld mit Beschriftung (PLAN §4 `frei`, `hoeren_schreiben`, `luecke`): `lang`/`dir` der Antwortsprache, ohne
 * Autokorrektur, Enter prüft (Formular des Spielers). Darunter die Zeichenhilfe (Sonderzeichen bzw. arabische Tastatur).
 */
export function Texteingabe({
  id,
  beschriftung,
  wert,
  setzeWert,
  sprache,
  gesperrt,
  status,
  tastatur,
  namen,
  ui,
  ziffern,
  beschreibung,
}: {
  id: string;
  beschriftung: string;
  wert: string;
  setzeWert: (wert: string) => void;
  sprache: Sprache;
  gesperrt: boolean;
  status: 'angenommen' | 'nicht' | null;
  tastatur: TastaturTexte;
  namen: Readonly<Record<string, string>>;
  ui: UiSprache;
  ziffern: Ziffern;
  beschreibung?: string;
}) {
  const [offen, setOffen] = useState(false);
  const m = useSchreibmarke(id, wert, setzeWert);
  return (
    <div className="flex flex-col gap-3">
      <label htmlFor={id} className="text-18 font-bold">
        {beschriftung}
      </label>
      <input
        id={id}
        type="text"
        lang={sprache}
        dir={richtung(sprache)}
        value={wert}
        disabled={gesperrt}
        maxLength={ANTWORT_MAX}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        inputMode={offen ? 'none' : undefined}
        aria-describedby={beschreibung}
        onChange={(e) => setzeWert(e.target.value)}
        onSelect={m.merke}
        className={feldKlasse(sprache, status)}
      />
      <Zeichenhilfe
        sprache={sprache}
        feldId={id}
        gesperrt={gesperrt}
        tastatur={tastatur}
        namen={namen}
        ui={ui}
        ziffern={ziffern}
        onZeichen={m.zeichen}
        onLoeschen={m.loeschen}
        onOffen={setOffen}
      />
    </div>
  );
}
