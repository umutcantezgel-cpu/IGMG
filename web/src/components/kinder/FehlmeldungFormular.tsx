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
  /** Kennzeichen eines Termins, für den schon eine Abmeldung vorliegt */
  schonGemeldet: string;
  /** Kein Termin wählbar (keiner geplant oder alle schon abgemeldet) */
  keinTermin: string;
};

/** Ein wählbarer Termin; Datum und Uhrzeit sind auf dem Server fertig formatiert (nie die Browsersprache). */
export type FehlTermin = { datum: string; tag: string; zeit: string; gemeldet: boolean };

const GRUENDE: Grund[] = ['krank', 'familie', 'schule', 'sonstiges'];
const WAHL =
  'flex min-h-12 cursor-pointer items-center gap-3 rounded-md border-2 border-linie bg-weiss px-3 py-2 has-checked:border-gruen-700 has-checked:bg-gruen-50 has-disabled:cursor-not-allowed has-disabled:bg-sand has-disabled:text-tinte-2';

/**
 * „Kind fehlt“ (AUFTRAG 3.5): einen der nächsten Termine und den Grund wählen (Sichtabnahme EK-1: Radiogruppe statt
 * Datumsfeld – das native Feld formatiert nach der Browsersprache, nicht nach der Seite). Schon abgemeldete Termine
 * stehen gesperrt da. Die Abmeldung belegt die Anwesenheit der Lehrkraft mit „entschuldigt“ vor (B-23). Danach lädt die
 * Seite die Liste neu.
 */
export function FehlmeldungFormular({
  lernendeId,
  termine,
  texte,
}: {
  lernendeId: string;
  termine: FehlTermin[];
  texte: FehlmeldungTexte;
}) {
  const router = useRouter();
  const [meldung, setMeldung] = useState<{ text: string; fehler: boolean } | null>(null);
  const [sendet, setSendet] = useState(false);
  const [gewaehlt, setGewaehlt] = useState<string | null>(null);
  const frei = termine.filter((x) => !x.gemeldet);
  // Gewählt bleibt, solange der Termin frei ist; nach einer Abmeldung (neu geladen) rückt der nächste freie nach
  const wahl = frei.some((x) => x.datum === gewaehlt) ? gewaehlt : (frei[0]?.datum ?? null);

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

  const status = (
    <p role="status" className={klassen('text-16 font-bold', meldung?.fehler ? 'text-fehler' : 'text-gruen-800')}>
      {meldung?.text}
    </p>
  );

  if (!frei.length) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-tinte-2">{texte.keinTermin}</p>
        {status}
      </div>
    );
  }

  return (
    <form action={senden} className="flex flex-col gap-5">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 font-bold">{texte.datum}</legend>
        <div className="grid gap-2">
          {termine.map((x) => (
            <label key={x.datum} className={WAHL}>
              <input
                type="radio"
                name="datum"
                value={x.datum}
                required
                disabled={x.gemeldet}
                checked={wahl === x.datum}
                onChange={() => setGewaehlt(x.datum)}
                className="size-5 shrink-0 accent-gruen-700"
              />
              <span className="font-bold whitespace-nowrap tabular-nums">{x.tag}</span>
              <span className="text-16 whitespace-nowrap text-tinte-2 tabular-nums">{x.gemeldet ? texte.schonGemeldet : x.zeit}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 font-bold">{texte.grund}</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {GRUENDE.map((g, i) => (
            <label key={g} className={WAHL}>
              <input type="radio" name="grund" value={g} defaultChecked={i === 0} className="size-5 shrink-0 accent-gruen-700" />
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
        {status}
      </div>
    </form>
  );
}
