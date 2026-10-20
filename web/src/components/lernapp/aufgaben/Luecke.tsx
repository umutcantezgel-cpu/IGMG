'use client';

import { useId, useMemo, useState } from 'react';
import { lueckeReihenfolge } from '@/lib/lernapp/aufgaben/auswertung/luecke';
import { richtung, type AufgabenProps } from '../typen';
import { Optionsgruppe } from './Optionsgruppe';
import { feldKlasse, useSchreibmarke } from './Texteingabe';
import { Zeichenhilfe } from './Zeichenhilfe';

/** Bewertung dieses Typs (lädt mit der Komponente, `lader.ts`). */
export { bewerteLuecke as bewerte } from '@/lib/lernapp/aufgaben/auswertung/luecke';

/**
 * Übungstyp `luecke` (Lückentext, PLAN §4): Der Satz steht mit `lang`/`dir` seiner Sprache. Mit Optionen zeigt die Lücke
 * die Wahl, die Optionen bilden eine Radiogruppe; ohne Optionen ist die Lücke ein beschriftetes Feld im Satz (Beschreibung:
 * der ganze Satz mit „…“), darunter die Zeichenhilfe. Die Übersetzung steht als Hilfe darunter.
 */
export default function Luecke({
  aufgabe,
  texte,
  sprache,
  ziffern,
  gesperrt,
  auswertung,
  antwort,
  setzeAntwort,
  tastatur,
}: AufgabenProps<'luecke'>) {
  const id = useId();
  const t = texte.luecke;
  const reihe = useMemo(() => lueckeReihenfolge(aufgabe), [aufgabe]);
  const [wert, setWert] = useState(antwort && 'text' in antwort ? antwort.text : '');
  const setze = (w: string) => {
    setWert(w);
    setzeAntwort(w.trim() ? { typ: 'luecke', text: w } : null);
  };
  const m = useSchreibmarke(`${id}-feld`, wert, setze);
  const [offen, setOffen] = useState(false);
  const optionen = aufgabe.optionen;
  const wahl = antwort && 'wahl' in antwort ? antwort.wahl : null;
  const status = auswertung ? (auswertung.urteil === 'falsch' ? 'nicht' : 'angenommen') : null;
  const dir = richtung(aufgabe.sprache);
  const ar = aufgabe.sprache === 'ar';

  const luecke = optionen ? (
    <span
      aria-hidden
      className={`mx-1 inline-block min-w-24 border-b-2 px-2 text-center font-bold ${status === 'nicht' ? 'border-fehler' : 'border-gruen-700'}`}
    >
      {wahl !== null ? optionen[wahl] : '\u00A0'}
    </span>
  ) : (
    <>
      <label htmlFor={`${id}-feld`} className="sr-only">
        {t.luecke}
      </label>
      <input
        id={`${id}-feld`}
        type="text"
        lang={aufgabe.sprache}
        dir={dir}
        value={wert}
        disabled={gesperrt}
        maxLength={60}
        size={10}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        inputMode={offen ? 'none' : undefined}
        aria-describedby={`${id}-satz`}
        onChange={(e) => setze(e.target.value)}
        onSelect={m.merke}
        className={`mx-1 inline-block w-40 align-baseline ${feldKlasse(aufgabe.sprache, status, false)}`}
      />
    </>
  );

  const satz = (
    <div className="flex flex-col gap-3">
      <p lang={aufgabe.sprache} dir={dir} className={`rounded-lg bg-sand px-4 py-5 ${ar ? 'font-arabic text-arabisch-2' : 'text-24'}`}>
        {aufgabe.vor}
        {luecke}
        {aufgabe.nach}
      </p>
      <p id={`${id}-satz`} lang={aufgabe.sprache} dir={dir} className="sr-only">
        {`${aufgabe.vor} … ${aufgabe.nach}`}
      </p>
      {aufgabe.hilfe ? (
        <p className="text-18 text-tinte-2">
          {t.hilfe}{' '}
          <bdi lang={aufgabe.hilfe.sprache} dir={richtung(aufgabe.hilfe.sprache)}>
            {aufgabe.hilfe.text}
          </bdi>
        </p>
      ) : null}
    </div>
  );

  if (optionen)
    return (
      <Optionsgruppe
        legende={t.optionen}
        tasten={t.tasten}
        optionen={optionen.map((o) => ({ text: o, sprache: aufgabe.sprache }))}
        reihe={reihe}
        wahl={wahl}
        setzeWahl={(i) => setzeAntwort({ typ: 'luecke', wahl: i })}
        gesperrt={gesperrt}
        richtig={auswertung ? richtigeOption(aufgabe.optionen ?? [], auswertung.loesung, aufgabe) : null}
        ui={sprache}
        ziffern={ziffern}
        kopf={satz}
      />
    );

  return (
    <div className="flex flex-col gap-5">
      {satz}
      <Zeichenhilfe
        sprache={aufgabe.sprache}
        feldId={`${id}-feld`}
        gesperrt={gesperrt}
        tastatur={tastatur}
        namen={texte.harakat.zeichen}
        ui={sprache}
        ziffern={ziffern}
        onZeichen={m.zeichen}
        onLoeschen={m.loeschen}
        onOffen={setOffen}
      />
    </div>
  );
}

/** Index der Option, die die angezeigte Lösung füllt (Satz mit Lücke = Lösung). */
function richtigeOption(optionen: readonly string[], loesung: string | null, a: { vor: string; nach: string }): number | null {
  if (!loesung) return null;
  const i = optionen.findIndex((o) => `${a.vor}${o}${a.nach}`.replace(/\s+/g, ' ').trim() === loesung);
  return i >= 0 ? i : null;
}
