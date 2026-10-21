'use client';

import { lazy, Suspense, useState } from 'react';
import type { SpielerTexte } from '@/components/lernapp/typen';
import type { Lektion } from '@/lib/lernapp/aufgaben/schema';

/** Spieler als eigener Chunk (wie in der Lern-App); Übungstypen lädt er selbst per `import()`. */
const Spieler = lazy(() => import('@/components/lernapp/Spieler').then((m) => ({ default: m.Spieler })));

/**
 * Vorschau einer Lektion im echten Spieler (Verwaltung L3-06, PLAN §7.1): ohne Ereignisse (`onEreignis` tut nichts), ohne
 * Speicherung auf dem Gerät und ohne Abgleich. Sprechübungen sind aus (kein Mikrofon in der Verwaltung außer im
 * Audio-Studio), Hörübungen laden die Bündel wie die App.
 */
export function Vorschau({ lektion, texte, laedt, ende }: { lektion: Lektion; texte: SpielerTexte; laedt: string; ende: string }) {
  const [fertig, setFertig] = useState(false);
  return (
    <div className="flex flex-col gap-4" lang="de">
      <Suspense fallback={<p className="text-18 text-tinte-2">{laedt}</p>}>
        <Spieler
          key={lektion.schluessel}
          lektion={lektion}
          texte={texte}
          sprache="de"
          ziffern="westlich"
          onEreignis={() => undefined}
          onFertig={() => setFertig(true)}
          optionen={{ hoeren: true, sprechen: false, spracherkennung: false }}
        />
      </Suspense>
      {fertig ? (
        <p role="status" className="text-16 text-tinte-2">
          {ende}
        </p>
      ) : null}
    </div>
  );
}
