'use client';

import { Volume2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Inhalt } from '@/lib/lernapp/aufgaben/grundlagen';
import { hoerenUnmoeglich, spiele, stoppe } from '@/lib/lernapp/oberflaeche/audio';
import { InhaltText } from '../InhaltText';
import type { AufgabenProps } from '../typen';

type Hoertexte = AufgabenProps<'hoeren_waehlen'>['texte']['hoeren'];
type Lage = 'bereit' | 'spielt' | 'kein_netz' | 'ohne_audio' | 'unmoeglich';

const KNOPF =
  'druck inline-flex min-h-12 items-center gap-2 rounded-pill border-2 border-gruen-700 px-5 font-bold disabled:border-linie disabled:text-tinte-3';

/**
 * Wiedergabe der Hörübungen (PLAN §4, ADR 0039 Fortschreibung Nr. 3–4, KERN 4.0 §4/§8): „Anhören“ und „Langsam anhören“
 * (0,75 mit gleicher Tonhöhe) über das eine `<audio>` der Lern-App; nichts spielt ohne Tippen. „Ich kann gerade nicht
 * hören“ überspringt alle Aufgaben der Lektion, die Hören brauchen (auch Schrift-Aufgaben nur mit Hörbeispiel). Ohne Clip („Audio folgt“) oder wenn das Gerät nicht abspielen kann, gibt es
 * nur „Weiter ohne Hören“ – keine Sackgasse. Nach der Antwort steht die Abschrift.
 */
export function Abspieler({
  hoeren,
  texte,
  gesperrt,
  ausgewertet,
  ueberspringe,
  nurUeberspringen,
  melde,
}: {
  hoeren: Inhalt;
  texte: Hoertexte;
  gesperrt: boolean;
  /** nach dem Prüfen: Abschrift zeigen */
  ausgewertet: boolean;
  ueberspringe: AufgabenProps<'hoeren_waehlen'>['ueberspringe'];
  nurUeberspringen: (ja: boolean) => void;
  melde: (text: string) => void;
}) {
  const clip = hoeren.audio;
  // Gerät schon als „kann nicht abspielen“ bekannt: gemerkt im Browser (der Spieler rendert nur dort)
  const [lage, setLage] = useState<Lage>(() => (!clip ? 'ohne_audio' : hoerenUnmoeglich() ? 'unmoeglich' : 'bereit'));

  useEffect(() => {
    nurUeberspringen(lage === 'ohne_audio' || lage === 'unmoeglich');
  }, [lage, nurUeberspringen]);

  useEffect(() => () => stoppe(), []);

  async function abspielen(langsam: boolean) {
    if (!clip) return;
    setLage('spielt');
    const r = await spiele(clip, { langsam });
    if (r === 'nicht_moeglich') {
      setLage('unmoeglich');
      melde(texte.nichtMoeglich);
    } else if (r === 'kein_netz') {
      setLage('kein_netz');
      melde(texte.keinNetz);
    } else setLage((l) => (l === 'spielt' ? 'bereit' : l));
  }

  if (lage === 'ohne_audio' || lage === 'unmoeglich')
    return (
      <div className="flex flex-col items-start gap-3 rounded-lg border-2 border-linie bg-sand p-4">
        {lage === 'ohne_audio' ? <p className="text-20 font-bold">{texte.audioFolgt}</p> : null}
        <p className="text-18">{lage === 'ohne_audio' ? texte.audioFolgtText : texte.nichtMoeglich}</p>
        <button
          type="button"
          onClick={() => ueberspringe(lage === 'unmoeglich' ? { hoeren: true, meldung: texte.uebersprungen } : {})}
          className="min-h-12 druck rounded-pill bg-gruen-700 px-6 font-bold text-weiss hover:bg-gruen-800"
        >
          {texte.ueberspringen}
        </button>
      </div>
    );

  const spielt = lage === 'spielt';
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={spielt}
          onClick={() => void abspielen(false)}
          className={`${KNOPF} bg-gruen-700 text-weiss hover:bg-gruen-800`}
        >
          <Volume2 aria-hidden className="size-6" strokeWidth={2} />
          {texte.anhoeren}
        </button>
        <button
          type="button"
          disabled={spielt}
          onClick={() => void abspielen(true)}
          className={`${KNOPF} bg-weiss text-gruen-800 hover:bg-gruen-50`}
        >
          {texte.langsam}
        </button>
        {spielt ? <span className="text-16 text-tinte-2">{texte.spielt}</span> : null}
      </div>
      {lage === 'kein_netz' ? <p className="text-16 text-fehler">{texte.keinNetz}</p> : null}
      {ausgewertet ? (
        <p className="text-18">
          {texte.abschrift} <InhaltText inhalt={hoeren} />
        </p>
      ) : !gesperrt ? (
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => ueberspringe({ hoeren: true, meldung: texte.uebersprungen })}
            className="min-h-11 font-bold text-gruen-800 underline underline-offset-4 hover:text-gruen-950"
          >
            {texte.nichtHoeren}
          </button>
          {lage === 'kein_netz' ? (
            <button
              type="button"
              onClick={() => ueberspringe()}
              className="min-h-11 font-bold text-gruen-800 underline underline-offset-4 hover:text-gruen-950"
            >
              {texte.ueberspringen}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
