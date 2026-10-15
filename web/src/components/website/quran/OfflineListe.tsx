'use client';

import { CloudOff, Trash2 } from 'lucide-react';
import { useState, useSyncExternalStore } from 'react';
import { fuelle, SPEICHER } from './leser-typen';

type Eintrag = { titel: string; bytes: number; zeit: number };
type Texte = { liste: string; listeGroesse: string; listeEntfernen: string };

function liesRoh(): string {
  try {
    return window.localStorage.getItem(SPEICHER.offline) ?? '';
  } catch {
    return '';
  }
}

function abonniere(neu: () => void) {
  window.addEventListener('storage', neu);
  return () => window.removeEventListener('storage', neu);
}

/**
 * Übersicht /quran: offline gespeicherte Seiten aus dem Gerät (H-O01). Vom Server kommt nichts; ohne gespeicherte
 * Seiten bleibt die Insel leer. Entfernen lädt die Speicherlogik erst bei Bedarf.
 */
export function OfflineListe({ texte }: { texte: Texte }) {
  const roh = useSyncExternalStore(abonniere, liesRoh, () => '');
  const [weg, setWeg] = useState<string[]>([]);
  let eintraege: [string, Eintrag][] = [];
  try {
    eintraege = Object.entries((roh ? JSON.parse(roh) : {}) as Record<string, Eintrag>).filter(
      ([pfad]) => pfad.startsWith('/') && !weg.includes(pfad),
    );
  } catch {
    eintraege = [];
  }
  if (!eintraege.length) return null;
  return (
    <section aria-labelledby="offline-titel" className="flex flex-col gap-3 rounded-lg border border-linie bg-weiss p-6 shadow-s1">
      <h2 id="offline-titel" className="flex items-center gap-2 text-24">
        <CloudOff aria-hidden className="size-6 text-gruen-700" />
        {texte.liste}
      </h2>
      <ul className="flex flex-col divide-y divide-linie">
        {eintraege.map(([pfad, e]) => (
          <li key={pfad} className="flex items-center justify-between gap-3 py-2">
            <a href={pfad} className="min-w-0 font-bold">
              {e.titel}
              <span className="block text-16 font-normal text-tinte-2 tabular-nums">
                {fuelle(texte.listeGroesse, { mb: (e.bytes / 1e6).toLocaleString(undefined, { maximumFractionDigits: 1 }) })}
              </span>
            </a>
            <button
              type="button"
              aria-label={fuelle(texte.listeEntfernen, { titel: e.titel })}
              onClick={() =>
                void import('./offline').then(async ({ entferne }) => {
                  await entferne(pfad);
                  setWeg((w) => [...w, pfad]);
                })
              }
              className="inline-flex size-12 shrink-0 druck items-center justify-center rounded-pill border border-rand bg-weiss text-tinte transition duration-(--dauer-rueckmeldung) hover:border-fehler"
            >
              <Trash2 aria-hidden className="size-5" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
