'use client';

import { type KeyboardEvent, useId, useRef, useState } from 'react';
import { naechsterIndex } from '../tastatur';
import type { TastaturTexte } from '../typen';

/**
 * Arabische Bildschirmtastatur (PLAN §4 `frei`, KERN 4.0 §9: eigener Chunk ≤ 10 KB, erst bei arabischem Freitext
 * geladen). Buchstaben in der Anordnung der üblichen arabischen Tastatur, dazu Hamza-Formen, Vokalzeichen, Leerzeichen und
 * Löschen. Eine Werkzeugleiste mit wanderndem Tabindex (Pfeile in Schreibrichtung von rechts nach links, Pos1/Ende), Enter
 * oder Leertaste fügt ein; per Zeiger bleibt der Fokus im Feld. Jede Taste trägt den Namen ihres Zeichens in der
 * Oberflächensprache (Texte `aufgaben.harakat.zeichen`). Zeichen stehen hier nur als Codepunkte (KERN 4.0 §3).
 */

const BUCHSTABEN = [
  '\u0636',
  '\u0635',
  '\u062B',
  '\u0642',
  '\u0641',
  '\u063A',
  '\u0639',
  '\u0647',
  '\u062E',
  '\u062D',
  '\u062C',
  '\u062F',
  '\u0634',
  '\u0633',
  '\u064A',
  '\u0628',
  '\u0644',
  '\u0627',
  '\u062A',
  '\u0646',
  '\u0645',
  '\u0643',
  '\u0637',
  '\u0630',
  '\u0626',
  '\u0621',
  '\u0624',
  '\u0631',
  '\u0649',
  '\u0629',
  '\u0648',
  '\u0632',
  '\u0638',
  '\u0623',
  '\u0625',
  '\u0622',
];
const VOKALZEICHEN = ['\u064E', '\u064F', '\u0650', '\u0652', '\u0651', '\u064B', '\u064C', '\u064D'];
/** Grundstrich für Vokalzeichen auf der Taste (gepunkteter Kreis). */
const TRAEGER = '◌';

type Taste = { art: 'zeichen' | 'leer' | 'loeschen'; zeichen: string; name: string; anzeige: string };

const schluessel = (c: string) => `u${(c.codePointAt(0) ?? 0).toString(16).toUpperCase().padStart(4, '0')}`;

const KNOPF = 'druck min-h-11 min-w-11 rounded-md border-2 border-rand bg-weiss px-2 hover:border-gruen-700 disabled:text-tinte-3';

export default function ArabischeTastatur({
  texte,
  namen,
  feldId,
  gesperrt,
  onZeichen,
  onLoeschen,
}: {
  texte: TastaturTexte;
  /** Namen der Zeichen nach Codepunkt (`u0628`) */
  namen: Readonly<Record<string, string>>;
  feldId: string;
  gesperrt: boolean;
  onZeichen: (z: string) => void;
  onLoeschen: () => void;
}) {
  const id = useId();
  const [aktiv, setAktiv] = useState(0);
  const knoepfe = useRef<(HTMLButtonElement | null)[]>([]);
  const name = (c: string) => namen[schluessel(c)] ?? c;
  const buchstaben: Taste[] = BUCHSTABEN.map((c) => ({ art: 'zeichen', zeichen: c, name: name(c), anzeige: c }));
  const vokale: Taste[] = VOKALZEICHEN.map((c) => ({ art: 'zeichen', zeichen: c, name: name(c), anzeige: TRAEGER + c }));
  const steuerung: Taste[] = [
    { art: 'leer', zeichen: ' ', name: texte.leerzeichen, anzeige: '␣' },
    { art: 'loeschen', zeichen: '', name: texte.loeschen, anzeige: '⌫' },
  ];
  const alle = [...buchstaben, ...vokale, ...steuerung];

  function druecke(t: Taste) {
    if (t.art === 'loeschen') onLoeschen();
    else onZeichen(t.zeichen);
  }

  function taste(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    const n = naechsterIndex(i, e.key, alle.length, true);
    if (n === null) return;
    e.preventDefault();
    setAktiv(n);
    knoepfe.current[n]?.focus();
  }

  const gruppe = (titel: string, liste: Taste[], versatz: number, klasse: string) => (
    <div role="group" aria-labelledby={`${id}-${versatz}`} className="flex flex-col gap-1">
      <p id={`${id}-${versatz}`} className="sr-only">
        {titel}
      </p>
      <div className="flex flex-wrap gap-1">
        {liste.map((t, j) => {
          const i = versatz + j;
          return (
            <button
              key={`${t.art}${t.zeichen}`}
              ref={(el) => {
                knoepfe.current[i] = el;
              }}
              type="button"
              disabled={gesperrt}
              tabIndex={i === aktiv ? 0 : -1}
              aria-label={t.name}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => druecke(t)}
              onKeyDown={(e) => taste(e, i)}
              className={`${KNOPF} ${klasse}`}
            >
              <span aria-hidden lang={t.art === 'zeichen' ? 'ar' : undefined}>
                {t.anzeige}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div
      role="toolbar"
      aria-label={texte.arabisch}
      aria-controls={feldId}
      aria-describedby={`${id}-tasten`}
      dir="rtl"
      className="flex flex-col gap-3 rounded-lg border border-linie bg-sand p-3"
    >
      <p id={`${id}-tasten`} className="sr-only">
        {texte.tasten}
      </p>
      {gruppe(texte.buchstaben, buchstaben, 0, 'font-arabic text-arabisch-3')}
      {gruppe(texte.vokalzeichen, vokale, buchstaben.length, 'font-arabic text-arabisch-3')}
      {gruppe(texte.leerzeichen, steuerung, buchstaben.length + vokale.length, 'px-4 text-20')}
    </div>
  );
}
