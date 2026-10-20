'use client';

import { useMemo } from 'react';
import { hoerenReihenfolge } from '@/lib/lernapp/aufgaben/hoeren_waehlen';
import type { AufgabenProps } from '../typen';
import { Abspieler } from './Abspieler';
import { Optionsgruppe } from './Optionsgruppe';

/**
 * Hören und wählen (gemeinsam für `hoeren_waehlen` und `minimalpaare`): Abspieler oben, darunter die Radiogruppe. Ohne
 * Clip oder ohne Wiedergabe auf dem Gerät nur der Abspieler mit „Weiter ohne Hören“.
 */
export function HoerWahl({
  props,
  legende,
  tasten,
  gross,
}: {
  props: AufgabenProps<'hoeren_waehlen'> | AufgabenProps<'minimalpaare'>;
  legende: string;
  tasten: string;
  gross: boolean;
}) {
  const { aufgabe, texte, sprache, ziffern, gesperrt, auswertung, antwort, setzeAntwort, ueberspringe, nurUeberspringen, melde } = props;
  const reihe = useMemo(() => hoerenReihenfolge(aufgabe), [aufgabe]);
  const abspieler = (
    <Abspieler
      hoeren={aufgabe.hoeren}
      texte={texte.hoeren}
      gesperrt={gesperrt}
      ausgewertet={auswertung !== null}
      ueberspringe={ueberspringe}
      nurUeberspringen={nurUeberspringen}
      melde={melde}
    />
  );
  if (!aufgabe.hoeren.audio) return abspieler;
  const typ = aufgabe.typ;
  return (
    <Optionsgruppe
      legende={legende}
      tasten={tasten}
      optionen={aufgabe.optionen}
      reihe={reihe}
      wahl={antwort?.wahl ?? null}
      setzeWahl={(wahl) => setzeAntwort({ typ, wahl } as never)}
      gesperrt={gesperrt}
      richtig={auswertung ? aufgabe.richtig : null}
      ui={sprache}
      ziffern={ziffern}
      gross={gross}
      kopf={abspieler}
    />
  );
}
