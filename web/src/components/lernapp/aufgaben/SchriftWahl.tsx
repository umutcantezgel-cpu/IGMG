'use client';

import { useMemo } from 'react';
import { ohneTonLoesbar, schriftWahlReihenfolge } from '@/lib/lernapp/aufgaben/auswertung/schrift_wahl';
import { InhaltText } from '../InhaltText';
import type { AufgabenProps } from '../typen';
import { Anhoeren } from '../Anhoeren';
import { Abspieler } from './Abspieler';
import { Wahlgruppe } from './Wahlgruppe';

/** Bewertung dieses Typs (lädt mit der Komponente, `lader.ts`). */
export { bewerteSchriftWahlAntwort as bewerte } from '@/lib/lernapp/aufgaben/auswertung/schrift_wahl';

/**
 * Übungstypen `schrift_tr` und `schrift_latein` (PLAN §4.4): sichtbare Vorgabe (Buchstabe, Wort mit Lücke) und/oder
 * Hörbeispiel mit „langsam“, Antworten als Radiogruppe. Ein Chunk für beide Typen (gleicher Aufbau, `schrift_wahl.ts`).
 * - Mit Vorgabe ist das Hörbeispiel eine Hilfe (`Anhoeren`): lösbar auch ohne Ton, also kein Überspringen.
 * - Nur mit Hörbeispiel ist die Aufgabe eine Hörübung und bedient sich wie die anderen Hörtypen (`Abspieler`, KERN 4.0
 *   §4/§8): „Ich kann gerade nicht hören“ überspringt sie und die übrigen Hörübungen der Lektion ohne Wertung; kann das
 *   Gerät nicht abspielen bzw. lädt die Aufnahme nicht, gibt es „Weiter ohne Hören“ (keine Sackgasse); nach dem Prüfen
 *   steht die Abschrift.
 * Mit „Hörübungen aus“ bleibt die Vorgabe; Aufgaben nur mit Hörbeispiel nimmt der Spieler dann schon vor dem Start heraus.
 */
export default function SchriftWahl({
  aufgabe,
  texte,
  weitere,
  sprache,
  ziffern,
  gesperrt,
  auswertung,
  antwort,
  setzeAntwort,
  ueberspringe,
  nurUeberspringen,
  melde,
  optionen,
}: AufgabenProps<'schrift_tr'> | AufgabenProps<'schrift_latein'>) {
  const g = weitere.aufgaben2.gemeinsam;
  const reihe = useMemo(() => schriftWahlReihenfolge(aufgabe), [aufgabe]);
  const typ = aufgabe.typ;
  const hoeruebung = aufgabe.hoeren && !ohneTonLoesbar(aufgabe) ? aufgabe.hoeren : null;
  return (
    <div className="flex flex-col gap-5">
      {hoeruebung ? (
        <div className="rounded-lg bg-sand px-4 py-6">
          <Abspieler
            hoeren={hoeruebung}
            texte={texte.hoeren}
            gesperrt={gesperrt}
            ausgewertet={auswertung !== null}
            ueberspringe={ueberspringe}
            nurUeberspringen={nurUeberspringen}
            melde={melde}
          />
        </div>
      ) : aufgabe.vorgabe ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg bg-sand px-4 py-6">
          <p className="text-48 font-bold">
            <InhaltText inhalt={aufgabe.vorgabe} />
          </p>
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
