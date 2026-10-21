'use client';

import { useMemo } from 'react';
import { schriftWahlReihenfolge } from '@/lib/lernapp/aufgaben/auswertung/schrift_wahl';
import { InhaltText } from '../InhaltText';
import type { AufgabenProps } from '../typen';
import { Anhoeren } from '../Anhoeren';
import { Wahlgruppe } from './Wahlgruppe';

/** Bewertung dieses Typs (lädt mit der Komponente, `lader.ts`). */
export { bewerteSchriftWahlAntwort as bewerte } from '@/lib/lernapp/aufgaben/auswertung/schrift_wahl';

/**
 * Übungstypen `schrift_tr` und `schrift_latein` (PLAN §4.4): sichtbare Vorgabe (Buchstabe, Wort mit Lücke) und/oder
 * Hörbeispiel mit „langsam“, Antworten als Radiogruppe. Ein Chunk für beide Typen (gleicher Aufbau, `schrift_wahl.ts`).
 * Ohne Ton (Hörübungen aus) bleibt die Vorgabe; Aufgaben nur mit Hörbeispiel überspringt der Spieler dann ohne Wertung.
 */
export default function SchriftWahl({
  aufgabe,
  weitere,
  sprache,
  ziffern,
  gesperrt,
  auswertung,
  antwort,
  setzeAntwort,
  optionen,
}: AufgabenProps<'schrift_tr'> | AufgabenProps<'schrift_latein'>) {
  const g = weitere.aufgaben2.gemeinsam;
  const reihe = useMemo(() => schriftWahlReihenfolge(aufgabe), [aufgabe]);
  const typ = aufgabe.typ;
  return (
    <div className="flex flex-col gap-5">
      {aufgabe.vorgabe || (aufgabe.hoeren && optionen.hoeren) ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg bg-sand px-4 py-6">
          {aufgabe.vorgabe ? (
            <p className="text-48 font-bold">
              <InhaltText inhalt={aufgabe.vorgabe} />
            </p>
          ) : null}
          <Anhoeren audio={aufgabe.hoeren?.audio} texte={g} aus={!optionen.hoeren} />
        </div>
      ) : null}
      <Wahlgruppe
        legende={g.antworten}
        tasten={g.tasten}
        optionen={reihe.map((i) => ({ index: i, inhalt: <InhaltText inhalt={aufgabe.optionen[i]!} /> }))}
        gewaehlt={antwort?.wahl ?? null}
        richtig={auswertung ? aufgabe.richtig : null}
        gesperrt={gesperrt}
        setze={(wahl) => setzeAntwort({ typ, wahl } as never)}
        sprache={sprache}
        ziffern={ziffern}
        markeRichtig={g.richtigeAntwort}
        markeFalsch={g.deineAntwort}
        gross
      />
    </div>
  );
}
