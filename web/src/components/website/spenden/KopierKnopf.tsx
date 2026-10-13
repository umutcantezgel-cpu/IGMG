'use client';

import { useState, type ReactNode } from 'react';

/**
 * Kleine Insel „IBAN kopieren“ (AUFTRAG 3.10): schreibt den Text in die Zwischenablage und meldet das Ergebnis in
 * einer Live-Region. Symbol und Texte kommen vom Server (K-12). Ohne Zwischenablage (unsicherer Kontext, alter
 * Browser) erscheint der Hinweis zum Markieren.
 */
export function KopierKnopf({ text, kinder, texte }: { text: string; kinder: ReactNode; texte: { kopiert: string; fehler: string } }) {
  const [stand, setStand] = useState<'ruhe' | 'kopiert' | 'fehler'>('ruhe');
  async function kopieren() {
    try {
      await navigator.clipboard.writeText(text);
      setStand('kopiert');
    } catch {
      setStand('fehler');
    }
  }
  return (
    <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1">
      <button
        type="button"
        onClick={kopieren}
        className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-md border-2 border-gruen-700 bg-weiss px-4 font-bold text-gruen-800 transition duration-(--dauer-rueckmeldung) hover:bg-gruen-50 active:scale-98 print:hidden"
      >
        {kinder}
      </button>
      <span role="status" className="text-16 font-bold text-gruen-800">
        {stand === 'kopiert' ? texte.kopiert : stand === 'fehler' ? <span className="text-fehler">{texte.fehler}</span> : null}
      </span>
    </span>
  );
}
