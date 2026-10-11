'use client';

import { Ban, CircleCheck } from 'lucide-react';
import { useJetzt } from '@/lib/zeit/useJetzt';

type Zeitraum = { tage: number[]; start: string; ende: string };

const WOCHENTAGE = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const format = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Berlin',
  weekday: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

/** „Jetzt: Geöffnet/Geschlossen“ (Footer) – rechnet im Browser (Europe/Berlin), damit die Seite statisch bleibt. */
export function JetztGeoeffnet({ zeitraeume, geoeffnet, geschlossen }: { zeitraeume: Zeitraum[]; geoeffnet: string; geschlossen: string }) {
  const jetzt = useJetzt();
  if (!jetzt || zeitraeume.length === 0) return <span className="invisible">{geschlossen}</span>;
  const teile = format.formatToParts(jetzt);
  const tag = WOCHENTAGE.indexOf(teile.find((p) => p.type === 'weekday')?.value ?? '');
  const hm = `${teile.find((p) => p.type === 'hour')?.value}:${teile.find((p) => p.type === 'minute')?.value}`;
  const offen = zeitraeume.some((z) => z.tage.includes(tag) && z.start <= hm && hm < z.ende);
  const Icon = offen ? CircleCheck : Ban;
  return (
    <span className="flex items-center gap-1.5">
      <Icon aria-hidden className="size-4" />
      {offen ? geoeffnet : geschlossen}
    </span>
  );
}
