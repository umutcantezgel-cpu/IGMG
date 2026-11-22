import { UserRound } from 'lucide-react';
import { Bild } from '@/components/website/Bild';
import { cn } from '@/lib/utils';

/** Initialen aus den großgeschriebenen Wörtern des Namens; ohne solche Wörter ein Personensymbol. */
function initialen(name: string): string | null {
  const teile = name.split(/\s+/).filter((w) => /^\p{Lu}/u.test(w));
  return teile.length
    ? teile
        .slice(0, 3)
        .map((w) => w[0])
        .join('')
    : null;
}

/** Zeichen vor dem Namen: das Logo des Absenders (Gemeinde), sonst die Initialen der Person. */
function Zeichen({ name, logo, groesse }: { name: string; logo?: string; groesse: string }) {
  if (logo)
    return (
      <span aria-hidden className={cn('flex shrink-0 items-center justify-center rounded-pill border border-linie bg-weiss', groesse)}>
        <Bild src={logo} alt="" width={40} height={40} className="size-8 rounded-sm" />
      </span>
    );
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
 * Absenderzeile im Kopf des Beitrags (design/NewsDetails.dc.html, Kopfzeile mit Trennlinien). Der Absender steht nur
 * hier: die frühere Autorenkarte der Seitenspalte entfällt (H-B03, Abnahme „Autor einmal“). Absender ist die Gemeinde
 * mit ihrem Logo (`logo`), solange kein Name einer Person gepflegt ist – keine erfundene Person, kein Platzhalter (G-04).
 */
export function AutorZeile({ name, funktion, logo }: { name: string; funktion?: string; logo?: string }) {
  return (
    <div className="flex items-center gap-3">
      <Zeichen name={name} logo={logo} groesse="size-12" />
      <span className="flex flex-col leading-snug">
        <strong>{name}</strong>
        {funktion ? <span className="text-16 text-tinte-2">{funktion}</span> : null}
      </span>
    </div>
  );
}
