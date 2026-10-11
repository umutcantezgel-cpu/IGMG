'use client';

import { Compass } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

/** Texte kommen als Props aus der Server-Komponente QiblaPanel (K-12: kein next-intl im Browser). */
export type QiblaKompassTexte = {
  dialAria: string;
  dialNord: string;
  winkelKurz: string;
  aktivieren: string;
  beenden: string;
  hinweis: string;
  startet: string;
  aktiv: string;
  verweigert: string;
  fehlt: string;
};

type Phase = 'aus' | 'fragt' | 'sucht' | 'aktiv' | 'verweigert' | 'fehlt';

/** Wartezeit auf ein erstes Lagesignal; danach gilt der Sensor als nicht verfügbar. */
const WARTEZEIT_MS = 3000;

/** iOS verlangt eine ausdrückliche Erlaubnis; die Methode gibt es nur dort. */
type OrientierungsGeraet = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<'granted' | 'denied'>;
};

/** iOS liefert den Kompasskurs als webkitCompassHeading. */
type Lagesignal = DeviceOrientationEvent & { webkitCompassHeading?: number };

/** Kurs in Grad im Uhrzeigersinn ab Norden; null, solange kein verwertbares Signal kommt. */
function kursAus(signal: Lagesignal): number | null {
  const ios = signal.webkitCompassHeading;
  if (typeof ios === 'number' && ios >= 0) return ios;
  if (signal.absolute === true && typeof signal.alpha === 'number') return (360 - signal.alpha) % 360;
  return null;
}

/**
 * Kompass der Qibla-Richtung (design/PrayerTimes.dc.html, Tab „Qibla“): Die Richtung steht fest und wird
 * auf dem Server berechnet. Der Kompass hört erst nach „Kompass aktivieren“ auf die Lagesensoren, dreht
 * den Kreis nach Norden und stoppt wieder mit „Kompass beenden“. Nichts geschieht beim Laden.
 */
export function QiblaKompass({ winkel, texte }: { winkel: number; texte: QiblaKompassTexte }) {
  const [phase, setPhase] = useState<Phase>('aus');
  const [kurs, setKurs] = useState<number | null>(null);
  const datenDa = useRef(false);

  useEffect(() => {
    if (phase !== 'sucht' && phase !== 'aktiv') return;
    const lauschen = (ereignis: Event) => {
      const neuerKurs = kursAus(ereignis as Lagesignal);
      if (neuerKurs === null) return;
      datenDa.current = true;
      setKurs(Math.round(neuerKurs));
      setPhase('aktiv');
    };
    window.addEventListener('deviceorientationabsolute', lauschen);
    window.addEventListener('deviceorientation', lauschen);
    const wartezeit = window.setTimeout(() => {
      if (!datenDa.current) setPhase('fehlt');
    }, WARTEZEIT_MS);
    return () => {
      window.removeEventListener('deviceorientationabsolute', lauschen);
      window.removeEventListener('deviceorientation', lauschen);
      window.clearTimeout(wartezeit);
    };
  }, [phase]);

  async function umschalten() {
    if (phase === 'aktiv') {
      datenDa.current = false;
      setKurs(null);
      setPhase('aus');
      return;
    }
    if (typeof DeviceOrientationEvent === 'undefined') {
      setPhase('fehlt');
      return;
    }
    datenDa.current = false;
    const geraet = DeviceOrientationEvent as OrientierungsGeraet;
    if (typeof geraet.requestPermission === 'function') {
      // Die Erlaubnis wird direkt im Klick angefordert (iOS verlangt die Nutzeraktion).
      setPhase('fragt');
      try {
        if ((await geraet.requestPermission()) !== 'granted') {
          setPhase('verweigert');
          return;
        }
      } catch {
        setPhase('verweigert');
        return;
      }
    }
    setPhase('sucht');
  }

  const statusText = {
    aus: '',
    fragt: texte.startet,
    sucht: texte.startet,
    aktiv: texte.aktiv,
    verweigert: texte.verweigert,
    fehlt: texte.fehlt,
  }[phase];
  const drehung = phase === 'aktiv' && kurs !== null ? { transform: `rotate(${-kurs}deg)` } : undefined;
  const hinweisZeigen = phase === 'aus' || phase === 'verweigert';

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div role="img" aria-label={texte.dialAria} className="relative size-60 rounded-full border-2 border-rand bg-papier">
        <div aria-hidden className="absolute inset-0 transition-transform duration-150 motion-reduce:transition-none" style={drehung}>
          <span className="absolute top-2 left-1/2 -translate-x-1/2 font-bold text-tinte">{texte.dialNord}</span>
          <div className="absolute inset-0" style={{ transform: `rotate(${winkel}deg)` }}>
            <span className="absolute top-1/2 left-1/2 h-24 w-1 -translate-x-1/2 -translate-y-full rounded-sm bg-gruen-700" />
          </div>
        </div>
        <span aria-hidden className="absolute top-1/2 left-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-pill bg-gruen-950" />
        <span aria-hidden className="absolute bottom-5 left-1/2 -translate-x-1/2 text-20 font-bold text-gruen-800">
          {texte.winkelKurz}
        </span>
      </div>
      {phase === 'fehlt' ? null : (
        <button
          type="button"
          onClick={umschalten}
          disabled={phase === 'fragt' || phase === 'sucht'}
          className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-md border-2 border-gruen-700 bg-weiss px-5 font-bold text-gruen-800 hover:bg-gruen-50 disabled:cursor-wait disabled:opacity-60"
        >
          <Compass aria-hidden className="size-5" />
          <span>{phase === 'aktiv' ? texte.beenden : texte.aktivieren}</span>
        </button>
      )}
      {hinweisZeigen ? <p className="max-w-[40ch] text-16 leading-normal text-tinte-2">{texte.hinweis}</p> : null}
      <p role="status" className="min-h-12 max-w-[40ch] text-16 leading-normal text-tinte">
        {statusText}
      </p>
    </div>
  );
}
