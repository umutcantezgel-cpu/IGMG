import { CirclePause, Clock, Lock } from 'lucide-react';
import type { RefObject } from 'react';
import type { SchreibGrund } from '@/lib/chat/regeln';

/**
 * Hinweisband über dem gesperrten Eingabefeld (GC-1): Symbol, Grund und – bei „geschlossen“ – die Wiederöffnungszeit.
 * Solange es steht, ist es die einzige Statusmeldung des Fensters; eine weitere Meldung (z. B. „gemeldet“) steht darin.
 */
export function SperrBand({
  ref,
  grund,
  text,
  wiederAb,
  zusatz = null,
}: {
  ref?: RefObject<HTMLDivElement | null>;
  grund: SchreibGrund;
  text: string;
  wiederAb: string;
  zusatz?: string | null;
}) {
  // Uhr für Zeitfenster und Stummschaltung, Pause für Pausen, sonst Schloss
  const klasse = 'mt-0.5 size-5 shrink-0 text-info';
  return (
    <div ref={ref} role="status" tabIndex={-1} className="flex items-start gap-3 rounded-md bg-info-toenung px-4 py-3">
      {grund === 'geschlossen' || grund === 'stumm' ? (
        <Clock aria-hidden className={klasse} />
      ) : grund === 'pausiert' || grund === 'notfallpause' ? (
        <CirclePause aria-hidden className={klasse} />
      ) : (
        <Lock aria-hidden className={klasse} />
      )}
      <p className="flex flex-col text-16">
        <span className="font-bold text-tinte">{text}</span>
        {grund === 'geschlossen' ? <span className="text-tinte-2">{wiederAb}</span> : null}
        {zusatz ? <span className="text-tinte-2">{zusatz}</span> : null}
      </p>
    </div>
  );
}
