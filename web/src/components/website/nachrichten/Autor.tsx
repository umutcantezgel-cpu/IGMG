import { UserRound } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Initialen nur für echte Namen; Platzhalter „[…]“ zeigen ein Personensymbol (G-04, G-05). */
function initialen(name: string): string | null {
  if (name.startsWith('[')) return null;
  const teile = name.split(/\s+/).filter((w) => /^\p{Lu}/u.test(w));
  return teile.length
    ? teile
        .slice(0, 3)
        .map((w) => w[0])
        .join('')
    : null;
}

function Bild({ name, groesse }: { name: string; groesse: string }) {
  return (
    <span
      aria-hidden
      className={cn('flex shrink-0 items-center justify-center rounded-pill bg-gruen-50 font-bold text-gruen-800', groesse)}
    >
      {initialen(name) ?? <UserRound className="size-6" />}
    </span>
  );
}

/**
 * Autorzeile im Kopf des Beitrags (design/NewsDetails.dc.html, Kopfzeile mit Trennlinien). Der Autor steht nur hier:
 * die frühere Autorenkarte der Seitenspalte entfällt (H-B03, Abnahme „Autor einmal“).
 */
export function AutorZeile({ name, funktion }: { name: string; funktion: string }) {
  return (
    <div className="flex items-center gap-3">
      <Bild name={name} groesse="size-12" />
      <span className="flex flex-col leading-snug">
        <strong>{name}</strong>
        <span className="text-16 text-tinte-2">{funktion}</span>
      </span>
    </div>
  );
}
