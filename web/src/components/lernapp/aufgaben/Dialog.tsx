'use client';

import { useMemo } from 'react';
import { antwortSprecher, dialogReihenfolge } from '@/lib/lernapp/aufgaben/dialog';
import { formatiere } from '@/lib/lernapp/format';
import { InhaltText } from '../InhaltText';
import type { AufgabenProps } from '../typen';
import { Anhoeren } from '../Anhoeren';
import { Wahlgruppe } from './Wahlgruppe';

/**
 * Übungstyp `dialog` (PLAN §4): Gesprächsverlauf als geordnete Liste (Person A am Anfang der Zeile, Person B am Ende –
 * gespiegelt in RTL), jede Zeile in ihrer Sprache, optional mit Audio und aufklappbarer Übersetzung. Darunter die Antworten
 * als Radiogruppe; „Prüfen“ kommt vom Spieler.
 */
export default function Dialog({
  aufgabe,
  weitere,
  sprache,
  ziffern,
  gesperrt,
  auswertung,
  antwort,
  setzeAntwort,
  optionen,
}: AufgabenProps<'dialog'>) {
  const t = weitere.aufgaben2;
  const reihe = useMemo(() => dialogReihenfolge(aufgabe), [aufgabe]);
  const person = (s: 'a' | 'b' | 'c') => t.gemeinsam.person[s];
  return (
    <div className="flex flex-col gap-5">
      <ol aria-label={t.dialog.verlauf} className="flex flex-col gap-3">
        {aufgabe.verlauf.map((z, i) => (
          <li
            key={i}
            className={`flex flex-col gap-2 rounded-lg border border-linie p-4 ${z.sprecher === 'a' ? 'me-6 bg-sand md:me-16' : 'ms-6 bg-weiss md:ms-16'}`}
          >
            <span className="text-16 font-bold text-tinte-2">{person(z.sprecher)}</span>
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
        ))}
      </ol>
      <p className="text-18 font-bold">
        {formatiere(t.dialog.duAntwortest, { person: person(antwortSprecher(aufgabe)) }, sprache, ziffern)}
      </p>
      <Wahlgruppe
        legende={t.dialog.antworten}
        tasten={t.gemeinsam.tasten}
        optionen={reihe.map((i) => ({ index: i, inhalt: <InhaltText inhalt={aufgabe.optionen[i]!} /> }))}
        gewaehlt={antwort?.wahl ?? null}
        richtig={auswertung ? aufgabe.richtig : null}
        gesperrt={gesperrt}
        setze={(wahl) => setzeAntwort({ typ: 'dialog', wahl })}
        sprache={sprache}
        ziffern={ziffern}
        markeRichtig={t.gemeinsam.richtigeAntwort}
        markeFalsch={t.gemeinsam.deineAntwort}
        zweispaltig={false}
      />
    </div>
  );
}
