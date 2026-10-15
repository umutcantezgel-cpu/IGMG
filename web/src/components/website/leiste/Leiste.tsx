'use client';

import { lazy, Suspense, type ComponentProps } from 'react';
import { LeisteLive } from './LeisteLive';

/**
 * Die einzeilige Leiste der Leseseiten lädt als eigener Chunk nur dort (Z-08): Seiten mit voller Leiste (die meisten,
 * auch not-found) bringen ihr JavaScript nicht mehr mit. Auf dem Server wird sie vollständig gerendert; bei der
 * Hydrierung bleibt das Server-HTML stehen, bis der Chunk da ist (kein Sprung, feste Höhe).
 */
const LeisteKompakt = lazy(() => import('./LeisteKompakt').then((m) => ({ default: m.LeisteKompakt })));

/** PrayerTimesBar im Browser: volle Leiste oder (Leseseiten) die einzeilige Form. */
export function Leiste({ kompakt, ...props }: ComponentProps<typeof LeisteLive> & { kompakt: boolean }) {
  if (!kompakt) return <LeisteLive {...props} />;
  return (
    <Suspense fallback={null}>
      <LeisteKompakt {...props} />
    </Suspense>
  );
}
