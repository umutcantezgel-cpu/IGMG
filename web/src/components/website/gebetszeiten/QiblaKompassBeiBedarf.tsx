'use client';

import { lazy, type ReactNode, Suspense, useEffect, useRef, useState } from 'react';
import type { QiblaKompassTexte } from './QiblaKompassAnsicht';

const QiblaKompass = lazy(() => import('./QiblaKompass').then((m) => ({ default: m.QiblaKompass })));

/**
 * Lädt den Kompass erst, wenn er sichtbar wird, also wenn der Tab „Qibla“ geöffnet ist (H-L01, JS ≤ 180 kB gz).
 * Inaktive Tabs tragen `hidden` und schneiden den Bildschirm deshalb nicht. Bis dahin steht die Vorschau vom Server
 * mit derselben Ansicht im Zustand „aus“ (QiblaKompassAnsicht). Sie ist auch die Rückfallansicht beim Laden.
 */
export function QiblaKompassBeiBedarf({
  winkel,
  texte,
  symbol,
  vorschau,
}: {
  winkel: number;
  texte: QiblaKompassTexte;
  symbol: ReactNode;
  vorschau: ReactNode;
}) {
  const huelle = useRef<HTMLDivElement>(null);
  const [laden, setLaden] = useState(false);

  useEffect(() => {
    const ziel = huelle.current;
    if (!ziel || laden) return;
    if (typeof IntersectionObserver === 'undefined') {
      setLaden(true);
      return;
    }
    const beobachter = new IntersectionObserver(
      (eintraege) => {
        if (eintraege.some((e) => e.isIntersecting)) setLaden(true);
      },
      { rootMargin: '200px' },
    );
    beobachter.observe(ziel);
    return () => beobachter.disconnect();
  }, [laden]);

  return (
    <div ref={huelle} className="w-full">
      {laden ? (
        <Suspense fallback={vorschau}>
          <QiblaKompass winkel={winkel} texte={texte} symbol={symbol} />
        </Suspense>
      ) : (
        vorschau
      )}
    </div>
  );
}
