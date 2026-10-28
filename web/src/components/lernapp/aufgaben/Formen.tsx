'use client';

import { lazy, Suspense, useId, useMemo, useRef, useState } from 'react';
import { pruefeZellen } from '@/lib/lernapp/aufgaben/auswertung/formen';
import { ANTWORT_MAX } from '@/lib/lernapp/aufgaben/hilfen';
import { einfuegen, type Feldstand, loesche } from '../tastatur/einfuegen';
import { InhaltText } from '../InhaltText';
import { richtung, type AufgabenProps } from '../typen';
import { feldKlasse } from './schreibmarke';

/** Bewertung dieses Typs (lädt mit der Komponente, `lader.ts`). */
export { bewerteFormen as bewerte } from '@/lib/lernapp/aufgaben/auswertung/formen';

/**
 * Zeichenhilfe als eigener Chunk, geladen mit dem ersten Fokus in einem Feld (Stufe C N6, Nacharbeit): Beginnt eine Lektion
 * mit `formen` (tr.b1.e16.l07, ausgeliefert seit L3-E23 – das Budget-Werkzeug misst sie statt zu schätzen), zählt der
 * Typ-Chunk zum Spieler-Budget (KERN §9, zusätzlich zur Hülle ≤ 60 KB). Bis dahin hält ein leerer Platz die Höhe einer
 * Zeile; sie erscheint unter der Tabelle, die Felder verschieben sich nicht.
 */
const Zeichenhilfe = lazy(() => import('./Zeichenhilfe').then((m) => ({ default: m.Zeichenhilfe })));
const PLATZ = <div aria-hidden className="min-h-11" />;

/**
 * Übungstyp `formen` (Konjugation, Endungen; PLAN §4): Tabelle mit Zeilen- und Spaltenköpfen (`th` mit `scope`); offene
 * Zellen sind Felder, beschriftet über ihre Köpfe (`aria-labelledby`, „Kopfbezug“); vorgegebene Zellen stehen als Text.
 * Enter prüft. Die Zeichenhilfe darunter (ab dem ersten Fokus in einem Feld) schreibt in das zuletzt fokussierte Feld. Nach
 * dem Prüfen steht unter jeder nicht angenommenen Zelle die richtige Form.
 */
