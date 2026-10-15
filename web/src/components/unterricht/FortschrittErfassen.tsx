'use client';

import { useState } from 'react';
import { fuelle, naechsterFortschritt, type FortschrittStatus } from '@/lib/lernen/ansicht';
import { klassen } from '@/lib/klassen';
import { speichereFortschritt } from '@/server/actions/unterricht';

type Stand = FortschrittStatus | null;
export type FortschrittTexte = {
  lernende: string;
  /** „Stufe {nr}“ */
  stufe: string;
  status: Record<'offen' | FortschrittStatus, string>;
  /** „{name}, {stufe}: {status}. Weiter zu: {naechster}“ */
  zelleAria: string;
  /** „Gespeichert: {name}, {stufe} – {status}“ */
  gespeichert: string;
  fehler: string;
  legende: string;
};

const ANTEIL: Record<'offen' | FortschrittStatus, number> = { offen: 0, begonnen: 1 / 3, sicher: 2 / 3, abgeschlossen: 1 };

/** Füllstand als Kreis (nicht nur Farbe, WCAG 1.4.1): leer, ein Drittel, zwei Drittel, voll mit Häkchen. */
export function Fuellkreis({ status }: { status: 'offen' | FortschrittStatus }) {
  const a = ANTEIL[status];
  const winkel = a * 2 * Math.PI;
  const x = 12 + 8 * Math.sin(winkel);
  const y = 12 - 8 * Math.cos(winkel);
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="size-6 shrink-0">
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="none"
        strokeWidth="2"
        className={a ? 'stroke-gruen-700' : 'stroke-rand'}
        strokeDasharray={a ? undefined : '2 3'}
      />
      {a > 0 && a < 1 ? (
        <path d={`M12 12V4A8 8 0 ${a > 0.5 ? 1 : 0} 1 ${x.toFixed(2)} ${y.toFixed(2)}Z`} className="fill-gruen-700" />
      ) : null}
      {a === 1 ? (
        <>
          <circle cx="12" cy="12" r="9" className="fill-gruen-700" />
          <path
            d="M8 12.5l2.8 2.8L16.5 9.5"
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="stroke-weiss"
          />
        </>
      ) : null}
    </svg>
  );
}

/**
 * Fortschritt je Stufe (AUFTRAG 3.5): Raster Lernende × Stufen einer Kursart. Ein Druck schaltet die Zelle weiter (offen →
 * begonnen → sicher → abgeschlossen → offen) und speichert sofort; scheitert das Speichern, springt sie zurück.
 * Erste Spalte bleibt beim waagerechten Blättern stehen.
 */
export function FortschrittErfassen({
  gruppeId,
  stufen,
  lernende,
  texte,
}: {
  gruppeId: string;
  stufen: { id: string; nr: number; titel: string }[];
  lernende: { id: string; name: string; stand: Record<string, Stand> }[];
  texte: FortschrittTexte;
}) {
  const [stand, setStand] = useState<Record<string, Stand>>(() =>
    Object.fromEntries(lernende.flatMap((l) => stufen.map((s) => [`${l.id}|${s.id}`, l.stand[s.id] ?? null]))),
  );
  const [meldung, setMeldung] = useState<{ text: string; fehler: boolean } | null>(null);
  const name = (s: Stand) => texte.status[s ?? 'offen'];

  async function weiter(l: { id: string; name: string }, s: { id: string; nr: number }) {
    const schluessel = `${l.id}|${s.id}`;
    const vorher = stand[schluessel] ?? null;
    const neu = naechsterFortschritt(vorher);
    setStand((alt) => ({ ...alt, [schluessel]: neu }));
    const r = await speichereFortschritt({ gruppeId, lernendeId: l.id, stufeId: s.id, status: neu }).catch(() => null);
    if (r?.ok && r.wert) {
      setMeldung({
        text: fuelle(texte.gespeichert, { name: l.name, stufe: fuelle(texte.stufe, { nr: s.nr }), status: name(neu) }),
        fehler: false,
      });
    } else {
      setStand((alt) => ({ ...alt, [schluessel]: vorher }));
      setMeldung({ text: texte.fehler, fehler: true });
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <dl aria-label={texte.legende} className="flex flex-wrap gap-x-5 gap-y-2 text-16 text-tinte-2">
        {(['offen', 'begonnen', 'sicher', 'abgeschlossen'] as const).map((s) => (
          <div key={s} className="flex items-center gap-2">
            <dt>
              <Fuellkreis status={s} />
            </dt>
            <dd>{texte.status[s]}</dd>
          </div>
        ))}
      </dl>
      <div className="relative overflow-x-auto rounded-lg border border-linie bg-weiss">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-linie bg-papier">
              <th scope="col" className="sticky left-0 z-1 bg-papier px-4 py-3 text-16 font-bold">
                {texte.lernende}
              </th>
              {stufen.map((s) => (
                <th key={s.id} scope="col" className="px-1 py-3 text-center text-16 font-bold whitespace-nowrap">
                  <abbr title={s.titel} className="no-underline">
                    {fuelle(texte.stufe, { nr: s.nr })}
                  </abbr>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lernende.map((l) => (
              <tr key={l.id} className="border-b border-linie last:border-b-0">
                <th scope="row" className="sticky left-0 z-1 bg-weiss px-4 py-2 font-bold whitespace-nowrap">
                  {l.name}
                </th>
                {stufen.map((s) => {
                  const wert = stand[`${l.id}|${s.id}`] ?? null;
                  return (
                    <td key={s.id} className="px-1 py-1 text-center">
                      <button
                        type="button"
                        onClick={() => void weiter(l, s)}
                        aria-label={fuelle(texte.zelleAria, {
                          name: l.name,
                          stufe: fuelle(texte.stufe, { nr: s.nr }),
                          status: name(wert),
                          naechster: name(naechsterFortschritt(wert)),
                        })}
                        className={klassen(
                          'inline-flex min-h-12 min-w-12 druck cursor-pointer items-center justify-center rounded-md border transition duration-(--dauer-rueckmeldung) hover:border-gruen-700',
                          wert === 'abgeschlossen' ? 'border-gruen-700 bg-gruen-50' : 'border-linie bg-weiss',
                        )}
                      >
                        <Fuellkreis status={wert ?? 'offen'} />
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p role="status" className={klassen('min-h-6 text-16 font-bold', meldung?.fehler ? 'text-fehler' : 'text-gruen-800')}>
        {meldung?.text}
      </p>
    </div>
  );
}
