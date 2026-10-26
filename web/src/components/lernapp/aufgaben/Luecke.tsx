'use client';

import { lazy, Suspense, useId, useMemo } from 'react';
import { lueckeReihenfolge } from '@/lib/lernapp/aufgaben/auswertung/luecke';
import type { AufgabenProps } from '../typen';
import { LueckeSatz } from './LueckeSatz';
import { Optionsgruppe } from './Optionsgruppe';

/** Bewertung dieses Typs (lädt mit der Komponente, `lader.ts`). */
export { bewerteLuecke as bewerte } from '@/lib/lernapp/aufgaben/auswertung/luecke';

/**
 * Freitext-Form als eigener Chunk (Stufe C N6): Beginnt eine Lektion mit einer Lücke, zählt ihr Typ-Chunk zum Spieler-Budget
 * (KERN §9, zusätzlich zur Hülle ≤ 60 KB); die Wahl unter Optionen braucht weder Feld noch Zeichenhilfe.
 */
const LueckeFeld = lazy(() => import('./LueckeFeld'));

/**
 * Übungstyp `luecke` (Lückentext, PLAN §4): Der Satz steht mit `lang`/`dir` seiner Sprache. Mit Optionen zeigt die Lücke
 * die Wahl, die Optionen bilden eine Radiogruppe, die der Satz mit „…“ beschreibt (`aria-describedby`); ohne Optionen ist die Lücke ein beschriftetes Feld im Satz (Beschreibung:
 * der ganze Satz mit „…“), darunter die Zeichenhilfe (`LueckeFeld.tsx`). Die Übersetzung steht als Hilfe darunter.
 */
export default function Luecke(props: AufgabenProps<'luecke'>) {
  const { aufgabe, texte, sprache, ziffern, gesperrt, auswertung, antwort, setzeAntwort } = props;
  const id = useId();
  const t = texte.luecke;
  const reihe = useMemo(() => lueckeReihenfolge(aufgabe), [aufgabe]);
  const optionen = aufgabe.optionen;

  // Freitext: Feld und Zeichenhilfe als eigener Chunk; bis dahin der Satz mit Platz für Feld und Zeichenhilfe
  if (!optionen)
    return (
      <Suspense
        fallback={
          <div className="flex flex-col gap-5">
            <LueckeSatz
              aufgabe={aufgabe}
              id={id}
              hilfe={t.hilfe}
              luecke={<span aria-hidden className="mx-1 inline-block min-h-12 w-40" />}
            />
            <div className="min-h-11" />
          </div>
        }
      >
        <LueckeFeld {...props} />
      </Suspense>
    );

  const wahl = antwort && 'wahl' in antwort ? antwort.wahl : null;
  const status = auswertung ? (auswertung.urteil === 'falsch' ? 'nicht' : 'angenommen') : null;
  return (
    <Optionsgruppe
      legende={t.optionen}
      tasten={t.tasten}
      optionen={optionen.map((o) => ({ text: o, sprache: aufgabe.sprache }))}
      reihe={reihe}
      wahl={wahl}
      setzeWahl={(i) => setzeAntwort({ typ: 'luecke', wahl: i })}
      gesperrt={gesperrt}
      richtig={auswertung ? richtigeOption(optionen, auswertung.loesung, aufgabe) : null}
      ui={sprache}
      ziffern={ziffern}
      kopf={
        <LueckeSatz
          aufgabe={aufgabe}
          id={id}
          hilfe={t.hilfe}
          luecke={
            <span
              aria-hidden
              className={`mx-1 inline-block min-w-24 border-b-2 px-2 text-center font-bold ${status === 'nicht' ? 'border-fehler' : 'border-gruen-700'}`}
            >
              {wahl !== null ? optionen[wahl] : '\u00A0'}
            </span>
          }
        />
      }
      beschriebenVon={`${id}-satz`}
    />
  );
}

/** Index der Option, die die angezeigte Lösung füllt (Satz mit Lücke = Lösung). */
function richtigeOption(optionen: readonly string[], loesung: string | null, a: { vor: string; nach: string }): number | null {
  if (!loesung) return null;
  const i = optionen.findIndex((o) => `${a.vor}${o}${a.nach}`.replace(/\s+/g, ' ').trim() === loesung);
  return i >= 0 ? i : null;
}
