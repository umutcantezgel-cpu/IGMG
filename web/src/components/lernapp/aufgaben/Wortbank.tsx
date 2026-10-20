'use client';

import { type KeyboardEvent, useId, useMemo, useRef, useState } from 'react';
import { kachelReihenfolge, legeKachel, nimmKachel, verschiebeKachel } from '@/lib/lernapp/aufgaben/wortbank';
import { formatiere } from '@/lib/lernapp/format';
import { InhaltText } from '../InhaltText';
import { naechsterIndex, verschiebeRichtung } from '../tastatur';
import { type AufgabenProps, richtung } from '../typen';

/** Bewertung dieses Typs (lädt mit der Komponente, `lader.ts`). */
export { bewerteWortbank as bewerte } from '@/lib/lernapp/aufgaben/wortbank';

const KACHEL = 'min-h-11 min-w-11 rounded-md border-2 px-3 py-1 text-20';

/**
 * Übungstyp `wortbank` (PLAN §4): Kacheln aus der Bank in die Antwortzeile legen. Ziehen ist nie nötig (WCAG 2.5.7).
 * Tastatur: Bank als Werkzeugleiste mit wanderndem Tabindex (Pfeile in Schreibrichtung, Pos1/Ende, Enter legt), Antwortzeile
 * als Liste (Pfeile wechseln, Entfernen/Rücktaste/Enter nimmt heraus, Alt + Pfeil verschiebt). Eine gelegte Kachel
 * erscheint mit Deckkraft und 8 px Weg (B-31, `tritt-auf`; reduziert nur Deckkraft); ihr Platz in der Bank bleibt frei.
 */
