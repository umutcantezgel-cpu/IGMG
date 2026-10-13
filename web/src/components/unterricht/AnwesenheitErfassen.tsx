'use client';

import { useState, type CSSProperties } from 'react';
import type { AnwesenheitsStatus } from '@/lib/lernen/termine';
import { klassen } from '@/lib/klassen';
import { speichereAnwesenheit } from '@/server/actions/unterricht';

export type AnwesenheitsTexte = {
  titel: string;
  status: Record<AnwesenheitsStatus, string>;
  fehlmeldung: string;
  speichern: string;
  gespeichert: string;
  fehler: string;
  alleAnwesend: string;
  zaehler: string;
};

type Zeile = { lernendeId: string; name: string; status: AnwesenheitsStatus; fehlmeldung: boolean };
const REIHE: AnwesenheitsStatus[] = ['anwesend', 'verspaetet', 'entschuldigt', 'fehlt'];
const FARBE: Record<AnwesenheitsStatus, string> = {
  anwesend: 'border-gruen-700 bg-gruen-700 text-weiss',
  verspaetet: 'border-gruen-700 bg-gruen-50 text-gruen-800',
  entschuldigt: 'border-rand bg-sand text-tinte',
  fehlt: 'border-fehler bg-fehler-toenung text-fehler',
};

/**
 * Anwesenheit auf einem Bildschirm (B-23, Ziel 20 Sekunden): je Kind vier große Schalter, Fehlmeldungen der Eltern sind
 * vorbelegt. Ein Druck gibt sofort Rückmeldung (Häkchen zeichnet sich), gespeichert wird mit einem Knopf für alle.
 */
export function AnwesenheitErfassen({ terminId, zeilen, texte }: { terminId: string; zeilen: Zeile[]; texte: AnwesenheitsTexte }) {
  const [stand, setStand] = useState<Record<string, AnwesenheitsStatus>>(() =>
    Object.fromEntries(zeilen.map((z) => [z.lernendeId, z.status])),
  );
  const [meldung, setMeldung] = useState<{ text: string; fehler: boolean } | null>(null);
  const [sendet, setSendet] = useState(false);
  const anwesend = Object.values(stand).filter((s) => s === 'anwesend' || s === 'verspaetet').length;

  async function speichern() {
    setSendet(true);
    setMeldung(null);
    const r = await speichereAnwesenheit({
      terminId,
      eintraege: Object.entries(stand).map(([lernendeId, status]) => ({ lernendeId, status })),
    }).catch(() => null);
    setSendet(false);
    setMeldung(r?.ok ? { text: texte.gespeichert, fehler: false } : { text: texte.fehler, fehler: true });
  }

  return (
    <section aria-labelledby="anwesenheit-titel" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="anwesenheit-titel" className="text-24">
          {texte.titel}
        </h2>
        <p className="text-18 font-bold text-gruen-800 tabular-nums" aria-live="polite">
          {texte.zaehler.replace('{anwesend}', String(anwesend)).replace('{gesamt}', String(zeilen.length))}
        </p>
      </div>
      <button
        type="button"
        onClick={() =>
          setStand((s) => Object.fromEntries(Object.keys(s).map((id) => [id, s[id] === 'entschuldigt' ? 'entschuldigt' : 'anwesend'])))
        }
        className="min-h-12 self-start rounded-md border-2 border-gruen-700 px-4 font-bold text-gruen-800 hover:bg-gruen-50"
      >
        {texte.alleAnwesend}
      </button>
      <ul className="flex flex-col divide-y divide-linie rounded-lg border border-linie bg-weiss">
        {zeilen.map((z) => (
          <li key={z.lernendeId} className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
            <span className="flex flex-col">
              <span className="text-20 font-bold">{z.name}</span>
              {z.fehlmeldung ? <span className="text-16 text-tinte-2">{texte.fehlmeldung}</span> : null}
            </span>
            <fieldset className="flex flex-wrap gap-2">
              <legend className="sr-only">{z.name}</legend>
              {REIHE.map((s) => {
                const an = stand[z.lernendeId] === s;
                return (
                  <label
                    key={s}
                    className={klassen(
                      'inline-flex min-h-12 min-w-24 cursor-pointer items-center justify-center gap-2 rounded-md border-2 px-3 font-bold transition duration-(--dauer-rueckmeldung) active:scale-98 has-focus-visible:outline-2 has-focus-visible:outline-gruen-950',
                      an ? FARBE[s] : 'border-linie bg-weiss text-tinte-2 hover:border-gruen-700',
                    )}
                  >
                    <input
                      type="radio"
                      name={`a-${z.lernendeId}`}
                      value={s}
                      checked={an}
                      onChange={() => setStand((alt) => ({ ...alt, [z.lernendeId]: s }))}
                      className="sr-only"
                    />
                    {an ? (
                      <svg aria-hidden viewBox="0 0 24 24" className="size-5">
                        <path
                          d="M5 12.5l4.5 4.5L19 7.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          pathLength={1}
                          className="linie-zeichnet"
                          style={{ '--dauer': 'var(--dauer-wechsel)' } as CSSProperties}
                        />
                      </svg>
                    ) : null}
                    {texte.status[s]}
                  </label>
                );
              })}
            </fieldset>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={() => void speichern()}
          disabled={sendet}
          className="min-h-12 rounded-md bg-gruen-700 px-6 text-18 font-bold text-weiss hover:bg-gruen-800 disabled:opacity-60"
        >
          {texte.speichern}
        </button>
        <p role="status" className={klassen('text-16 font-bold', meldung?.fehler ? 'text-fehler' : 'text-gruen-800')}>
          {meldung?.text}
        </p>
      </div>
    </section>
  );
}
