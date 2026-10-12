'use client';

import { Ban, CircleCheck } from 'lucide-react';
import { berlinTeile, uhrzeitBerlin } from '@/lib/gebetszeiten/naechstes';
import { useJetzt } from '@/lib/zeit/useJetzt';

type Zeitraum = { tage: number[]; start: string; ende: string };

/** „Jetzt: Geöffnet/Geschlossen“ (Footer) – rechnet im Browser (Europe/Berlin), damit die Seite statisch bleibt. */
export function JetztGeoeffnet({ zeitraeume, geoeffnet, geschlossen }: { zeitraeume: Zeitraum[]; geoeffnet: string; geschlossen: string }) {
  const jetzt = useJetzt();
  if (!jetzt || zeitraeume.length === 0) return <span className="invisible">{geschlossen}</span>;
  // Ortszeit Europe/Berlin ohne Intl (H-L01, lib/gebetszeiten/naechstes.ts)
  const tag = berlinTeile(jetzt).wochentag;
  const hm = uhrzeitBerlin(jetzt);
  const offen = zeitraeume.some((z) => z.tage.includes(tag) && z.start <= hm && hm < z.ende);
  const Icon = offen ? CircleCheck : Ban;
  return (
    <span className="flex items-center gap-1.5">
      <Icon aria-hidden className="size-4" />
      {offen ? geoeffnet : geschlossen}
    </span>
  );
}