export default function Wortbank({
  aufgabe,
  texte,
  sprache,
  ziffern,
  gesperrt,
  auswertung,
  antwort,
  setzeAntwort,
}: AufgabenProps<'wortbank'>) {
  const id = useId();
  const gewaehlt = useMemo(() => antwort?.kacheln ?? [], [antwort]);
  const bank = useMemo(() => kachelReihenfolge(aufgabe), [aufgabe]);
  const frei = bank.filter((k) => !gewaehlt.includes(k));
  const [fokusBank, setFokusBank] = useState(0);
  const [fokusAntwort, setFokusAntwort] = useState(0);
  const bankKnoepfe = useRef(new Map<number, HTMLButtonElement>());
  const antwortKnoepfe = useRef(new Map<number, HTMLButtonElement>());
  const rtl = aufgabe.sprache === 'ar';
  const t = texte.wortbank;
  const f = (vorlage: string, wort: string) => formatiere(vorlage, { wort }, sprache, ziffern);
  const text = (k: number) => aufgabe.kacheln[k] ?? '';

  const setze = (neu: number[]) => setzeAntwort(neu.length ? { typ: 'wortbank', kacheln: neu } : null);
  const fokussiere = (knoepfe: Map<number, HTMLButtonElement>, k: number | undefined) =>
    requestAnimationFrame(() => (k === undefined ? undefined : knoepfe.get(k)?.focus()));

  function lege(k: number) {
    if (gesperrt) return;
    const neu = legeKachel(gewaehlt, k);
    setze(neu);
    const rest = bank.filter((x) => !neu.includes(x));
    if (rest.length) {
      const pos = Math.min(Math.max(0, frei.indexOf(k)), rest.length - 1);
      setFokusBank(pos);
      fokussiere(bankKnoepfe.current, rest[pos]);
    } else {
      setFokusAntwort(neu.length - 1);
      fokussiere(antwortKnoepfe.current, neu.at(-1));
    }
  }

  function nimm(pos: number) {
    if (gesperrt) return;
    const k = gewaehlt[pos];
    const neu = nimmKachel(gewaehlt, pos);
    setze(neu);
    if (neu.length) {
      const p = Math.min(pos, neu.length - 1);
      setFokusAntwort(p);
      fokussiere(antwortKnoepfe.current, neu[p]);
    } else if (k !== undefined) {
      setFokusBank(Math.max(0, bank.filter((x) => !neu.includes(x)).indexOf(k)));
      fokussiere(bankKnoepfe.current, k);
    }
  }

  function bankTaste(e: KeyboardEvent<HTMLButtonElement>, pos: number) {
    const n = naechsterIndex(pos, e.key, frei.length, rtl);
    if (n === null) return;
    e.preventDefault();
    setFokusBank(n);
    bankKnoepfe.current.get(frei[n] as number)?.focus();
  }

  function antwortTaste(e: KeyboardEvent<HTMLButtonElement>, pos: number) {
    if (gesperrt) return;
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      nimm(pos);
      return;
    }
    if (e.altKey) {
      const r = verschiebeRichtung(e.key, rtl);
      if (r === null) return;
      e.preventDefault();
      const neu = verschiebeKachel(gewaehlt, pos, r);
      setze(neu);
      const p = Math.max(0, Math.min(neu.length - 1, pos + r));
      setFokusAntwort(p);
      fokussiere(antwortKnoepfe.current, neu[p]);
      return;
    }
    const n = naechsterIndex(pos, e.key, gewaehlt.length, rtl);
    if (n === null) return;
    e.preventDefault();
    setFokusAntwort(n);
    antwortKnoepfe.current.get(gewaehlt[n] as number)?.focus();
  }

  const aktivBank = Math.min(fokusBank, Math.max(0, frei.length - 1));
  const aktivAntwort = Math.min(fokusAntwort, Math.max(0, gewaehlt.length - 1));
  const zeile = auswertung ? (auswertung.urteil === 'falsch' ? 'border-fehler' : 'border-gruen-700') : 'border-rand';

  return (
    <div className="flex flex-col gap-5">
      {/* ohne Vorgabe nur bei `satzbau` (Satzbau.tsx nutzt diese Bedienung) */}
      {aufgabe.vorgabe ? (
        <p className="rounded-lg bg-sand px-4 py-4 text-24">
          <InhaltText inhalt={aufgabe.vorgabe} />
        </p>
      ) : null}
      <p id={`${id}-tasten`} className="sr-only">
        {t.tasten}
      </p>
      <div className={`flex min-h-16 flex-col justify-end border-b-2 pb-2 ${zeile}`}>
        <h3 id={`${id}-antwort`} className="sr-only">
          {t.antwort}
        </h3>
        {gewaehlt.length ? (
          <ol
            aria-labelledby={`${id}-antwort`}
            aria-describedby={`${id}-tasten`}
            lang={aufgabe.sprache}
            dir={richtung(aufgabe.sprache)}
            className="flex flex-wrap gap-2"
          >
            {gewaehlt.map((k, pos) => (
              <li key={k} className="tritt-auf">
                <button
                  ref={(el) => {
                    if (el) antwortKnoepfe.current.set(k, el);
                    else antwortKnoepfe.current.delete(k);
                  }}
                  type="button"
                  disabled={gesperrt}
                  tabIndex={pos === aktivAntwort ? 0 : -1}
                  aria-label={f(t.entfernen, text(k))}
                  onClick={() => nimm(pos)}
                  onKeyDown={(e) => antwortTaste(e, pos)}
                  className={`${KACHEL} druck border-gruen-700 bg-weiss font-bold ${aufgabe.sprache === 'ar' ? 'font-arabic' : ''}`}
                >
                  {text(k)}
                </button>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-18 text-tinte-3">{t.antwortLeer}</p>
        )}
      </div>
      <div
        role="toolbar"
        aria-label={t.bank}
        aria-describedby={`${id}-tasten`}
        lang={aufgabe.sprache}
        dir={richtung(aufgabe.sprache)}
        className="flex flex-wrap gap-2"
      >
        {bank.map((k) => {
          if (gewaehlt.includes(k))
            return (
              <span key={k} aria-hidden className={`${KACHEL} border-dashed border-linie bg-sand text-transparent select-none`}>
                {text(k)}
              </span>
            );
          const pos = frei.indexOf(k);
          return (
            <button
              key={k}
              ref={(el) => {
                if (el) bankKnoepfe.current.set(k, el);
                else bankKnoepfe.current.delete(k);
              }}
              type="button"
              disabled={gesperrt}
              tabIndex={pos === aktivBank ? 0 : -1}
              aria-label={f(t.hinzufuegen, text(k))}
              onClick={() => lege(k)}
              onKeyDown={(e) => bankTaste(e, pos)}
              className={`${KACHEL} druck border-rand bg-weiss hover:border-gruen-700 disabled:text-tinte-3 ${aufgabe.sprache === 'ar' ? 'font-arabic' : ''}`}
            >
              {text(k)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
