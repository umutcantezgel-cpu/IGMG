'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ablauf, frageReihenfolge } from '@/lib/lernapp/aufgaben/geschichte';
import { formatiere } from '@/lib/lernapp/format';
import { InhaltText, isoliert } from '../InhaltText';
import type { AufgabenProps } from '../typen';
import { Anhoeren } from '../Anhoeren';
import { Wahlgruppe } from './Wahlgruppe';

/** Bewertung dieses Typs (lädt mit der Komponente, `lader.ts`). */
export { bewerteGeschichte as bewerte } from '@/lib/lernapp/aufgaben/geschichte';

const KNOPF = 'min-h-12 druck self-start rounded-pill border-2 border-gruen-700 bg-weiss px-6 font-bold text-gruen-800 hover:bg-gruen-50';

/**
 * Übungstyp `geschichte` (PLAN §4): Zeile für Zeile mit „Weiter lesen“ (der Fokus springt auf die neue Zeile, Screenreader
 * lesen sie vor), Audio je Zeile, Fragen dazwischen mit sofortiger Rückmeldung als Text (und in der Live-Region). Nach der
 * letzten Zeile gibt „Geschichte abschließen“ die ersten Antworten ab; das Rückmeldeblatt des Spielers folgt.
 */
export default function Geschichte({
  aufgabe,
  weitere,
  sprache,
  ziffern,
  gesperrt,
  auswertung,
  gibAb,
  melde,
  optionen,
}: AufgabenProps<'geschichte'>) {
  const t = weitere.aufgaben2;
  const schritte = useMemo(() => ablauf(aufgabe), [aufgabe]);
  const [pos, setPos] = useState(0);
  const [wahl, setWahl] = useState<number | null>(null);
  const [wahlen, setWahlen] = useState<(number | null)[]>(() => aufgabe.fragen.map(() => null));
  const neu = useRef<HTMLLIElement>(null);
  const erster = useRef(true);

  useEffect(() => {
    if (erster.current) {
      erster.current = false;
      return;
    }
    neu.current?.focus();
  }, [pos]);

  const aktuell = schritte[pos];
  const offeneFrage = aktuell?.art === 'frage' && wahlen[aktuell.index] == null;
  const amEnde = pos >= schritte.length - 1 && !offeneFrage;

  function pruefeFrage() {
    if (aktuell?.art !== 'frage' || wahl === null) return;
    const f = aufgabe.fragen[aktuell.index]!;
    setWahlen((w) => w.map((x, i) => (i === aktuell.index ? wahl : x)));
    melde(
      wahl === f.richtig
        ? t.geschichte.richtig
        : formatiere(t.geschichte.falsch, { loesung: isoliert(f.optionen[f.richtig]?.text ?? '') }, sprache, ziffern),
    );
    setWahl(null);
  }

  function weiter() {
    melde('');
    setPos((p) => Math.min(p + 1, schritte.length - 1));
  }

  function abschliessen() {
    gibAb({ typ: 'geschichte', wahlen: wahlen.map((w) => w ?? -1) });
  }

  return (
    <div className="flex flex-col gap-5">
      {aufgabe.titel ? (
        <p className="text-24 font-bold">
          <InhaltText inhalt={aufgabe.titel} />
        </p>
      ) : null}
      <ol className="flex flex-col gap-4">
        {schritte.slice(0, pos + 1).map((s, i) => {
          const letzte = i === pos;
          if (s.art === 'zeile') {
            const z = aufgabe.zeilen[s.index]!;
            return (
              <li key={`z${s.index}`} ref={letzte ? neu : undefined} tabIndex={-1} className="flex flex-col gap-2 outline-none">
                {z.sprecher ? <span className="text-16 font-bold text-tinte-2">{t.gemeinsam.person[z.sprecher]}</span> : null}
                <span className="text-20">
                  <InhaltText inhalt={z.zeile} />
                </span>
                <Anhoeren audio={z.zeile.audio} texte={t.gemeinsam} aus={!optionen.hoeren} />
                {z.uebersetzung ? (
                  <details className="text-18">
                    <summary className="min-h-11 cursor-pointer py-2 font-bold text-gruen-800">{t.gemeinsam.uebersetzung}</summary>
                    <InhaltText inhalt={z.uebersetzung} />
                  </details>
                ) : null}
              </li>
            );
          }
          const f = aufgabe.fragen[s.index]!;
          const beantwortet = wahlen[s.index];
          const reihe = frageReihenfolge(aufgabe, s.index);
          return (
            <li
              key={`f${s.index}`}
              ref={letzte ? neu : undefined}
              tabIndex={-1}
              className="flex flex-col gap-3 rounded-lg border-2 border-linie bg-weiss p-4 outline-none"
            >
              <p className="text-18 font-bold">
                {t.geschichte.frage}: <InhaltText inhalt={f.frage} />
              </p>
              <Wahlgruppe
                legende={f.frage.text}
                tasten={t.gemeinsam.tasten}
                optionen={reihe.map((k) => ({ index: k, inhalt: <InhaltText inhalt={f.optionen[k]!} /> }))}
                gewaehlt={beantwortet ?? (letzte ? wahl : null)}
                richtig={beantwortet != null ? f.richtig : null}
                gesperrt={gesperrt || beantwortet != null}
                setze={setWahl}
                beiEnter={pruefeFrage}
                sprache={sprache}
                ziffern={ziffern}
                markeRichtig={t.gemeinsam.richtigeAntwort}
                markeFalsch={t.gemeinsam.deineAntwort}
              />
              {beantwortet != null ? (
                <p className={`text-18 font-bold ${beantwortet === f.richtig ? 'text-gruen-800' : 'text-fehler'}`}>
                  {beantwortet === f.richtig
                    ? t.geschichte.richtig
                    : formatiere(t.geschichte.falsch, { loesung: isoliert(f.optionen[f.richtig]?.text ?? '') }, sprache, ziffern)}
                </p>
              ) : letzte && !gesperrt ? (
                <button type="button" onClick={pruefeFrage} disabled={wahl === null} className={`${KNOPF} disabled:opacity-60`}>
                  {t.geschichte.fragePruefen}
                </button>
              ) : null}
            </li>
          );
        })}
      </ol>
      {gesperrt || auswertung ? null : offeneFrage ? null : amEnde ? (
        <div className="flex flex-col gap-3">
          <p className="text-18">{t.geschichte.fertig}</p>
          <button type="button" onClick={abschliessen} className={KNOPF}>
            {t.geschichte.abschliessen}
          </button>
        </div>
      ) : (
        <button type="button" onClick={weiter} className={KNOPF}>
          {t.geschichte.weiterLesen}
        </button>
      )}
    </div>
  );
}
