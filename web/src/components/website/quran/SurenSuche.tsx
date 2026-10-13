'use client';

import { Search } from 'lucide-react';
import { useId, useRef, useState, type ReactNode } from 'react';
import { passt } from '@/lib/quran/suche';

/**
 * Surensuche der Übersicht (O-Q01): filtert die Kacheln im Browser nach Name (Umschrift oder arabisch) oder Nummer.
 * Die Kacheln stehen vollständig im HTML (ohne JavaScript alle sichtbar); das Suchfeld erscheint nur mit Skript.
 */
export function SurenSuche({
  texte,
  children,
}: {
  texte: { label: string; platzhalter: string; keine: string; treffer: string };
  children: ReactNode;
}) {
  const huelle = useRef<HTMLDivElement>(null);
  const [eingabe, setEingabe] = useState('');
  const [anzahl, setAnzahl] = useState<number | null>(null);
  const id = useId();

  const filtere = (wert: string) => {
    setEingabe(wert);
    let n = 0;
    for (const li of huelle.current?.querySelectorAll<HTMLElement>('li[data-nr]') ?? []) {
      const ja = passt(wert, Number(li.dataset.nr), li.dataset.suche ?? '');
      li.hidden = !ja;
      if (ja) n++;
    }
    setAnzahl(wert.trim() ? n : null);
  };

  return (
    <div ref={huelle} className="flex flex-col gap-4">
      <div className="nur-mit-skript flex flex-col gap-2">
        <label htmlFor={id} className="text-16 font-bold">
          {texte.label}
        </label>
        <div className="relative max-w-md">
          <Search aria-hidden className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-tinte-2" />
          <input
            id={id}
            type="search"
            value={eingabe}
            onChange={(e) => filtere(e.target.value)}
            placeholder={texte.platzhalter}
            autoComplete="off"
            className="min-h-12 w-full rounded-pill border border-rand bg-weiss py-2 pr-4 pl-12 text-18"
          />
        </div>
        <p role="status" className="min-h-6 text-16 text-tinte-2">
          {anzahl === null ? '' : anzahl === 0 ? texte.keine : texte.treffer.replace('{anzahl}', String(anzahl))}
        </p>
      </div>
      {children}
    </div>
  );
}
