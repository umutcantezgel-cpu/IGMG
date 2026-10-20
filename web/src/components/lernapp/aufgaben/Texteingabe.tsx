'use client';

import { type SyntheticEvent, useState } from 'react';
import { ANTWORT_MAX } from '@/lib/lernapp/aufgaben/hilfen';
import type { Ziffern } from '@/lib/lernapp/format';
import type { Sprache } from '@/lib/lernapp/kurse';
import { einfuegen, type Feldstand, loesche } from '../tastatur/einfuegen';
import { richtung, type TastaturTexte, type UiSprache } from '../typen';
import { Zeichenhilfe } from './Zeichenhilfe';

/**
 * Schreibmarke eines Felds merken und Zeichen der Hilfen an ihr einfügen (Fokus bleibt, wo er ist). Ohne Refs: die Marke
 * steht im Zustand, das Feld wird über seine Kennung gefunden.
 */
export function useSchreibmarke(id: string, wert: string, setze: (wert: string) => void) {
  const [marke, setMarke] = useState<{ anfang: number; ende: number } | null>(null);
  const merke = (e: SyntheticEvent<HTMLInputElement>) => {
    const f = e.currentTarget;
    setMarke({ anfang: f.selectionStart ?? f.value.length, ende: f.selectionEnd ?? f.value.length });
  };
  const anwenden = (neu: Feldstand) => {
    setze(neu.wert);
    setMarke({ anfang: neu.anfang, ende: neu.ende });
    requestAnimationFrame(() => {
      const feld = document.getElementById(id);
      if (feld instanceof HTMLInputElement && document.activeElement === feld) feld.setSelectionRange(neu.anfang, neu.ende);
    });
  };
  const stand = (): Feldstand => ({ wert, anfang: marke?.anfang ?? wert.length, ende: marke?.ende ?? wert.length });
  return {
    merke,
    zeichen: (z: string) => anwenden(einfuegen(stand(), z, ANTWORT_MAX)),
    loeschen: () => anwenden(loesche(stand())),
  };
}

/** Klassen eines Antwortfelds (Rand nach dem Prüfen: grün angenommen, Fehlerfarbe sonst; Text steht im Blatt). */
export function feldKlasse(sprache: Sprache, status: 'angenommen' | 'nicht' | null, breit = true): string {
  const rand = status === 'angenommen' ? 'border-gruen-700' : status === 'nicht' ? 'border-fehler' : 'border-rand';
  const schrift = sprache === 'ar' ? 'font-arabic text-arabisch-3' : 'text-20';
  return `${breit ? 'w-full' : ''} min-h-12 rounded-md border-2 bg-weiss px-3 py-1 ${rand} ${schrift} outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gruen-950 disabled:bg-sand`;
}

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