export default function Formen({
  aufgabe,
  texte,
  sprache,
  ziffern,
  gesperrt,
  auswertung,
  antwort,
  setzeAntwort,
  tastatur,
}: AufgabenProps<'formen'>) {
  const id = useId();
  const t = texte.formen;
  const [werte, setWerte] = useState<string[]>(() => antwort?.werte ?? aufgabe.zellen.map(() => ''));
  const [aktiv, setAktiv] = useState(() => aufgabe.zellen.findIndex((c) => !c.vorgabe));
  const [offen, setOffen] = useState(false);
  const [hilfe, setHilfe] = useState(false);
  const felder = useRef(new Map<number, HTMLInputElement>());
  const marken = useRef(new Map<number, { anfang: number; ende: number }>());
  const kopfSprache = aufgabe.kopfsprache ?? aufgabe.sprache;
  const ergebnis = useMemo(
    () => (auswertung ? new Map(pruefeZellen(aufgabe, werte).map((z) => [z.index, z])) : null),
    [auswertung, aufgabe, werte],
  );

  const setze = (i: number, w: string) => {
    const neu = werte.map((x, j) => (j === i ? w : x));
    setWerte(neu);
    setzeAntwort(neu.some((x, j) => x.trim() && !aufgabe.zellen[j]?.vorgabe) ? { typ: 'formen', werte: neu } : null);
  };
  const anwenden = (f: (s: Feldstand) => Feldstand) => {
    if (aktiv < 0) return;
    const wert = werte[aktiv] ?? '';
    const m = marken.current.get(aktiv) ?? { anfang: wert.length, ende: wert.length };
    const neu = f({ wert, ...m });
    setze(aktiv, neu.wert);
    marken.current.set(aktiv, { anfang: neu.anfang, ende: neu.ende });
    const feld = felder.current.get(aktiv);
    requestAnimationFrame(() => {
      if (feld && document.activeElement === feld) feld.setSelectionRange(neu.anfang, neu.ende);
    });
  };

  const zelle = (zeile: number, spalte: number) => {
    const i = aufgabe.zellen.findIndex((c) => c.zeile === zeile && c.spalte === spalte);
    const c = aufgabe.zellen[i];
    if (!c) return <td key={spalte} className="border border-linie p-2" />;
    if (c.vorgabe)
      return (
        <td key={spalte} lang={aufgabe.sprache} dir={richtung(aufgabe.sprache)} className="border border-linie bg-sand p-2 text-20">
          {c.loesungen[0]}
        </td>
      );
    const e = ergebnis?.get(i);
    const status = e ? (e.urteil === 'falsch' ? 'nicht' : 'angenommen') : null;
    return (
      <td key={spalte} className="border border-linie p-2">
        <input
          ref={(el) => {
            if (el) felder.current.set(i, el);
            else felder.current.delete(i);
          }}
          id={`${id}-z${i}`}
          type="text"
          lang={aufgabe.sprache}
          dir={richtung(aufgabe.sprache)}
          value={werte[i] ?? ''}
          disabled={gesperrt}
          maxLength={ANTWORT_MAX}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          inputMode={offen ? 'none' : undefined}
          aria-labelledby={`${id}-r${zeile} ${aufgabe.spalten.length > 1 ? `${id}-s${spalte}` : `${id}-s0`}`}
          aria-describedby={e && e.urteil !== 'richtig' ? `${id}-l${i}` : undefined}
          onFocus={() => {
            setAktiv(i);
            setHilfe(true);
          }}
          onChange={(ev) => setze(i, ev.target.value)}
          onSelect={(ev) =>
            marken.current.set(i, {
              anfang: ev.currentTarget.selectionStart ?? ev.currentTarget.value.length,
              ende: ev.currentTarget.selectionEnd ?? ev.currentTarget.value.length,
            })
          }
          className={feldKlasse(aufgabe.sprache, status)}
        />
        {e && e.urteil !== 'richtig' ? (
          <p id={`${id}-l${i}`} className="pt-1 text-16">
            {t.richtigeForm}{' '}
            <bdi lang={aufgabe.sprache} dir={richtung(aufgabe.sprache)} className="font-bold">
              {e.loesung}
            </bdi>
          </p>
        ) : null}
      </td>
    );
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-start">
          <caption className="pb-3 text-start text-20 font-bold">
            {aufgabe.titel ? <InhaltText inhalt={aufgabe.titel} /> : t.tabelle}
          </caption>
          <thead>
            <tr>
              <td className="p-2" />
              {aufgabe.spalten.map((s, j) => (
                <th
                  key={j}
                  id={`${id}-s${j}`}
                  scope="col"
                  lang={kopfSprache}
                  dir={richtung(kopfSprache)}
                  className="border border-linie bg-sand p-2 text-start text-18"
                >
                  {s}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {aufgabe.zeilen.map((z, i) => (
              <tr key={i}>
                <th
                  id={`${id}-r${i}`}
                  scope="row"
                  lang={kopfSprache}
                  dir={richtung(kopfSprache)}
                  className={`border border-linie bg-sand p-2 text-start ${kopfSprache === 'ar' ? 'font-arabic text-arabisch-3' : 'text-18'}`}
                >
                  {z}
                </th>
                {aufgabe.spalten.map((_, j) => zelle(i, j))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {hilfe ? (
        <Suspense fallback={PLATZ}>
          <Zeichenhilfe
            sprache={aufgabe.sprache}
            feldId={`${id}-z${Math.max(0, aktiv)}`}
            gesperrt={gesperrt}
            tastatur={tastatur}
            namen={texte.harakat.zeichen}
            ui={sprache}
            ziffern={ziffern}
            onZeichen={(z) => anwenden((s) => einfuegen(s, z, ANTWORT_MAX))}
            onLoeschen={() => anwenden(loesche)}
            onOffen={setOffen}
          />
        </Suspense>
      ) : (
        PLATZ
      )}
    </div>
  );
}
