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

/** Autorzeile im Kopf des Beitrags (design/NewsDetails.dc.html, Kopfzeile mit Trennlinien). */
export function AutorZeile({ name, funktion }: { name: string; funktion: string }) {
  return (
    <div className="flex items-center gap-3">
      <Bild name={name} groesse="size-12" />
      <span className="flex flex-col leading-[1.35]">
        <strong>{name}</strong>
        <span className="text-16 text-tinte-2">{funktion}</span>
      </span>
    </div>
  );
}

/** Autorenkarte der Seitenspalte (design/NewsDetails.dc.html, „Über den Autor“). */
export function AutorKarte({ ueberschrift, name, funktion, text }: { ueberschrift: string; name: string; funktion: string; text: string }) {
  return (
    <section aria-labelledby="nd-autor" className="flex flex-col gap-3 rounded-lg border border-linie bg-weiss p-6">
      <h2 id="nd-autor" className="text-24">
        {ueberschrift}
      </h2>
      <div className="flex items-center gap-3">
        <Bild name={name} groesse="size-14" />
        <span className="flex flex-col leading-[1.35]">
          <strong>{name}</strong>
          <span className="text-16 text-tinte-2">{funktion}</span>
        </span>
      </div>
      <p className="text-16 text-tinte-2">{text}</p>
    </section>
  );
}
