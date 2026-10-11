'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Meldung } from '@/components/verwaltung/Meldung';
import { speichereLoeschfristen, type FristenZustand } from '@/server/actions/einstellungen';

/** Löschfristen je Eingangsart (C16). Texte und Startwerte vom Server; ganze Tage 1–3650. */
export function FristenFormular({
  arten,
  startwerte,
  texte,
}: {
  arten: { art: string; label: string }[];
  startwerte: Record<string, number>;
  texte: { tage: string; speichern: string; gespeichert: string; fehler: string };
}) {
  const [zustand, absenden] = useActionState<FristenZustand, FormData>(speichereLoeschfristen, {});
  return (
    <form action={absenden} className="flex flex-col gap-4" noValidate>
      {zustand.gespeichert ? <Meldung art="erfolg">{texte.gespeichert}</Meldung> : null}
      {zustand.fehler ? <Meldung art="fehler">{texte.fehler}</Meldung> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        {arten.map(({ art, label }) => (
          <label key={art} className="flex flex-col gap-1 font-bold">
            {label}
            <span className="flex items-center gap-2 font-normal">
              <input
                name={art}
                type="number"
                min={1}
                max={3650}
                step={1}
                required
                defaultValue={zustand.werte?.[art] ?? startwerte[art]}
                className="min-h-11 w-32 rounded-md border border-rand bg-weiss px-3 text-18"
              />
              {texte.tage}
            </span>
          </label>
        ))}
      </div>
      <Button type="submit" className="self-start">
        {texte.speichern}
      </Button>
    </form>
  );
}
