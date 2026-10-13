'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { klassen } from '@/lib/klassen';
import { meldeKindFehlend } from '@/server/actions/unterricht';

type Grund = 'krank' | 'familie' | 'schule' | 'sonstiges';
export type FehlmeldungTexte = {
  datum: string;
  grund: string;
  gruende: Record<Grund, string>;
  senden: string;
  gesendet: string;
  fehler: string;
};

const GRUENDE: Grund[] = ['krank', 'familie', 'schule', 'sonstiges'];

/**
 * „Kind fehlt“ (AUFTRAG 3.5): Tag (heute bis 60 Tage voraus, vorbelegt mit dem nächsten Termin) und Grund wählen. Die
 * Abmeldung belegt die Anwesenheit der Lehrkraft mit „entschuldigt“ vor (B-23). Danach lädt die Seite die Liste neu.
 */
export function FehlmeldungFormular({
  lernendeId,
  vorschlag,
  min,
  max,
  texte,
}: {
  lernendeId: string;
  vorschlag: string;
  min: string;
  max: string;
  texte: FehlmeldungTexte;
}) {
  const router = useRouter();
  const [meldung, setMeldung] = useState<{ text: string; fehler: boolean } | null>(null);
  const [sendet, setSendet] = useState(false);

  async function senden(fd: FormData) {
    setSendet(true);
    setMeldung(null);
    const r = await meldeKindFehlend({
      lernendeId,
      datum: String(fd.get('datum') ?? ''),
      grund: (fd.get('grund') as Grund | null) ?? 'sonstiges',
    }).catch(() => null);
    setSendet(false);
    if (r?.ok && r.wert) {
      setMeldung({ text: texte.gesendet, fehler: false });
      router.refresh();
    } else setMeldung({ text: texte.fehler, fehler: true });
  }

  return (
    <form action={senden} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="font-bold">{texte.datum}</span>
        <input
          type="date"
          name="datum"
          required
          min={min}
          max={max}
          defaultValue={vorschlag}
          className="min-h-12 w-full rounded-md border-2 border-rand bg-weiss px-3 text-18 sm:w-64"
        />
      </label>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 font-bold">{texte.grund}</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {GRUENDE.map((g, i) => (
            <label
              key={g}
              className="flex min-h-12 cursor-pointer items-center gap-3 rounded-md border-2 border-linie bg-weiss px-3 has-checked:border-gruen-700 has-checked:bg-gruen-50"
            >
              <input type="radio" name="grund" value={g} defaultChecked={i === 0} className="size-5 accent-gruen-700" />
              <span>{texte.gruende[g]}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={sendet}
          className="inline-flex min-h-12 cursor-pointer items-center rounded-md bg-gruen-700 px-6 font-bold text-weiss transition duration-(--dauer-rueckmeldung) hover:bg-gruen-800 active:scale-98 disabled:cursor-wait disabled:opacity-60 motion-reduce:active:scale-100"
        >
          {texte.senden}
        </button>
        <p role="status" className={klassen('text-16 font-bold', meldung?.fehler ? 'text-fehler' : 'text-gruen-800')}>
          {meldung?.text}
        </p>
      </div>
    </form>
  );
}
