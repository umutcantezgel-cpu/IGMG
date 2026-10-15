'use client';

import { useState, useSyncExternalStore } from 'react';
import { mitteilungEingeschaltet, setzeMitteilung } from './mitteilung';

type Zustand = 'pruefen' | 'an' | 'aus' | 'verweigert' | 'nicht';
export type MitteilungTexte = Record<Exclude<Zustand, 'pruefen'>, string> & { einschalten: string; ausschalten: string };

function lage(): Zustand {
  if (typeof Notification === 'undefined') return 'nicht';
  if (Notification.permission === 'denied') return 'verweigert';
  return Notification.permission === 'granted' && mitteilungEingeschaltet() ? 'an' : 'aus';
}

const ohneAbo = () => () => undefined;

/**
 * „Hinweis auch als Mitteilung des Browsers“ (F-38): je Gerät. Die Erlaubnis des Browsers wird nur nach einem Klick auf
 * „einschalten“ erfragt – nie beim Laden. Ausschalten löscht nur den Merker; die Erlaubnis selbst nimmt der Browser in
 * seinen Website-Einstellungen zurück. Auf dem Server und beim Hydrieren steht nichts (Zustand „pruefen“).
 */
export function MitteilungImBrowser({
  texte,
  knopf,
}: {
  texte: MitteilungTexte;
  /** Klasse des Knopfs (KNOPF_SEKUNDAER vom Server) */ knopf: string;
}) {
  const basis = useSyncExternalStore(ohneAbo, lage, () => 'pruefen' as Zustand);
  const [eigen, setEigen] = useState<Zustand | null>(null);
  const zustand = eigen ?? basis;

  async function einschalten() {
    if (typeof Notification === 'undefined') return setEigen('nicht');
    const erlaubnis = await Notification.requestPermission();
    if (erlaubnis === 'granted') setzeMitteilung(true);
    setEigen(erlaubnis === 'granted' ? 'an' : erlaubnis === 'denied' ? 'verweigert' : 'aus');
  }

  function ausschalten() {
    setzeMitteilung(false);
    setEigen('aus');
  }

  return (
    <div className="flex flex-col gap-3">
      <p role="status" className="min-h-6 max-w-text text-16 text-tinte-2">
        {zustand === 'pruefen' ? '' : texte[zustand]}
      </p>
      {zustand === 'aus' ? (
        <button type="button" onClick={() => void einschalten()} className={`${knopf} self-start`}>
          {texte.einschalten}
        </button>
      ) : zustand === 'an' ? (
        <button type="button" onClick={ausschalten} className={`${knopf} self-start`}>
          {texte.ausschalten}
        </button>
      ) : null}
    </div>
  );
}
