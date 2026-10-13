'use client';

import { lazy, type ReactNode, Suspense, useEffect, useRef, useState } from 'react';
import { QiblaKompassAnsicht, type QiblaKompassTexte } from './QiblaKompassAnsicht';

/** Erst im Fehlerfall (nach dem Aktivieren) gebraucht: nicht im Bundle der Gebetszeiten-Seite (H-L01, JS ≤ 180 kB) */
const Zustandsgrafik = lazy(() => import('@/components/website/Zustandsgrafik').then((m) => ({ default: m.Zustandsgrafik })));

export type { QiblaKompassTexte };

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
 * den Kreis nach Norden und stoppt wieder mit „Kompass beenden“. Nichts geschieht beim Laden. Der Code lädt erst,
 * wenn der Tab „Qibla“ sichtbar wird (QiblaKompassBeiBedarf); bis dahin zeigt der Server dieselbe Ansicht.
 */
export function QiblaKompass({ winkel, texte, symbol }: { winkel: number; texte: QiblaKompassTexte; symbol: ReactNode }) {
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
  const hinweisZeigen = phase === 'aus' || phase === 'verweigert';
  /** Die Ortung schlägt fehl: Die Richtung oben bleibt gültig, der Text sagt, was zu tun ist. */
  const fehlerZustand = phase === 'verweigert' || phase === 'fehlt';

  return (
    <QiblaKompassAnsicht
      winkel={winkel}
      texte={texte}
      symbol={symbol}
      kurs={phase === 'aktiv' ? kurs : null}
      knopfText={phase === 'aktiv' ? texte.beenden : texte.aktivieren}
      knopfZeigen={phase !== 'fehlt'}
      knopfGesperrt={phase === 'fragt' || phase === 'sucht'}
      onKnopf={umschalten}
      hinweisZeigen={hinweisZeigen}
      statusText={statusText}
      fehler={
        fehlerZustand ? (
          <Suspense fallback={null}>
            <Zustandsgrafik art="fehler" groesse={48} />
          </Suspense>
        ) : null
      }
    />
  );
}
