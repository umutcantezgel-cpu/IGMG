'use client';

import { ArrowDown, ArrowUp } from 'lucide-react';
import { type KeyboardEvent, useEffect, useId, useMemo, useRef } from 'react';
import { startFolge, stellenRichtig, verschiebe } from '@/lib/lernapp/aufgaben/auswertung/reihenfolge';
import { formatiere, type Werte, zahl } from '@/lib/lernapp/format';
import { richtung, type AufgabenProps } from '../typen';
import { Erklaerung } from './Erklaerung';

/** Bewertung dieses Typs (lädt mit der Komponente, `lader.ts`). */
export { bewerteReihenfolge as bewerte } from '@/lib/lernapp/aufgaben/auswertung/reihenfolge';

const KNOPF =
  'druck inline-flex size-11 items-center justify-center rounded-md border-2 border-rand bg-weiss hover:border-gruen-700 disabled:border-linie disabled:text-tinte-3';

type Knopf = 'hoch' | 'runter';

/**
 * Übungstyp `reihenfolge` (Wissenskurs, PLAN §4): die Schritte als geordnete Liste, gemischt; je Schritt „nach oben“ und
 * „nach unten“ (≥ 44 px), Alt + Pfeil nach oben/unten verschiebt den Schritt, der Fokus bleibt bei ihm. Ziehen ist nie
 * nötig (WCAG 2.5.7). Jede Verschiebung sagt die Live-Region des Spielers an. Die gemischte Startfolge ist schon eine
 * Antwort. Nach dem Prüfen steht je Stelle in Worten, ob sie stimmt bzw. wohin der Schritt gehört.
 */
export default function Reihenfolge({
  aufgabe,
  texte,
  sprache,
  ziffern,
  gesperrt,
  auswertung,
  antwort,
  setzeAntwort,
  melde,
}: AufgabenProps<'reihenfolge'>) {
  const id = useId();
  const t = texte.reihenfolge;
  const start = useMemo(() => startFolge(aufgabe), [aufgabe]);
  const folge = antwort?.folge ?? start;
  const knoepfe = useRef(new Map<string, HTMLButtonElement>());
  const f = (vorlage: string, werte: Werte) => formatiere(vorlage, werte, sprache, ziffern);
  const text = (schritt: number) => aufgabe.schritte[schritt] ?? '';

  useEffect(() => {
    if (!antwort) setzeAntwort({ typ: 'reihenfolge', folge: start });
  }, [antwort, setzeAntwort, start]);

  function bewege(pos: number, r: -1 | 1, knopf: Knopf) {
    const ziel = pos + r;
    if (gesperrt || ziel < 0 || ziel >= folge.length) return;
    const schritt = folge[pos] as number;
    const neu = verschiebe(folge, pos, r);
    setzeAntwort({ typ: 'reihenfolge', folge: neu });
    melde(f(t.verschoben, { text: text(schritt), nr: ziel + 1, anzahl: neu.length }));
    // Fokus bleibt beim verschobenen Schritt; am Rand (Knopf gesperrt) auf seinen anderen Knopf
    const naechster: Knopf = ziel === 0 ? 'runter' : ziel === neu.length - 1 ? 'hoch' : knopf;
    requestAnimationFrame(() => knoepfe.current.get(`${schritt}:${naechster}`)?.focus());
  }

  function taste(e: KeyboardEvent<HTMLLIElement>, pos: number) {
    if (!e.altKey || (e.key !== 'ArrowUp' && e.key !== 'ArrowDown')) return;
    e.preventDefault();
    if (e.key === 'ArrowUp') bewege(pos, -1, 'hoch');
    else bewege(pos, 1, 'runter');
  }

  const merke = (schritt: number, knopf: Knopf) => (el: HTMLButtonElement | null) => {
    if (el) knoepfe.current.set(`${schritt}:${knopf}`, el);
    else knoepfe.current.delete(`${schritt}:${knopf}`);
  };
  const geprueft = auswertung ? stellenRichtig(folge) : null;

  return (
    <div className="flex flex-col gap-5">
      <p id={`${id}-tasten`} className="sr-only">
        {t.tasten}
      </p>
      <ol aria-label={t.liste} aria-describedby={`${id}-tasten`} className="flex flex-col gap-3">
        {folge.map((schritt, pos) => {
          const ok = geprueft?.[pos];
          const zustand = !geprueft ? 'border-rand' : ok ? 'border-gruen-700 bg-gruen-50' : 'border-fehler bg-fehler-toenung';
          return (
            <li
              key={schritt}
              onKeyDown={(e) => taste(e, pos)}
              className={`flex items-center gap-3 rounded-lg border-2 bg-weiss p-3 ${zustand}`}
            >
              <span aria-hidden className="inline-flex size-8 shrink-0 items-center justify-center rounded-sm bg-sand text-16 font-bold">
                {zahl(pos + 1, sprache, ziffern)}
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span lang={aufgabe.sprache} dir={richtung(aufgabe.sprache)} className="text-20">
                  {text(schritt)}
                </span>
                {geprueft ? (
                  <span className={`text-16 font-bold ${ok ? 'text-gruen-800' : 'text-fehler'}`}>
                    {ok ? t.passt : f(t.gehoertAn, { nr: schritt + 1 })}
                  </span>
                ) : null}
              </span>
              <span className="flex shrink-0 gap-2">
                <button
                  ref={merke(schritt, 'hoch')}
                  type="button"
                  disabled={gesperrt || pos === 0}
                  aria-label={f(t.hoch, { text: text(schritt) })}
                  onClick={() => bewege(pos, -1, 'hoch')}
                  className={KNOPF}
                >
                  <ArrowUp aria-hidden className="size-5" />
                </button>
                <button
                  ref={merke(schritt, 'runter')}
                  type="button"
                  disabled={gesperrt || pos === folge.length - 1}
                  aria-label={f(t.runter, { text: text(schritt) })}
                  onClick={() => bewege(pos, 1, 'runter')}
                  className={KNOPF}
                >
                  <ArrowDown aria-hidden className="size-5" />
                </button>
              </span>
            </li>
          );
        })}
      </ol>
      {auswertung ? <Erklaerung quelle={aufgabe.quelle} sprache={aufgabe.sprache} texte={texte.wissen} /> : null}
    </div>
  );
}
