'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { fuelle } from '@/lib/lernen/ansicht';
import { klassen } from '@/lib/klassen';
import { speichereHifz } from '@/server/actions/unterricht';

export type HifzTexte = {
  lernende: string;
  waehlen: string;
  sure: string;
  vonVers: string;
  bisVers: string;
  bewertung: string;
  ohne: string;
  speichern: string;
  gespeichert: string;
  fehler: string;
  /** „Diese Sure hat {anzahl} Verse.“ */
  verseMax: string;
};

const FELD = 'min-h-12 w-full rounded-md border-2 border-rand bg-weiss px-3 text-18';

/**
 * Hifz-Eintrag (AUFTRAG 3.5): geprüften Abschnitt mit Sure, Versen und optionaler Bewertung eintragen. Der Server prüft
 * Sure und Verse gegen den Koran-Import und die Mitgliedschaft (`trageHifzEin`); danach lädt die Seite die Liste neu.
 */
export function HifzEintragen({
  gruppeId,
  lernende,
  suren,
  texte,
}: {
  gruppeId: string;
  lernende: { id: string; name: string }[];
  suren: { nr: number; name: string; verse: number }[];
  texte: HifzTexte;
}) {
  const router = useRouter();
  const [sure, setSure] = useState<number>(suren[0]?.nr ?? 1);
  const [meldung, setMeldung] = useState<{ text: string; fehler: boolean } | null>(null);
  const [sendet, setSendet] = useState(false);
  const max = suren.find((s) => s.nr === sure)?.verse ?? 286;

  async function senden(fd: FormData) {
    setSendet(true);
    setMeldung(null);
    const zahl = (n: string) => Number(fd.get(n));
    const bewertung = fd.get('bewertung');
    const r = await speichereHifz({
      gruppeId,
      lernendeId: String(fd.get('lernendeId') ?? ''),
      sure: zahl('sure'),
      vonVers: zahl('vonVers'),
      bisVers: zahl('bisVers'),
      bewertung: bewertung ? Number(bewertung) : null,
    }).catch(() => null);
    setSendet(false);
    if (r?.ok && r.wert) {
      setMeldung({ text: texte.gespeichert, fehler: false });
      router.refresh();
    } else setMeldung({ text: texte.fehler, fehler: true });
  }

  return (
    <form action={senden} className="flex flex-col gap-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="font-bold">{texte.lernende}</span>
          <select name="lernendeId" required defaultValue="" className={FELD}>
            <option value="" disabled>
              {texte.waehlen}
            </option>
            {lernende.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="font-bold">{texte.sure}</span>
          <select name="sure" value={sure} onChange={(e) => setSure(Number(e.currentTarget.value))} className={FELD}>
            {suren.map((s) => (
              <option key={s.nr} value={s.nr}>
                {s.nr} · {s.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="font-bold">{texte.vonVers}</span>
          <input name="vonVers" type="number" inputMode="numeric" min={1} max={max} required defaultValue={1} className={FELD} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="font-bold">{texte.bisVers}</span>
          <input
            name="bisVers"
            type="number"
            inputMode="numeric"
            min={1}
            max={max}
            required
            defaultValue={1}
            aria-describedby="hifz-verse"
            className={FELD}
          />
          <span id="hifz-verse" className="text-16 text-tinte-2">
            {fuelle(texte.verseMax, { anzahl: max })}
          </span>
        </label>
      </div>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 font-bold">{texte.bewertung}</legend>
        <div className="flex flex-wrap gap-2">
          {['', '1', '2', '3', '4', '5'].map((w) => (
            <label
              key={w || 'ohne'}
              className="inline-flex min-h-12 min-w-12 cursor-pointer items-center justify-center rounded-md border-2 border-linie bg-weiss px-3 font-bold has-checked:border-gruen-700 has-checked:bg-gruen-50 has-checked:text-gruen-800 has-focus-visible:outline-2 has-focus-visible:outline-gruen-950"
            >
              <input type="radio" name="bewertung" value={w} defaultChecked={w === ''} className="sr-only" />
              {w || texte.ohne}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={sendet}
          className="inline-flex min-h-12 druck cursor-pointer items-center rounded-md bg-gruen-700 px-6 font-bold text-weiss transition duration-(--dauer-rueckmeldung) hover:bg-gruen-800 disabled:cursor-wait disabled:opacity-60"
        >
          {texte.speichern}
        </button>
        <p role="status" className={klassen('text-16 font-bold', meldung?.fehler ? 'text-fehler' : 'text-gruen-800')}>
          {meldung?.text}
        </p>
      </div>
    </form>
  );
}
