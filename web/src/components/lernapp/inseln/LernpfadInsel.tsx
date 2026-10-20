'use client';

import { useEffect, useState } from 'react';
import type { KursSlug } from '@/lib/lernapp/kurse';
import { ladeKursverzeichnis, type LernpfadVerzeichnis } from '@/lib/lernapp/oberflaeche/kursverzeichnis';

/**
 * Lernpfad eines Kurses (PLAN §3.1, B-24): Einheiten als Stationen. Daten kommen aus dem Kursverzeichnis
 * (`ladeKursverzeichnis`, Route aus Paket L1-05); bis zur Zusammenführung gibt es keins, und die Insel zeigt den Hinweis
 * „wird vorbereitet“, den schon der Server rendert. Die Zusammenführung zeichnet hier die Stationen (Muster
 * `website/elifbe/Weg.tsx`) mit Links auf `…/ueben?l=<lektion>` und `…/tipps?e=<einheit>`.
 */
export function LernpfadInsel({ kurs, adresse, leer }: { kurs: KursSlug; adresse: string; leer: string }) {
  const [verzeichnis, setVerzeichnis] = useState<LernpfadVerzeichnis | null>(null);
  useEffect(() => {
    let aktiv = true;
    void ladeKursverzeichnis(kurs).then((v) => aktiv && setVerzeichnis(v));
    return () => {
      aktiv = false;
    };
  }, [kurs]);
  if (!verzeichnis || verzeichnis.einheiten.length === 0) return <p className="text-18 text-tinte-2">{leer}</p>;
  return (
    <ol className="flex flex-col gap-3">
      {verzeichnis.einheiten.map((e) => (
        <li key={e.schluessel} className="rounded-lg border border-linie bg-weiss p-4">
          <h3 className="text-20">{e.titel}</h3>
          <ul className="mt-2 flex flex-col gap-1">
            {e.lektionen.map((l) => (
              <li key={l.schluessel}>
                <a href={`${adresse}/ueben?l=${encodeURIComponent(l.schluessel)}`} className="inline-flex min-h-11 items-center font-bold">
                  {l.titel}
                </a>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
}
