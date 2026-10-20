'use client';

import { useEffect, useRef, useState } from 'react';
import type { Inhalt } from '@/lib/lernapp/aufgaben/schema';
import { ladeBuendel } from '@/lib/lernapp/lokal/vorrat';

/** Element einstellen und abspielen (außerhalb der Komponente: das Element ist ein externes System). */
function spieleAb(el: HTMLAudioElement, adresse: string, langsam: boolean): Promise<void> {
  el.src = adresse;
  el.playbackRate = langsam ? 0.75 : 1;
  el.preservesPitch = true;
  return el.play();
}

/**
 * Vorlage anhören (ADR 0039 Fortschreibung S4/S5): Das Bündel kommt ganz aus dem Vorrat bzw. Netz, der Clip ist eine
 * Scheibe daraus (`Blob.slice`, ohne Kopie) und spielt über ein `<audio>` aus einer Objekt-Adresse (`media-src blob:`).
 * „Langsam“ = 0,75-fach mit erhaltener Tonhöhe. Ohne Audio rendert die Komponente nichts (KERN 4.0 §4: „Audio folgt“).
 */
export function Anhoeren({
  audio,
  texte,
  aus = false,
}: {
  audio: Inhalt['audio'];
  texte: { anhoeren: string; langsam: string; audioFehler: string };
  /** „Hörübungen aus“ */
  aus?: boolean;
}) {
  const [fehler, setFehler] = useState(false);
  const element = useRef<HTMLAudioElement | null>(null);
  const adresse = useRef<string | null>(null);

  useEffect(
    () => () => {
      element.current?.pause();
      if (adresse.current) URL.revokeObjectURL(adresse.current);
    },
    [],
  );

  if (!audio || aus) return null;

  async function spiele(langsam: boolean) {
    if (!audio) return;
    try {
      if (!adresse.current) {
        const buendel = await ladeBuendel(audio.buendel);
        if (!buendel) throw new Error('Bündel fehlt');
        adresse.current = URL.createObjectURL(buendel.slice(audio.versatz, audio.versatz + audio.laenge, 'audio/webm'));
      }
      element.current ??= new Audio();
      setFehler(false);
      await spieleAb(element.current, adresse.current, langsam);
    } catch {
      setFehler(true);
    }
  }

  const knopf =
    'inline-flex min-h-11 items-center gap-2 rounded-pill border-2 border-gruen-700 px-4 font-bold text-gruen-800 hover:bg-gruen-50';
  return (
    <span className="flex flex-wrap items-center gap-2">
      <button type="button" className={knopf} onClick={() => void spiele(false)}>
        {texte.anhoeren}
      </button>
      <button type="button" className={knopf} onClick={() => void spiele(true)}>
        {texte.langsam}
      </button>
      {fehler ? <span className="text-16 text-fehler">{texte.audioFehler}</span> : null}
    </span>
  );
}
