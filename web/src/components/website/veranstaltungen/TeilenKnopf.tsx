'use client';

import { Share2 } from 'lucide-react';
import { useState } from 'react';

/**
 * „Teilen“ (design/EventDetails.dc.html D:42): Teilen-Dialog des Geräts, sonst Link in die Zwischenablage.
 * Rückmeldung über eine Live-Region (WCAG 4.1.3). Keine Dritt-Dienste.
 */
export function TeilenKnopf({ titel, texte }: { titel: string; texte: { teilen: string; kopiert: string; fehler: string } }) {
  const [meldung, setMeldung] = useState('');
  async function teilen() {
    const url = window.location.href.split('#')[0];
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: titel, url });
        return;
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setMeldung(texte.kopiert);
    } catch {
      setMeldung(texte.fehler);
    }
  }
  return (
    <>
      <button
        type="button"
        onClick={teilen}
        className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-md border border-rand bg-weiss px-[18px] font-bold text-tinte hover:border-gruen-700 hover:bg-gruen-50"
      >
        <Share2 aria-hidden className="size-5" />
        {texte.teilen}
      </button>
      <span role="status" className="text-16 text-gruen-800 empty:hidden">
        {meldung}
      </span>
    </>
  );
}
